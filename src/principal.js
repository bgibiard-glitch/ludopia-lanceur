'use strict';

/**
 * Processus principal du lanceur Ludopia.
 *
 * Le lanceur ouvre une fenêtre « bibliothèque » qui affiche le catalogue, et
 * une fenêtre dédiée par jeu. Chaque fenêtre de jeu est bridée à l'origine de
 * son jeu : une navigation vers un autre domaine part dans le navigateur du
 * système, jamais dans la fenêtre.
 */

const {
  app, BrowserWindow, shell, ipcMain, Menu, Tray, nativeImage, net, dialog, nativeTheme,
  globalShortcut, screen,
} = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const donnees = require('./donnees');
const maj = require('./maj');
const social = require('./social');
const avis = require('./avis');

const RACINE = path.join(__dirname, '..');

/* Les réglages, avec leurs valeurs par défaut. Tout est allumé au départ : un
   avis qu'on n'attendait pas se coupe en deux clics, alors qu'un avis qui
   n'arrive jamais ne se découvre pas — on croit simplement que personne
   n'écrit. */
const REGLAGES_DEFAUT = {
  avisMessages: true,
  avisSalons: true,
  avisInvitations: true,
  avisAppels: true,
  avisSeries: true,
  son: true,
  demarrerReduit: false,
  /* 'systeme' | 'sombre' | 'clair'. Le défaut suit le système : quelqu'un qui a
     réglé son ordinateur en clair n'a pas envie qu'une application décide
     seule du contraire, et l'inverse est vrai aussi. */
  theme: 'systeme',
  /* La surimpression : un tchat déplaçable au-dessus du jeu. Éteinte au
     départ — une fenêtre qui s'invite par-dessus une partie sans qu'on l'ait
     demandée est une fenêtre qu'on désinstalle. */
  surimpression: false,
};

function reglages() {
  return { ...REGLAGES_DEFAUT, ...(donnees.get('reglages') || {}) };
}

/**
 * Les couleurs de la barre de titre, qui n'est pas dessinée par nous.
 *
 * Windows la peint lui-même à partir de ces valeurs. Une barre restée sombre
 * au-dessus d'une interface claire est le genre de détail qui fait qu'une
 * application « ne fait pas fini », et l'on ne sait pas dire pourquoi.
 */
/** Répercute le thème sur la barre de titre et sur l'interface. */
function appliquerTheme() {
  if (!fenetreBibliotheque || fenetreBibliotheque.isDestroyed()) return;
  if (process.platform !== 'darwin') {
    try { fenetreBibliotheque.setTitleBarOverlay(couleursBarre()); } catch { /* pas supporté */ }
  }
  fenetreBibliotheque.webContents.send('theme:changement', {
    choisi: reglages().theme,
    effectif: themeEffectif(),
  });
}

function couleursBarre() {
  const clair = themeEffectif() === 'clair';
  return {
    color: clair ? '#ffffff' : '#06060f',
    symbolColor: clair ? '#3b3b5e' : '#c5c2e6',
    height: 44,
  };
}

/** Ce que « systeme » veut dire ici et maintenant. */
function themeEffectif() {
  const choisi = reglages().theme;
  if (choisi === 'clair' || choisi === 'sombre') return choisi;
  return nativeTheme.shouldUseDarkColors ? 'sombre' : 'clair';
}
const SITE = 'https://ludopia.fr';
/* Le catalogue vivant : le fichier soigné du site, ENRICHI par le service des
   jeux qui se sont enrôlés eux-mêmes. Un jeu qui s'enregistre apparaît ici au
   prochain rafraîchissement, sans redéploiement du site ni du lanceur. */
const CATALOGUE_DISTANT = 'https://ludopia-social.bgibiard.workers.dev/catalogue';
const ACTUALITES = `${SITE}/assets/actualites.json`;

/** Une seule instance : un second lancement réveille la fenêtre existante. */
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let fenetreBibliotheque = null;

/* De quoi refermer l'avis d'un appel qui n'a plus lieu d'être : une sonnerie
   par appel, retirée dès qu'il se termine. */
const sonneriesEnCours = new Map();

let fenetreSurimpression = null;

/**
 * Le tchat en surimpression : une fenêtre sans cadre, translucide, toujours
 * au-dessus — y compris d'un jeu en plein écran sans bordure — qu'on déplace
 * par sa poignée.
 *
 * Elle est créée à la demande et **masquée** plutôt que détruite : la
 * recréation d'une fenêtre transparente coûte une seconde visible, et F10
 * doit répondre au doigt.
 */
