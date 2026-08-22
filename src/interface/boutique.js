/**
 * La boutique et la bourse : les Ludos et les apparences.
 *
 * Un seul écran pour les deux, et c'est un choix : une monnaie sans rien à
 * acheter est un compteur, une boutique sans solde affiché est un piège. Les
 * voir ensemble, c'est comprendre l'économie d'un coup d'œil.
 *
 * Les articles n'ont pas d'images : ils ont un descripteur — deux couleurs, un
 * motif, un signe — et la vignette est dessinée ici même en SVG. C'est le même
 * descripteur que liront les jeux, donc ce qu'on voit dans la boutique est ce
 * qu'on obtient partout, par construction.
 */

/* eslint-disable no-use-before-define */

const T_BOUT = {
  fr: {
    titre: 'Boutique',
    solde: 'Ludos',
    bonus: 'Bonus du jour',
    bonusPris: 'Déjà pris',
    bonusRecu: (n, s) => `+${n} Ludos${s ? ` (dont ${s} grâce à vos séries)` : ''} !`,
    porter: 'Porter',
    porte: 'Porté',
    enlever: 'Enlever',
    acheter: (n) => `${n} Ⱡ`,
    possede: 'À vous',
    seGagne: 'Se gagne',
    obtention: {
      'serie-30': 'Série d’amitié de 30 jours',
      fondateur: 'Compte des premiers jours',
      depart: 'Offert à l’inscription',
    },
    raretes: {
      commun: 'Commun', rare: 'Rare', epique: 'Épique', legendaire: 'Légendaire', evenement: 'Événement',
    },
    emplacements: {
      personnage: 'Personnages', chapeau: 'Chapeaux', dos: 'Capes', aura: 'Auras',
      cadre: 'Cadres', banniere: 'Bannières', emote: 'Émotes',
    },
    partout: 'Tout ce que vous portez vous suit dans chaque jeu Ludopia.',
    origine: (jeu) => `Vient de ${jeu}`,
    historique: 'Derniers mouvements',
    connexionRequise: 'Connectez-vous pour voir votre bourse.',
    soldeInsuffisant: 'Il vous manque des Ludos. Jouez, ou repassez demain pour le bonus.',
  },
  en: {
    titre: 'Shop',
    solde: 'Ludos',
    bonus: 'Daily bonus',
    bonusPris: 'Already taken',
    bonusRecu: (n, s) => `+${n} Ludos${s ? ` (${s} thanks to your streaks)` : ''}!`,
    porter: 'Wear',
    porte: 'Worn',
    enlever: 'Take off',
    acheter: (n) => `${n} Ⱡ`,
    possede: 'Yours',
    seGagne: 'Earned',
    obtention: {
      'serie-30': '30-day friendship streak',
      fondateur: 'Early account',
      depart: 'Free at sign-up',
    },
    raretes: {
      commun: 'Common', rare: 'Rare', epique: 'Epic', legendaire: 'Legendary', evenement: 'Event',
    },
    emplacements: {
      personnage: 'Characters', chapeau: 'Hats', dos: 'Capes', aura: 'Auras',
      cadre: 'Frames', banniere: 'Banners', emote: 'Emotes',
    },
    partout: 'Everything you wear follows you into every Ludopia game.',
    origine: (jeu) => `From ${jeu}`,
    historique: 'Recent activity',
    connexionRequise: 'Sign in to see your wallet.',
    soldeInsuffisant: 'Not enough Ludos. Play, or come back tomorrow for the bonus.',
  },
};

const TB = () => T_BOUT[typeof etat !== 'undefined' && etat.langue === 'en' ? 'en' : 'fr'];

const bout = {
  articles: null,
  portes: {},
  bourse: null,
};

// =============================================================================
// La vignette : le descripteur, dessiné
// =============================================================================

/**
 * Un descripteur devient une vignette SVG.
 *
 * C'est volontairement simple — c'est le rendu de secours que tout jeu peut
 * reproduire — et c'est aussi ce qui garantit la promesse : ce qu'on voit ici
 * est le minimum que l'on aura partout.
 */
