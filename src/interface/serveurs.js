/**
 * Les serveurs, côté interface.
 *
 * L'agencement est celui qui s'est imposé partout, et il s'est imposé parce
 * qu'il est juste : une colonne d'icônes pour les serveurs, une colonne pour
 * leurs salons, le contenu au milieu, les membres à droite. Chaque colonne
 * répond à une question différente — où suis-je, de quoi parle-t-on, avec qui.
 *
 * Le lanceur avait déjà deux colonnes : les conversations et la bibliothèque.
 * Les serveurs prennent la place de la seconde quand on en ouvre un, et la
 * rendent quand on en sort. Ajouter une cinquième colonne aurait donné une
 * fenêtre où le contenu occupe le tiers de la largeur.
 *
 * Ce fichier tient l'état des serveurs et tout ce qui les dessine. Il s'appuie
 * sur `lanceur.js` pour les utilitaires communs — `$`, `T()`, `bulle`,
 * `messageErreur` — et sur `voix.js` pour la mécanique des liaisons audio.
 */

/* eslint-disable no-use-before-define */

const T_SRV = {
  fr: {
    serveurs: 'Serveurs',
    creer: 'Créer un serveur',
    rejoindre: 'Rejoindre',
    explorer: 'Explorer',
    annuaire: 'Les serveurs ouverts',
    annuaireAide: 'Classés par activité récente, pas par taille : un serveur de trente '
      + 'personnes qui vit passe devant un serveur de mille qui dort.',
    aucunServeur: 'Aucun serveur ouvert ne correspond.',
    rechercher: 'Chercher un serveur…',
    tousLesJeux: 'Tous les jeux',
    toutesLangues: 'Toutes langues',
    membres: (n) => `${n} membre${n > 1 ? 's' : ''}`,
    enLigne: (n) => `${n} en ligne`,
    entrer: 'Entrer',
    dejaMembre: 'Vous y êtes déjà',
    nom: 'Nom du serveur',
    description: 'De quoi y parle-t-on',
    descriptionAide: 'Obligatoire pour un serveur ouvert : personne n’entre dans un nom.',
    visibilite: 'Qui peut entrer',
    prive: 'Sur invitation',
    public: 'Ouvert à tous',
    priveAide: 'Il faut le code pour entrer. Le serveur ne figure nulle part.',
    publicAide: 'Il figure à l’annuaire. N’importe qui peut entrer.',
    jeuLie: 'Jeu associé',
    aucunJeu: 'Aucun',
    couleur: 'Couleur',
    langue: 'Langue',
    creerAction: 'Créer',
    annuler: 'Annuler',
    codeInvitation: 'Code d’invitation',
    codeAide: 'Huit caractères, à transmettre de la main à la main.',
    entrerParCode: 'Entrer avec un code',
    salons: 'Salons',
    ajouterSalon: 'Ajouter un salon',
    nomSalon: 'Nom du salon',
    sorteSalon: 'Sorte',
    texte: 'Texte',
    vocal: 'Vocal',
    annonces: 'Annonces',
    categorie: 'Catégorie',
    membresTitre: 'Membres',
    reglagesServeur: 'Réglages du serveur',
    roles: 'Rôles',
    quitter: 'Quitter le serveur',
    quitterSur: 'Quitter ce serveur ?',
    partager: 'Partager',
    copie: 'Lien copié.',
    ecrire: 'Votre message…',
    lectureSeule: 'Salon en lecture seule.',
    entrerVocal: 'Rejoindre',
    sortirVocal: 'Quitter le vocal',
    personne: 'Personne pour l’instant',
    salonVide: 'Rien encore. Ouvrez le bal.',
    modeLent: (s) => `Mode lent : encore ${s} s.`,
    officiel: 'Officiel',
    certifie: 'Certifié',
    surnom: 'Votre surnom ici',
    exclure: 'Exclure',
    aucunRole: 'Aucun rôle',
    nouveauRole: 'Nouveau rôle',
    droits: 'Ce que ce rôle permet',
    rang: 'Rang',
    rangAide: 'Plus haut que celui des autres pour pouvoir agir sur eux.',
    enregistrer: 'Enregistrer',
    supprimer: 'Supprimer',
  },
  en: {
    serveurs: 'Servers',
    creer: 'Create a server',
    rejoindre: 'Join',
    explorer: 'Explore',
    annuaire: 'Open servers',
    annuaireAide: 'Sorted by recent activity, not size: a thirty-person server that is '
      + 'alive comes before a thousand-person one that sleeps.',
    aucunServeur: 'No open server matches.',
    rechercher: 'Search a server…',
    tousLesJeux: 'All games',
    toutesLangues: 'All languages',
    membres: (n) => `${n} member${n > 1 ? 's' : ''}`,
    enLigne: (n) => `${n} online`,
    entrer: 'Enter',
    dejaMembre: 'You are already in',
    nom: 'Server name',
    description: 'What is it about',
    descriptionAide: 'Required for an open server: nobody walks into a name.',
    visibilite: 'Who can enter',
    prive: 'By invitation',
    public: 'Open to all',
    priveAide: 'A code is needed. The server is listed nowhere.',
    publicAide: 'It appears in the directory. Anyone can enter.',
    jeuLie: 'Related game',
    aucunJeu: 'None',
    couleur: 'Colour',
    langue: 'Language',
    creerAction: 'Create',
    annuler: 'Cancel',
    codeInvitation: 'Invite code',
    codeAide: 'Eight characters, passed hand to hand.',
    entrerParCode: 'Enter with a code',
    salons: 'Channels',
    ajouterSalon: 'Add a channel',
    nomSalon: 'Channel name',
    sorteSalon: 'Kind',
    texte: 'Text',
    vocal: 'Voice',
    annonces: 'Announcements',
    categorie: 'Category',
    membresTitre: 'Members',
    reglagesServeur: 'Server settings',
    roles: 'Roles',
    quitter: 'Leave server',
    quitterSur: 'Leave this server?',
    partager: 'Share',
    copie: 'Link copied.',
    ecrire: 'Your message…',
    lectureSeule: 'Read-only channel.',
    entrerVocal: 'Join',
    sortirVocal: 'Leave voice',
    personne: 'Nobody yet',
    salonVide: 'Nothing yet. Break the ice.',
    modeLent: (s) => `Slow mode: ${s} s left.`,
    officiel: 'Official',
    certifie: 'Verified',
    surnom: 'Your nickname here',
    exclure: 'Kick',
    aucunRole: 'No role',
    nouveauRole: 'New role',
    droits: 'What this role allows',
    rang: 'Rank',
    rangAide: 'Higher than the others to be able to act on them.',
    enregistrer: 'Save',
    supprimer: 'Delete',
  },
};

const TS = () => T_SRV[typeof etat !== 'undefined' && etat.langue === 'en' ? 'en' : 'fr'];

