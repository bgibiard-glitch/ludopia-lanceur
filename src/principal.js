'use strict';

/**
 * Processus principal du lanceur Ludopia.
 *
 * Le lanceur ouvre une fenêtre « bibliothèque » qui affiche le catalogue, et
 * une fenêtre dédiée par jeu. Chaque fenêtre de jeu est bridée à l'origine de
 * son jeu : une navigation vers un autre domaine part dans le navigateur du
 * système, jamais dans la fenêtre.
 */

const { app, BrowserWindow, shell, ipcMain, Menu, Tray, nativeImage, net, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const donnees = require('./donnees');

const RACINE = path.join(__dirname, '..');
const SITE = 'https://ludopia.fr';
// Servi depuis `assets/` et non `/lanceur/` : le dossier `lanceur/` du dépôt
// contient les sources de cette application, il n'est jamais mis en ligne.
const CATALOGUE_DISTANT = `${SITE}/assets/catalogue-jeux.json`;

/** Une seule instance : un second lancement réveille la fenêtre existante. */
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let fenetreBibliotheque = null;
let plateau = null;                       // icône de la zone de notification
const fenetresJeu = new Map();            // id du jeu -> BrowserWindow
const chronos = new Map();                // id du jeu -> horodatage de lancement
let catalogue = null;

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
function catalogueDistant() {
  return new Promise((resolve) => {
    const fin = setTimeout(() => resolve(null), 6000);
    const requete = net.request({ url: CATALOGUE_DISTANT, useSessionCookies: false });
    let corps = '';
    requete.on('response', (rep) => {
      if (rep.statusCode !== 200) { clearTimeout(fin); resolve(null); return; }
      rep.on('data', (m) => { corps += m; });
      rep.on('end', () => {
        clearTimeout(fin);
        try {
          const recu = JSON.parse(corps);
          resolve(Array.isArray(recu.jeux) && recu.jeux.length ? recu : null);
        } catch { resolve(null); }
      });
    });
    requete.on('error', () => { clearTimeout(fin); resolve(null); });
    requete.end();
  });
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
    titleBarOverlay: process.platform === 'darwin' ? false : {
      color: '#06060f',
      symbolColor: '#c5c2e6',
      height: 44,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  fenetreBibliotheque.loadFile(path.join(__dirname, 'interface', 'index.html'));
  fenetreBibliotheque.once('ready-to-show', () => fenetreBibliotheque.show());

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
  creerMenu();
  creerBibliotheque();
  creerPlateau();

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