function vignette(d, emplacement) {
  const p = d?.primaire || '#7c5cff';
  const s = d?.secondaire || p;
  const motif = d?.motif || 'uni';
  const signe = d?.signe || '';

  let fond = `<rect width="80" height="80" rx="16" fill="${p}"/>`;
  if (motif === 'degrade' || motif === 'halo') {
    fond = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p}"/><stop offset="1" stop-color="${s}"/>
      </linearGradient></defs><rect width="80" height="80" rx="16" fill="url(#g)"/>`;
  } else if (motif === 'tuile' || motif === 'cube') {
    fond = `<rect width="80" height="80" rx="16" fill="${p}"/>
      <rect x="8" y="8" width="30" height="30" rx="6" fill="${s}" opacity="0.7"/>
      <rect x="42" y="42" width="30" height="30" rx="6" fill="${s}" opacity="0.7"/>`;
  } else if (motif === 'trait') {
    fond = `<rect width="80" height="80" rx="16" fill="none" stroke="${p}" stroke-width="5"/>`;
  } else if (motif === 'flamme') {
    fond = `<defs><radialGradient id="g" cx="0.5" cy="0.85" r="0.9">
      <stop offset="0" stop-color="${s}"/><stop offset="1" stop-color="${p}"/>
      </radialGradient></defs><rect width="80" height="80" rx="16" fill="url(#g)"/>`;
  }

  const texte = signe
    ? `<text x="40" y="52" font-size="34" text-anchor="middle">${signe}</text>` : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">${fond}${texte}</svg>`;
  const img = document.createElement('img');
  img.className = 'bout-vignette';
  img.alt = '';
  img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  img.dataset.emplacement = emplacement;
  return img;
}

// =============================================================================
// L'écran
// =============================================================================

async function ouvrirBoutique() {
  etat.vue = 'boutique';
  etat.conversation = null;
  etat.salon = null;
  window.ludopia.social.conversationAffichee(null);
  window.ludopia.social.salonAffiche(null);
  dessinerBoutique();

  const [cat, bourse] = await Promise.all([
    window.ludopia.boutique.lire(etat.langue),
    window.ludopia.bourse.lire(),
  ]);
  if (etat.vue !== 'boutique') return;
  if (cat.ok) { bout.articles = cat.donnees.articles || []; bout.portes = cat.donnees.portes || {}; }
  if (bourse.ok) bout.bourse = bourse.donnees;
  dessinerBoutique();
}

function dessinerBoutique() {
  if (etat.vue !== 'boutique') return;
  const t = TB();
  const scene = $('#scene');
  scene.textContent = '';
  document.body.classList.remove('dans-serveur');
  scene.style.setProperty('--accent', 'var(--brand)');

  if (!etat.social.connecte) {
    const tete = document.createElement('section');
    tete.className = 'acc-tete';
    const h1 = document.createElement('h1');
    h1.textContent = t.titre;
    tete.append(h1);
    scene.append(tete, bulle(t.connexionRequise, 'calme'));
    dessinerRail();
    return;
  }

  // --- l'en-tête : le solde et le bonus ---
  const tete = document.createElement('section');
  tete.className = 'acc-tete bout-tete';

  const h1 = document.createElement('h1');
  h1.textContent = t.titre;
  tete.append(h1);

  const solde = document.createElement('div');
  solde.className = 'bout-solde';
  const chiffre = document.createElement('b');
  chiffre.id = 'bout-solde';
  chiffre.textContent = bout.bourse ? String(bout.bourse.solde) : '…';
  const unite = document.createElement('span');
  unite.textContent = ` Ⱡ ${t.solde}`;
  solde.append(chiffre, unite);
  tete.append(solde);

  const bonus = document.createElement('button');
  bonus.type = 'button';
  bonus.className = 'jouer jouer--mini';
  bonus.id = 'bout-bonus';
  const dispo = bout.bourse?.bonusDisponible !== false;
  bonus.textContent = dispo ? `🎁 ${t.bonus}` : t.bonusPris;
  bonus.disabled = !dispo;
  bonus.addEventListener('click', prendreLeBonus);
  tete.append(bonus);

  scene.append(tete);

  const note = document.createElement('p');
  note.className = 'acc-vide bout-note';
  note.textContent = t.partout;
  scene.append(note);

  const retour = document.createElement('div');
  retour.id = 'bout-retour';
  scene.append(retour);

  // --- les rayons, par emplacement ---
  if (!bout.articles) {
    scene.append(bulle('…', 'calme'));
  } else {
    const parEmplacement = new Map();
    for (const a of bout.articles) {
      if (!parEmplacement.has(a.emplacement)) parEmplacement.set(a.emplacement, []);
      parEmplacement.get(a.emplacement).push(a);
    }

    for (const [emplacement, articles] of parEmplacement) {
      const rayon = document.createElement('section');
      rayon.className = 'acc-bloc';

      const h2 = document.createElement('h2');
      h2.textContent = t.emplacements[emplacement] || emplacement;
      rayon.append(h2);

      const grille = document.createElement('div');
      grille.className = 'bout-grille';
      for (const a of articles) grille.append(carteArticle(a));
      rayon.append(grille);

      scene.append(rayon);
    }
  }

  // --- l'historique ---
  if (bout.bourse?.mouvements?.length) {
    const bloc = document.createElement('section');
    bloc.className = 'acc-bloc';
    const h2 = document.createElement('h2');
    h2.textContent = t.historique;
    bloc.append(h2);

    for (const m of bout.bourse.mouvements.slice(0, 10)) {
      const ligne = document.createElement('p');
      ligne.className = 'bout-mouvement';
      const sens = ['gain', 'bonus'].includes(m.sorte) ? '+' : '−';
      const montant = document.createElement('b');
      montant.dataset.sens = sens;
      montant.textContent = `${sens}${m.montant} Ⱡ`;
      ligne.append(montant, document.createTextNode(` ${m.motif || m.sorte}`));
      bloc.append(ligne);
    }
    scene.append(bloc);
  }

  dessinerRail();
  dessinerChats();
  scene.scrollTop = 0;
}