/* Ce que chaque droit veut dire, en une ligne. La liste des droits vient du
   service — elle vit à un seul endroit — mais leurs noms lisibles vivent ici :
   le service n'a pas à connaître la langue de qui le lit. */
const NOMS_DROITS = {
  fr: {
    ecrire: 'Écrire des messages',
    reagir: 'Réagir aux messages',
    parler: 'Entrer dans les salons vocaux',
    inviter: 'Inviter du monde',
    epingler: 'Épingler des messages',
    ecrireAnnonces: 'Écrire dans les annonces',
    gererSalons: 'Créer et supprimer des salons',
    gererRoles: 'Gérer les rôles',
    gererServeur: 'Modifier le serveur',
    exclure: 'Exclure des membres',
    couperLesAutres: 'Couper le micro des autres',
    mentionnerTous: 'Interpeller tout le monde',
    ignorerLenteur: 'Ignorer le mode lent',
    supprimerMessages: 'Supprimer des messages',
  },
  en: {
    ecrire: 'Send messages',
    reagir: 'React to messages',
    parler: 'Join voice channels',
    inviter: 'Invite people',
    epingler: 'Pin messages',
    ecrireAnnonces: 'Post announcements',
    gererSalons: 'Create and delete channels',
    gererRoles: 'Manage roles',
    gererServeur: 'Edit the server',
    exclure: 'Kick members',
    couperLesAutres: 'Mute others',
    mentionnerTous: 'Mention everyone',
    ignorerLenteur: 'Bypass slow mode',
    supprimerMessages: 'Delete messages',
  },
};

const COULEURS_SERVEUR = [
  '#7c5cff', '#2ee6a8', '#ffb020', '#ff5c7a', '#4d8dff', '#ff7a45', '#c084fc', '#22d3ee',
];

// L'état propre aux serveurs, à côté de celui du lanceur plutôt que dedans :
// il se remet à zéro d'un bloc quand on se déconnecte.
const srv = {
  liste: [],
  ouvert: null,        // identifiant du serveur affiché
  contenu: null,       // { serveur, salons }
  salon: null,         // identifiant du salon affiché
  messages: [],
  membres: [],
  roles: null,
  annuaire: null,
  vue: null,           // null | 'annuaire' | 'creation' | 'reglages' | 'roles'
  sequence: 0,         // garde contre une réponse tardive qui écraserait la suite
};

// =============================================================================
// Chargement
// =============================================================================

async function rafraichirServeurs() {
  if (!etat.social.connecte) { srv.liste = []; return; }
  const r = await window.ludopia.serveurs.mesServeurs();
  if (r.ok) srv.liste = r.donnees.serveurs || [];
}

/**
 * Ouvre un serveur et charge son contenu.
 *
 * La garde de séquence n'est pas un ornement : on clique d'un serveur à
 * l'autre plus vite que le réseau ne répond, et sans elle la réponse du
 * premier écrase l'affichage du second. Le bogue est déroutant — on voit les
 * salons du serveur qu'on vient de quitter.
 */
async function ouvrirServeur(id) {
  const jeton = srv.sequence + 1;
  srv.sequence = jeton;

  srv.ouvert = id;
  srv.vue = null;
  etat.vue = 'serveur';
  etat.conversation = null;
  etat.salon = null;
  window.ludopia.social.conversationAffichee(null);
  window.ludopia.social.salonAffiche(null);

  dessinerServeur();

  const r = await window.ludopia.serveurs.contenu(id);
  if (srv.sequence !== jeton) return;

  if (!r.ok) {
    srv.contenu = null;
    dessinerServeur();
    return;
  }

  srv.contenu = r.donnees;
  // Le premier salon de texte, faute de choix explicite : ouvrir un serveur
  // sur un écran vide donne l'impression qu'il ne contient rien.
  const premier = (r.donnees.salons || []).find((x) => x.sorte !== 'vocal');
  srv.salon = premier ? premier.id : null;
  srv.messages = [];

  dessinerServeur();
  if (srv.salon) chargerSalonServeur(srv.salon);
  chargerMembres(id);
}

async function chargerMembres(id) {
  const r = await window.ludopia.serveurs.membres(id);
  if (r.ok && srv.ouvert === id) {
    srv.membres = r.donnees.membres || [];
    dessinerMembres();
  }
}

async function chargerSalonServeur(salon) {
  const jeton = srv.sequence + 1;
  srv.sequence = jeton;
  srv.salon = salon;
  srv.messages = [];
  dessinerServeur();

  const r = await window.ludopia.social.messagesSalon(salon, 0);
  if (srv.sequence !== jeton) return;
  if (r.ok) {
    srv.messages = r.donnees.messages || [];
    dessinerServeur();
    const fil = $('.srv-fil');
    if (fil) fil.scrollTop = fil.scrollHeight;
    window.ludopia.social.salonLu(salon, srv.messages.at(-1)?.id || 0);
    suivreSalonServeur(salon);
  }
}

/** Attente longue sur le salon affiché. S'arrête dès qu'on en change. */
async function suivreSalonServeur(salon) {
  while (srv.salon === salon && srv.ouvert) {
    const depuis = srv.messages.at(-1)?.id || 0;
    const r = await window.ludopia.social.attendreSalon(salon, depuis);
    if (srv.salon !== salon) return;

    if (r.ok && (r.donnees.messages || []).length) {
      const fil = $('.srv-fil');
      const enBas = fil ? fil.scrollHeight - fil.scrollTop - fil.clientHeight < 60 : true;
      srv.messages.push(...r.donnees.messages);
      dessinerServeur();
      // On ne fait descendre le fil que si l'on y était déjà : sinon on
      // arrache la lecture de quelqu'un qui remontait la conversation.
      if (enBas) {
        const f = $('.srv-fil');
        if (f) f.scrollTop = f.scrollHeight;
      }
      window.ludopia.social.salonLu(salon, srv.messages.at(-1).id);
    } else if (!r.ok && r.erreur !== 'delai_depasse') {
      await new Promise((f) => { setTimeout(f, 4000); });
    }
  }
}

// =============================================================================
// La colonne des icônes
// =============================================================================

