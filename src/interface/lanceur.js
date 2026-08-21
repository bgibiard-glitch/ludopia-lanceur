'use strict';

/**
 * Interface de la bibliothèque. Aucun accès direct au système : tout passe par
 * `window.ludopia`, la passerelle posée par le preload.
 */

const $ = (sel, racine = document) => racine.querySelector(sel);

const TEXTES = {
  fr: {
    bibliotheque: 'Bibliothèque',
    siteWeb: 'Site de Ludopia',
    chargement: 'Chargement de la bibliothèque…',
    jouer: 'Jouer',
    reprendre: 'Revenir au jeu',
    fermer: 'Fermer le jeu',
    bientot: 'Bientôt',
    ficheWeb: 'Voir la fiche',
    enLigne: 'En ligne',
    injoignable: 'Injoignable',
    aVenir: 'En chantier',
    joue: 'En cours de partie',
    verification: 'Vérification…',
    jamais: 'Jamais lancé',
    tempsDeJeu: 'Temps de jeu',
    minutes: 'minutes',
    heures: 'heures',
    apropos: 'À propos',
    genres: 'Genres',
    editeur: 'Éditeur',
    public: 'Public',
    lancements: 'Lancements',
    derniereFois: 'Dernière partie',
    plateformes: 'Plateformes',
    navigateur: 'Navigateur et bureau',
    aujourdhui: "aujourd'hui",
    hier: 'hier',
    ilYaJours: (n) => `il y a ${n} jours`,
    lanceur: 'Lanceur',
  },
  en: {
    bibliotheque: 'Library',
    siteWeb: 'Ludopia website',
    chargement: 'Loading your library…',
    jouer: 'Play',
    reprendre: 'Back to game',
    fermer: 'Close game',
    bientot: 'Soon',
    ficheWeb: 'View page',
    enLigne: 'Online',
    injoignable: 'Unreachable',
    aVenir: 'In the works',
    joue: 'Playing now',
    verification: 'Checking…',
    jamais: 'Never launched',
    tempsDeJeu: 'Time played',
    minutes: 'minutes',
    heures: 'hours',
    apropos: 'About',
    genres: 'Genres',
    editeur: 'Publisher',
    public: 'Audience',
    lancements: 'Launches',
    derniereFois: 'Last played',
    plateformes: 'Platforms',
    navigateur: 'Browser and desktop',
    aujourdhui: 'today',
    hier: 'yesterday',
    ilYaJours: (n) => `${n} days ago`,
    lanceur: 'Launcher',
  },
};

const ICONE_JOUER =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z"/></svg>';

let etat = {
  langue: 'fr',
  catalogue: null,
  stats: {},
  ouverts: [],
  joignables: {},   // id -> true | false | undefined (pas encore vérifié)
  choisi: null,
};

const T = () => TEXTES[etat.langue];

// =============================================================================
// Mise en forme
// =============================================================================

function duree(minutes) {
  const t = T();
  if (!minutes) return `0 ${t.minutes}`;
  if (minutes < 60) return `${minutes} ${t.minutes}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} ${t.heures}`;
}

function quand(iso) {
  if (!iso) return T().jamais;
  const alors = new Date(iso);
  if (Number.isNaN(alors.getTime())) return T().jamais;
  // On compare des jours calendaires, pas des tranches de 24 h : une partie
  // d'hier soir doit dire « hier », pas « aujourd'hui ».
  const jour = (d) => Math.floor((d - d.getTimezoneOffset() * 60000) / 86400000);
  const ecart = jour(new Date()) - jour(alors);
  if (ecart <= 0) return T().aujourdhui;
  if (ecart === 1) return T().hier;
  if (ecart < 30) return T().ilYaJours(ecart);
  return alors.toLocaleDateString(etat.langue === 'fr' ? 'fr-FR' : 'en-GB');
}

/** État d'un jeu, dans l'ordre de priorité d'affichage. */
function etatJeu(jeu) {
  if (etat.ouverts.includes(jeu.id)) return 'joue';
  if (jeu.statut === 'a-venir' || !jeu.url) return 'a-venir';
  const j = etat.joignables[jeu.id];
  if (j === undefined) return 'inconnu';
  return j ? 'en-ligne' : 'injoignable';
}

function libelleEtat(cle) {
  const t = T();
  return { joue: t.joue, 'en-ligne': t.enLigne, injoignable: t.injoignable,
    'a-venir': t.aVenir, inconnu: t.verification }[cle];
}

// =============================================================================
// Rail
// =============================================================================