function carteArticle(a) {
  const t = TB();
  const carte = document.createElement('article');
  carte.className = `bout-carte bout-carte--${a.rarete}`;

  carte.append(vignette(a.descripteur, a.emplacement));

  const nom = document.createElement('p');
  nom.className = 'bout-nom';
  nom.textContent = a.nom;
  carte.append(nom);

  const sous = document.createElement('p');
  sous.className = 'bout-sous';
  sous.textContent = t.raretes[a.rarete] || a.rarete;
  if (a.jeuOrigine) {
    const jeu = etat.catalogue?.jeux.find((j) => j.id === a.jeuOrigine);
    if (jeu) sous.textContent += ` · ${t.origine(jeu.nom)}`;
  }
  carte.append(sous);

  const action = document.createElement('button');
  action.type = 'button';

  const portee = bout.portes[a.emplacement] === a.id;

  if (portee) {
    action.className = 'btn-mini bout-action bout-action--porte';
    action.textContent = t.porte;
    action.addEventListener('click', () => equiper(a.emplacement, null));
  } else if (a.possede) {
    action.className = 'btn-mini bout-action';
    action.textContent = t.porter;
    action.addEventListener('click', () => equiper(a.emplacement, a.id));
  } else if (a.obtention) {
    action.className = 'btn-mini bout-action';
    action.disabled = true;
    action.textContent = `🔒 ${t.obtention[a.obtention] || t.seGagne}`;
  } else {
    action.className = 'jouer jouer--mini bout-action';
    action.textContent = t.acheter(a.prix);
    action.addEventListener('click', () => acheterArticle(a));
  }
  carte.append(action);

  return carte;
}

// =============================================================================
// Les gestes
// =============================================================================

async function prendreLeBonus() {
  const t = TB();
  const bouton = document.getElementById('bout-bonus');
  if (bouton) bouton.disabled = true;

  const r = await window.ludopia.bourse.bonus();
  const retour = document.getElementById('bout-retour');
  if (!retour) return;
  retour.textContent = '';

  if (r.ok) {
    retour.append(bulle(t.bonusRecu(r.donnees.recu, r.donnees.parSeries), 'calme'));
    if (bout.bourse) {
      bout.bourse.solde = r.donnees.solde;
      bout.bourse.bonusDisponible = false;
    }
    const solde = document.getElementById('bout-solde');
    if (solde) solde.textContent = String(r.donnees.solde);
    if (bouton) bouton.textContent = t.bonusPris;
  } else {
    retour.append(bulle(messageErreur(r.erreur, r.detail)));
    if (bouton) bouton.disabled = false;
  }
}

async function acheterArticle(a) {
  const t = TB();
  const r = await window.ludopia.boutique.acheter(a.id);
  const retour = document.getElementById('bout-retour');

  if (!r.ok) {
    if (retour) {
      retour.textContent = '';
      retour.append(bulle(r.erreur === 'solde_insuffisant'
        ? t.soldeInsuffisant
        : messageErreur(r.erreur, r.detail)));
    }
    return;
  }

  if (bout.bourse) bout.bourse.solde = r.donnees.solde;
  const article = bout.articles.find((x) => x.id === a.id);
  if (article) article.possede = true;

  /* Acheté, donc porté : c'est ce qu'on attend en achetant un chapeau, et un
     achat qui ne change rien à l'écran ressemble à un achat perdu. */
  await equiper(a.emplacement, a.id);
}

async function equiper(emplacement, article) {
  const r = await window.ludopia.boutique.equiper(emplacement, article);
  if (r.ok) {
    if (article) bout.portes[emplacement] = article;
    else delete bout.portes[emplacement];
    dessinerBoutique();
  }
}