/** Les pastilles de serveurs, en tête de la colonne des conversations. */
function pastillesServeurs(colonne) {
  /* Le bouton « + » s'affiche même sans aucun serveur — surtout sans aucun
     serveur : c'est l'unique porte vers l'annuaire, et la cacher au nouveau
     venu revenait à cacher la fonctionnalité entière. Trouvé par le test à
     deux fenêtres, resté invisible à la relecture. */
  if (srv.liste.length) {
    const titre = document.createElement('p');
    titre.className = 'chats-titre';
    titre.textContent = TS().serveurs;
    colonne.append(titre);
  }

  for (const s of srv.liste) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chat-pastille chat-pastille--serveur';
    b.title = s.nom;
    b.setAttribute('aria-label', s.nom);
    b.setAttribute('aria-current', String(srv.ouvert === s.id));
    b.style.setProperty('--teinte', s.couleur || 'var(--brand)');

    const rond = document.createElement('span');
    rond.className = 'chat-rond chat-rond--serveur';
    rond.textContent = s.emoji || '🎮';
    b.append(rond);

    if (s.certifie) {
      const sceau = document.createElement('i');
      sceau.className = 'chat-sceau';
      sceau.textContent = '✓';
      b.append(sceau);
    }

    b.addEventListener('click', () => ouvrirServeur(s.id));
    colonne.append(b);
  }

  const plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'chat-pastille chat-pastille--plus';
  plus.title = TS().explorer;
  plus.setAttribute('aria-label', TS().explorer);
  plus.textContent = '+';
  plus.addEventListener('click', ouvrirAnnuaire);
  colonne.append(plus);

  const trait = document.createElement('hr');
  trait.className = 'chats-trait';
  colonne.append(trait);
  return true;
}

// =============================================================================
// L'écran d'un serveur
// =============================================================================

function dessinerServeur() {
  if (etat.vue !== 'serveur') return;
  dessinerRailServeur();

  const scene = $('#scene');
  scene.textContent = '';
  document.body.classList.add('dans-serveur');

  if (srv.vue === 'annuaire') { dessinerAnnuaire(scene); return; }
  if (srv.vue === 'creation') { dessinerCreation(scene); return; }
  if (srv.vue === 'roles') { dessinerRoles(scene); return; }
  if (srv.vue === 'reglages') { dessinerReglagesServeur(scene); return; }

  if (!srv.contenu) {
    scene.append(bulle('…', 'calme'));
    return;
  }

  const salon = (srv.contenu.salons || []).find((x) => x.id === srv.salon);
  if (!salon) {
    scene.append(bulle(TS().salonVide, 'calme'));
    return;
  }

  if (salon.sorte === 'vocal') { dessinerSalonVocal(scene, salon); return; }
  dessinerSalonTexte(scene, salon);
}

/** La colonne des salons, à la place de la bibliothèque. */
function dessinerRailServeur() {
  const rail = document.querySelector('.rail');
  if (!rail) return;

  let panneau = document.getElementById('rail-serveur');
  if (!panneau) {
    panneau = document.createElement('div');
    panneau.id = 'rail-serveur';
    panneau.className = 'rail-serveur';
    rail.parentNode.insertBefore(panneau, rail);
  }

  const dedans = etat.vue === 'serveur';
  panneau.hidden = !dedans;
  rail.hidden = dedans;
  if (!dedans) return;

  panneau.textContent = '';
  const s = srv.contenu?.serveur;
  const t = TS();

  // --- en-tête ---
  const tete = document.createElement('div');
  tete.className = 'srv-tete';
  if (s?.couleur) tete.style.setProperty('--teinte', s.couleur);

  const retour = document.createElement('button');
  retour.type = 'button';
  retour.className = 'srv-retour';
  retour.textContent = '←';
  retour.title = T().bibliotheque;
  retour.addEventListener('click', fermerServeur);
  tete.append(retour);

  const nom = document.createElement('p');
  nom.className = 'srv-nom';
  nom.textContent = s?.nom || '…';
  if (s?.certifie) {
    const sceau = document.createElement('i');
    sceau.className = 'srv-sceau';
    sceau.textContent = '✓';
    sceau.title = s.visibilite === 'officiel' ? t.officiel : t.certifie;
    nom.append(sceau);
  }
  tete.append(nom);

  const menu = document.createElement('button');
  menu.type = 'button';
  menu.className = 'srv-menu';
  menu.textContent = '⋯';
  menu.title = t.reglagesServeur;
  menu.addEventListener('click', () => { srv.vue = 'reglages'; dessinerServeur(); });
  tete.append(menu);

  panneau.append(tete);

  if (!srv.contenu) return;

  // --- les salons, par catégorie ---
  const parCategorie = new Map();
  for (const c of srv.contenu.salons || []) {
    const cle = c.categorie || '';
    if (!parCategorie.has(cle)) parCategorie.set(cle, []);
    parCategorie.get(cle).push(c);
  }

  for (const [categorie, salons] of parCategorie) {
    if (categorie) {
      const titre = document.createElement('p');
      titre.className = 'srv-categorie';
      titre.textContent = categorie;
      panneau.append(titre);
    }

    for (const c of salons) {
      panneau.append(ligneSalon(c));
    }
  }

  // --- ajouter un salon ---
  if (peutIci('gererSalons')) {
    const ajout = document.createElement('button');
    ajout.type = 'button';
    ajout.className = 'srv-ajout';
    ajout.textContent = `+ ${t.ajouterSalon}`;
    ajout.addEventListener('click', ajouterSalon);
    panneau.append(ajout);
  }
}

function ligneSalon(c) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'srv-salon';
  b.dataset.sorte = c.sorte;
  b.setAttribute('aria-current', String(srv.salon === c.id));

  const icone = document.createElement('span');
  icone.className = 'srv-salon-icone';
  icone.textContent = c.sorte === 'vocal' ? '🔊' : c.sorte === 'annonces' ? '📣' : '#';
  b.append(icone);

  const nom = document.createElement('span');
  nom.className = 'srv-salon-nom';
  nom.textContent = c.nom;
  b.append(nom);

  if (c.nonLus) {
    const n = document.createElement('b');
    n.className = 'srv-non-lus';
    n.textContent = c.nonLus > 99 ? '99+' : String(c.nonLus);
    b.append(n);
  }

  b.addEventListener('click', () => {
    if (c.sorte === 'vocal') { srv.salon = c.id; dessinerServeur(); return; }
    chargerSalonServeur(c.id);
  });

  const bloc = document.createElement('div');
  bloc.className = 'srv-salon-bloc';
  bloc.append(b);

  // Les personnes présentes dans un salon vocal, sous son nom. C'est
  // l'information qui fait entrer : on rejoint quelqu'un, pas une pièce vide.
  if (c.sorte === 'vocal' && (c.voix || []).length) {
    const liste = document.createElement('ul');
    liste.className = 'srv-voix';
    for (const v of c.voix) {
      const li = document.createElement('li');
      li.textContent = v.pseudo;
      if (v.muet) {
        const m = document.createElement('i');
        m.textContent = '🔇';
        li.append(m);
      }
      liste.append(li);
    }
    bloc.append(liste);
  }

  return bloc;
}

function fermerServeur() {
  srv.ouvert = null;
  srv.contenu = null;
  srv.salon = null;
  srv.vue = null;
  etat.vue = 'accueil';
  document.body.classList.remove('dans-serveur');
  dessinerRailServeur();
  dessinerAccueil();
  dessinerChats();
}

