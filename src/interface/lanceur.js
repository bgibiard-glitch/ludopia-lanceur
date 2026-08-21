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
    majRecherche: 'Recherche d’une mise à jour…',
    majTelechargement: 'Téléchargement',
    majPrete: 'Mise à jour prête',
    majAJour: 'Rechercher une mise à jour',
    majErreur: 'Mise à jour indisponible',
    accueil: 'Accueil',
    bonjour: 'Votre bibliothèque',
    totalTemps: 'Temps de jeu total',
    totalParties: 'Parties lancées',
    jeuxJoues: 'Jeux essayés',
    prefere: 'Le plus joué',
    aucun: 'aucun',
    reprendre2: 'Reprendre',
    nouvelles: 'Les nouvelles du studio',
    toutesNouvelles: 'Toutes les actualités',
    nouvellesVides: 'Les nouvelles arriveront dès que le réseau répondra.',
    amis: 'Vos amis',
    amisBientot: 'Le réseau d’amis — voir qui joue à quoi, se parler, se lancer des défis — demande un compte Ludopia. Il n’existe pas encore : rien n’est donc affiché ici plutôt que de faire semblant.',
    riensurvous: 'Rien n’est envoyé à Ludopia : ces chiffres ne quittent pas votre machine.',
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
    majRecherche: 'Checking for updates…',
    majTelechargement: 'Downloading',
    majPrete: 'Update ready',
    majAJour: 'Check for updates',
    majErreur: 'Updates unavailable',
    accueil: 'Home',
    bonjour: 'Your library',
    totalTemps: 'Total time played',
    totalParties: 'Sessions started',
    jeuxJoues: 'Games tried',
    prefere: 'Most played',
    aucun: 'none',
    reprendre2: 'Resume',
    nouvelles: 'News from the studio',
    toutesNouvelles: 'All the news',
    nouvellesVides: 'News will show up as soon as the network answers.',
    amis: 'Your friends',
    amisBientot: 'The friends network — seeing who plays what, chatting, sending challenges — needs a Ludopia account. There is none yet, so nothing is shown here rather than pretending.',
    riensurvous: 'Nothing is sent to Ludopia: these numbers never leave your machine.',
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
  vue: 'accueil',   // 'accueil' ou 'jeu'
  actualites: null,
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
  $('#accueil')?.setAttribute('aria-current', String(etat.vue === 'accueil'));

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


// =============================================================================
// Accueil
// =============================================================================

/** Somme des minutes, parties et jeux essayés, tous titres confondus. */
function bilan() {
  let minutes = 0;
  let lancements = 0;
  let essayes = 0;
  let prefere = null;

  for (const jeu of etat.catalogue.jeux) {
    const s = etat.stats[jeu.id];
    if (!s) continue;
    minutes += s.minutes || 0;
    lancements += s.lancements || 0;
    if (s.lancements) essayes += 1;
    if (!prefere || (s.minutes || 0) > (etat.stats[prefere.id]?.minutes || 0)) {
      if (s.minutes) prefere = jeu;
    }
  }
  return { minutes, lancements, essayes, prefere };
}

function carteChiffre(valeur, libelle) {
  const el = document.createElement('div');
  el.className = 'chiffre';
  const b = document.createElement('b');
  b.textContent = valeur;
  const s = document.createElement('span');
  s.textContent = libelle;
  el.append(b, s);
  return el;
}

function dessinerAccueil() {
  const t = T();
  const scene = $('#scene');
  scene.textContent = '';
  scene.style.setProperty('--accent', 'var(--brand)');
  scene.style.setProperty('--accent-ink', '#080813');

  const b = bilan();

  // --- en-tête et chiffres ---
  const tete = document.createElement('section');
  tete.className = 'acc-tete';
  const h1 = document.createElement('h1');
  h1.textContent = t.bonjour;
  tete.append(h1);

  const chiffres = document.createElement('div');
  chiffres.className = 'chiffres';
  chiffres.append(
    carteChiffre(duree(b.minutes), t.totalTemps),
    carteChiffre(String(b.lancements), t.totalParties),
    carteChiffre(`${b.essayes} / ${etat.catalogue.jeux.length}`, t.jeuxJoues),
    carteChiffre(b.prefere ? b.prefere.nom : t.aucun, t.prefere),
  );
  tete.append(chiffres);

  const note = document.createElement('p');
  note.className = 'acc-note';
  note.textContent = t.riensurvous;
  tete.append(note);
  scene.append(tete);

  // --- reprendre la dernière partie ---
  const dernier = etat.catalogue.jeux.find((j) => j.id === etat.choisi && j.url)
    || etat.catalogue.jeux.find((j) => etat.stats[j.id]?.lancements && j.url);
  if (dernier) {
    const bloc = document.createElement('section');
    bloc.className = 'acc-bloc';
    bloc.style.setProperty('--accent', dernier.accent);
    bloc.style.setProperty('--accent-ink', dernier.encre || '#080813');

    const h2 = document.createElement('h2');
    h2.textContent = t.reprendre2;
    bloc.append(h2);

    const carte = document.createElement('div');
    carte.className = 'reprise';
    if (dernier.jaquette) {
      const img = document.createElement('img');
      img.className = 'reprise-fond';
      img.src = dernier.jaquette;
      img.alt = '';
      carte.append(img);
    }
    const corps = document.createElement('div');
    corps.className = 'reprise-corps';
    const nom = document.createElement('p');
    nom.className = 'reprise-nom';
    nom.textContent = dernier.nom;
    const meta = document.createElement('p');
    meta.className = 'reprise-meta';
    meta.textContent = `${duree(etat.stats[dernier.id]?.minutes || 0)} · ${quand(etat.stats[dernier.id]?.derniereFois)}`;
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'jouer';
    bouton.innerHTML = ICONE_JOUER;
    bouton.append(etat.ouverts.includes(dernier.id) ? t.reprendre : t.jouer);
    bouton.addEventListener('click', () => window.ludopia.lancer(dernier.id));
    corps.append(nom, meta, bouton);
    carte.append(corps);
    bloc.append(carte);
    scene.append(bloc);
  }

  // --- les nouvelles ---
  const bloc = document.createElement('section');
  bloc.className = 'acc-bloc';
  const h2 = document.createElement('h2');
  h2.textContent = t.nouvelles;
  bloc.append(h2);

  const articles = etat.actualites?.langues?.[etat.langue]?.articles || [];
  if (!articles.length) {
    const vide = document.createElement('p');
    vide.className = 'acc-vide';
    vide.textContent = t.nouvellesVides;
    bloc.append(vide);
  } else {
    const liste = document.createElement('div');
    liste.className = 'nouvelles';
    for (const a of articles.slice(0, 6)) {
      const el = document.createElement('article');
      el.className = 'nouvelle';
      el.style.setProperty('--accent', a.accent);
      const meta = document.createElement('p');
      meta.className = 'nouvelle-meta';
      meta.textContent = [a.date, a.jeu, a.version].filter(Boolean).join(' · ');
      const titre = document.createElement('h3');
      titre.textContent = a.titre;
      const resume = document.createElement('p');
      resume.className = 'nouvelle-resume';
      resume.textContent = a.resume;
      el.append(meta, titre, resume);
      liste.append(el);
    }
    bloc.append(liste);

    const lien = document.createElement('button');
    lien.type = 'button';
    lien.className = 'action-secondaire';
    lien.textContent = t.toutesNouvelles;
    const url = etat.actualites.langues[etat.langue].url;
    lien.addEventListener('click', () => window.ludopia.ouvrirLien(url));
    bloc.append(lien);
  }
  scene.append(bloc);

  // --- les amis, honnêtement ---
  const amis = document.createElement('section');
  amis.className = 'acc-bloc';
  const h2a = document.createElement('h2');
  h2a.textContent = t.amis;
  const p = document.createElement('p');
  p.className = 'acc-vide';
  p.textContent = t.amisBientot;
  amis.append(h2a, p);
  scene.append(amis);

  scene.scrollTop = 0;
}