function basculerSurimpression() {
  if (fenetreSurimpression && !fenetreSurimpression.isDestroyed()) {
    if (fenetreSurimpression.isVisible()) fenetreSurimpression.hide();
    else fenetreSurimpression.showInactive();
    return;
  }

  const zone = screen.getPrimaryDisplay().workArea;
  fenetreSurimpression = new BrowserWindow({
    width: 340,
    height: 380,
    x: zone.x + zone.width - 360,
    y: zone.y + zone.height - 400,
    frame: false,
    transparent: true,
    resizable: true,
    minWidth: 260,
    minHeight: 220,
    skipTaskbar: true,
    /* `screen-saver` est le niveau qui passe au-dessus d'un jeu en plein écran
       fenêtré. Un vrai plein écran exclusif ne laisse rien passer, quel que
       soit le niveau — c'est une limite du système, pas un réglage. */
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });
  fenetreSurimpression.setAlwaysOnTop(true, 'screen-saver');
  // Elle ne vole jamais le focus à l'ouverture : on est en train de jouer.
  fenetreSurimpression.loadFile(path.join(__dirname, 'interface', 'surimpression.html'));
  fenetreSurimpression.once('ready-to-show', () => fenetreSurimpression.showInactive());
  fenetreSurimpression.on('closed', () => { fenetreSurimpression = null; });
}
let plateau = null;                       // icône de la zone de notification
const fenetresJeu = new Map();            // id du jeu -> BrowserWindow
const chronos = new Map();                // id du jeu -> horodatage de lancement
let catalogue = null;
let conversationOuverte = null;   // ce que l'interface affiche, pour les avis
let salonAffiche = null;

// =============================================================================
// Catalogue
// =============================================================================

function catalogueLocal() {
  return JSON.parse(fs.readFileSync(path.join(RACINE, 'catalogue.json'), 'utf8'));
}

/**
 * Récupère le catalogue publié sur ludopia.fr pour que la bibliothèque suive
 * les nouveautés sans réinstallation. En cas d'échec — hors ligne, site en
 * maintenance, JSON abîmé — on garde celui livré avec l'application.
 */
function jsonDistant(url, delai = 6000) {
  return new Promise((resolve) => {
    const fin = setTimeout(() => resolve(null), delai);
    const requete = net.request({ url, useSessionCookies: false });
    let corps = '';
    requete.on('response', (rep) => {
      if (rep.statusCode !== 200) { clearTimeout(fin); resolve(null); return; }
      rep.on('data', (m) => { corps += m; });
      rep.on('end', () => {
        clearTimeout(fin);
        try { resolve(JSON.parse(corps)); } catch { resolve(null); }
      });
    });
    requete.on('error', () => { clearTimeout(fin); resolve(null); });
    requete.end();
  });
}

async function catalogueDistant() {
  const recu = await jsonDistant(CATALOGUE_DISTANT);
  return Array.isArray(recu?.jeux) && recu.jeux.length ? recu : null;
}

/** Les actualités du studio, telles que publiées sur le site. */
let actualites = null;
async function chargerActualites() {
  // Le service lit les changelogs des jeux a la source : une version deployee
  // il y a deux minutes y figure deja. Le fichier depose avec le site sert de
  // repli quand un jeu ne publie pas encore le sien.
  const vif = await social.actualites();
  if (vif.ok && vif.donnees?.langues) {
    actualites = vif.donnees;
    return actualites;
  }
  if (actualites) return actualites;
  const recu = await jsonDistant(ACTUALITES);
  if (recu?.langues) actualites = recu;
  return actualites;
}

/**
 * Les visuels ne sont livrés qu'avec l'application : un catalogue distant plus
 * récent peut décrire un jeu dont on n'a pas encore l'image. On garde donc les
 * chemins locaux du jeu de même identifiant quand ils existent.
 */
function fusionner(local, distant) {
  if (!distant) return local;
  const parId = new Map(local.jeux.map((j) => [j.id, j]));
  const jeux = distant.jeux.map((j) => {
    const connu = parId.get(j.id);
    if (!connu) return { ...j, logo: null, jaquette: null, vignette: null };
    return { ...j, logo: connu.logo, jaquette: connu.jaquette, vignette: connu.vignette };
  });
  return { ...distant, jeux };
}

// =============================================================================
// Disponibilité des jeux
// =============================================================================

/** Un HEAD sur l'accueil du jeu : sert la pastille « en ligne / injoignable ». */
function joignable(url) {
  return new Promise((resolve) => {
    if (!url) { resolve(false); return; }
    // Large : au premier appel d'une session, la resolution DNS, la negociation
    // TLS et la detection de proxy s'additionnent.
    const fin = setTimeout(() => { resolve(false); }, 9000);
    const requete = net.request({ method: 'HEAD', url });
    requete.on('response', (rep) => {
      clearTimeout(fin);
      resolve(rep.statusCode >= 200 && rep.statusCode < 400);
    });
    requete.on('error', () => { clearTimeout(fin); resolve(false); });
    requete.end();
  });
}

// =============================================================================
// Fenêtres
// =============================================================================

function bornesValides(bornes) {
  if (!bornes) return null;
  const { screen } = require('electron');
  // Un écran débranché depuis la dernière session laisserait la fenêtre hors champ.
  const visible = screen.getAllDisplays().some((e) => {
    const z = e.workArea;
    return bornes.x < z.x + z.width && bornes.x + bornes.width > z.x
        && bornes.y < z.y + z.height && bornes.y + bornes.height > z.y;
  });
  return visible ? bornes : null;
}