/** Ai-je ce droit dans le serveur ouvert. */
function peutIci(nom) {
  const s = srv.contenu?.serveur;
  if (!s) return false;
  if (s.role === 'proprietaire') return true;
  const bit = srv.roles?.catalogue?.[nom];
  if (!bit) return false;
  return ((srv.roles?.mesDroits || 0) & bit) === bit;
}

// =============================================================================
// Un salon de texte
// =============================================================================

function dessinerSalonTexte(scene, salon) {
  const t = TS();

  const tete = document.createElement('div');
  tete.className = 'srv-bandeau';

  const nom = document.createElement('p');
  nom.className = 'srv-bandeau-nom';
  nom.textContent = `${salon.sorte === 'annonces' ? '📣' : '#'} ${salon.nom}`;
  tete.append(nom);

  if (salon.sujet) {
    const sujet = document.createElement('p');
    sujet.className = 'srv-bandeau-sujet';
    sujet.textContent = salon.sujet;
    tete.append(sujet);
  }

  const outils = document.createElement('div');
  outils.className = 'srv-bandeau-outils';

  const partage = document.createElement('button');
  partage.type = 'button';
  partage.className = 'btn-mini';
  partage.textContent = t.partager;
  partage.addEventListener('click', () => ouvrirPartage(srv.contenu.serveur));
  outils.append(partage);

  const membresBouton = document.createElement('button');
  membresBouton.type = 'button';
  membresBouton.className = 'btn-mini';
  membresBouton.textContent = `${t.membresTitre} · ${srv.contenu.serveur.membres}`;
  membresBouton.addEventListener('click', () => {
    document.body.classList.toggle('avec-membres');
    /* On recharge en ouvrant : la liste date de l'ouverture du serveur, et
       quelqu'un qui vient d'entrer n'y figurerait pas. */
    if (document.body.classList.contains('avec-membres')) chargerMembres(srv.ouvert);
  });
  outils.append(membresBouton);

  tete.append(outils);
  scene.append(tete);

  // --- le fil ---
  const fil = document.createElement('div');
  fil.className = 'srv-fil';

  if (!srv.messages.length) {
    fil.append(bulle(t.salonVide, 'calme'));
  } else {
    let dernierAuteur = null;
    let derniereHeure = 0;
    for (const m of srv.messages) {
      /* Les messages consécutifs d'une même personne à moins de cinq minutes
         d'intervalle se regroupent sous un seul en-tête. Sans cela, quelqu'un
         qui écrit trois phrases occupe trois fois la place et le fil devient
         une liste de noms. */
      const groupe = m.auteur === dernierAuteur && m.envoye_le - derniereHeure < 300;
      fil.append(messageSalon(m, groupe));
      dernierAuteur = m.auteur;
      derniereHeure = m.envoye_le;
    }
  }
  scene.append(fil);

  // --- écrire ---
  const peutEcrire = salon.sorte !== 'annonces' || peutIci('ecrireAnnonces');

  if (!peutEcrire) {
    const note = document.createElement('p');
    note.className = 'srv-lecture';
    note.textContent = t.lectureSeule;
    scene.append(note);
    dessinerMembres();
    return;
  }

  const form = document.createElement('form');
  form.className = 'srv-ecrire';

  const champ = document.createElement('input');
  champ.type = 'text';
  champ.placeholder = t.ecrire;
  champ.maxLength = 2000;
  champ.autocomplete = 'off';
  form.append(champ);

  // Le même sélecteur d'emojis que partout ailleurs : il vit dans lanceur.js.
  const bEmoji = document.createElement('button');
  bEmoji.type = 'button';
  bEmoji.className = 'btn-mini';
  bEmoji.dataset.ouvreEmojis = '1';
  bEmoji.textContent = '😀';
  bEmoji.addEventListener('click', () => {
    ouvrirSelecteurEmojis(bEmoji, (e) => {
      champ.value += e;
      champ.focus();
    });
  });
  form.append(bEmoji);

  const envoyer = document.createElement('button');
  envoyer.type = 'submit';
  envoyer.className = 'jouer';
  envoyer.textContent = '↑';
  form.append(envoyer);

  const retour = document.createElement('div');
  retour.className = 'srv-retour-envoi';
  form.append(retour);

  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const texte = champ.value.trim();
    if (!texte) return;
    champ.value = '';
    retour.textContent = '';

    const r = await window.ludopia.social.ecrireSalon(salon.id, texte);
    if (!r.ok) {
      if (r.erreur === 'mode_lent') {
        let d = {};
        try { d = JSON.parse(r.detail || '{}'); } catch { /* détail illisible */ }
        retour.append(bulle(t.modeLent(d.attendre ?? '?')));
      } else {
        retour.append(bulle(messageErreur(r.erreur, r.detail)));
      }
      // On rend le texte : le perdre pour un refus de mode lent serait
      // doublement pénible.
      champ.value = texte;
    }
  });

  scene.append(form);
  setTimeout(() => champ.focus(), 30);
  dessinerMembres();
}

function messageSalon(m, groupe) {
  const el = document.createElement('div');
  el.className = groupe ? 'srv-msg srv-msg--suite' : 'srv-msg';

  if (!groupe) {
    const tete = document.createElement('p');
    tete.className = 'srv-msg-tete';

    const qui = document.createElement('b');
    qui.textContent = m.pseudo || '…';
    // La couleur du rôle le plus haut, comme partout ailleurs : c'est ce qui
    // permet de repérer une réponse de modération dans un fil chargé.
    const membre = srv.membres.find((x) => x.id === m.auteur);
    const role = membre?.roles?.[0];
    if (role?.couleur) qui.style.color = role.couleur;
    tete.append(qui);

    const heure = document.createElement('span');
    heure.textContent = new Date(m.envoye_le * 1000)
      .toLocaleTimeString(etat.langue === 'fr' ? 'fr-FR' : 'en-GB',
        { hour: '2-digit', minute: '2-digit' });
    tete.append(heure);

    el.append(tete);
  }

  const texte = document.createElement('p');
  texte.className = 'srv-msg-texte';
  texte.textContent = m.texte;
  el.append(texte);

  return el;
}

// =============================================================================
// Un salon vocal
// =============================================================================