function dessinerRail() {
  const rail = $('#rail');
  rail.textContent = '';

  for (const jeu of etat.catalogue.jeux) {
    const cle = etatJeu(jeu);
    const li = document.createElement('li');
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'rail-jeu';
    bouton.dataset.etat = cle;
    bouton.style.setProperty('--accent', jeu.accent);
    bouton.setAttribute('aria-current', String(jeu.id === etat.choisi));

    const logo = document.createElement('img');
    logo.src = jeu.logo || 'medias/logo.svg';
    logo.alt = '';
    logo.width = 34;
    logo.height = 34;

    const bloc = document.createElement('div');
    const nom = document.createElement('span');
    nom.className = 'rail-nom';
    nom.textContent = jeu.nom;
    const sous = document.createElement('span');
    sous.className = 'rail-etat';
    sous.innerHTML = '<b></b>';
    sous.append(libelleEtat(cle));
    bloc.append(nom, sous);

    bouton.append(logo, bloc);
    bouton.addEventListener('click', () => choisir(jeu.id));
    li.append(bouton);
    rail.append(li);
  }
}

// =============================================================================
// Scène
// =============================================================================

function ligne(dl, cle, valeur) {
  const bloc = document.createElement('div');
  bloc.className = 'fiche-ligne';
  const dt = document.createElement('dt');
  dt.textContent = cle;
  const dd = document.createElement('dd');
  dd.textContent = valeur;
  bloc.append(dt, dd);
  dl.append(bloc);
}

function dessinerScene() {
  const jeu = etat.catalogue.jeux.find((j) => j.id === etat.choisi);
  if (!jeu) return;

  const t = T();
  const loc = jeu[etat.langue] || jeu.fr;
  const cle = etatJeu(jeu);
  const stats = etat.stats[jeu.id] || { minutes: 0, lancements: 0, derniereFois: null };
  const jouable = Boolean(jeu.url) && jeu.statut !== 'a-venir';

  const scene = $('#scene');
  scene.textContent = '';
  scene.style.setProperty('--accent', jeu.accent);
  scene.style.setProperty('--accent-ink', jeu.encre || '#080813');

  // --- affiche ---
  const affiche = document.createElement('section');
  affiche.className = jeu.jaquette ? 'affiche' : 'affiche affiche--nu';

  if (jeu.jaquette) {
    const fond = document.createElement('img');
    fond.className = 'affiche-fond';
    fond.src = jeu.jaquette;
    fond.alt = '';
    affiche.append(fond);
  }

  const pastille = document.createElement('span');
  pastille.className = 'pastille';
  pastille.dataset.etat = cle;
  pastille.innerHTML = '<b></b>';
  pastille.append(libelleEtat(cle));
  affiche.append(pastille);

  const marque = document.createElement('div');
  marque.className = 'affiche-marque';
  if (jeu.logo) {
    const l = document.createElement('img');
    l.src = jeu.logo;
    l.alt = '';
    l.width = 52;
    l.height = 52;
    marque.append(l);
  }
  const h1 = document.createElement('h1');
  h1.textContent = jeu.nom;
  marque.append(h1);
  affiche.append(marque);

  const accroche = document.createElement('p');
  accroche.className = 'affiche-accroche';
  accroche.textContent = loc.accroche;
  affiche.append(accroche);

  // --- actions ---
  const actions = document.createElement('div');
  actions.className = 'actions';

  const jouer = document.createElement('button');
  jouer.type = 'button';
  jouer.className = 'jouer';
  jouer.disabled = !jouable;
  jouer.innerHTML = ICONE_JOUER;
  jouer.append(jouable ? (cle === 'joue' ? t.reprendre : t.jouer) : t.bientot);
  jouer.addEventListener('click', async () => {
    jouer.disabled = true;
    await window.ludopia.lancer(jeu.id);
    // L'état revient par l'événement `jeux:changement`, qui redessine tout.
  });
  actions.append(jouer);

  if (cle === 'joue') {
    const fermer = document.createElement('button');
    fermer.type = 'button';
    fermer.className = 'action-secondaire';
    fermer.textContent = t.fermer;
    fermer.addEventListener('click', () => window.ludopia.fermer(jeu.id));
    actions.append(fermer);
  }

  const fiche = document.createElement('button');
  fiche.type = 'button';
  fiche.className = 'action-secondaire';
  fiche.textContent = t.ficheWeb;
  const chemin = etat.langue === 'fr' ? `jeux/${jeu.id}.html` : `en/games/${jeu.id}.html`;
  fiche.addEventListener('click', () => window.ludopia.ouvrirLien(`https://ludopia.fr/${chemin}`));
  actions.append(fiche);

  affiche.append(actions);
  scene.append(affiche);

  // --- corps ---
  const corps = document.createElement('div');
  corps.className = 'corps';

  const gauche = document.createElement('div');
  const h2 = document.createElement('h2');
  h2.textContent = t.apropos;
  const resume = document.createElement('p');
  resume.className = 'resume';
  resume.textContent = loc.resume;
  gauche.append(h2, resume);

  const etiquettes = document.createElement('div');
  etiquettes.className = 'etiquettes';
  for (const g of loc.genres || []) {
    const s = document.createElement('span');
    s.textContent = g;
    etiquettes.append(s);
  }
  gauche.append(etiquettes);

  if (jeu.vignette) {
    const apercu = document.createElement('figure');
    apercu.className = 'apercu';
    const img = document.createElement('img');
    img.src = jeu.vignette;
    img.alt = '';
    apercu.append(img);
    gauche.append(apercu);
  }
  corps.append(gauche);

  // --- fiche latérale ---
  const aside = document.createElement('aside');
  aside.className = 'fiche';

  const compteur = document.createElement('div');
  compteur.className = 'compteur';
  compteur.innerHTML = `<b>${duree(stats.minutes)}</b><span>${t.tempsDeJeu}</span>`;
  aside.append(compteur);

  const dl = document.createElement('dl');
  ligne(dl, t.derniereFois, quand(stats.derniereFois));
  ligne(dl, t.lancements, String(stats.lancements || 0));
  ligne(dl, t.editeur, 'Ludopia');
  ligne(dl, t.public, loc.public || '—');
  ligne(dl, t.plateformes, t.navigateur);
  aside.append(dl);
  corps.append(aside);

  scene.append(corps);
  scene.scrollTop = 0;
}