function creerBibliotheque() {
  const memorisee = bornesValides(donnees.get('fenetre'));

  fenetreBibliotheque = new BrowserWindow({
    width: memorisee?.width ?? 1180,
    height: memorisee?.height ?? 760,
    x: memorisee?.x,
    y: memorisee?.y,
    minWidth: 880,
    minHeight: 600,
    show: false,
    backgroundColor: '#06060f',
    title: 'Ludopia',
    icon: iconeApplication(),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    titleBarOverlay: process.platform === 'darwin' ? false : couleursBarre(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  /* Le micro, et rien d'autre.
     Sans gestionnaire explicite, Electron accorde à peu près tout ce qu'une
     page demande. On énumère donc ce qui a une raison d'exister ici : le mode
     audio a besoin du micro, l'interface a besoin d'écrire dans le
     presse-papiers. La caméra, la position, les périphériques USB n'ont aucun
     usage dans un lanceur de jeux, et le jour où une page en demanderait, ce
     serait un signe et pas une commodité. */
  fenetreBibliotheque.webContents.session.setPermissionRequestHandler(
    (_wc, permission, callback, details) => {
      if (permission === 'media') {
        // `mediaTypes` est absent sur certaines versions : à défaut, on
        // n'accorde rien plutôt que d'accorder la caméra par inadvertance.
        const types = details?.mediaTypes || [];
        callback(types.length > 0 && types.every((t) => t === 'audio'));
        return;
      }
      callback(['clipboard-sanitized-write', 'fullscreen'].includes(permission));
    },
  );
  fenetreBibliotheque.webContents.session.setPermissionCheckHandler(
    (_wc, permission, _origine, details) => {
      if (permission === 'media') return details?.mediaType === 'audio';
      return ['clipboard-sanitized-write', 'fullscreen'].includes(permission);
    },
  );

  fenetreBibliotheque.loadFile(path.join(__dirname, 'interface', 'index.html'));
  fenetreBibliotheque.once('ready-to-show', () => {
    // Démarrer réduit sert à qui lance Ludopia au démarrage de sa session :
    // le lanceur se tient prêt sans s'imposer devant ce qu'on faisait.
    if (reglages().demarrerReduit) fenetreBibliotheque.minimize();
    fenetreBibliotheque.show();
  });

  const retenirBornes = () => {
    if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()
        && !fenetreBibliotheque.isMaximized() && !fenetreBibliotheque.isMinimized()) {
      donnees.set('fenetre', fenetreBibliotheque.getBounds());
    }
  };
  fenetreBibliotheque.on('resized', retenirBornes);
  fenetreBibliotheque.on('moved', retenirBornes);
  fenetreBibliotheque.on('closed', () => { fenetreBibliotheque = null; });

  // Tout lien externe part dans le navigateur du système.
  fenetreBibliotheque.webContents.setWindowOpenHandler(({ url }) => {
    ouvrirDehors(url);
    return { action: 'deny' };
  });

  return fenetreBibliotheque;
}

/** N'ouvre au-dehors que du http(s) : `file:` ou `javascript:` seraient dangereux. */
function ouvrirDehors(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:') shell.openExternal(url);
  } catch { /* URL illisible : on ignore */ }
}

function lancerJeu(id) {
  const jeu = catalogue.jeux.find((j) => j.id === id);
  if (!jeu || !jeu.url) return { ok: false, raison: 'indisponible' };

  const deja = fenetresJeu.get(id);
  if (deja && !deja.isDestroyed()) {
    if (deja.isMinimized()) deja.restore();
    deja.focus();
    return { ok: true, deja: true };
  }

  const stats = donnees.statsJeu(id);
  const memorisee = bornesValides(stats.fenetre);

  const fenetre = new BrowserWindow({
    width: memorisee?.width ?? jeu.fenetre?.largeur ?? 1280,
    height: memorisee?.height ?? jeu.fenetre?.hauteur ?? 820,
    x: memorisee?.x,
    y: memorisee?.y,
    minWidth: 360,
    minHeight: 520,
    show: false,
    backgroundColor: jeu.encre || '#06060f',
    title: `${jeu.nom} — Ludopia`,
    icon: iconeApplication(),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Chaque jeu a sa propre partition : les sessions ne se mélangent pas et
      // se conservent d'un lancement à l'autre.
      partition: `persist:jeu-${id}`,
    },
  });

  fenetre.loadURL(jeu.url);
  fenetre.once('ready-to-show', () => fenetre.show());

  brider(fenetre, jeu);
  raccourcis(fenetre);

  fenetresJeu.set(id, fenetre);
  chronos.set(id, Date.now());
  social.signalerJeu(id);
  donnees.majStatsJeu(id, {
    lancements: stats.lancements + 1,
    derniereFois: new Date().toISOString(),
  });
  donnees.set('dernierJeu', id);

  const retenirBornes = () => {
    if (!fenetre.isDestroyed() && !fenetre.isMaximized() && !fenetre.isMinimized()) {
      donnees.majStatsJeu(id, { fenetre: fenetre.getBounds() });
    }
  };
  fenetre.on('resized', retenirBornes);
  fenetre.on('moved', retenirBornes);

  fenetre.on('closed', () => {
    compterTemps(id);
    fenetresJeu.delete(id);
    // On annonce le jeu encore ouvert, s'il en reste un.
    social.signalerJeu([...fenetresJeu.keys()][0] || null);
    prevenirBibliotheque();
  });

  prevenirBibliotheque();
  return { ok: true };
}

/**
 * Enferme la fenêtre dans les origines du jeu. Sans cela, un lien vers un
 * réseau social ou une page de paiement s'ouvrirait dans la fenêtre de jeu,
 * sans barre d'adresse — l'utilisateur ne pourrait plus voir où il se trouve.
 */
