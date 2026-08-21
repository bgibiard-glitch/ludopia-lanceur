'use strict';

/**
 * Mise à jour du lanceur, depuis le lanceur.
 *
 * Le flux est le dépôt public `bgibiard-glitch/ludopia-lanceur` : chaque
 * release y publie un `latest.yml` qu'`electron-updater` compare à la version
 * installée. Le téléchargement se fait en tâche de fond ; l'installation
 * attend l'accord de l'utilisateur, car elle redémarre l'application — la
 * faire au milieu d'une partie serait inacceptable.
 *
 * Sur macOS, une mise à jour automatique exige une application **signée**.
 * Tant qu'elle ne l'est pas, on n'essaie même pas : `autoUpdater` échouerait
 * à chaque démarrage et remplirait le journal d'erreurs sans rien apporter.
 */

const { app, dialog, shell } = require('electron');

const DEPOT = 'https://github.com/bgibiard-glitch/ludopia-lanceur/releases/latest';

let updater = null;
let etat = { phase: 'inconnu', version: null, progression: 0, erreur: null };
let prevenir = () => {};
let fenetreDemandeuse = null;

/** Chargé à la demande : inutile d'embarquer le module en développement. */
function charger() {
  if (updater) return updater;
  try {
    ({ autoUpdater: updater } = require('electron-updater'));
  } catch {
    return null;
  }
  updater.autoDownload = true;          // télécharger, oui
  updater.autoInstallOnAppQuit = false; // installer sans prévenir, non
  updater.logger = null;
  return updater;
}

function poser(phase, extra = {}) {
  etat = { ...etat, phase, ...extra };
  prevenir(etat);
}

function disponible() {
  // En développement il n'y a pas d'application empaquetée à remplacer.
  if (!app.isPackaged) return false;
  // macOS non signé : la mise à jour automatique est refusée par le système.
  if (process.platform === 'darwin') return false;
  return true;
}

function brancher() {
  const u = charger();
  if (!u) return;

  u.on('checking-for-update', () => poser('recherche'));
  u.on('update-not-available', () => poser('a-jour'));
  u.on('update-available', (info) => poser('telechargement', { version: info.version }));
  u.on('download-progress', (p) => poser('telechargement', { progression: Math.round(p.percent) }));
  u.on('update-downloaded', (info) => {
    poser('prete', { version: info.version, progression: 100 });
    proposerInstallation(info.version);
  });
  u.on('error', (err) => poser('erreur', { erreur: String(err?.message || err) }));
}

async function proposerInstallation(version) {
  const fr = app.getLocale().startsWith('fr');
  const r = await dialog.showMessageBox(fenetreDemandeuse ?? undefined, {
    type: 'info',
    buttons: fr ? ['Redémarrer et installer', 'Plus tard'] : ['Restart and install', 'Later'],
    defaultId: 0,
    cancelId: 1,
    title: fr ? 'Mise à jour prête' : 'Update ready',
    message: fr ? `Ludopia ${version} est prête à s'installer.`
                : `Ludopia ${version} is ready to install.`,
    detail: fr
      ? "L'installation ferme le lanceur et le rouvre. Vos parties en cours seront interrompues."
      : 'Installing closes the launcher and reopens it. Any game in progress will be interrupted.',
  });
  if (r.response === 0) {
    // `isSilent` à false : l'installateur montre sa progression, ce qui vaut
    // mieux qu'une fenêtre qui disparaît sans explication.
    updater.quitAndInstall(false, true);
  }
}

/**
 * Cherche une mise à jour.
 * @param {boolean} manuelle vrai si l'utilisateur l'a demandée — on lui répond
 *   alors même quand tout est à jour, sinon le bouton semblerait cassé.
 */
async function chercher(manuelle = false, fenetre = null) {
  fenetreDemandeuse = fenetre;

  if (!disponible()) {
    const raison = !app.isPackaged ? 'developpement' : 'non-signe';
    poser('indisponible', { erreur: raison });
    if (manuelle) ouvrirLesReleases();
    return etat;
  }

  const u = charger();
  if (!u) {
    poser('indisponible', { erreur: 'module-absent' });
    if (manuelle) ouvrirLesReleases();
    return etat;
  }

  try {
    await u.checkForUpdates();
  } catch (err) {
    poser('erreur', { erreur: String(err?.message || err) });
  }

  if (manuelle && etat.phase === 'a-jour') {
    const fr = app.getLocale().startsWith('fr');
    dialog.showMessageBox(fenetre ?? undefined, {
      type: 'info',
      title: fr ? 'Aucune mise à jour' : 'No update',
      message: fr ? `Ludopia ${app.getVersion()} est à jour.`
                  : `Ludopia ${app.getVersion()} is up to date.`,
      buttons: [fr ? 'Fermer' : 'Close'],
    });
  }
  return etat;
}

function ouvrirLesReleases() {
  shell.openExternal(DEPOT);
}

/** Vérification discrète au démarrage, puis une fois par jour. */
function surveiller() {
  if (!disponible()) return;
  // On laisse la bibliothèque s'afficher avant de solliciter le réseau.
  setTimeout(() => chercher(false), 8000);
  setInterval(() => chercher(false), 24 * 60 * 60 * 1000);
}

module.exports = {
  brancher,
  chercher,
  surveiller,
  ouvrirLesReleases,
  disponible,
  etat: () => etat,
  surChangement: (f) => { prevenir = f; },
};
