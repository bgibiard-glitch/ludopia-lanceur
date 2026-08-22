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
  if (!srv.liste.length) return false;

  const titre = document.createElement('p');
  titre.className = 'chats-titre';
  titre.textContent = TS().serveurs;
  colonne.append(titre);

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