function brider(fenetre, jeu) {
  const permises = new Set((jeu.origines?.length ? jeu.origines : [jeu.url]).map((u) => new URL(u).origin));

  const autorisee = (url) => {
    try { return permises.has(new URL(url).origin); } catch { return false; }
  };

  fenetre.webContents.on('will-navigate', (evt, url) => {
    if (!autorisee(url)) {
      evt.preventDefault();
      ouvrirDehors(url);
    }
  });

  fenetre.webContents.setWindowOpenHandler(({ url }) => {
    if (autorisee(url)) {
      // Un paiement ou une connexion tierce ouvre souvent une fenêtre fille :
      // on la laisse vivre, bridée elle aussi.
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          backgroundColor: jeu.encre || '#06060f',
          autoHideMenuBar: true,
          webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
        },
      };
    }
    ouvrirDehors(url);
    return { action: 'deny' };
  });

  // Le jeu n'a besoin ni du micro, ni de la caméra, ni de la position.
  fenetre.webContents.session.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(['fullscreen', 'clipboard-sanitized-write'].includes(permission));
  });
}

function raccourcis(fenetre) {
  fenetre.webContents.on('before-input-event', (evt, entree) => {
    if (entree.type !== 'keyDown') return;
    const cmd = process.platform === 'darwin' ? entree.meta : entree.control;

    if (entree.key === 'F11' || (cmd && entree.shift && entree.key.toLowerCase() === 'f')) {
      evt.preventDefault();
      fenetre.setFullScreen(!fenetre.isFullScreen());
    } else if (entree.key === 'Escape' && fenetre.isFullScreen()) {
      evt.preventDefault();
      fenetre.setFullScreen(false);
    } else if (cmd && entree.key.toLowerCase() === 'r') {
      evt.preventDefault();
      fenetre.webContents.reload();
    } else if (cmd && entree.shift && entree.key.toLowerCase() === 'l') {
      evt.preventDefault();
      montrerBibliotheque();
    }
  });
}

function compterTemps(id) {
  const debut = chronos.get(id);
  if (!debut) return;
  chronos.delete(id);
  const minutes = Math.round((Date.now() - debut) / 60000);
  if (minutes > 0) {
    donnees.majStatsJeu(id, { minutes: donnees.statsJeu(id).minutes + minutes });
  }
}

function montrerBibliotheque() {
  if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()) {
    if (fenetreBibliotheque.isMinimized()) fenetreBibliotheque.restore();
    fenetreBibliotheque.show();
    fenetreBibliotheque.focus();
  } else {
    creerBibliotheque();
  }
}

function prevenirBibliotheque() {
  if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()) {
    fenetreBibliotheque.webContents.send('jeux:changement', [...fenetresJeu.keys()]);
  }
}

// =============================================================================
// Icône, menu, zone de notification
// =============================================================================