function dessinerSalonVocal(scene, salon) {
  const t = TS();

  const tete = document.createElement('div');
  tete.className = 'srv-bandeau';
  const nom = document.createElement('p');
  nom.className = 'srv-bandeau-nom';
  nom.textContent = `🔊 ${salon.nom}`;
  tete.append(nom);
  scene.append(tete);

  const salle = document.createElement('div');
  salle.className = 'srv-salle';

  const presents = salon.voix || [];
  if (!presents.length) {
    const vide = document.createElement('p');
    vide.className = 'acc-vide';
    vide.textContent = t.personne;
    salle.append(vide);
  }

  for (const v of presents) {
    const carte = document.createElement('div');
    carte.className = v.muet ? 'srv-voix-carte srv-voix-carte--muet' : 'srv-voix-carte';

    const rond = document.createElement('span');
    rond.className = 'srv-voix-rond';
    rond.textContent = (v.pseudo || '?').slice(0, 1).toUpperCase();
    rond.style.setProperty('--teinte', teinte(v.id));
    carte.append(rond);

    const p = document.createElement('p');
    p.textContent = v.pseudo;
    carte.append(p);

    if (v.muet) {
      const m = document.createElement('i');
      m.className = 'srv-voix-muet';
      m.textContent = '🔇';
      carte.append(m);
    }

    salle.append(carte);
  }

  scene.append(salle);

  const barre = document.createElement('div');
  barre.className = 'srv-salle-barre';

  const dedans = vocalEnCours() === salon.id;
  const bouton = document.createElement('button');
  bouton.type = 'button';
  bouton.className = dedans ? 'action-secondaire' : 'jouer';
  bouton.textContent = dedans ? t.sortirVocal : t.entrerVocal;
  bouton.addEventListener('click', () => (dedans ? sortirDuVocal() : entrerDansVocal(salon.id)));
  barre.append(bouton);

  scene.append(barre);
  dessinerMembres();
}

// =============================================================================
// La liste des membres
// =============================================================================

function dessinerMembres() {
  let panneau = document.getElementById('membres');
  if (!panneau) {
    panneau = document.createElement('aside');
    panneau.id = 'membres';
    panneau.className = 'membres';
    document.querySelector('.cadre')?.append(panneau);
  }

  if (etat.vue !== 'serveur' || !srv.contenu) {
    panneau.hidden = true;
    return;
  }
  panneau.hidden = false;
  panneau.textContent = '';

  const t = TS();
  const titre = document.createElement('p');
  titre.className = 'membres-titre';
  titre.textContent = t.membresTitre;
  panneau.append(titre);

  /* En ligne d'abord, puis hors ligne. C'est le seul ordre utile : on ouvre
     cette liste pour savoir à qui l'on peut parler maintenant. */
  const enLigne = srv.membres.filter((m) => m.enLigne);
  const hors = srv.membres.filter((m) => !m.enLigne);

  for (const [libelle, groupe] of [[t.enLigne(enLigne.length), enLigne], ['', hors]]) {
    if (!groupe.length) continue;
    if (libelle) {
      const s = document.createElement('p');
      s.className = 'membres-section';
      s.textContent = libelle;
      panneau.append(s);
    }
    for (const m of groupe) panneau.append(carteMembre(m));
  }
}

function carteMembre(m) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = m.enLigne ? 'membre' : 'membre membre--hors';

  const rond = document.createElement('span');
  rond.className = 'membre-rond';
  rond.textContent = (m.pseudo || '?').slice(0, 1).toUpperCase();
  rond.style.setProperty('--teinte', teinte(m.id));
  el.append(rond);

  const bloc = document.createElement('span');
  bloc.className = 'membre-bloc';

  const nom = document.createElement('span');
  nom.className = 'membre-nom';
  nom.textContent = m.surnom || m.pseudo;
  if (m.role === 'proprietaire') {
    const c = document.createElement('i');
    c.textContent = '👑';
    c.title = 'Propriétaire';
    nom.append(c);
  }
  bloc.append(nom);

  const sous = document.createElement('span');
  sous.className = 'membre-sous';
  if (m.jeu) {
    const jeu = etat.catalogue?.jeux.find((j) => j.id === m.jeu);
    sous.textContent = `${T().joueA} ${jeu ? jeu.nom : m.jeu}`;
  } else if (m.statut) {
    sous.textContent = m.statut;
  }
  if (sous.textContent) bloc.append(sous);

  el.append(bloc);
  el.addEventListener('click', () => ouvrirProfil(m.id));
  return el;
}

// =============================================================================
// L'annuaire
// =============================================================================

async function ouvrirAnnuaire() {
  etat.vue = 'serveur';
  srv.ouvert = null;
  srv.vue = 'annuaire';
  srv.annuaire = null;
  dessinerServeur();

  const r = await window.ludopia.serveurs.annuaire(`langue=${etat.langue}`);
  if (srv.vue !== 'annuaire') return;
  srv.annuaire = r.ok ? (r.donnees.serveurs || []) : [];
  dessinerServeur();
}

function dessinerAnnuaire(scene) {
  const t = TS();

  const tete = document.createElement('section');
  tete.className = 'acc-tete';
  const h1 = document.createElement('h1');
  h1.textContent = t.annuaire;
  const aide = document.createElement('p');
  aide.className = 'acc-vide';
  aide.textContent = t.annuaireAide;
  tete.append(h1, aide);
  scene.append(tete);

  // --- créer ou entrer par code ---
  const barre = document.createElement('div');
  barre.className = 'ami-actions';

  const creer = document.createElement('button');
  creer.type = 'button';
  creer.className = 'jouer';
  creer.textContent = t.creer;
  creer.addEventListener('click', () => { srv.vue = 'creation'; dessinerServeur(); });
  barre.append(creer);

  const parCode = document.createElement('button');
  parCode.type = 'button';
  parCode.className = 'action-secondaire';
  parCode.textContent = t.entrerParCode;
  parCode.addEventListener('click', () => entrerParCode(scene));
  barre.append(parCode);

  scene.append(barre);

  const zoneCode = document.createElement('div');
  zoneCode.id = 'srv-zone-code';
  scene.append(zoneCode);

  // --- la liste ---
  const liste = document.createElement('div');
  liste.className = 'srv-annuaire';

  if (srv.annuaire === null) {
    liste.append(bulle('…', 'calme'));
  } else if (!srv.annuaire.length) {
    liste.append(bulle(t.aucunServeur, 'calme'));
  } else {
    for (const s of srv.annuaire) liste.append(carteAnnuaire(s));
  }

  scene.append(liste);
  scene.scrollTop = 0;
}

function carteAnnuaire(s) {
  const t = TS();
  const dejaMembre = srv.liste.some((x) => x.id === s.id);

  const carte = document.createElement('article');
  carte.className = 'srv-carte';
  carte.style.setProperty('--teinte', s.couleur || 'var(--brand)');

  const tete = document.createElement('div');
  tete.className = 'srv-carte-tete';

  const rond = document.createElement('span');
  rond.className = 'srv-carte-rond';
  rond.textContent = s.emoji || '🎮';
  tete.append(rond);

  const bloc = document.createElement('div');
  const nom = document.createElement('p');
  nom.className = 'srv-carte-nom';
  nom.textContent = s.nom;
  if (s.certifie || s.visibilite === 'officiel') {
    const sceau = document.createElement('i');
    sceau.className = 'srv-sceau';
    sceau.textContent = '✓';
    sceau.title = s.visibilite === 'officiel' ? t.officiel : t.certifie;
    nom.append(sceau);
  }
  bloc.append(nom);

  const sous = document.createElement('p');
  sous.className = 'srv-carte-sous';
  sous.textContent = t.membres(s.membres);
  bloc.append(sous);
  tete.append(bloc);
  carte.append(tete);

  if (s.description) {
    const d = document.createElement('p');
    d.className = 'srv-carte-desc';
    d.textContent = s.description;
    carte.append(d);
  }

  const action = document.createElement('button');
  action.type = 'button';
  action.className = dejaMembre ? 'btn-mini' : 'jouer jouer--mini';
  action.textContent = dejaMembre ? t.dejaMembre : t.entrer;
  action.disabled = dejaMembre;
  action.addEventListener('click', async () => {
    const r = await window.ludopia.serveurs.rejoindre({ serveur: s.id });
    if (r.ok) {
      await rafraichirServeurs();
      dessinerChats();
      ouvrirServeur(s.id);
    }
  });
  carte.append(action);

  return carte;
}