function choisir(id) {
  etat.choisi = id;
  dessinerRail();
  dessinerScene();
}

// =============================================================================
// Cycle
// =============================================================================

async function rafraichirStats() {
  etat.stats = await window.ludopia.stats();
}

let sondageEnCours = false;
let prochainSondage = null;

/**
 * Sonde chaque jeu en parallèle et redessine dès qu'une réponse arrive, puis
 * remet ça plus tard.
 *
 * Une passe unique ne suffit pas : une coupure d'une seconde au démarrage
 * marquerait les jeux « injoignables » jusqu'à la fermeture du lanceur, alors
 * qu'ils répondent. On repasse donc régulièrement, et plus vite quand quelque
 * chose n'a pas répondu.
 */
function sonder() {
  if (sondageEnCours) return;
  sondageEnCours = true;
  clearTimeout(prochainSondage);

  const aSonder = etat.catalogue.jeux.filter((j) => j.url);

  Promise.all(aSonder.map((jeu) => window.ludopia.joignable(jeu.id).then((ok) => {
    etat.joignables[jeu.id] = ok;
    dessinerRail();
    if (etat.choisi === jeu.id) dessinerScene();
    return ok;
  }).catch(() => false))).then((resultats) => {
    sondageEnCours = false;
    const toutVaBien = resultats.every(Boolean);
    prochainSondage = setTimeout(sonder, toutVaBien ? 120000 : 20000);
  });
}

function appliquerLangue() {
  document.documentElement.lang = etat.langue;
  $('[data-langue]').textContent = etat.langue === 'fr' ? 'EN' : 'FR';
  for (const el of document.querySelectorAll('[data-t]')) {
    const v = T()[el.dataset.t];
    if (typeof v === 'string') el.textContent = v;
  }
}

async function demarrer() {
  if (window.ludopia.plateforme === 'darwin') document.body.classList.add('mac');

  const depart = await window.ludopia.demarrage();
  etat.catalogue = depart.catalogue;
  etat.langue = depart.langue;
  etat.ouverts = depart.ouverts;
  etat.choisi = depart.dernierJeu
    && depart.catalogue.jeux.some((j) => j.id === depart.dernierJeu)
    ? depart.dernierJeu
    : depart.catalogue.jeux[0].id;

  $('#version').textContent = `${T().lanceur} ${depart.versionLanceur}`;

  await rafraichirStats();
  appliquerLangue();
  dessinerRail();
  dessinerScene();
  sonder();

  // Le temps de jeu affiché doit avancer pendant qu'une partie tourne.
  setInterval(async () => {
    if (!etat.ouverts.length) return;
    await rafraichirStats();
    dessinerScene();
  }, 60000);

  window.ludopia.surChangementJeux(async (ouverts) => {
    etat.ouverts = ouverts;
    await rafraichirStats();
    dessinerRail();
    dessinerScene();
  });

  // Au retour dans la fenêtre — reprise de veille, changement de réseau —
  // l'état affiché peut dater de plusieurs heures.
  window.addEventListener('focus', sonder);
  window.addEventListener('online', sonder);

  window.ludopia.surCatalogue((catalogue) => {
    etat.catalogue = catalogue;
    if (!catalogue.jeux.some((j) => j.id === etat.choisi)) {
      etat.choisi = catalogue.jeux[0].id;
    }
    dessinerRail();
    dessinerScene();
    sonder();
  });

  $('[data-langue]').addEventListener('click', async () => {
    etat.langue = etat.langue === 'fr' ? 'en' : 'fr';
    await window.ludopia.definirLangue(etat.langue);
    $('#version').textContent = `${T().lanceur} ${depart.versionLanceur}`;
    appliquerLangue();
    dessinerRail();
    dessinerScene();
  });

  for (const el of document.querySelectorAll('[data-ouvrir]')) {
    el.addEventListener('click', () => window.ludopia.ouvrirLien(el.dataset.ouvrir));
  }
}

demarrer().catch((err) => {
  $('#scene').innerHTML =
    `<div class="vide"><p>La bibliothèque n'a pas pu s'ouvrir.</p><p>${err.message}</p></div>`;
});