function ouvrirAccueil() {
  etat.vue = 'accueil';
  dessinerRail();
  dessinerAccueil();
}

function choisir(id) {
  etat.choisi = id;
  etat.vue = 'jeu';
  dessinerRail();
  dessinerScene();
}

/** Redessine la vue courante — accueil ou fiche de jeu. */
function redessiner() {
  dessinerRail();
  if (etat.vue === 'accueil') dessinerAccueil();
  else dessinerScene();
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
    // Sans le test sur la vue, la réponse du sondage écrasait la page
    // d'accueil par la fiche du jeu resté sélectionné.
    if (etat.vue === 'jeu' && etat.choisi === jeu.id) dessinerScene();
    return ok;
  }).catch(() => false))).then((resultats) => {
    sondageEnCours = false;
    const toutVaBien = resultats.every(Boolean);
    prochainSondage = setTimeout(sonder, toutVaBien ? 120000 : 20000);
  });
}

/**
 * Le bouton de mise à jour reste caché quand rien ne se passe : une ligne
 * « à jour » permanente n'apprend rien et encombre le rail. Il n'apparaît que
 * lorsqu'il y a quelque chose à dire ou à faire.
 */
function dessinerMaj(etat) {
  const bouton = $('#maj');
  if (!bouton) return;
  const t = T();

  const libelles = {
    recherche: t.majRecherche,
    telechargement: `${t.majTelechargement} ${etat.progression || 0} %`,
    prete: `${t.majPrete} — ${etat.version || ''}`,
    erreur: t.majErreur,
  };

  const texte = libelles[etat.phase];
  bouton.hidden = !texte;
  if (texte) {
    bouton.textContent = texte;
    bouton.dataset.phase = etat.phase;
  }
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
  ouvrirAccueil();
  sonder();

  $('#accueil')?.addEventListener('click', ouvrirAccueil);

  // Les nouvelles arrivent du site : la page s'affiche sans les attendre.
  window.ludopia.actualites().then((flux) => {
    if (!flux) return;
    etat.actualites = flux;
    if (etat.vue === 'accueil') dessinerAccueil();
  });

  // Le temps de jeu affiché doit avancer pendant qu'une partie tourne.
  setInterval(async () => {
    if (!etat.ouverts.length) return;
    await rafraichirStats();
    redessiner();
  }, 60000);

  window.ludopia.surChangementJeux(async (ouverts) => {
    etat.ouverts = ouverts;
    await rafraichirStats();
    redessiner();
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
    redessiner();
    sonder();
  });

  window.ludopia.surMaj(dessinerMaj);
  window.ludopia.majEtat().then(dessinerMaj);
  $('#maj')?.addEventListener('click', () => window.ludopia.majChercher());

  $('[data-langue]').addEventListener('click', async () => {
    etat.langue = etat.langue === 'fr' ? 'en' : 'fr';
    await window.ludopia.definirLangue(etat.langue);
    $('#version').textContent = `${T().lanceur} ${depart.versionLanceur}`;
    appliquerLangue();
    redessiner();
  });

  for (const el of document.querySelectorAll('[data-ouvrir]')) {
    el.addEventListener('click', () => window.ludopia.ouvrirLien(el.dataset.ouvrir));
  }
}

demarrer().catch((err) => {
  $('#scene').innerHTML =
    `<div class="vide"><p>La bibliothèque n'a pas pu s'ouvrir.</p><p>${err.message}</p></div>`;
});