function entrerParCode(scene) {
  const t = TS();
  const zone = scene.querySelector('#srv-zone-code');
  if (!zone || zone.childElementCount) return;

  const form = document.createElement('form');
  form.className = 'srv-code-form';

  const champ = document.createElement('input');
  champ.type = 'text';
  champ.placeholder = t.codeInvitation;
  champ.maxLength = 12;
  form.append(champ);

  const ok = document.createElement('button');
  ok.type = 'submit';
  ok.className = 'jouer jouer--mini';
  ok.textContent = t.rejoindre;
  form.append(ok);

  const retour = document.createElement('div');
  form.append(retour);

  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    retour.textContent = '';
    const r = await window.ludopia.serveurs.rejoindre({ code: champ.value });
    if (!r.ok) { retour.append(bulle(messageErreur(r.erreur, r.detail))); return; }
    await rafraichirServeurs();
    dessinerChats();
    ouvrirServeur(r.donnees.id);
  });

  zone.append(form);
  champ.focus();
}

// =============================================================================
// Créer un serveur
// =============================================================================

function dessinerCreation(scene) {
  const t = TS();

  const tete = document.createElement('section');
  tete.className = 'acc-tete';
  const h1 = document.createElement('h1');
  h1.textContent = t.creer;
  tete.append(h1);
  scene.append(tete);

  const form = document.createElement('form');
  form.className = 'srv-form';

  const nom = document.createElement('input');
  nom.type = 'text';
  nom.placeholder = t.nom;
  nom.maxLength = 40;
  form.append(nom);

  const description = document.createElement('textarea');
  description.placeholder = t.description;
  description.maxLength = 300;
  description.rows = 3;
  form.append(description);

  // --- la visibilité, en deux cartes plutôt qu'une case à cocher : le choix
  // engage, il mérite d'être lu. ---
  const visibilite = document.createElement('div');
  visibilite.className = 'srv-visibilite';
  let nature = 'prive';
  for (const [valeur, intitule, aide] of [
    ['prive', t.prive, t.priveAide],
    ['public', t.public, t.publicAide],
  ]) {
    const carte = document.createElement('button');
    carte.type = 'button';
    carte.className = valeur === nature ? 'srv-visi srv-visi--actif' : 'srv-visi';
    const p1 = document.createElement('b');
    p1.textContent = intitule;
    const p2 = document.createElement('span');
    p2.textContent = aide;
    carte.append(p1, p2);
    carte.addEventListener('click', () => {
      nature = valeur;
      visibilite.querySelectorAll('.srv-visi').forEach((x) => x.classList.remove('srv-visi--actif'));
      carte.classList.add('srv-visi--actif');
    });
    visibilite.append(carte);
  }
  form.append(visibilite);

  // --- couleur ---
  const couleurs = document.createElement('div');
  couleurs.className = 'srv-couleurs';
  let couleur = COULEURS_SERVEUR[0];
  for (const c of COULEURS_SERVEUR) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = c === couleur ? 'srv-couleur srv-couleur--actif' : 'srv-couleur';
    b.style.setProperty('--c', c);
    b.setAttribute('aria-label', c);
    b.addEventListener('click', () => {
      couleur = c;
      couleurs.querySelectorAll('.srv-couleur').forEach((x) => x.classList.remove('srv-couleur--actif'));
      b.classList.add('srv-couleur--actif');
    });
    couleurs.append(b);
  }
  form.append(couleurs);

  // --- jeu associé ---
  const jeu = document.createElement('select');
  const aucun = document.createElement('option');
  aucun.value = '';
  aucun.textContent = `${t.jeuLie} : ${t.aucunJeu.toLowerCase()}`;
  jeu.append(aucun);
  for (const j of etat.catalogue?.jeux || []) {
    const o = document.createElement('option');
    o.value = j.id;
    o.textContent = `${t.jeuLie} : ${j.nom}`;
    jeu.append(o);
  }
  form.append(jeu);

  const retour = document.createElement('div');
  form.append(retour);

  const barre = document.createElement('div');
  barre.className = 'ami-actions';
  const ok = document.createElement('button');
  ok.type = 'submit';
  ok.className = 'jouer';
  ok.textContent = t.creerAction;
  barre.append(ok);
  const annuler = document.createElement('button');
  annuler.type = 'button';
  annuler.className = 'action-secondaire';
  annuler.textContent = t.annuler;
  annuler.addEventListener('click', ouvrirAnnuaire);
  barre.append(annuler);
  form.append(barre);

  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    retour.textContent = '';
    ok.disabled = true;
    const r = await window.ludopia.serveurs.creer({
      nom: nom.value,
      description: description.value,
      visibilite: nature,
      couleur,
      jeu: jeu.value || null,
      langue: etat.langue,
    });
    ok.disabled = false;
    if (!r.ok) { retour.append(bulle(messageErreur(r.erreur, r.detail))); return; }
    await rafraichirServeurs();
    dessinerChats();
    ouvrirServeur(r.donnees.id);
  });

  scene.append(form);
  setTimeout(() => nom.focus(), 30);
}

// =============================================================================
// Réglages d'un serveur
// =============================================================================