function iconeApplication() {
  const candidats = process.platform === 'win32'
    ? ['ressources/icon.ico', 'ressources/icones/256x256.png']
    : ['ressources/icones/512x512.png', 'ressources/icon.png'];
  for (const c of candidats) {
    const p = path.join(RACINE, c);
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

function creerPlateau() {
  const chemin = path.join(RACINE, 'ressources/icones/32x32.png');
  if (!fs.existsSync(chemin)) return;
  plateau = new Tray(nativeImage.createFromPath(chemin));
  plateau.setToolTip('Ludopia');
  plateau.setContextMenu(Menu.buildFromTemplate([
    { label: 'Ouvrir la bibliothèque', click: montrerBibliotheque },
    { type: 'separator' },
    { label: 'ludopia.fr', click: () => ouvrirDehors(SITE) },
    { type: 'separator' },
    { label: 'Quitter', click: () => app.quit() },
  ]));
  plateau.on('click', montrerBibliotheque);
}

function creerMenu() {
  const surMac = process.platform === 'darwin';
  const modele = [
    ...(surMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'Fichier',
      submenu: [
        { label: 'Bibliothèque', accelerator: 'CmdOrCtrl+Shift+L', click: montrerBibliotheque },
        { type: 'separator' },
        surMac ? { role: 'close' } : { role: 'quit', label: 'Quitter' },
      ],
    },
    { role: 'editMenu', label: 'Édition' },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Recharger' },
        { role: 'togglefullscreen', label: 'Plein écran' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Taille normale' },
        { role: 'zoomIn', label: 'Agrandir' },
        { role: 'zoomOut', label: 'Réduire' },
      ],
    },
    {
      label: 'Aide',
      submenu: [
        { label: 'Rechercher une mise à jour…',
          click: () => maj.chercher(true, fenetreBibliotheque) },
        { type: 'separator' },
        { label: 'Site de Ludopia', click: () => ouvrirDehors(SITE) },
        { label: 'Nous écrire', click: () => ouvrirDehors(`${SITE}/contact.html`) },
        { type: 'separator' },
        {
          label: 'À propos',
          click: () => dialog.showMessageBox({
            type: 'info',
            title: 'À propos de Ludopia',
            message: `Ludopia ${app.getVersion()}`,
            detail: `Le lanceur des jeux Ludopia.\nElectron ${process.versions.electron} · Chromium ${process.versions.chrome}\n\nludopia.fr`,
            buttons: ['Fermer'],
          }),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(modele));
}

// =============================================================================
// Passerelle avec l'interface
// =============================================================================

function brancherIpc() {
  ipcMain.handle('catalogue:lire', () => ({
    catalogue,
    ouverts: [...fenetresJeu.keys()],
    langue: donnees.get('langue') || (app.getLocale().startsWith('fr') ? 'fr' : 'en'),
    dernierJeu: donnees.get('dernierJeu'),
    versionLanceur: app.getVersion(),
  }));

  ipcMain.handle('stats:lire', () => {
    const sortie = {};
    for (const jeu of catalogue.jeux) {
      const s = donnees.statsJeu(jeu.id);
      // Le chrono en cours compte, sinon le temps affiché n'avancerait qu'à la
      // fermeture de la fenêtre de jeu.
      const encours = chronos.get(jeu.id);
      sortie[jeu.id] = {
        ...s,
        minutes: s.minutes + (encours ? Math.round((Date.now() - encours) / 60000) : 0),
        ouvert: fenetresJeu.has(jeu.id),
      };
    }
    return sortie;
  });

  ipcMain.handle('jeu:lancer', (_evt, id) => lancerJeu(id));

  ipcMain.handle('jeu:fermer', (_evt, id) => {
    const f = fenetresJeu.get(id);
    if (f && !f.isDestroyed()) f.close();
    return true;
  });

  ipcMain.handle('jeu:joignable', async (_evt, id) => {
    const jeu = catalogue.jeux.find((j) => j.id === id);
    return joignable(jeu?.url);
  });

  ipcMain.handle('langue:definir', (_evt, langue) => donnees.set('langue', langue));

  ipcMain.handle('lien:ouvrir', (_evt, url) => { ouvrirDehors(url); });

  ipcMain.handle('actualites:lire', () => chargerActualites());
  ipcMain.handle('classement:lire', () => social.classement());

  ipcMain.handle('reglages:lire', () => reglages());
  ipcMain.handle('reglages:definir', (_e, valeurs) => {
    donnees.set('reglages', { ...reglages(), ...valeurs });
    avis.reglages(reglages());
    if ('theme' in valeurs) appliquerTheme();
    if ('surimpression' in valeurs) {
      globalShortcut.unregister('F10');
      if (valeurs.surimpression) globalShortcut.register('F10', basculerSurimpression);
      else if (fenetreSurimpression && !fenetreSurimpression.isDestroyed()) {
        fenetreSurimpression.hide();
      }
    }
    return reglages();
  });
  ipcMain.handle('donnees:dossier', () => app.getPath('userData'));
  ipcMain.handle('donnees:ouvrir', () => shell.openPath(app.getPath('userData')));

  // --- service social ---
  ipcMain.handle('social:etat', () => social.etat());
  ipcMain.handle('social:inscription', (_e, pseudo, courriel, mdp) =>
    social.inscription(pseudo, courriel, mdp,
      `${process.platform} ${require('node:os').hostname()}`));
  ipcMain.handle('social:connexion', (_e, identifiant, mdp) =>
    social.connexion(identifiant, mdp,
      `${process.platform} ${require('node:os').hostname()}`));
  ipcMain.handle('social:deconnexion', () => social.deconnexion());

  ipcMain.handle('social:amis', () => social.amis());
  ipcMain.handle('social:ajouterAmi', (_e, code) => social.ajouterAmi(code));
  ipcMain.handle('social:repondreAmi', (_e, id, accepte) => social.repondreAmi(id, accepte));
  ipcMain.handle('social:retirerAmi', (_e, id) => social.retirerAmi(id));
  ipcMain.handle('social:bloquer', (_e, id, actif) => social.bloquer(id, actif));
  ipcMain.handle('social:signaler', (_e, id, motif) => social.signaler(id, motif));

  ipcMain.handle('social:inviter', (_e, vers, jeu) => social.inviter(vers, jeu));

  ipcMain.handle('social:salons', () => social.salons());
  ipcMain.handle('social:creerSalon', (_e, nom, emoji) => social.creerSalon(nom, emoji));
  ipcMain.handle('social:rejoindreSalon', (_e, code) => social.rejoindreSalon(code));
  ipcMain.handle('social:quitterSalon', (_e, salon) => social.quitterSalon(salon));
  ipcMain.handle('social:renommerSalon', (_e, salon, nom, emoji) =>
    social.renommerSalon(salon, nom, emoji));
  ipcMain.handle('social:membresSalon', (_e, salon) => social.membresSalon(salon));
  ipcMain.handle('social:messagesSalon', (_e, salon, depuis) =>
    social.messagesSalon(salon, depuis));
  ipcMain.handle('social:attendreSalon', (_e, salon, depuis) =>
    social.attendreSalon(salon, depuis));
  ipcMain.handle('social:ecrireSalon',
    (_e, salon, texte, repondA) => social.ecrireSalon(salon, texte, repondA));
  ipcMain.handle('social:salonLu', (_e, salon, jusqu) => social.salonLu(salon, jusqu));
  ipcMain.handle('social:inviterDansSalon', (_e, salon, ami) =>
    social.inviterDansSalon(salon, ami));
  ipcMain.handle('social:exclureDuSalon', (_e, salon, membre) =>
    social.exclureDuSalon(salon, membre));

  ipcMain.handle('social:reagir', (_e, sorte, message, emoji) =>
    social.reagir(sorte, message, emoji));
  ipcMain.handle('social:reactions', (_e, avec) => social.reactions(avec));
  ipcMain.handle('social:statut', (_e, statut) => social.definirStatut(statut));
  ipcMain.handle('social:profil', (_e, de) => social.profil(de));
  ipcMain.handle('social:emojis', () => social.emojis());
  // Quel jeu proposer : celui qui est ouvert. Inviter sans jouer n'aurait
  // pas de sens — il n'y aurait rien à rejoindre.
  ipcMain.handle('social:jeuOuvert', () => [...fenetresJeu.keys()][0] || null);

  ipcMain.handle('social:messages', (_e, avec, depuis) => social.messages(avec, depuis));
  ipcMain.handle('social:attendreMessages', (_e, avec, depuis) =>
    social.attendreMessages(avec, depuis));
  ipcMain.handle('social:envoyer',
    (_e, vers, texte, repondA) => social.envoyer(vers, texte, repondA));

  // --- le mode audio ---
  /* Le panneau « Quoi de neuf » : l'accueil le montre UNE fois par version.
     Sans lui, une mise à jour silencieuse donne « j'ai l'impression qu'il n'y
     a rien de nouveau » — dit mot pour mot par le premier utilisateur. */
  ipcMain.handle('nouveautes:etat', () => ({
    version: app.getVersion(),
    aMontrer: donnees.get('versionVue') !== app.getVersion(),
  }));
  ipcMain.on('nouveautes:vues', () => donnees.set('versionVue', app.getVersion()));

  ipcMain.handle('theme:etat', () => ({
    choisi: reglages().theme,
    effectif: themeEffectif(),
  }));

  /* Le système peut basculer pendant qu'on est ouvert — au coucher du soleil,
     sur les réglages automatiques de Windows. Rester sur l'ancien thème
     jusqu'au prochain démarrage se remarque tout de suite. */
  nativeTheme.on('updated', () => {
    if (reglages().theme !== 'systeme') return;
    appliquerTheme();
  });

  /* F10 bascule la surimpression. Le raccourci n'existe que si le réglage est
     allumé : un raccourci global mange la touche pour tout le système, et
     personne n'aime perdre F10 au profit d'une fenêtre qu'il n'a pas demandée. */
  const poserRaccourci = () => {
    globalShortcut.unregister('F10');
    if (reglages().surimpression) {
      globalShortcut.register('F10', basculerSurimpression);
    }
  };
  poserRaccourci();
  ipcMain.on('surimpression:reglageChange', poserRaccourci);

  // Le même geste que F10, pour le bouton des réglages — et parce qu'un
  // raccourci global ne se déclenche pas depuis un clavier synthétique, ce
  // qui rend F10 invérifiable automatiquement. Le verbe, lui, l'est.
  ipcMain.on('surimpression:basculer', basculerSurimpression);

  ipcMain.on('surimpression:masquer', () => {
    if (fenetreSurimpression && !fenetreSurimpression.isDestroyed()) {
      fenetreSurimpression.hide();
    }
  });

  /* Les serveurs et tout ce qui les entoure. Un relais direct : la logique
     vit côté service, et l'interface parle au processus principal qui tient le
     jeton. */
  ipcMain.handle('social:modifierProfil', (_e, d) => social.modifierProfil(d));
  ipcMain.handle('social:passeport', (_e, d) => social.definirPasseport(d));
  ipcMain.handle('ev:liste', (_e, serveur) => social.evenements(serveur));
  ipcMain.handle('ev:creer', (_e, d) => social.creerEvenement(d));
  ipcMain.handle('ev:participer', (_e, id, venir) => social.participerEvenement(id, venir));
  ipcMain.handle('ev:annuler', (_e, id) => social.annulerEvenement(id));
  ipcMain.handle('ev:miens', () => social.mesEvenements());
  ipcMain.handle('sond:creer', (_e, d) => social.creerSondage(d));
  ipcMain.handle('sond:liste', (_e, salon) => social.sondages(salon));
  ipcMain.handle('sond:voter', (_e, id, choix) => social.voterSondage(id, choix));

  ipcMain.handle('srv:liste', () => social.mesServeurs());
  ipcMain.handle('srv:creer', (_e, d) => social.creerServeur(d));
  ipcMain.handle('srv:rejoindre', (_e, d) => social.rejoindreServeur(d));
  ipcMain.handle('srv:quitter', (_e, id) => social.quitterServeur(id));
  ipcMain.handle('srv:modifier', (_e, d) => social.modifierServeur(d));
  ipcMain.handle('srv:contenu', (_e, id) => social.contenuServeur(id));
  ipcMain.handle('srv:membres', (_e, id) => social.membresServeur(id));
  ipcMain.handle('srv:exclure', (_e, id, compte) => social.exclureDuServeur(id, compte));
  ipcMain.handle('srv:ajouterSalon', (_e, d) => social.ajouterSalonServeur(d));
  ipcMain.handle('srv:supprimerSalon', (_e, salon) => social.supprimerSalonServeur(salon));
  ipcMain.handle('srv:annuaire', (_e, filtres) => social.annuaireServeurs(filtres));
  ipcMain.handle('srv:roles', (_e, id) => social.roles(id));
  ipcMain.handle('srv:creerRole', (_e, d) => social.creerRole(d));
  ipcMain.handle('srv:modifierRole', (_e, d) => social.modifierRole(d));
  ipcMain.handle('srv:supprimerRole', (_e, role) => social.supprimerRole(role));
  ipcMain.handle('srv:attribuerRole', (_e, role, compte, retirer) =>
    social.attribuerRole(role, compte, retirer));
  ipcMain.handle('srv:surnom', (_e, id, surnom) => social.definirSurnom(id, surnom));

  ipcMain.handle('boutique:lire', (_e, langue) => social.boutique(langue));
  ipcMain.handle('boutique:acheter', (_e, article) => social.acheterArticle(article));
  ipcMain.handle('boutique:equiper', (_e, emplacement, article) =>
    social.equiperArticle(emplacement, article));

  ipcMain.handle('bourse:lire', () => social.bourse());
  ipcMain.handle('bourse:bonus', () => social.bonusQuotidien());
  ipcMain.handle('bourse:offrir', (_e, vers, montant, mot) =>
    social.offrirLudos(vers, montant, mot));

  ipcMain.handle('voix:salonEntrer', (_e, salon) => social.entrerEnVoixSalon(salon));
  ipcMain.handle('voix:salonBattement', (_e, salon, muet) =>
    social.battementVoixSalon(salon, muet));
  ipcMain.handle('voix:salonSortir', (_e, salon) => social.sortirDeVoixSalon(salon));
  ipcMain.handle('voix:salonSignal', (_e, salon, vers, sorte, charge) =>
    social.signalVoixSalon(salon, vers, sorte, charge));

  ipcMain.handle('voix:glace', () => social.glace());
  ipcMain.handle('voix:appeler', (_e, vers) => social.appelerVoix(vers));
  ipcMain.handle('voix:repondre', (_e, id, accepte) => social.repondreVoix(id, accepte));
  ipcMain.handle('voix:raccrocher', (_e, id, raison) => social.raccrocherVoix(id, raison));
  ipcMain.handle('voix:signal', (_e, id, sorte, charge) => social.signalVoix(id, sorte, charge));
  ipcMain.handle('voix:etat', (_e, id) => social.etatVoix(id));
  ipcMain.handle('social:marquerLus', (_e, avec) => {
    avis.vuePar(avec);
    return social.marquerLus(avec);
  });

  // L'interface dit ce qu'elle affiche : sans cela, un avis partirait pour un
  // message déjà sous les yeux.
  ipcMain.on('social:conversationAffichee', (_e, id) => { conversationOuverte = id || null; });
  ipcMain.on('social:salonAffiche', (_e, id) => {
    salonAffiche = id || null;
    // Lire un salon efface son avis : le laisser serait dire deux fois la
    // même chose.
    if (id) avis.vuePar(`salon:${id}`);
  });

  ipcMain.handle('maj:etat', () => ({ ...maj.etat(), disponible: maj.disponible() }));
  ipcMain.handle('maj:chercher', () => maj.chercher(true, fenetreBibliotheque));
  ipcMain.handle('maj:installer', () => maj.installer());

  ipcMain.handle('catalogue:rafraichir', async () => {
    catalogue = fusionner(catalogueLocal(), await catalogueDistant());
    return catalogue;
  });
}

// =============================================================================
// Cycle de vie
// =============================================================================

app.on('second-instance', montrerBibliotheque);

app.whenReady().then(async () => {
  if (process.platform === 'win32') app.setAppUserModelId('fr.ludopia.lanceur');

  catalogue = catalogueLocal();
  brancherIpc();

  /* Les avis du système. Ils ont besoin de savoir ce que l'utilisateur a sous
     les yeux : signaler un message qu'il est en train de lire serait une
     nuisance. L'interface tient le processus principal au courant de la
     conversation ouverte. */
  avis.reglages(reglages());
  avis.brancher({
    ouvrir: (idAmi) => {
      montrerBibliotheque();
      if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()) {
        fenetreBibliotheque.webContents.send('social:ouvrirConversation', idAmi);
      }
    },
    visible: () => Boolean(fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()
      && fenetreBibliotheque.isVisible() && !fenetreBibliotheque.isMinimized()
      && fenetreBibliotheque.isFocused()),
    conversation: () => conversationOuverte,
    salon: () => salonAffiche,
  });

  social.surMessageSalon((salon, messages) => {
    avis.messageSalonRecu(salon, messages, (id) => {
      montrerBibliotheque();
      if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()) {
        fenetreBibliotheque.webContents.send('social:ouvrirSalon', id);
      }
    });
    if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()) {
      fenetreBibliotheque.webContents.send('social:nouveauxMessages', messages);
    }
    // La surimpression affiche aussi la vie des salons — c'est souvent là que
    // ça parle pendant qu'on joue. Un canal dédié : le nom du salon fait
    // partie du message affiché, pas de la conversation à qui répondre.
    if (fenetreSurimpression && !fenetreSurimpression.isDestroyed()) {
      fenetreSurimpression.webContents.send('surimpression:salon', {
        salon: { id: salon.id, nom: salon.nom, emoji: salon.emoji },
        messages,
      });
    }
  });

  social.surMessages(async (recus) => {
    // Le service donne des identifiants, pas des pseudos : on les retrouve
    // dans la liste d'amis, qui les porte déjà.
    const r = await social.amis();
    if (!r.ok) return;
    const parId = new Map((r.donnees.amis || []).map((a) => [a.id, a]));

    const parExpediteur = new Map();
    for (const m of recus) {
      if (!parExpediteur.has(m.expediteur)) parExpediteur.set(m.expediteur, []);
      parExpediteur.get(m.expediteur).push(m.texte);
    }

    for (const [id, textes] of parExpediteur) {
      const ami = parId.get(id);
      if (ami) avis.messageRecu(ami, textes);
    }

    if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()) {
      fenetreBibliotheque.webContents.send('social:nouveauxMessages', recus);
    }
    // La surimpression aussi : c'est même toute sa raison d'être — elle vit
    // précisément quand la fenêtre principale est derrière le jeu.
    if (fenetreSurimpression && !fenetreSurimpression.isDestroyed()) {
      fenetreSurimpression.webContents.send('social:nouveauxMessages', recus);
    }
  });

  /* Les signaux de la voix vont droit à l'interface : c'est elle qui tient la
     connexion. Le processus principal n'en retient qu'une chose — une sonnerie
     mérite un avis système, parce qu'elle arrive souvent pendant une partie,
     lanceur réduit, et qu'un appel qu'on ne voit pas est un appel manqué. */
  social.surSignaux(async (signaux) => {
    if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()) {
      fenetreBibliotheque.webContents.send('voix:signaux', signaux);
    }

    // Un appel qui se termine ferme son avis : une notification qui propose
    // encore de répondre à quelqu'un qui a raccroché est pire qu'aucune.
    for (const x of signaux) {
      if (x.sorte !== 'raccroche') continue;
      const fermer = sonneriesEnCours.get(x.appel);
      if (fermer) { fermer(); sonneriesEnCours.delete(x.appel); }
    }

    const sonneries = signaux.filter((x) => x.sorte === 'sonne');
    if (!sonneries.length) return;

    const r = await social.amis();
    const parId = new Map(r.ok ? (r.donnees.amis || []).map((a) => [a.id, a]) : []);

    for (const x of sonneries) {
      const ami = parId.get(x.de);
      if (!ami) continue;
      const fermer = avis.appelRecu(ami, () => {
        montrerBibliotheque();
        if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()) {
          fenetreBibliotheque.webContents.send('voix:decrocher', x.appel);
        }
      });
      if (fermer) sonneriesEnCours.set(x.appel, fermer);
    }
  });

  social.surInvitation(async (invitations) => {
    for (const inv of invitations) {
      const jeu = catalogue.jeux.find((j) => j.id === inv.jeu);
      avis.invitationRecue(
        { id: inv.ami, pseudo: inv.pseudo },
        inv.jeu,
        jeu ? jeu.nom : inv.jeu,
        () => { montrerBibliotheque(); lancerJeu(inv.jeu); },
      );
      // Vue une fois signalée : sans cela le même avis reviendrait toutes les
      // dix secondes pendant dix minutes.
      await social.invitationVue(inv.id);
    }
  });

  /* La ronde du soir : entre dix-huit heures et minuit, heure locale, on
     regarde une fois par heure si des séries se perdent aujourd'hui. C'est le
     lanceur qui décide de l'heure — le service n'a ni le fuseau de chacun, ni
     le droit de décréter qu'il est vingt heures quelque part. Un avis par
     série et par soirée, pas un tir de barrage. */
  const seriesPrevenues = new Set();
  setInterval(async () => {
    const heure = new Date().getHours();
    if (heure < 18) { seriesPrevenues.clear(); return; }
    if (!social.etat().connecte) return;

    const r = await social.seriesEnPeril();
    if (!r.ok) return;
    for (const x of r.donnees.enPeril || []) {
      if (!x.pseudo || seriesPrevenues.has(x.ami)) continue;
      seriesPrevenues.add(x.ami);
      avis.serieEnPeril(x.pseudo, x.jours, () => montrerBibliotheque());
    }
  }, 3600 * 1000);

  social.surChangement(() => {
    if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()) {
      fenetreBibliotheque.webContents.send('social:changement', social.etat());
    }
  });
  social.reprendre();

  maj.brancher();
  maj.surChangement((etat) => {
    if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()) {
      fenetreBibliotheque.webContents.send('maj:changement', etat);
    }
  });
  creerMenu();
  creerBibliotheque();
  creerPlateau();
  maj.retenirFenetre(fenetreBibliotheque);
  maj.surveiller();

  // Le catalogue distant arrive après coup : la bibliothèque s'affiche tout de
  // suite avec ce qui est livré, puis se met à jour si le réseau répond.
  const distant = await catalogueDistant();
  if (distant) {
    catalogue = fusionner(catalogueLocal(), distant);
    if (fenetreBibliotheque && !fenetreBibliotheque.isDestroyed()) {
      fenetreBibliotheque.webContents.send('catalogue:maj', catalogue);
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) creerBibliotheque();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  for (const id of [...chronos.keys()]) compterTemps(id);
  donnees.vider();
});

// Aucune fenêtre de ce lanceur n'a besoin de Node : on refuse toute tentative
// d'attacher un preload ou d'activer l'intégration Node depuis une page web.
app.on('web-contents-created', (_evt, contenu) => {
  contenu.on('will-attach-webview', (evt) => evt.preventDefault());
});