function dessinerReglagesServeur(scene) {
  const t = TS();
  const s = srv.contenu?.serveur;
  if (!s) { srv.vue = null; dessinerServeur(); return; }

  const tete = document.createElement('section');
  tete.className = 'acc-tete';
  const h1 = document.createElement('h1');
  h1.textContent = s.nom;
  tete.append(h1);
  scene.append(tete);

  // --- partage ---
  const blocPartage = document.createElement('section');
  blocPartage.className = 'acc-bloc';
  const h2p = document.createElement('h2');
  h2p.textContent = t.partager;
  blocPartage.append(h2p);

  if (s.code) {
    const code = document.createElement('p');
    code.className = 'stat-somme';
    code.textContent = s.code;
    blocPartage.append(code);

    const aide = document.createElement('p');
    aide.className = 'acc-vide';
    aide.textContent = t.codeAide;
    blocPartage.append(aide);

    const partager = document.createElement('button');
    partager.type = 'button';
    partager.className = 'jouer jouer--mini';
    partager.textContent = t.partager;
    partager.addEventListener('click', () => ouvrirPartage(s));
    blocPartage.append(partager);
  }
  scene.append(blocPartage);

  // --- surnom ---
  const blocSurnom = document.createElement('section');
  blocSurnom.className = 'acc-bloc';
  const h2s = document.createElement('h2');
  h2s.textContent = t.surnom;
  blocSurnom.append(h2s);

  const formSurnom = document.createElement('form');
  formSurnom.className = 'srv-code-form';
  const champSurnom = document.createElement('input');
  champSurnom.type = 'text';
  champSurnom.maxLength = 24;
  champSurnom.placeholder = t.surnom;
  formSurnom.append(champSurnom);
  const okSurnom = document.createElement('button');
  okSurnom.type = 'submit';
  okSurnom.className = 'btn-mini';
  okSurnom.textContent = t.enregistrer;
  formSurnom.append(okSurnom);
  formSurnom.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    await window.ludopia.serveurs.surnom(s.id, champSurnom.value);
    chargerMembres(s.id);
  });
  blocSurnom.append(formSurnom);
  scene.append(blocSurnom);

  // --- rôles ---
  if (peutIci('gererRoles') || s.role === 'proprietaire') {
    const blocRoles = document.createElement('section');
    blocRoles.className = 'acc-bloc';
    const h2r = document.createElement('h2');
    h2r.textContent = t.roles;
    blocRoles.append(h2r);

    const aller = document.createElement('button');
    aller.type = 'button';
    aller.className = 'btn-mini';
    aller.textContent = t.roles;
    aller.addEventListener('click', async () => {
      const r = await window.ludopia.serveurs.roles(s.id);
      if (r.ok) { srv.roles = r.donnees; srv.vue = 'roles'; dessinerServeur(); }
    });
    blocRoles.append(aller);
    scene.append(blocRoles);
  }

  // --- quitter ---
  const blocQuitter = document.createElement('section');
  blocQuitter.className = 'acc-bloc';
  const quitter = document.createElement('button');
  quitter.type = 'button';
  quitter.className = 'btn-mini btn-mini--danger';
  quitter.textContent = t.quitter;
  quitter.addEventListener('click', async () => {
    if (quitter.dataset.sur !== '1') {
      // Une confirmation en deux clics sur le même bouton : pas de boîte de
      // dialogue système, qui gèle le processus, et pas de clic accidentel.
      quitter.dataset.sur = '1';
      quitter.textContent = t.quitterSur;
      setTimeout(() => {
        quitter.dataset.sur = '';
        quitter.textContent = t.quitter;
      }, 3000);
      return;
    }
    await window.ludopia.serveurs.quitter(s.id);
    await rafraichirServeurs();
    fermerServeur();
  });
  blocQuitter.append(quitter);
  scene.append(blocQuitter);

  // --- retour ---
  const retour = document.createElement('button');
  retour.type = 'button';
  retour.className = 'action-secondaire';
  retour.textContent = '←';
  retour.addEventListener('click', () => { srv.vue = null; dessinerServeur(); });
  scene.append(retour);
  scene.scrollTop = 0;
}

// =============================================================================
// Le partage
// =============================================================================

/**
 * Partager un serveur, en un geste.
 *
 * Le lien mène à une page du site qui montre l'aperçu du serveur et propose
 * d'installer Ludopia : c'est le maillon qui transforme un partage en
 * inscription. Les boutons ouvrent les partages natifs des plateformes — pas
 * d'API, pas de clé, juste leurs adresses de partage publiques.
 */
function ouvrirPartage(s) {
  const t = TS();
  const lien = `https://ludopia.fr/rejoindre?code=${encodeURIComponent(s.code || '')}`;
  const texte = etat.langue === 'fr'
    ? `Rejoins-moi sur « ${s.nom} », mon serveur Ludopia !`
    : `Join me on "${s.nom}", my Ludopia server!`;

  let voile = document.getElementById('srv-partage');
  if (voile) voile.remove();

  voile = document.createElement('div');
  voile.id = 'srv-partage';
  voile.className = 'srv-partage-voile';
  voile.addEventListener('click', (evt) => { if (evt.target === voile) voile.remove(); });

  const boite = document.createElement('div');
  boite.className = 'srv-partage-boite';

  const titre = document.createElement('p');
  titre.className = 'srv-partage-titre';
  titre.textContent = t.partager;
  boite.append(titre);

  const champ = document.createElement('input');
  champ.type = 'text';
  champ.readOnly = true;
  champ.value = lien;
  champ.addEventListener('click', () => champ.select());
  boite.append(champ);

  const copier = document.createElement('button');
  copier.type = 'button';
  copier.className = 'jouer jouer--mini';
  copier.textContent = '📋';
  copier.addEventListener('click', async () => {
    await navigator.clipboard.writeText(`${texte} ${lien}`);
    copier.textContent = '✓';
    setTimeout(() => { copier.textContent = '📋'; }, 1600);
  });
  boite.append(copier);

  const reseaux = document.createElement('div');
  reseaux.className = 'srv-partage-reseaux';
  const cibles = [
    ['WhatsApp', `https://wa.me/?text=${encodeURIComponent(`${texte} ${lien}`)}`],
    ['Telegram', `https://t.me/share/url?url=${encodeURIComponent(lien)}&text=${encodeURIComponent(texte)}`],
    ['X', `https://twitter.com/intent/tweet?text=${encodeURIComponent(texte)}&url=${encodeURIComponent(lien)}`],
    ['Reddit', `https://www.reddit.com/submit?url=${encodeURIComponent(lien)}&title=${encodeURIComponent(texte)}`],
  ];
  for (const [nom, url] of cibles) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-mini';
    b.textContent = nom;
    b.addEventListener('click', () => window.ludopia.ouvrirLien(url));
    reseaux.append(b);
  }
  boite.append(reseaux);

  voile.append(boite);
  document.body.append(voile);
}

// =============================================================================
// Les rôles
// =============================================================================

function dessinerRoles(scene) {
  const t = TS();
  const noms = NOMS_DROITS[etat.langue === 'en' ? 'en' : 'fr'];
  const catalogue = srv.roles?.catalogue || {};

  const tete = document.createElement('section');
  tete.className = 'acc-tete';
  const h1 = document.createElement('h1');
  h1.textContent = t.roles;
  tete.append(h1);
  scene.append(tete);

  for (const role of srv.roles?.roles || []) {
    scene.append(carteRole(role, catalogue, noms));
  }

  // --- en créer un ---
  const creer = document.createElement('button');
  creer.type = 'button';
  creer.className = 'action-secondaire';
  creer.textContent = `+ ${t.nouveauRole}`;
  creer.addEventListener('click', async () => {
    const r = await window.ludopia.serveurs.creerRole({
      serveur: srv.ouvert,
      nom: t.nouveauRole,
      couleur: '#94a3b8',
      droits: 0,
      rang: 1,
    });
    if (r.ok) {
      const relu = await window.ludopia.serveurs.roles(srv.ouvert);
      if (relu.ok) { srv.roles = relu.donnees; dessinerServeur(); }
    }
  });
  scene.append(creer);

  const retour = document.createElement('button');
  retour.type = 'button';
  retour.className = 'action-secondaire';
  retour.textContent = '←';
  retour.addEventListener('click', () => { srv.vue = 'reglages'; dessinerServeur(); });
  scene.append(retour);
  scene.scrollTop = 0;
}

function carteRole(role, catalogue, noms) {
  const t = TS();
  const carte = document.createElement('section');
  carte.className = 'acc-bloc srv-role';
  carte.style.setProperty('--teinte', role.couleur || 'var(--muted)');

  const tete = document.createElement('div');
  tete.className = 'srv-role-tete';

  const nom = document.createElement('input');
  nom.type = 'text';
  nom.value = role.nom;
  nom.maxLength = 30;
  nom.className = 'srv-role-nom';
  tete.append(nom);

  const combien = document.createElement('span');
  combien.className = 'srv-carte-sous';
  combien.textContent = t.membres(role.membres || 0);
  tete.append(combien);
  carte.append(tete);

  // --- couleurs ---
  const couleurs = document.createElement('div');
  couleurs.className = 'srv-couleurs';
  let couleur = role.couleur;
  for (const c of [...COULEURS_SERVEUR, '#94a3b8', '#e2e8f0']) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = c === couleur ? 'srv-couleur srv-couleur--actif' : 'srv-couleur';
    b.style.setProperty('--c', c);
    b.addEventListener('click', () => {
      couleur = c;
      couleurs.querySelectorAll('.srv-couleur').forEach((x) => x.classList.remove('srv-couleur--actif'));
      b.classList.add('srv-couleur--actif');
      carte.style.setProperty('--teinte', c);
    });
    couleurs.append(b);
  }
  carte.append(couleurs);

  // --- la grille des droits ---
  const grille = document.createElement('div');
  grille.className = 'srv-droits';
  let droits = role.droits;
  for (const [cle, bit] of Object.entries(catalogue)) {
    const ligne = document.createElement('label');
    ligne.className = 'srv-droit';
    const case_ = document.createElement('input');
    case_.type = 'checkbox';
    case_.checked = (droits & bit) === bit;
    case_.addEventListener('change', () => {
      droits = case_.checked ? (droits | bit) : (droits & ~bit);
    });
    ligne.append(case_, document.createTextNode(noms[cle] || cle));
    grille.append(ligne);
  }
  carte.append(grille);

  const retour = document.createElement('div');
  carte.append(retour);

  // --- enregistrer / supprimer ---
  const barre = document.createElement('div');
  barre.className = 'ami-actions';

  const ok = document.createElement('button');
  ok.type = 'button';
  ok.className = 'jouer jouer--mini';
  ok.textContent = t.enregistrer;
  ok.addEventListener('click', async () => {
    retour.textContent = '';
    const r = await window.ludopia.serveurs.modifierRole({
      role: role.id, nom: nom.value, couleur, droits,
    });
    if (!r.ok) retour.append(bulle(messageErreur(r.erreur, r.detail)));
    else ok.textContent = '✓';
    setTimeout(() => { ok.textContent = t.enregistrer; }, 1500);
  });
  barre.append(ok);

  const suppr = document.createElement('button');
  suppr.type = 'button';
  suppr.className = 'btn-mini btn-mini--danger';
  suppr.textContent = t.supprimer;
  suppr.addEventListener('click', async () => {
    const r = await window.ludopia.serveurs.supprimerRole(role.id);
    if (!r.ok) { retour.append(bulle(messageErreur(r.erreur, r.detail))); return; }
    const relu = await window.ludopia.serveurs.roles(srv.ouvert);
    if (relu.ok) { srv.roles = relu.donnees; dessinerServeur(); }
  });
  barre.append(suppr);
  carte.append(barre);

  return carte;
}

// =============================================================================
// Ajouter un salon
// =============================================================================

async function ajouterSalon() {
  const t = TS();
  const panneau = document.getElementById('rail-serveur');
  if (!panneau || panneau.querySelector('.srv-ajout-form')) return;

  const form = document.createElement('form');
  form.className = 'srv-ajout-form';

  const nom = document.createElement('input');
  nom.type = 'text';
  nom.placeholder = t.nomSalon;
  nom.maxLength = 40;
  form.append(nom);

  const sorte = document.createElement('select');
  for (const [valeur, intitule] of [['texte', t.texte], ['vocal', t.vocal], ['annonces', t.annonces]]) {
    const o = document.createElement('option');
    o.value = valeur;
    o.textContent = intitule;
    sorte.append(o);
  }
  form.append(sorte);

  const ok = document.createElement('button');
  ok.type = 'submit';
  ok.className = 'btn-mini';
  ok.textContent = '+';
  form.append(ok);

  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const r = await window.ludopia.serveurs.ajouterSalon({
      serveur: srv.ouvert,
      nom: nom.value,
      sorte: sorte.value,
      categorie: sorte.value === 'vocal' ? 'Vocal' : 'Discussion',
    });
    if (r.ok) {
      const contenu = await window.ludopia.serveurs.contenu(srv.ouvert);
      if (contenu.ok) { srv.contenu = contenu.donnees; dessinerServeur(); }
    }
  });

  panneau.append(form);
  nom.focus();
}

// =============================================================================
// Rafraîchissement périodique du serveur ouvert
// =============================================================================

/* Les présences vocales et les non-lus des autres salons bougent sans nous.
   Dix secondes : assez frais pour voir quelqu'un entrer en vocal, assez
   espacé pour ne rien coûter. */
setInterval(async () => {
  if (etat.vue !== 'serveur' || !srv.ouvert || srv.vue) return;
  const r = await window.ludopia.serveurs.contenu(srv.ouvert);
  if (!r.ok || etat.vue !== 'serveur') return;

  const avant = JSON.stringify(srv.contenu?.salons?.map(
    (x) => [x.id, x.nonLus, (x.voix || []).map((v) => v.id + (v.muet ? 'm' : ''))],
  ));
  const apres = JSON.stringify(r.donnees.salons?.map(
    (x) => [x.id, x.nonLus, (x.voix || []).map((v) => v.id + (v.muet ? 'm' : ''))],
  ));
  srv.contenu = r.donnees;
  // On ne redessine que si quelque chose a changé : un redessin pendant une
  // saisie efface le champ.
  if (avant !== apres) dessinerServeur();
  if (document.body.classList.contains('avec-membres')) chargerMembres(srv.ouvert);
}, 10000);
