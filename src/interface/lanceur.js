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
    majPrete: 'Installer la mise à jour',
    majAJour: 'Rechercher une mise à jour',
    majErreur: 'Mise à jour : réessayer',
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
    amisConnecter: 'Créez un compte pour voir qui joue à quoi et vous écrire. On ne peut pas vous trouver sans votre code : il n’y a pas d’annuaire.',
    amisAucun: 'Personne dans vos amis pour l’instant. Échangez votre code.',
    amisTous: 'Voir tous mes amis',
    amisEnLigne: 'en ligne',
    riensurvous: 'Rien n’est envoyé à Ludopia : ces chiffres ne quittent pas votre machine.',
    amisTitre: 'Amis',
    connexion: 'Se connecter',
    inscription: 'Créer un compte',
    pseudo: 'Pseudo',
    courriel: 'Adresse e-mail',
    identifiant: 'Adresse e-mail ou pseudo',
    motDePasse: 'Mot de passe',
    pseudoAide: 'C’est ce que verront vos amis.',
    courrielAide: 'Elle sert à vous connecter. Elle n’est jamais montrée à personne.',
    conversations: 'Conversations',
    classement: 'Le classement de la semaine',
    plusJoues: 'Les plus joués',
    quiMontent: 'Ceux qui montent',
    joueurs: 'joueurs',
    unJoueur: 'joueur',
    classementPortee: 'Comptes connectés au lanceur ayant ouvert un jeu, sur sept jours. Les joueurs du navigateur ne sont pas comptés — le service ne les voit pas.',
    classementVide: 'Pas encore assez de parties pour établir un classement.',
    salons: 'Salons',
    nouveauSalon: 'Nouveau salon',
    rejoindreSalon: 'Rejoindre un salon',
    nomDuSalon: 'Nom du salon',
    codeDuSalon: 'Code du salon',
    creer: 'Créer',
    rejoindre: 'Rejoindre',
    codeSalon: 'Code',
    quitterSalon: 'Quitter',
    inviterAmis: 'Inviter des amis',
    dejaDedans: 'déjà dans le salon',
    ajoute: 'Ajouté',
    membresDuSalon: 'Membres',
    confirmerQuitter: 'Quitter ce salon ? Vous ne verrez plus ses messages.',
    salonVide: 'Personne n’a encore rien dit. À vous.',
    membres: 'membres',
    unMembre: 'membre',
    aucunSalon: 'Aucun salon. Créez-en un, ou rejoignez celui d’un ami avec son code.',
    salonsExplication: 'Un salon est un fil partagé entre amis. On n’y entre qu’avec son code : il n’existe aucune liste publique.',
    emojis: 'Emojis',
    reagir: 'Réagir',
    monStatut: 'Votre statut',
    statutExemple: 'Cherche des joueurs…',
    enregistrer: 'Enregistrer',
    voirProfil: 'Profil',
    fermerProfil: 'Fermer',
    niveau: 'Niveau',
    joursDeJeu: 'Jours de jeu',
    membreDepuis: 'Membre depuis',
    joursVersNiveau: 'jours vers le niveau suivant',
    parJeu: 'Par jeu',
    jours: 'jours',
    unJour: 'jour',
    profilMesure: 'Le niveau vient des jours où un jeu a été ouvert depuis le lanceur, pas du temps passé — qui ne quitte pas votre machine.',
    chercherJeu: 'Chercher un jeu…',
    aucunResultat: 'Aucun jeu ne correspond.',
    reglages: 'Réglages',
    avisTitre: 'Avis',
    avisMessages: 'Messages privés',
    avisMessagesAide: 'Vous prévenir quand un ami écrit, même en pleine partie. Rien ne s’affiche si la conversation est déjà sous vos yeux.',
    avisSalons: 'Messages de salon',
    avisSalonsAide: 'Vous prévenir quand quelqu’un parle dans un salon que vous suivez.',
    avisInvitations: 'Invitations à jouer',
    avisInvitationsAide: 'Vous prévenir quand un ami vous invite à le rejoindre sur un jeu.',
    avisSon: 'Son',
    avisSonAide: 'Jouer le son du système avec chaque avis.',
    lanceurTitre: 'Le lanceur',
    demarrerReduit: 'Démarrer réduit',
    demarrerReduitAide: 'Utile si Ludopia se lance avec votre session : il se tient prêt sans s’imposer.',
    serieTenue: (n) => `Série de ${n} jour${n > 1 ? 's' : ''} : vous avez joué tous les deux aujourd’hui.`,
    serieAVous: 'Votre série tient encore aujourd’hui — il ne manque que vous.',
    serieAlui: (n) => `Série de ${n} jour${n > 1 ? 's' : ''} en péril : il manque votre ami aujourd’hui.`,
    boutique: 'Boutique',
    editerProfil: 'Personnaliser',
    offrirLudos: 'Offrir des Ludos',
    passeportTitre: 'Passeport public',
    passeportAide: 'Une page web à partager : votre niveau, vos jeux, ce que vous portez. '
      + 'Jamais votre présence en direct ni vos amis. Fermé par défaut.',
    passeportAdresse: 'votre-adresse',
    passeportOuvrir: 'Ouvrir mon passeport',
    passeportFermer: 'Le fermer',
    passeportCopier: 'Copier le lien',
    passeportCopie: 'Lien copié !',
    avisSeries: 'Séries en péril',
    avisSeriesAide: 'Le soir, vous prévenir quand une série d’amitié se rompt si vous ne jouez pas tous les deux.',
    offrirCombien: 'Combien ?',
    offrirMot: 'Un petit mot (facultatif)',
    offrirEnvoyer: 'Offrir',
    offrirFait: (n, qui) => `${n} Ⱡ offerts à ${qui} !`,
    bloquerSur: 'Bloquer, vraiment ?',
    signalerEnvoi: 'Envoyer le signalement',
    bioTitre: 'Deux lignes sur vous',
    accentTitre: 'Votre couleur',
    banniereTitre: 'Votre bannière',
    avatarTitre: 'Votre figure',
    avatarAide: 'Elle est dessinée à partir d’un dé, pas d’une photo : relancez jusqu’à celle qui vous plaît. La même vous suivra partout, jusque dans les jeux.',
    relancer: 'Relancer le dé',
    enregistre: 'Enregistré.',
    surimpressionTitre: 'Tchat sur le jeu (F10)',
    surimpressionAide: 'Une petite fenêtre déplaçable, par-dessus la partie : les messages '
      + 'des amis, et de quoi répondre sans quitter le jeu. F10 la montre et la cache.',
    themeTitre: 'Apparence',
    themeAide: 'Suivre le système, ou choisir. Le changement est immédiat.',
    themeSysteme: 'Système',
    themeSombre: 'Sombre',
    themeClair: 'Clair',
    langueTitre: 'Langue',
    langueAide: 'La langue de l’interface. Les jeux gardent la leur.',
    compteTitre: 'Votre compte',
    donneesTitre: 'Vos données',
    donneesOu: 'Temps de jeu, parties, positions de fenêtres et session : tout vit ici, sur votre machine. Aucune mise à jour n’y touche.',
    ouvrirDossier: 'Ouvrir le dossier',
    dejaCompte: 'J’ai déjà un compte',
    pasDeCompte: 'Créer un compte',
    deconnexion: 'Se déconnecter',
    monCode: 'Votre code ami',
    codeExplication: 'Donnez ce code à quelqu’un pour qu’il vous ajoute. On ne peut pas vous trouver autrement : il n’y a pas d’annuaire.',
    copier: 'Copier',
    copie: 'Copié',
    ajouterAmi: 'Ajouter un ami',
    codeAmi: 'Code à 8 caractères',
    ajouter: 'Ajouter',
    demandesRecues: 'Demandes reçues',
    demandesEnvoyees: 'Demandes envoyées',
    accepter: 'Accepter',
    refuser: 'Refuser',
    mesAmis: 'Vos amis',
    aucunAmi: 'Personne pour l’instant. Échangez votre code avec quelqu’un.',
    enAttente: 'en attente',
    horsLigne: 'Hors ligne',
    joueA: 'joue à',
    ecrire: 'Écrire',
    inviter: 'Inviter',
    invitationPartie: 'Invitation envoyée',
    votreMessage: 'Votre message…',
    envoyer: 'Envoyer',
    retirer: 'Retirer de mes amis',
    bloquerAmi: 'Bloquer',
    signalerAmi: 'Signaler',
    confirmerRetrait: 'Retirer cette personne de vos amis ?',
    confirmerBlocage: 'Bloquer cette personne ? Vous ne recevrez plus ses messages et elle disparaîtra de vos amis.',
    motifSignalement: 'Que s’est-il passé ?',
    signalementEnvoye: 'Signalement envoyé. La personne est bloquée.',
    conversationVide: 'Rien encore. Dites bonjour.',
    connexionRequise: 'Connectez-vous pour voir vos amis.',
    horsService: 'Le service est injoignable. Réessayez dans un instant.',
    erreurs: {
      pseudo_invalide: 'Pseudo invalide : 3 à 20 caractères, lettres et chiffres.',
      pseudo_pris: 'Ce pseudo est déjà pris.',
      mot_de_passe_invalide: 'Mot de passe : 8 caractères au minimum.',
      identifiants_invalides: 'Pseudo ou mot de passe incorrect.',
      code_invalide: 'Ce code n’a pas la bonne forme.',
      code_inconnu: 'Aucun compte ne porte ce code.',
      code_soi_meme: 'C’est votre propre code.',
      pas_ami: 'Vous n’êtes plus amis.',
      message_vide: 'Le message est vide.',
      reseau: 'Pas de réseau.',
      delai_depasse: 'Le service met trop de temps à répondre.',
      non_authentifie: 'Votre session a expiré. Reconnectez-vous.',
      trop_d_appels: 'Trop d’essais. Patientez quelques minutes.',
      courriel_invalide: 'Cette adresse e-mail n’a pas l’air valide.',
      courriel_pris: 'Un compte utilise déjà cette adresse.',
      compte_suspendu: 'Ce compte est suspendu.',
    },
    suspenduJusqu: (quand) => `Ce compte est suspendu jusqu’au ${quand}.`,
    suspenduSansTerme: 'Ce compte est suspendu.',
    suspenduMotif: (motif) => `Motif : ${motif}`,
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
    majPrete: 'Install the update',
    majAJour: 'Check for updates',
    majErreur: 'Update check failed — retry',
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
    amisConnecter: 'Create an account to see who is playing what and to write to each other. Nobody can find you without your code: there is no directory.',
    amisAucun: 'No friends yet. Swap your code with someone.',
    amisTous: 'See all my friends',
    amisEnLigne: 'online',
    riensurvous: 'Nothing is sent to Ludopia: these numbers never leave your machine.',
    amisTitre: 'Friends',
    connexion: 'Sign in',
    inscription: 'Create an account',
    pseudo: 'Name',
    courriel: 'Email address',
    identifiant: 'Email address or name',
    motDePasse: 'Password',
    pseudoAide: 'This is what your friends will see.',
    courrielAide: 'Used to sign in. It is never shown to anyone.',
    conversations: 'Conversations',
    classement: 'This week’s ranking',
    plusJoues: 'Most played',
    quiMontent: 'Rising',
    joueurs: 'players',
    unJoueur: 'player',
    classementPortee: 'Accounts signed in to the launcher that opened a game, over seven days. Browser players are not counted — the service does not see them.',
    classementVide: 'Not enough sessions yet to build a ranking.',
    salons: 'Rooms',
    nouveauSalon: 'New room',
    rejoindreSalon: 'Join a room',
    nomDuSalon: 'Room name',
    codeDuSalon: 'Room code',
    creer: 'Create',
    rejoindre: 'Join',
    codeSalon: 'Code',
    quitterSalon: 'Leave',
    inviterAmis: 'Invite friends',
    dejaDedans: 'already in the room',
    ajoute: 'Added',
    membresDuSalon: 'Members',
    confirmerQuitter: 'Leave this room? You will stop seeing its messages.',
    salonVide: 'Nobody has said anything yet. Go ahead.',
    membres: 'members',
    unMembre: 'member',
    aucunSalon: 'No rooms yet. Create one, or join a friend’s with their code.',
    salonsExplication: 'A room is a shared thread between friends. You only get in with its code: there is no public list.',
    emojis: 'Emoji',
    reagir: 'React',
    monStatut: 'Your status',
    statutExemple: 'Looking for players…',
    enregistrer: 'Save',
    voirProfil: 'Profile',
    fermerProfil: 'Close',
    niveau: 'Level',
    joursDeJeu: 'Days played',
    membreDepuis: 'Member since',
    joursVersNiveau: 'days to the next level',
    parJeu: 'Per game',
    jours: 'days',
    unJour: 'day',
    profilMesure: 'The level comes from the days a game was opened from the launcher, not from time spent — which never leaves your machine.',
    chercherJeu: 'Search a game…',
    aucunResultat: 'No game matches.',
    reglages: 'Settings',
    avisTitre: 'Notifications',
    avisMessages: 'Direct messages',
    avisMessagesAide: 'Tell you when a friend writes, even mid-game. Nothing shows if the conversation is already in front of you.',
    avisSalons: 'Room messages',
    avisSalonsAide: 'Tell you when someone speaks in a room you follow.',
    avisInvitations: 'Game invitations',
    avisInvitationsAide: 'Tell you when a friend invites you to join them on a game.',
    avisSon: 'Sound',
    avisSonAide: 'Play the system sound with each notification.',
    lanceurTitre: 'The launcher',
    demarrerReduit: 'Start minimised',
    demarrerReduitAide: 'Useful if Ludopia starts with your session: it stays ready without getting in the way.',
    serieTenue: (n) => `${n}-day streak: you both played today.`,
    serieAVous: 'Your streak still stands today — only you are missing.',
    serieAlui: (n) => `${n}-day streak at risk: your friend has not played today.`,
    boutique: 'Shop',
    editerProfil: 'Customise',
    offrirLudos: 'Gift Ludos',
    passeportTitre: 'Public passport',
    passeportAide: 'A web page to share: your level, your games, what you wear. '
      + 'Never your live presence or your friends. Closed by default.',
    passeportAdresse: 'your-address',
    passeportOuvrir: 'Open my passport',
    passeportFermer: 'Close it',
    passeportCopier: 'Copy the link',
    passeportCopie: 'Link copied!',
    avisSeries: 'Streaks at risk',
    avisSeriesAide: 'In the evening, warn you when a friendship streak will break unless you both play.',
    offrirCombien: 'How many?',
    offrirMot: 'A little note (optional)',
    offrirEnvoyer: 'Gift',
    offrirFait: (n, qui) => `${n} Ⱡ gifted to ${qui}!`,
    bloquerSur: 'Block, really?',
    signalerEnvoi: 'Send the report',
    bioTitre: 'Two lines about you',
    accentTitre: 'Your colour',
    banniereTitre: 'Your banner',
    avatarTitre: 'Your figure',
    avatarAide: 'It is drawn from a dice roll, not a photo: roll until you like it. The same one follows you everywhere, into the games.',
    relancer: 'Roll again',
    enregistre: 'Saved.',
    surimpressionTitre: 'In-game chat (F10)',
    surimpressionAide: 'A small movable window over your game: friends’ messages, and a '
      + 'field to reply without leaving. F10 shows and hides it.',
    themeTitre: 'Appearance',
    themeAide: 'Follow the system, or choose. The change is immediate.',
    themeSysteme: 'System',
    themeSombre: 'Dark',
    themeClair: 'Light',
    langueTitre: 'Language',
    langueAide: 'The interface language. Games keep their own.',
    compteTitre: 'Your account',
    donneesTitre: 'Your data',
    donneesOu: 'Time played, sessions, window positions and your sign-in: it all lives here, on your machine. No update touches it.',
    ouvrirDossier: 'Open the folder',
    dejaCompte: 'I already have an account',
    pasDeCompte: 'Create an account',
    deconnexion: 'Sign out',
    monCode: 'Your friend code',
    codeExplication: 'Give this code to someone so they can add you. There is no other way to find you: there is no directory.',
    copier: 'Copy',
    copie: 'Copied',
    ajouterAmi: 'Add a friend',
    codeAmi: '8-character code',
    ajouter: 'Add',
    demandesRecues: 'Requests received',
    demandesEnvoyees: 'Requests sent',
    accepter: 'Accept',
    refuser: 'Decline',
    mesAmis: 'Your friends',
    aucunAmi: 'Nobody yet. Swap your code with someone.',
    enAttente: 'pending',
    horsLigne: 'Offline',
    joueA: 'playing',
    ecrire: 'Message',
    inviter: 'Invite',
    invitationPartie: 'Invitation sent',
    votreMessage: 'Your message…',
    envoyer: 'Send',
    retirer: 'Remove friend',
    bloquerAmi: 'Block',
    signalerAmi: 'Report',
    confirmerRetrait: 'Remove this person from your friends?',
    confirmerBlocage: 'Block this person? You will stop receiving their messages and they will leave your friends list.',
    motifSignalement: 'What happened?',
    signalementEnvoye: 'Report sent. The person is blocked.',
    conversationVide: 'Nothing yet. Say hello.',
    connexionRequise: 'Sign in to see your friends.',
    horsService: 'The service is unreachable. Try again in a moment.',
    erreurs: {
      pseudo_invalide: 'Invalid name: 3 to 20 characters, letters and digits.',
      pseudo_pris: 'That name is taken.',
      mot_de_passe_invalide: 'Password: 8 characters minimum.',
      identifiants_invalides: 'Wrong name or password.',
      code_invalide: 'That code is not in the right shape.',
      code_inconnu: 'No account carries that code.',
      code_soi_meme: 'That is your own code.',
      pas_ami: 'You are no longer friends.',
      message_vide: 'The message is empty.',
      reseau: 'No network.',
      delai_depasse: 'The service is taking too long.',
      non_authentifie: 'Your session expired. Sign in again.',
      trop_d_appels: 'Too many attempts. Wait a few minutes.',
      courriel_invalide: 'That email address does not look valid.',
      courriel_pris: 'An account already uses that address.',
    },
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
  jeuOuvert: null,  // identifiant du jeu en cours, pour proposer d'inviter
  // Invitations envoyées récemment : le libellé du bouton en dépend, plutôt
  // que d'une mutation du bouton lui-même — que le premier redessin efface.
  invitees: new Map(),
  salons: [],
  salon: null,            // salon affiché
  messagesSalon: [],
  reactionsSalon: [],
  membresSalon: [],
  inviteEnCours: false,   // volet « inviter des amis » déplié
  reactionsDirectes: [],
  profil: null,
  recherche: '',          // filtre de la bibliothèque
  reglages: {},
  dossierDonnees: '',
  versionLanceur: '',
  vue: 'accueil',   // 'accueil', 'jeu' ou 'amis'
  actualites: null,
  classement: null,
  social: { connecte: false, moi: null },
  amis: null,           // { amis, demandesRecues, demandesEnvoyees }
  conversation: null,   // identifiant de l'ami affiché
  messages: [],
  formulaire: 'connexion',  // 'connexion' ou 'inscription'
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
  const filtre = etat.recherche.trim().toLowerCase();
  $('#accueil')?.setAttribute('aria-current', String(etat.vue === 'accueil'));
  $('#reglagesBouton')?.setAttribute('aria-current', String(etat.vue === 'reglages'));

  const boutonSalons = $('#salonsBouton');
  if (boutonSalons) {
    boutonSalons.setAttribute('aria-current', String(etat.vue === 'salons'));
    const n = etat.salons.reduce((t, sa) => t + (sa.nonLus || 0), 0);
    boutonSalons.dataset.nonLus = n > 0 ? String(n) : '';
    $('.rail-salons-libelle', boutonSalons).textContent = T().salons;
    boutonSalons.hidden = !etat.social.connecte;
  }

  const boutonAmis = $('#amis');
  if (boutonAmis) {
    boutonAmis.setAttribute('aria-current', String(etat.vue === 'amis'));
    const n = nonLus();
    boutonAmis.dataset.nonLus = n > 0 ? String(n) : '';
    $('.rail-amis-libelle', boutonAmis).textContent = T().amisTitre;
  }

  const visibles = filtre
    ? etat.catalogue.jeux.filter((j) => {
      const loc = j[etat.langue] || j.fr;
      return `${j.nom} ${(loc.genres || []).join(' ')} ${loc.accroche || ''}`
        .toLowerCase().includes(filtre);
    })
    : etat.catalogue.jeux;

  if (!visibles.length) {
    const vide = document.createElement('li');
    vide.className = 'rail-vide';
    vide.textContent = T().aucunResultat;
    rail.append(vide);
  }

  for (const jeu of visibles) {
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
// Emojis
// =============================================================================

/* Liste servie par le service : la dupliquer ici la ferait diverger dès qu'on
   en ajoute un. En attendant sa réponse, un repli suffit à ne pas afficher un
   sélecteur vide. */
let EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '🎮', '🏆', '⚡'];

/**
 * Un sélecteur d'emojis, posé sous l'élément qui l'appelle.
 *
 * On n'ouvre qu'un sélecteur à la fois et on le referme au clic ailleurs :
 * deux panneaux ouverts sur la même page n'ont aucun sens et l'un des deux
 * finit toujours par rester coincé.
 */
let selecteurOuvert = null;

function fermerSelecteur() {
  if (selecteurOuvert) {
    selecteurOuvert.remove();
    selecteurOuvert = null;
  }
}

document.addEventListener('click', (evt) => {
  if (selecteurOuvert && !selecteurOuvert.contains(evt.target)
      && !evt.target.closest('[data-ouvre-emojis]')) {
    fermerSelecteur();
  }
});

function ouvrirSelecteurEmojis(ancre, choisi) {
  fermerSelecteur();

  const panneau = document.createElement('div');
  panneau.className = 'emojis';
  for (const e of EMOJIS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'emoji';
    b.textContent = e;
    b.addEventListener('click', () => {
      choisi(e);
      fermerSelecteur();
    });
    panneau.append(b);
  }

  document.body.append(panneau);
  selecteurOuvert = panneau;

  // Posé sous l'ancre, ramené dans la fenêtre s'il en sortait.
  const r = ancre.getBoundingClientRect();
  const largeur = panneau.offsetWidth;
  const hauteur = panneau.offsetHeight;
  const x = Math.min(Math.max(8, r.left), window.innerWidth - largeur - 8);
  const y = r.bottom + hauteur + 8 > window.innerHeight
    ? Math.max(8, r.top - hauteur - 6)
    : r.bottom + 6;
  panneau.style.left = `${x}px`;
  panneau.style.top = `${y}px`;
}

/** Les réactions d'un message, avec le compte et ce que j'ai posé moi-même. */
function barreReactions(sorte, idMessage, reactions, apres) {
  const miennes = reactions.filter((r) => Number(r.message) === Number(idMessage));

  const barre = document.createElement('div');
  barre.className = 'reactions';

  for (const r of miennes) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = r.mienne ? 'reaction reaction--mienne' : 'reaction';
    b.textContent = `${r.emoji} ${r.n}`;
    b.addEventListener('click', async () => {
      await window.ludopia.social.reagir(sorte, idMessage, r.emoji);
      apres();
    });
    barre.append(b);
  }

  const ajouter = document.createElement('button');
  ajouter.type = 'button';
  ajouter.className = 'reaction reaction--ajout';
  ajouter.dataset.ouvreEmojis = '1';
  ajouter.textContent = '＋';
  ajouter.setAttribute('aria-label', T().reagir);
  ajouter.addEventListener('click', () => {
    ouvrirSelecteurEmojis(ajouter, async (emoji) => {
      await window.ludopia.social.reagir(sorte, idMessage, emoji);
      apres();
    });
  });
  barre.append(ajouter);

  return barre;
}

// =============================================================================
// Salons privés
// =============================================================================

/* Une réponse plus ancienne ne doit jamais écraser une plus récente.
   Le cas se produit sans effort : on ouvre l'écran — un rafraîchissement part
   —, on rejoint un salon dans la seconde, un second rafraîchissement part et
   revient plus vite, puis le premier atterrit avec la liste d'avant. Le salon
   qu'on vient de rejoindre disparaît alors sans un mot.

   Un simple numéro d'ordre suffit : on ignore ce qui arrive en retard. */
let ordreSalons = 0;

async function rafraichirSalons() {
  const mien = ++ordreSalons;
  const r = await window.ludopia.social.salons();
  if (r.ok && mien === ordreSalons) etat.salons = r.donnees.salons || [];
  return r.ok;
}

async function rafraichirFilSalon() {
  if (!etat.salon) return;
  const r = await window.ludopia.social.messagesSalon(etat.salon, 0);
  if (r.ok) {
    etat.messagesSalon = r.donnees.messages || [];
    etat.reactionsSalon = r.donnees.reactions || [];
  }
}

async function ouvrirSalon(id) {
  etat.vue = 'salon';
  etat.salon = id;
  etat.inviteEnCours = false;
  window.ludopia.social.salonAffiche(id);
  etat.conversation = null;
  etat.messagesSalon = [];
  etat.reactionsSalon = [];
  window.ludopia.social.conversationAffichee(null);
  dessinerSalon();

  await rafraichirFilSalon();
  const dernier = etat.messagesSalon.reduce((n, m) => Math.max(n, Number(m.id) || 0), 0);
  if (dernier) await window.ludopia.social.salonLu(id, dernier);
  await rafraichirSalons();

  const m = await window.ludopia.social.membresSalon(id);
  if (m.ok) etat.membresSalon = m.donnees.membres || [];

  dessinerSalon();
  ecouterLeSalon();
}

/** Même principe que pour les conversations : une requête qui attend. */
let attenteSalon = false;
async function ecouterLeSalon() {
  if (attenteSalon) return;
  attenteSalon = true;
  try {
    while (etat.social.connecte && etat.salon) {
      const salon = etat.salon;
      const dernier = etat.messagesSalon
        .filter((m) => !m.provisoire)
        .reduce((n, m) => Math.max(n, Number(m.id) || 0), 0);

      const r = await window.ludopia.social.attendreSalon(salon, dernier);
      if (etat.salon !== salon) break;

      if (r.ok && (r.donnees.messages || []).length) {
        const connus = new Set(etat.messagesSalon.map((m) => String(m.id)));
        const neufs = r.donnees.messages.filter((m) => !connus.has(String(m.id)));
        if (neufs.length) {
          etat.messagesSalon = [...etat.messagesSalon.filter((m) => !m.provisoire), ...neufs];
          etat.reactionsSalon = r.donnees.reactions || etat.reactionsSalon;
          dessinerSalon();
          const max = neufs.reduce((n, m) => Math.max(n, Number(m.id) || 0), 0);
          await window.ludopia.social.salonLu(salon, max);
        }
      } else if (!r.ok && r.erreur !== 'delai_depasse') {
        await new Promise((f) => setTimeout(f, 3000));
      }
    }
  } finally {
    attenteSalon = false;
  }
}

function dessinerSalon() {
  const t = T();
  const salon = etat.salons.find((s) => s.id === etat.salon);
  if (!salon) {
    etat.salon = null;
    ouvrirAmis();
    return;
  }

  const scene = $('#scene');
  scene.textContent = '';
  scene.style.setProperty('--accent', 'var(--brand)');
  scene.style.setProperty('--accent-ink', '#080813');

  const bloc = document.createElement('section');
  bloc.className = 'conversation';

  // --- en-tête ---
  const tete = document.createElement('div');
  tete.className = 'conv-tete';

  const emoji = document.createElement('span');
  emoji.className = 'salon-emoji';
  emoji.textContent = salon.emoji || '🎮';

  const qui = document.createElement('div');
  const nom = document.createElement('p');
  nom.className = 'conv-nom';
  nom.textContent = salon.nom;
  const flamme = pastilleSerie(ami.serie);
  if (flamme) nom.append(flamme);

  const sous = document.createElement('p');
  sous.className = 'ami-etat';
  const enLigne = etat.membresSalon.filter((m) => m.enLigne).length;
  sous.textContent = `${salon.membres} ${salon.membres > 1 ? t.membres : t.unMembre}`
    + (enLigne ? ` · ${enLigne} ${t.amisEnLigne}` : '');
  qui.append(nom, sous);

  tete.append(emoji, qui);

  const outils = document.createElement('div');
  outils.className = 'conv-outils';

  if (salon.code) {
    const code = document.createElement('button');
    code.type = 'button';
    code.className = 'btn-mini';
    code.textContent = `${t.codeSalon} ${salon.code.slice(0, 4)} ${salon.code.slice(4)}`;
    code.addEventListener('click', async () => {
      await navigator.clipboard.writeText(salon.code);
      code.textContent = t.copie;
      setTimeout(() => dessinerSalon(), 1600);
    });
    outils.append(code);
  }

  /* Inviter directement plutôt que de transmettre un code : c'est le geste
     naturel quand la personne est déjà dans sa liste d'amis. Le code reste
     là pour ceux qui ne le sont pas encore. */
  const inviter = document.createElement('button');
  inviter.type = 'button';
  inviter.className = 'btn-mini';
  inviter.textContent = t.inviterAmis;
  inviter.addEventListener('click', () => {
    etat.inviteEnCours = !etat.inviteEnCours;
    dessinerSalon();
  });
  outils.append(inviter);

  const partir = document.createElement('button');
  partir.type = 'button';
  partir.className = 'btn-mini';
  partir.textContent = t.quitterSalon;
  partir.addEventListener('click', async () => {
    // Deux clics sur le même bouton plutôt qu'un dialogue natif, qui gèle le
    // rendu d'Electron.
    if (partir.dataset.sur !== '1') {
      partir.dataset.sur = '1';
      partir.textContent = `${t.quitterSalon} ?`;
      setTimeout(() => {
        partir.dataset.sur = '';
        partir.textContent = t.quitterSalon;
      }, 3000);
      return;
    }
    await window.ludopia.social.quitterSalon(salon.id);
    etat.salon = null;
    await rafraichirSalons();
    ouvrirAmis();
  });
  outils.append(partir);

  tete.append(outils);
  bloc.append(tete);

  // --- volet d'invitation ---
  if (etat.inviteEnCours) {
    const volet = document.createElement('div');
    volet.className = 'salon-invite';

    const dedans = new Set(etat.membresSalon.map((m) => m.id));
    const amis = (etat.amis?.amis || []);

    if (!amis.length) {
      volet.append(bulle(t.aucunAmi, 'calme'));
    } else {
      for (const a of amis) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn-mini';
        b.disabled = dedans.has(a.id);
        b.textContent = dedans.has(a.id) ? `${a.pseudo} — ${t.dejaDedans}` : a.pseudo;
        b.addEventListener('click', async () => {
          b.disabled = true;
          b.textContent = `${a.pseudo} — ${t.ajoute}`;
          await window.ludopia.social.inviterDansSalon(salon.id, a.id);
          const m = await window.ludopia.social.membresSalon(salon.id);
          if (m.ok) etat.membresSalon = m.donnees.membres || [];
          await rafraichirFilSalon();
          await rafraichirSalons();
        });
        volet.append(b);
      }
    }
    bloc.append(volet);
  }

  // --- fil ---
  const fil = document.createElement('div');
  fil.className = 'conv-fil';
  if (!etat.messagesSalon.length) {
    fil.append(bulle(t.salonVide, 'calme'));
  } else {
    let dernierAuteur = null;
    for (const m of etat.messagesSalon) {
      const el = document.createElement('div');
      el.className = m.auteur === etat.social.moi?.id ? 'msg msg--moi' : 'msg';
      if (m.provisoire) el.classList.add('msg--provisoire');

      // Le pseudo n'apparaît qu'au changement d'auteur : le répéter à chaque
      // ligne hache la lecture d'une conversation à plusieurs.
      if (m.auteur !== dernierAuteur && m.auteur !== etat.social.moi?.id) {
        const qui2 = document.createElement('p');
        qui2.className = 'msg-auteur';
        qui2.textContent = m.pseudo;
        el.append(qui2);
      }
      dernierAuteur = m.auteur;

      const texte = document.createElement('p');
      texte.textContent = m.texte;
      const heure = document.createElement('span');
      heure.className = 'msg-heure';
      heure.textContent = new Date(m.envoye_le * 1000).toLocaleTimeString(
        etat.langue === 'fr' ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' },
      );
      el.append(texte, heure);

      if (!m.provisoire) {
        el.append(barreReactions('salon', m.id, etat.reactionsSalon, async () => {
          await rafraichirFilSalon();
          dessinerSalon();
        }));
      }
      fil.append(el);
    }
  }
  bloc.append(fil);

  // --- saisie ---
  bloc.append(champSaisie(async (texte) => {
    const provisoire = {
      id: `provisoire-${Date.now()}`,
      auteur: etat.social.moi?.id,
      pseudo: etat.social.moi?.pseudo,
      texte,
      envoye_le: Math.floor(Date.now() / 1000),
      provisoire: true,
    };
    etat.messagesSalon = [...etat.messagesSalon, provisoire];
    dessinerSalon();

    const r = await window.ludopia.social.ecrireSalon(salon.id, texte);
    if (!r.ok) {
      etat.messagesSalon = etat.messagesSalon.filter((x) => x.id !== provisoire.id);
      dessinerSalon();
      $('.conv-fil')?.append(bulle(messageErreur(r.erreur, r.detail)));
      return;
    }
    await rafraichirFilSalon();
    dessinerSalon();
  }));

  scene.append(bloc);
  dessinerRail();
  dessinerChats();

  setTimeout(() => {
    const f = $('.conv-fil');
    if (f) f.scrollTop = f.scrollHeight;
    $('.conv-saisie input')?.focus();
  }, 30);
}

/** La barre de saisie, partagée par les conversations et les salons. */
function champSaisie(envoyer) {
  const t = T();
  const form = document.createElement('form');
  form.className = 'conv-saisie';

  const saisie = document.createElement('input');
  saisie.type = 'text';
  saisie.placeholder = t.votreMessage;
  saisie.maxLength = 1000;

  const emoji = document.createElement('button');
  emoji.type = 'button';
  emoji.className = 'btn-mini';
  emoji.dataset.ouvreEmojis = '1';
  emoji.textContent = '😀';
  emoji.setAttribute('aria-label', t.emojis);
  emoji.addEventListener('click', () => {
    ouvrirSelecteurEmojis(emoji, (e) => {
      saisie.value += e;
      saisie.focus();
    });
  });

  const bouton = document.createElement('button');
  bouton.type = 'submit';
  bouton.className = 'btn-mini btn-mini--fort';
  bouton.textContent = t.envoyer;

  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const texte = saisie.value.trim();
    if (!texte) return;
    saisie.value = '';
    await envoyer(texte);
  });

  form.append(saisie, emoji, bouton);
  return form;
}

// =============================================================================
// Profil
// =============================================================================

async function ouvrirProfil(id) {
  const r = await window.ludopia.social.profil(id === etat.social.moi?.id ? null : id);
  if (!r.ok) {
    /* Pas de `window.alert` : en Electron il fige le rendu jusqu'à ce que
       quelqu'un clique, ce qui bloque aussi les mises à jour de la
       conversation en cours. Le message s'affiche dans la page. */
    const scene = $('#scene');
    scene?.prepend(bulle(messageErreur(r.erreur, r.detail)));
    return;
  }
  etat.profil = r.donnees;
  dessinerProfil();
}

function dessinerProfil() {
  const t = T();
  const p = etat.profil;
  if (!p) return;

  fermerSelecteur();
  const ancien = $('.voile');
  if (ancien) ancien.remove();

  const voile = document.createElement('div');
  voile.className = 'voile';
  voile.addEventListener('click', (evt) => { if (evt.target === voile) voile.remove(); });

  const carte = document.createElement('div');
  carte.className = 'profil';
  carte.setAttribute('role', 'dialog');
  carte.setAttribute('aria-modal', 'true');

  const fermer = document.createElement('button');
  fermer.type = 'button';
  fermer.className = 'profil-fermer';
  fermer.textContent = '✕';
  fermer.setAttribute('aria-label', t.fermerProfil);
  fermer.addEventListener('click', () => voile.remove());
  carte.append(fermer);

  if (p.banniere) carte.dataset.banniere = p.banniere;
  if (p.accent) carte.style.setProperty('--teinte-perso', p.accent);

  const rond = document.createElement('span');
  rond.className = 'profil-rond';
  rond.style.setProperty('--teinte', p.accent || teinte(p.id));
  if (p.avatar) {
    const figure = document.createElement('img');
    figure.className = 'profil-figure';
    figure.alt = '';
    figure.src = dessinerFigure(p.avatar, p.accent);
    rond.textContent = '';
    rond.append(figure);
  } else {
    rond.textContent = initiales(p.pseudo);
  }
  carte.append(rond);

  const nom = document.createElement('h2');
  nom.textContent = p.pseudo;
  carte.append(nom);

  const titre = document.createElement('p');
  titre.className = 'profil-titre';
  titre.textContent = `${t.niveau} ${p.niveau} · ${p.titre}`;
  carte.append(titre);

  if (p.statut) {
    const st = document.createElement('p');
    st.className = 'profil-statut';
    st.textContent = p.statut;
    carte.append(st);
  }

  if (p.bio) {
    const bio = document.createElement('p');
    bio.className = 'profil-bio';
    bio.textContent = p.bio;
    carte.append(bio);
  }

  // Sa propre fiche s'édite depuis la carte : c'est là qu'on la regarde, c'est
  // là qu'on veut la changer.
  if (p.id === etat.social.moi?.id) {
    const editer = document.createElement('button');
    editer.type = 'button';
    editer.className = 'btn-mini profil-editer';
    editer.textContent = t.editerProfil;
    editer.addEventListener('click', () => { voile.remove(); ouvrirEditionProfil(p); });
    carte.append(editer);
  }

  // La barre de progression : on voit ce qui manque pour le palier suivant.
  const jauge = document.createElement('div');
  jauge.className = 'profil-jauge';
  const remplie = document.createElement('i');
  remplie.style.width = `${Math.round((p.dansLeNiveau / p.paliersuivant) * 100)}%`;
  jauge.append(remplie);
  carte.append(jauge);

  const sousJauge = document.createElement('p');
  sousJauge.className = 'acc-note';
  sousJauge.textContent = `${p.dansLeNiveau} / ${p.paliersuivant} ${t.joursVersNiveau}`;
  carte.append(sousJauge);

  const chiffres = document.createElement('div');
  chiffres.className = 'chiffres';
  chiffres.append(
    carteChiffre(String(p.joursDeJeu), t.joursDeJeu),
    carteChiffre(String(p.amis), t.amisTitre),
    carteChiffre(new Date(p.depuis * 1000).toLocaleDateString(
      etat.langue === 'fr' ? 'fr-FR' : 'en-GB'), t.membreDepuis),
  );
  carte.append(chiffres);

  if (p.parJeu?.length) {
    const h3 = document.createElement('h3');
    h3.className = 'profil-sous';
    h3.textContent = t.parJeu;
    carte.append(h3);

    const liste = document.createElement('ul');
    liste.className = 'profil-jeux';
    for (const j of p.parJeu) {
      const jeu = etat.catalogue.jeux.find((x) => x.id === j.jeu);
      const li = document.createElement('li');
      li.style.setProperty('--accent', jeu?.accent || 'var(--brand)');
      const n = document.createElement('span');
      n.textContent = jeu?.nom || j.jeu;
      const v = document.createElement('em');
      v.textContent = `${j.jours} ${j.jours > 1 ? t.jours : t.unJour}`;
      li.append(n, v);
      liste.append(li);
    }
    carte.append(liste);
  }

  const mesure = document.createElement('p');
  mesure.className = 'acc-note';
  mesure.textContent = t.profilMesure;
  carte.append(mesure);

  voile.append(carte);
  document.body.append(voile);
}


// =============================================================================
// Offrir des Ludos, signaler — de petites boîtes en place
// =============================================================================

/** Une boîte modale minimale, détruite au clic hors d'elle. */
function boite() {
  const ancien = $('.voile');
  if (ancien) ancien.remove();
  const voile = document.createElement('div');
  voile.className = 'voile';
  voile.addEventListener('click', (evt) => { if (evt.target === voile) voile.remove(); });
  const carte = document.createElement('div');
  carte.className = 'profil profil--edition';
  carte.setAttribute('role', 'dialog');
  carte.setAttribute('aria-modal', 'true');
  const fermer = document.createElement('button');
  fermer.type = 'button';
  fermer.className = 'profil-fermer';
  fermer.textContent = '✕';
  fermer.addEventListener('click', () => voile.remove());
  carte.append(fermer);
  voile.append(carte);
  document.body.append(voile);
  return { voile, carte };
}

function ouvrirDon(ami) {
  const t = T();
  const { voile, carte } = boite();

  const h2 = document.createElement('h2');
  h2.textContent = `💝 ${t.offrirLudos}`;
  carte.append(h2);

  const qui = document.createElement('p');
  qui.className = 'profil-statut';
  qui.textContent = ami.pseudo;
  carte.append(qui);

  const montant = document.createElement('input');
  montant.type = 'number';
  montant.min = '1';
  montant.max = '500';
  montant.value = '50';
  montant.className = 'profil-bio-champ';
  montant.setAttribute('aria-label', t.offrirCombien);
  carte.append(montant);

  const mot = document.createElement('input');
  mot.type = 'text';
  mot.maxLength = 80;
  mot.placeholder = t.offrirMot;
  mot.className = 'profil-bio-champ';
  carte.append(mot);

  const retour = document.createElement('div');
  carte.append(retour);

  const ok = document.createElement('button');
  ok.type = 'button';
  ok.className = 'jouer jouer--mini';
  ok.textContent = t.offrirEnvoyer;
  ok.addEventListener('click', async () => {
    retour.textContent = '';
    ok.disabled = true;
    const n = Math.floor(Number(montant.value));
    const r = await window.ludopia.bourse.offrir(ami.id, n, mot.value);
    ok.disabled = false;
    if (!r.ok) { retour.append(bulle(messageErreur(r.erreur, r.detail))); return; }
    retour.append(bulle(t.offrirFait(n, ami.pseudo), 'calme'));
    setTimeout(() => voile.remove(), 1400);
  });
  carte.append(ok);
}

function ouvrirSignalement(ami) {
  const t = T();
  const { voile, carte } = boite();

  const h2 = document.createElement('h2');
  h2.textContent = t.signalerAmi;
  carte.append(h2);

  const qui = document.createElement('p');
  qui.className = 'profil-statut';
  qui.textContent = ami.pseudo;
  carte.append(qui);

  const motif = document.createElement('textarea');
  motif.className = 'profil-bio-champ';
  motif.rows = 3;
  motif.maxLength = 400;
  motif.placeholder = t.motifSignalement;
  carte.append(motif);

  const retour = document.createElement('div');
  carte.append(retour);

  const ok = document.createElement('button');
  ok.type = 'button';
  ok.className = 'btn-mini btn-mini--danger';
  ok.textContent = t.signalerEnvoi;
  ok.addEventListener('click', async () => {
    retour.textContent = '';
    ok.disabled = true;
    const r = await window.ludopia.social.signaler(ami.id, motif.value);
    ok.disabled = false;
    if (!r.ok) { retour.append(bulle(messageErreur(r.erreur, r.detail))); return; }
    retour.append(bulle(t.signalementEnvoye, 'calme'));
    await rafraichirAmis();
    setTimeout(() => { voile.remove(); dessinerAmis(); }, 1400);
  });
  carte.append(ok);
}

// =============================================================================
// Édition de sa fiche
// =============================================================================

const ACCENTS_PROFIL = [
  '#7c5cff', '#2ee6a8', '#ffb020', '#ff5c7a', '#4d8dff', '#ff7a45', '#c084fc', '#22d3ee',
];
const BANNIERES_PROFIL = ['nuit', 'aube', 'menthe', 'braise', 'ocean', 'orage', 'foret', 'sable'];

function ouvrirEditionProfil(p) {
  const t = T();

  const voile = document.createElement('div');
  voile.className = 'voile';
  voile.addEventListener('click', (evt) => { if (evt.target === voile) voile.remove(); });

  const carte = document.createElement('div');
  carte.className = 'profil profil--edition';
  carte.setAttribute('role', 'dialog');
  carte.setAttribute('aria-modal', 'true');

  const fermer = document.createElement('button');
  fermer.type = 'button';
  fermer.className = 'profil-fermer';
  fermer.textContent = '✕';
  fermer.addEventListener('click', () => voile.remove());
  carte.append(fermer);

  const brouillon = {
    avatar: p.avatar || null,
    accent: p.accent || null,
    banniere: p.banniere || null,
    bio: p.bio || '',
  };

  // --- la figure ---
  const h3a = document.createElement('h3');
  h3a.className = 'profil-sous';
  h3a.textContent = t.avatarTitre;
  carte.append(h3a);

  const apercu = document.createElement('img');
  apercu.className = 'profil-figure profil-figure--grande';
  apercu.alt = '';
  const redessiner = () => {
    apercu.src = dessinerFigure(brouillon.avatar || etat.social.moi?.id || 'x',
      brouillon.accent);
  };
  redessiner();
  carte.append(apercu);

  const aideAvatar = document.createElement('p');
  aideAvatar.className = 'acc-note';
  aideAvatar.textContent = t.avatarAide;
  carte.append(aideAvatar);

  const relancer = document.createElement('button');
  relancer.type = 'button';
  relancer.className = 'btn-mini';
  relancer.textContent = `🎲 ${t.relancer}`;
  relancer.addEventListener('click', () => {
    brouillon.avatar = Math.random().toString(36).slice(2, 12);
    redessiner();
  });
  carte.append(relancer);

  // --- la couleur ---
  const h3b = document.createElement('h3');
  h3b.className = 'profil-sous';
  h3b.textContent = t.accentTitre;
  carte.append(h3b);

  const couleurs = document.createElement('div');
  couleurs.className = 'srv-couleurs';
  for (const c of ACCENTS_PROFIL) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = c === brouillon.accent ? 'srv-couleur srv-couleur--actif' : 'srv-couleur';
    b.style.setProperty('--c', c);
    b.addEventListener('click', () => {
      brouillon.accent = c;
      couleurs.querySelectorAll('.srv-couleur').forEach((x) => x.classList.remove('srv-couleur--actif'));
      b.classList.add('srv-couleur--actif');
      redessiner();
    });
    couleurs.append(b);
  }
  carte.append(couleurs);

  // --- la banniere ---
  const h3c = document.createElement('h3');
  h3c.className = 'profil-sous';
  h3c.textContent = t.banniereTitre;
  carte.append(h3c);

  const bannieres = document.createElement('div');
  bannieres.className = 'profil-bannieres';
  for (const nom of BANNIERES_PROFIL) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = nom === brouillon.banniere
      ? 'profil-banniere profil-banniere--actif' : 'profil-banniere';
    b.dataset.banniere = nom;
    b.setAttribute('aria-label', nom);
    b.addEventListener('click', () => {
      brouillon.banniere = nom;
      bannieres.querySelectorAll('.profil-banniere').forEach((x) => x.classList.remove('profil-banniere--actif'));
      b.classList.add('profil-banniere--actif');
    });
    bannieres.append(b);
  }
  carte.append(bannieres);

  // --- la bio ---
  const h3d = document.createElement('h3');
  h3d.className = 'profil-sous';
  h3d.textContent = t.bioTitre;
  carte.append(h3d);

  const bio = document.createElement('textarea');
  bio.className = 'profil-bio-champ';
  bio.maxLength = 160;
  bio.rows = 2;
  bio.value = brouillon.bio;
  carte.append(bio);

  // --- le passeport public ---
  const h3e = document.createElement('h3');
  h3e.className = 'profil-sous';
  h3e.textContent = t.passeportTitre;
  carte.append(h3e);

  const aidePasseport = document.createElement('p');
  aidePasseport.className = 'acc-note';
  aidePasseport.textContent = t.passeportAide;
  carte.append(aidePasseport);

  const zonePasseport = document.createElement('div');
  zonePasseport.className = 'srv-code-form';

  const champAdresse = document.createElement('input');
  champAdresse.type = 'text';
  champAdresse.maxLength = 30;
  champAdresse.placeholder = t.passeportAdresse;
  champAdresse.style.textTransform = 'lowercase';
  zonePasseport.append(champAdresse);

  const boutonPasseport = document.createElement('button');
  boutonPasseport.type = 'button';
  boutonPasseport.className = 'btn-mini';
  boutonPasseport.textContent = t.passeportOuvrir;
  zonePasseport.append(boutonPasseport);
  carte.append(zonePasseport);

  const zoneLien = document.createElement('div');
  carte.append(zoneLien);

  let passeportOuvert = false;

  const peindrePasseport = (d) => {
    passeportOuvert = Boolean(d.public);
    if (d.adresse) champAdresse.value = d.adresse;
    boutonPasseport.textContent = passeportOuvert ? t.passeportFermer : t.passeportOuvrir;
    zoneLien.textContent = '';
    if (passeportOuvert && d.lien) {
      const copier = document.createElement('button');
      copier.type = 'button';
      copier.className = 'btn-mini';
      copier.textContent = `🔗 ${t.passeportCopier}`;
      copier.addEventListener('click', async () => {
        await navigator.clipboard.writeText(d.lien);
        copier.textContent = `✓ ${t.passeportCopie}`;
        setTimeout(() => { copier.textContent = `🔗 ${t.passeportCopier}`; }, 1600);
      });
      zoneLien.append(copier);
    }
  };

  // L'état courant, sans rien changer : un envoi vide relit la fiche.
  window.ludopia.social.passeport({}).then((r) => { if (r.ok) peindrePasseport(r.donnees); });

  boutonPasseport.addEventListener('click', async () => {
    zoneLien.textContent = '';
    const r = await window.ludopia.social.passeport({
      public: !passeportOuvert,
      adresse: champAdresse.value.trim() || undefined,
    });
    if (!r.ok) { zoneLien.append(bulle(messageErreur(r.erreur, r.detail))); return; }
    peindrePasseport(r.donnees);
  });

  const retour = document.createElement('div');
  carte.append(retour);

  const ok = document.createElement('button');
  ok.type = 'button';
  ok.className = 'jouer jouer--mini';
  ok.textContent = t.enregistrer ?? 'Enregistrer';
  ok.addEventListener('click', async () => {
    retour.textContent = '';
    const r = await window.ludopia.social.modifierProfil({
      avatar: brouillon.avatar,
      accent: brouillon.accent,
      banniere: brouillon.banniere,
      bio: bio.value,
    });
    if (!r.ok) { retour.append(bulle(messageErreur(r.erreur, r.detail))); return; }
    ok.textContent = `✓ ${t.enregistre}`;
    setTimeout(() => voile.remove(), 900);
  });
  carte.append(ok);

  voile.append(carte);
  document.body.append(voile);
}

// =============================================================================
// Réglages
// =============================================================================

/**
 * Une ligne de réglage : intitulé, explication, et l'interrupteur.
 *
 * L'explication n'est pas décorative. Un interrupteur nommé « Avis » sans plus
 * ne dit ni ce qu'il déclenche, ni quand — et l'utilisateur le laisse dans
 * l'état où il l'a trouvé, faute de savoir.
 */
function ligneReglage(intitule, explication, controle) {
  const el = document.createElement('div');
  el.className = 'reglage';

  const texte = document.createElement('div');
  const t1 = document.createElement('p');
  t1.className = 'reglage-nom';
  t1.textContent = intitule;
  texte.append(t1);

  if (explication) {
    const t2 = document.createElement('p');
    t2.className = 'reglage-aide';
    t2.textContent = explication;
    texte.append(t2);
  }

  el.append(texte, controle);
  return el;
}

function interrupteur(actif, change) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'bascule';
  b.setAttribute('role', 'switch');
  b.setAttribute('aria-checked', String(actif));
  b.addEventListener('click', () => {
    const neuf = b.getAttribute('aria-checked') !== 'true';
    b.setAttribute('aria-checked', String(neuf));
    change(neuf);
  });
  return b;
}

function dessinerReglages() {
  const t = T();
  const scene = $('#scene');
  scene.textContent = '';
  scene.style.setProperty('--accent', 'var(--brand)');
  scene.style.setProperty('--accent-ink', '#080813');

  const tete = document.createElement('section');
  tete.className = 'acc-tete';
  const h1 = document.createElement('h1');
  h1.textContent = t.reglages;
  tete.append(h1);
  scene.append(tete);

  const r = etat.reglages;

  // --- avis ---
  const blocAvis = document.createElement('section');
  blocAvis.className = 'acc-bloc';
  const h2a = document.createElement('h2');
  h2a.textContent = t.avisTitre;
  blocAvis.append(h2a);

  blocAvis.append(ligneReglage(t.avisMessages, t.avisMessagesAide,
    interrupteur(r.avisMessages, (v) => enregistrerReglage('avisMessages', v))));
  blocAvis.append(ligneReglage(t.avisSalons, t.avisSalonsAide,
    interrupteur(r.avisSalons, (v) => enregistrerReglage('avisSalons', v))));
  blocAvis.append(ligneReglage(t.avisInvitations, t.avisInvitationsAide,
    interrupteur(r.avisInvitations, (v) => enregistrerReglage('avisInvitations', v))));
  blocAvis.append(ligneReglage(t.avisSeries, t.avisSeriesAide,
    interrupteur(r.avisSeries !== false, (v) => enregistrerReglage('avisSeries', v))));
  blocAvis.append(ligneReglage(t.avisSon, t.avisSonAide,
    interrupteur(r.son, (v) => enregistrerReglage('son', v))));
  scene.append(blocAvis);

  // --- lanceur ---
  const blocLanceur = document.createElement('section');
  blocLanceur.className = 'acc-bloc';
  const h2b = document.createElement('h2');
  h2b.textContent = t.lanceurTitre;
  blocLanceur.append(h2b);

  blocLanceur.append(ligneReglage(t.demarrerReduit, t.demarrerReduitAide,
    interrupteur(r.demarrerReduit, (v) => enregistrerReglage('demarrerReduit', v))));
  blocLanceur.append(ligneReglage(t.surimpressionTitre, t.surimpressionAide,
    interrupteur(r.surimpression, (v) => enregistrerReglage('surimpression', v))));

  const langue = document.createElement('button');
  langue.type = 'button';
  langue.className = 'btn-mini';
  langue.textContent = etat.langue === 'fr' ? 'Français' : 'English';
  langue.addEventListener('click', () => $('[data-langue]')?.click());
  const choixTheme = document.createElement('div');
  choixTheme.className = 'segments';
  [['systeme', t.themeSysteme], ['sombre', t.themeSombre], ['clair', t.themeClair]]
    .forEach(([valeur, intitule]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = etat.theme?.choisi === valeur ? 'segment segment--actif' : 'segment';
      b.textContent = intitule;
      b.addEventListener('click', async () => {
        await enregistrerReglage('theme', valeur);
        etat.theme = { ...etat.theme, choisi: valeur };
        dessinerReglages();
      });
      choixTheme.append(b);
    });
  blocLanceur.append(ligneReglage(t.themeTitre, t.themeAide, choixTheme));

  blocLanceur.append(ligneReglage(t.langueTitre, t.langueAide, langue));
  scene.append(blocLanceur);

  // --- compte ---
  const blocCompte = document.createElement('section');
  blocCompte.className = 'acc-bloc';
  const h2c = document.createElement('h2');
  h2c.textContent = t.compteTitre;
  blocCompte.append(h2c);

  if (etat.social.connecte) {
    const qui = document.createElement('p');
    qui.className = 'acc-vide';
    qui.textContent = `${etat.social.moi?.pseudo || ''}`
      + (etat.social.moi?.courriel ? ` · ${etat.social.moi.courriel}` : '');
    blocCompte.append(qui);

    const barre = document.createElement('div');
    barre.className = 'ami-actions';

    const profil = document.createElement('button');
    profil.type = 'button';
    profil.className = 'btn-mini';
    profil.textContent = t.voirProfil;
    profil.addEventListener('click', () => ouvrirProfil(etat.social.moi?.id));
    barre.append(profil);

    const sortir = document.createElement('button');
    sortir.type = 'button';
    sortir.className = 'btn-mini';
    sortir.textContent = t.deconnexion;
    sortir.addEventListener('click', async () => {
      await window.ludopia.social.deconnexion();
      etat.social = { connecte: false, moi: null };
      etat.amis = null;
      etat.salons = [];
      dessinerReglages();
    });
    barre.append(sortir);
    blocCompte.append(barre);
  } else {
    blocCompte.append(bulle(t.connexionRequise, 'calme'));
    const aller = document.createElement('button');
    aller.type = 'button';
    aller.className = 'action-secondaire';
    aller.textContent = t.connexion;
    aller.addEventListener('click', ouvrirAmis);
    blocCompte.append(aller);
  }
  scene.append(blocCompte);

  // --- données ---
  const blocDonnees = document.createElement('section');
  blocDonnees.className = 'acc-bloc';
  const h2d = document.createElement('h2');
  h2d.textContent = t.donneesTitre;
  blocDonnees.append(h2d);

  const ou = document.createElement('p');
  ou.className = 'acc-vide';
  ou.textContent = t.donneesOu;
  blocDonnees.append(ou);

  const chemin = document.createElement('p');
  chemin.className = 'stat-somme';
  chemin.textContent = etat.dossierDonnees || '…';
  blocDonnees.append(chemin);

  const ouvrirDossier = document.createElement('button');
  ouvrirDossier.type = 'button';
  ouvrirDossier.className = 'btn-mini';
  ouvrirDossier.textContent = t.ouvrirDossier;
  ouvrirDossier.addEventListener('click', () => window.ludopia.ouvrirDossierDonnees());
  blocDonnees.append(ouvrirDossier);
  scene.append(blocDonnees);

  // --- à propos ---
  const blocApropos = document.createElement('section');
  blocApropos.className = 'acc-bloc';
  const h2e = document.createElement('h2');
  h2e.textContent = t.apropos;
  blocApropos.append(h2e);

  const version = document.createElement('p');
  version.className = 'acc-vide';
  version.textContent = `Ludopia ${etat.versionLanceur || ''}`;
  blocApropos.append(version);

  const barre2 = document.createElement('div');
  barre2.className = 'ami-actions';

  const maj = document.createElement('button');
  maj.type = 'button';
  maj.className = 'btn-mini';
  maj.textContent = t.majAJour;
  maj.addEventListener('click', () => window.ludopia.majChercher());
  barre2.append(maj);

  const site = document.createElement('button');
  site.type = 'button';
  site.className = 'btn-mini';
  site.textContent = t.siteWeb;
  site.addEventListener('click', () => window.ludopia.ouvrirLien('https://ludopia.fr'));
  barre2.append(site);

  blocApropos.append(barre2);
  scene.append(blocApropos);

  dessinerRail();
  dessinerChats();
  scene.scrollTop = 0;
}

async function enregistrerReglage(cle, valeur) {
  etat.reglages = { ...etat.reglages, [cle]: valeur };
  await window.ludopia.definirReglages(etat.reglages);
}

function ouvrirReglages() {
  etat.vue = 'reglages';
  etat.conversation = null;
  etat.salon = null;
  window.ludopia.social.conversationAffichee(null);
  window.ludopia.social.salonAffiche(null);
  dessinerReglages();
}

// =============================================================================
// Amis
// =============================================================================

const ICONE_APPEL =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
  + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<path d="M6.5 3h-3A1.5 1.5 0 0 0 2 4.6C2 13.1 10.9 22 19.4 22a1.5 1.5 0 0 0 '
  + '1.6-1.5v-3a1 1 0 0 0-.8-1l-3.4-.7a1 1 0 0 0-1 .4l-1 1.3a14 14 0 0 1-5.3-5.3l'
  + '1.3-1a1 1 0 0 0 .4-1l-.7-3.4a1 1 0 0 0-1-.8Z" /></svg>';

const ICONE_AMIS =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
  + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />'
  + '<circle cx="10" cy="8" r="3.5" /><path d="M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4" />'
  + '<path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8" /></svg>';

/**
 * Une suspension se dit en toutes lettres.
 *
 * Le service renvoie le motif et le terme dans le détail. Sans cela, quelqu'un
 * de suspendu verrait « pseudo ou mot de passe incorrect » et passerait une
 * soirée à réessayer son mot de passe — puis écrirait pour signaler une panne
 * qui n'en est pas une.
 */
function messageSuspension(detail) {
  const t = T();
  let d = {};
  try { d = JSON.parse(detail || '{}'); } catch { /* détail illisible */ }

  const quand = d.jusqu
    ? new Date(d.jusqu * 1000).toLocaleString(etat.langue === 'fr' ? 'fr-FR' : 'en-GB',
      { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  const tete = quand ? t.suspenduJusqu(quand) : t.suspenduSansTerme;
  return d.motif ? `${tete} ${t.suspenduMotif(d.motif)}` : tete;
}

/**
 * Dessine une figure à partir d'une graine.
 *
 * Le même algorithme partout — ici, dans les jeux, sur le site : une grille
 * cinq par cinq symétrique, dont chaque case s'allume selon un générateur
 * dérivé de la graine. C'est le principe des identicônes, et il tient en
 * vingt lignes sans rien télécharger ni héberger.
 */
function dessinerFigure(graine, accent) {
  // Un générateur simple et déterministe : la même graine donne la même figure
  // sur toute machine. La qualité statistique importe peu, la stabilité si.
  let h = 2166136261;
  for (const c of String(graine)) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const suivant = () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return (h >>> 0) / 4294967295;
  };

  const teinteFond = accent || '#7c5cff';
  let cases = '';
  for (let y = 0; y < 5; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      if (suivant() > 0.5) {
        cases += `<rect x="${10 + x * 16}" y="${10 + y * 16}" width="14" height="14" rx="3" fill="#fff" opacity="0.92"/>`;
        if (x < 2) {
          cases += `<rect x="${10 + (4 - x) * 16}" y="${10 + y * 16}" width="14" height="14" rx="3" fill="#fff" opacity="0.92"/>`;
        }
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`
    + `<rect width="100" height="100" rx="22" fill="${teinteFond}"/>${cases}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Pose le thème sur la racine du document.
 *
 * Un attribut plutôt qu'une classe : les feuilles de style le lisent avec
 * `:root[data-theme="clair"]`, et l'absence d'attribut vaut sombre — ce qui
 * évite un état intermédiaire non peint au tout premier rendu.
 */
function appliquerTheme(t) {
  const clair = (t?.effectif || 'sombre') === 'clair';
  if (clair) document.documentElement.dataset.theme = 'clair';
  else delete document.documentElement.dataset.theme;
}

/** Traduit un code d'erreur du service ; à défaut, on montre le code brut
 *  plutôt qu'un « une erreur est survenue » qui n'aide personne. */
function messageErreur(code, detail) {
  if (code === 'compte_suspendu') return messageSuspension(detail);
  return T().erreurs[code] || detail || code || T().horsService;
}

function bulle(texte, sorte = 'erreur') {
  const p = document.createElement('p');
  p.className = `bulle bulle--${sorte}`;
  p.textContent = texte;
  return p;
}

function champ(etiquette, type, nom, autocompletion, aide) {
  const bloc = document.createElement('label');
  bloc.className = 'champ';
  const l = document.createElement('span');
  l.textContent = etiquette;
  const i = document.createElement('input');
  i.type = type;
  i.name = nom;
  i.autocomplete = autocompletion;
  i.spellcheck = false;
  bloc.append(l, i);
  if (aide) {
    const a = document.createElement('em');
    a.className = 'champ-aide';
    a.textContent = aide;
    bloc.append(a);
  }
  return { bloc, entree: i };
}

// --- connexion et inscription -----------------------------------------------

function dessinerFormulaire(scene) {
  const t = T();
  const inscrire = etat.formulaire === 'inscription';

  const bloc = document.createElement('section');
  bloc.className = 'acc-bloc amis-connexion';

  const h1 = document.createElement('h1');
  h1.textContent = inscrire ? t.inscription : t.connexion;
  bloc.append(h1);

  const intro = document.createElement('p');
  intro.className = 'acc-vide';
  intro.textContent = t.codeExplication;
  bloc.append(intro);

  const form = document.createElement('form');
  form.className = 'formulaire';

  // À l'inscription on demande les deux : le pseudo est ce que voient les amis,
  // l'adresse est ce qui identifie le compte. À la connexion un seul champ
  // suffit — le service reconnaît une adresse à son arobase.
  const p = inscrire
    ? champ(t.pseudo, 'text', 'pseudo', 'username', t.pseudoAide)
    : champ(t.identifiant, 'text', 'identifiant', 'username');
  const c = inscrire
    ? champ(t.courriel, 'email', 'courriel', 'email', t.courrielAide)
    : null;
  const m = champ(t.motDePasse, 'password', 'motDePasse',
    inscrire ? 'new-password' : 'current-password');

  form.append(p.bloc);
  if (c) form.append(c.bloc);
  form.append(m.bloc);

  const erreurs = document.createElement('div');
  form.append(erreurs);

  const valider = document.createElement('button');
  valider.type = 'submit';
  valider.className = 'jouer';
  valider.textContent = inscrire ? t.inscription : t.connexion;
  form.append(valider);

  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    erreurs.textContent = '';
    valider.disabled = true;

    const r = inscrire
      ? await window.ludopia.social.inscription(p.entree.value, c.entree.value, m.entree.value)
      : await window.ludopia.social.connexion(p.entree.value, m.entree.value);
    valider.disabled = false;

    if (!r.ok) {
      erreurs.append(bulle(messageErreur(r.erreur, r.detail)));
      m.entree.value = '';
      m.entree.focus();
      return;
    }
    etat.social = { connecte: true, moi: r.donnees };
    await rafraichirAmis();
    dessinerAmis();
  });

  bloc.append(form);

  const bascule = document.createElement('button');
  bascule.type = 'button';
  bascule.className = 'rail-lien';
  bascule.textContent = inscrire ? t.dejaCompte : t.pasDeCompte;
  bascule.addEventListener('click', () => {
    etat.formulaire = inscrire ? 'connexion' : 'inscription';
    dessinerAmis();
  });
  bloc.append(bascule);

  scene.append(bloc);
  // Le curseur dans le premier champ : c'est la seule chose à faire ici.
  setTimeout(() => p.entree.focus(), 30);
}

// --- carte d'un ami ----------------------------------------------------------

/** « 42 min », « 2 h 10 » — la durée d'une partie en cours. */
function dureeCourte(secondes) {
  if (!secondes || secondes < 60) return null;
  const m = Math.floor(secondes / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const reste = m % 60;
  return reste ? `${h} h ${String(reste).padStart(2, '0')}` : `${h} h`;
}

function etatAmi(ami) {
  const t = T();
  if (ami.jeu) {
    const jeu = etat.catalogue.jeux.find((j) => j.id === ami.jeu);
    /* La durée transforme une information en invitation. « Joue à Villopia »
       n'appelle rien ; « joue à Villopia depuis 42 minutes » dit qu'il y a
       quelqu'un, maintenant, et qu'on peut le rejoindre. */
    const depuis = dureeCourte(ami.jeuDepuis);
    return {
      texte: `${t.joueA} ${jeu ? jeu.nom : ami.jeu}${depuis ? ` · ${depuis}` : ''}`,
      sorte: 'joue',
    };
  }
  if (ami.enLigne) return { texte: t.enLigne, sorte: 'en-ligne' };
  return { texte: `${t.horsLigne} · ${quand(ami.vuLe ? ami.vuLe * 1000 : null)}`, sorte: 'hors' };
}

/**
 * La flamme d'une série d'amitié.
 *
 * Trois états, et le troisième est celui qui compte : une série *en péril* —
 * vivante mais pas encore acquise aujourd'hui — s'affiche différemment. C'est
 * elle qui donne une raison d'écrire à quelqu'un, et l'afficher comme les
 * autres reviendrait à ne pas l'afficher.
 */
function pastilleSerie(serie) {
  if (!serie || !serie.jours) return null;
  const t = T();

  const el = document.createElement('b');
  el.className = serie.enPeril ? 'serie serie--peril' : 'serie';
  el.textContent = `🔥 ${serie.jours}`;
  el.title = serie.enPeril
    ? (serie.manque === 'moi' ? t.serieAVous : t.serieAlui(serie.jours))
    : t.serieTenue(serie.jours);
  return el;
}

function carteAmi(ami, actions) {
  const el = document.createElement('article');
  el.className = 'ami';
  const e = etatAmi(ami);
  el.dataset.etat = e.sorte;

  const tete = document.createElement('div');
  tete.className = 'ami-tete';

  const nom = document.createElement('p');
  nom.className = 'ami-nom';
  nom.textContent = ami.pseudo;
  if (ami.nonLus) {
    const pastille = document.createElement('b');
    pastille.className = 'ami-pastille';
    pastille.textContent = String(ami.nonLus);
    nom.append(pastille);
  }

  const flamme = pastilleSerie(ami.serie);
  if (flamme) nom.append(flamme);

  const sous = document.createElement('p');
  sous.className = 'ami-etat';
  sous.innerHTML = '<i></i>';
  sous.append(e.texte);

  tete.append(nom, sous);

  if (ami.statut) {
    const st = document.createElement('p');
    st.className = 'ami-statut';
    st.textContent = ami.statut;
    tete.append(st);
  }
  el.append(tete);

  const barre = document.createElement('div');
  barre.className = 'ami-actions';
  for (const [libelle, sorte, action] of actions) {
    const b = document.createElement('button');
    b.dataset.libelle = libelle;
    b.type = 'button';
    b.className = sorte === 'principal' ? 'btn-mini btn-mini--fort' : 'btn-mini';
    b.textContent = libelle;
    b.addEventListener('click', () => action(b));
    barre.append(b);
  }
  el.append(barre);
  return el;
}

// --- la liste ----------------------------------------------------------------

function dessinerListeAmis(scene) {
  const t = T();
  const d = etat.amis || { amis: [], demandesRecues: [], demandesEnvoyees: [] };

  // --- mon code ---
  const enTete = document.createElement('section');
  enTete.className = 'acc-tete amis-tete';

  const titre = document.createElement('h1');
  titre.textContent = t.amisTitre;
  enTete.append(titre);

  const carteCode = document.createElement('div');
  carteCode.className = 'code-carte';

  const etiquette = document.createElement('p');
  etiquette.className = 'code-etiquette';
  etiquette.textContent = t.monCode;

  const valeur = document.createElement('p');
  valeur.className = 'code-valeur';
  const brut = etat.social.moi?.codeAmi || '';
  // Deux groupes de quatre : un code de huit caractères se dicte mal d'un bloc.
  valeur.textContent = brut ? `${brut.slice(0, 4)} ${brut.slice(4)}` : '—';

  const copier = document.createElement('button');
  copier.type = 'button';
  copier.className = 'btn-mini';
  copier.textContent = t.copier;
  copier.addEventListener('click', async () => {
    await navigator.clipboard.writeText(brut);
    copier.textContent = t.copie;
    setTimeout(() => { copier.textContent = t.copier; }, 1600);
  });

  const explication = document.createElement('p');
  explication.className = 'code-explication';
  explication.textContent = t.codeExplication;

  carteCode.append(etiquette, valeur, copier, explication);
  enTete.append(carteCode);

  // --- statut ---
  const formStatut = document.createElement('form');
  formStatut.className = 'ajout-ami';
  formStatut.id = 'monStatut';
  const champStatut = document.createElement('input');
  champStatut.type = 'text';
  champStatut.maxLength = 80;
  champStatut.placeholder = t.statutExemple;
  champStatut.value = etat.social.moi?.statut || '';
  champStatut.setAttribute('aria-label', t.monStatut);

  const enregistrer = document.createElement('button');
  enregistrer.type = 'submit';
  enregistrer.className = 'btn-mini';
  enregistrer.textContent = t.enregistrer;

  formStatut.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    enregistrer.disabled = true;
    const r = await window.ludopia.social.statut(champStatut.value.trim() || null);
    enregistrer.disabled = false;
    if (r.ok) {
      etat.social.moi = { ...etat.social.moi, statut: r.donnees.statut };
      enregistrer.textContent = t.copie;
      setTimeout(() => { enregistrer.textContent = t.enregistrer; }, 1500);
    }
  });
  formStatut.append(champStatut, enregistrer);
  enTete.append(formStatut);

  // --- ajouter ---
  const form = document.createElement('form');
  form.className = 'ajout-ami';
  const saisie = document.createElement('input');
  saisie.type = 'text';
  saisie.placeholder = t.codeAmi;
  saisie.maxLength = 9;
  saisie.spellcheck = false;
  const bouton = document.createElement('button');
  bouton.type = 'submit';
  bouton.className = 'btn-mini btn-mini--fort';
  bouton.textContent = t.ajouter;
  const retour = document.createElement('div');
  retour.className = 'ajout-retour';

  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    retour.textContent = '';
    bouton.disabled = true;
    const r = await window.ludopia.social.ajouterAmi(saisie.value);
    bouton.disabled = false;
    if (!r.ok) {
      retour.append(bulle(messageErreur(r.erreur, r.detail)));
      return;
    }
    saisie.value = '';
    await rafraichirAmis();
    dessinerAmis();
  });

  form.append(saisie, bouton);
  enTete.append(form, retour);
  scene.append(enTete);

  // --- demandes reçues ---
  if (d.demandesRecues.length) {
    const bloc = document.createElement('section');
    bloc.className = 'acc-bloc';
    const h2 = document.createElement('h2');
    h2.textContent = t.demandesRecues;
    bloc.append(h2);
    const liste = document.createElement('div');
    liste.className = 'amis-grille';
    for (const a of d.demandesRecues) {
      liste.append(carteAmi(a, [
        [t.accepter, 'principal', async () => {
          await window.ludopia.social.repondreAmi(a.id, true);
          await rafraichirAmis();
          dessinerAmis();
        }],
        [t.refuser, 'discret', async () => {
          await window.ludopia.social.repondreAmi(a.id, false);
          await rafraichirAmis();
          dessinerAmis();
        }],
      ]));
    }
    bloc.append(liste);
    scene.append(bloc);
  }

  // --- amis ---
  const bloc = document.createElement('section');
  bloc.className = 'acc-bloc';
  const h2 = document.createElement('h2');
  h2.textContent = t.mesAmis;
  bloc.append(h2);

  if (!d.amis.length) {
    bloc.append(bulle(t.aucunAmi, 'calme'));
  } else {
    const liste = document.createElement('div');
    liste.className = 'amis-grille';
    for (const a of d.amis) {
      const actions = [[t.ecrire, 'principal', () => ouvrirConversation(a.id)]];

      // Inviter n'a de sens que si une partie tourne : sinon il n'y a rien à
      // rejoindre, et le bouton mentirait.
      if (etat.jeuOuvert) {
        const nom = etat.catalogue.jeux.find((j) => j.id === etat.jeuOuvert)?.nom
          || etat.jeuOuvert;
        const envoyee = etat.invitees.get(a.id);
        actions.push([
          envoyee ? t.invitationPartie : `${t.inviter} · ${nom}`,
          'discret',
          async () => {
            if (etat.invitees.has(a.id)) return;
            etat.invitees.set(a.id, Date.now());
            dessinerAmis();
            await window.ludopia.social.inviter(a.id, etat.jeuOuvert);
            // Le bouton redevient proposable au bout de quelques secondes :
            // laisser « envoyée » à demeure empêcherait de réinviter.
            setTimeout(() => {
              etat.invitees.delete(a.id);
              if (etat.vue === 'amis' && !etat.conversation) dessinerAmis();
            }, 8000);
          },
        ]);
      }

      actions.push(
        [t.voirProfil, 'discret', () => ouvrirProfil(a.id)],
        [`💝 ${t.offrirLudos}`, 'discret', () => ouvrirDon(a)],
        /* Plus aucun dialogue natif ici : window.confirm/prompt/alert gèlent
           le processus de rendu d'Electron — le même défaut qui avait figé le
           lanceur une première fois. La confirmation se fait en deux clics
           sur le même bouton, le motif dans un champ en place. */
        [t.bloquerAmi, 'discret', async (bouton) => {
          if (bouton && bouton.dataset.sur !== '1') {
            bouton.dataset.sur = '1';
            bouton.textContent = t.bloquerSur;
            setTimeout(() => {
              bouton.dataset.sur = '';
              bouton.textContent = t.bloquerAmi;
            }, 3000);
            return;
          }
          await window.ludopia.social.bloquer(a.id, true);
          await rafraichirAmis();
          dessinerAmis();
        }],
        [t.signalerAmi, 'discret', () => ouvrirSignalement(a)],
      );
      liste.append(carteAmi(a, actions));
    }
    bloc.append(liste);
  }
  scene.append(bloc);

  // --- demandes envoyées ---
  if (d.demandesEnvoyees.length) {
    const attente = document.createElement('section');
    attente.className = 'acc-bloc';
    const h = document.createElement('h2');
    h.textContent = t.demandesEnvoyees;
    attente.append(h);
    const liste = document.createElement('div');
    liste.className = 'amis-grille';
    for (const a of d.demandesEnvoyees) {
      liste.append(carteAmi(a, [[t.retirer, 'discret', async () => {
        await window.ludopia.social.retirerAmi(a.id);
        await rafraichirAmis();
        dessinerAmis();
      }]]));
    }
    attente.append(liste);
    scene.append(attente);
  }

  // --- déconnexion ---
  const pied = document.createElement('section');
  pied.className = 'acc-bloc';
  const sortir = document.createElement('button');
  sortir.type = 'button';
  sortir.className = 'action-secondaire';
  sortir.textContent = t.deconnexion;
  sortir.addEventListener('click', async () => {
    await window.ludopia.social.deconnexion();
    etat.social = { connecte: false, moi: null };
    etat.amis = null;
    dessinerAmis();
  });
  pied.append(sortir);
  scene.append(pied);
}

// --- conversation ------------------------------------------------------------

function dessinerConversation(scene) {
  const t = T();
  /* On ne referme pas une conversation ouverte parce que la liste d'amis est
     momentanément absente — un rafraîchissement en échec, une réponse lente du
     service — sinon l'utilisateur voit son fil disparaître en pleine
     discussion. On ne la referme que si la personne n'est vraiment plus une
     amie, c'est-à-dire quand la liste est là et ne la contient pas. */
  const liste = etat.amis?.amis;
  const ami = (liste || []).find((a) => a.id === etat.conversation)
    // Faute de liste, on se contente de ce que l'on sait déjà : le pseudo lu
    // dans les messages échangés.
    || (liste ? null : { id: etat.conversation, pseudo: '…', enLigne: false, vuLe: 0 });

  if (!ami) {
    etat.conversation = null;
    window.ludopia.social.conversationAffichee(null);
    dessinerListeAmis(scene);
    return;
  }

  const bloc = document.createElement('section');
  bloc.className = 'conversation';

  // --- en-tête ---
  const tete = document.createElement('div');
  tete.className = 'conv-tete';

  const retour = document.createElement('button');
  retour.type = 'button';
  retour.className = 'btn-mini';
  retour.textContent = '←';
  retour.setAttribute('aria-label', t.amisTitre);
  retour.addEventListener('click', () => {
    etat.conversation = null;
    window.ludopia.social.conversationAffichee(null);
    dessinerAmis();
  });

  const qui = document.createElement('div');
  const nom = document.createElement('button');
  nom.type = 'button';
  nom.className = 'conv-nom conv-nom--bouton';
  nom.textContent = ami.pseudo;
  nom.title = t.voirProfil;
  nom.addEventListener('click', () => ouvrirProfil(ami.id));
  const e = etatAmi(ami);
  const flamme = pastilleSerie(ami.serie);
  if (flamme) nom.append(flamme);

  const sous = document.createElement('p');
  sous.className = 'ami-etat';
  sous.dataset.etat = e.sorte;
  sous.innerHTML = '<i></i>';
  sous.append(e.texte);
  qui.append(nom, sous);

  /* Appeler. Le bouton n'apparaît que si la personne est en ligne : faire
     sonner quelqu'un qui n'a pas le lanceur ouvert ne produit rien, et un
     bouton qui ne fait rien use la confiance plus vite qu'un bouton absent. */
  const barreTete = document.createElement('div');
  barreTete.className = 'conv-actions';
  if (ami.enLigne && !enAppelAvec(ami.id)) {
    const appelBouton = document.createElement('button');
    appelBouton.type = 'button';
    appelBouton.className = 'conv-appel';
    appelBouton.title = TV().appeler;
    appelBouton.setAttribute('aria-label', TV().appeler);
    appelBouton.innerHTML = ICONE_APPEL;
    appelBouton.addEventListener('click', () => appelerAmi(ami));
    barreTete.append(appelBouton);
  }

  tete.append(retour, qui, barreTete);
  bloc.append(tete);

  // --- fil ---
  const fil = document.createElement('div');
  fil.className = 'conv-fil';
  if (!etat.messages.length) {
    fil.append(bulle(t.conversationVide, 'calme'));
  } else {
    for (const m of etat.messages) {
      const el = document.createElement('div');
      el.className = m.expediteur === etat.social.moi?.id ? 'msg msg--moi' : 'msg';
      if (m.provisoire) el.classList.add('msg--provisoire');
      const texte = document.createElement('p');
      texte.textContent = m.texte;
      const heure = document.createElement('span');
      heure.className = 'msg-heure';
      heure.textContent = new Date(m.envoye_le * 1000).toLocaleTimeString(
        etat.langue === 'fr' ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' },
      );
      el.append(texte, heure);
      if (!m.provisoire) {
        el.append(barreReactions('direct', m.id, etat.reactionsDirectes, async () => {
          await rafraichirConversation();
          dessinerAmis();
        }));
      }
      fil.append(el);
    }
  }
  bloc.append(fil);

  // --- saisie ---
  const form = document.createElement('form');
  form.className = 'conv-saisie';
  const saisie = document.createElement('input');
  saisie.type = 'text';
  saisie.placeholder = t.votreMessage;
  saisie.maxLength = 1000;
  const envoyer = document.createElement('button');
  envoyer.type = 'submit';
  envoyer.className = 'btn-mini btn-mini--fort';
  envoyer.textContent = t.envoyer;

  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const texte = saisie.value.trim();
    if (!texte) return;
    saisie.value = '';

    /* Le message s'affiche avant d'être parti. Attendre la réponse du serveur
       donnait une demi-seconde de vide après chaque envoi, et c'est
       exactement ce qui fait qu'une messagerie « traîne ». En cas d'échec la
       bulle est retirée et l'erreur s'affiche : on ne laisse pas croire qu'un
       message est parti quand il ne l'est pas. */
    const provisoire = {
      id: `provisoire-${Date.now()}`,
      expediteur: etat.social.moi?.id,
      destinataire: ami.id,
      texte,
      envoye_le: Math.floor(Date.now() / 1000),
      provisoire: true,
    };
    etat.messages = [...etat.messages, provisoire];
    dessinerAmis();

    const r = await window.ludopia.social.envoyer(ami.id, texte);
    if (!r.ok) {
      etat.messages = etat.messages.filter((x) => x.id !== provisoire.id);
      dessinerAmis();
      $('.conv-fil')?.append(bulle(messageErreur(r.erreur, r.detail)));
      return;
    }
    await rafraichirConversation();
    dessinerAmis();
  });

  const bEmoji = document.createElement('button');
  bEmoji.type = 'button';
  bEmoji.className = 'btn-mini';
  bEmoji.dataset.ouvreEmojis = '1';
  bEmoji.textContent = '😀';
  bEmoji.setAttribute('aria-label', t.emojis);
  bEmoji.addEventListener('click', () => {
    ouvrirSelecteurEmojis(bEmoji, (e) => {
      saisie.value += e;
      saisie.focus();
    });
  });

  form.append(saisie, bEmoji, envoyer);
  bloc.append(form);
  scene.append(bloc);

  // Le fil se lit par le bas, et le curseur attend dans le champ.
  setTimeout(() => {
    fil.scrollTop = fil.scrollHeight;
    saisie.focus();
  }, 30);
}

// --- assemblage --------------------------------------------------------------

function dessinerAmis() {
  const scene = $('#scene');
  scene.textContent = '';
  scene.style.setProperty('--accent', 'var(--brand)');
  scene.style.setProperty('--accent-ink', '#080813');

  if (!etat.social.connecte) {
    dessinerFormulaire(scene);
  } else if (etat.conversation) {
    dessinerConversation(scene);
  } else {
    dessinerListeAmis(scene);
  }
  dessinerRail();
  dessinerChats();
  scene.scrollTop = 0;
}

let ordreAmis = 0;

async function rafraichirAmis() {
  const mien = ++ordreAmis;
  const r = await window.ludopia.social.amis();
  // Même raison que pour les salons : une réponse en retard effacerait un ami
  // tout juste accepté.
  if (r.ok && mien === ordreAmis) etat.amis = r.donnees;
  return r.ok;
}

async function rafraichirConversation() {
  if (!etat.conversation) return;
  const r = await window.ludopia.social.messages(etat.conversation, 0);
  if (r.ok) etat.messages = r.donnees.messages || [];
  const rr = await window.ludopia.social.reactions(etat.conversation);
  if (rr.ok) etat.reactionsDirectes = rr.donnees.reactions || [];
}

async function ouvrirConversation(id) {
  etat.vue = 'amis';
  etat.conversation = id;
  window.ludopia.social.conversationAffichee(id);
  etat.messages = [];
  dessinerAmis();
  await rafraichirConversation();
  await window.ludopia.social.marquerLus(id);
  await rafraichirAmis();
  dessinerAmis();
  ecouterLesMessages();
}

/** Deux lettres tirées du pseudo : de vraies photos demanderaient un envoi de
 *  fichiers, une modération, et un hébergement — pour un gain douteux. */
function initiales(pseudo) {
  const mots = pseudo.trim().split(/\s+/).filter(Boolean);
  if (mots.length >= 2) return (mots[0][0] + mots[1][0]).toUpperCase();
  return pseudo.trim().slice(0, 2).toUpperCase();
}

/** Une teinte stable par personne : la même couleur d'une session à l'autre. */
function teinte(id) {
  let n = 0;
  for (let i = 0; i < id.length; i += 1) n = (n * 31 + id.charCodeAt(i)) % 360;
  return n;
}

function dessinerChats() {
  const colonne = $('#chats');
  if (!colonne) return;

  const liste = etat.social.connecte ? (etat.amis?.amis || []) : [];
  const salons = etat.social.connecte ? etat.salons : [];
  const desServeurs = etat.social.connecte && typeof srv !== 'undefined' && srv.liste.length > 0;
  const quelqueChose = liste.length > 0 || salons.length > 0 || desServeurs
    // Connecté mais sans rien : la colonne montre au moins le bouton
    // « explorer », sinon les serveurs sont introuvables.
    || etat.social.connecte;

  colonne.hidden = !quelqueChose;
  document.body.classList.toggle('avec-chats', quelqueChose);
  if (!quelqueChose) return;

  colonne.textContent = '';

  // Les serveurs d'abord : ce sont les lieux les plus larges, et leur colonne
  // d'icônes est l'entrée du mode communautaire.
  if (typeof pastillesServeurs === 'function') pastillesServeurs(colonne);

  const titre = document.createElement('p');
  titre.className = 'chats-titre';
  titre.textContent = T().conversations;
  colonne.append(titre);

  // Les salons d'abord : ce sont les lieux, les amis sont les personnes.
  for (const sa of salons) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chat-pastille chat-pastille--salon';
    b.title = sa.nom;
    b.setAttribute('aria-label', sa.nom);
    b.setAttribute('aria-current', String(etat.salon === sa.id));

    const rond = document.createElement('span');
    rond.className = 'chat-rond chat-rond--salon';
    rond.textContent = sa.emoji || '🎮';
    b.append(rond);

    if (sa.nonLus) {
      const n = document.createElement('b');
      n.className = 'chat-non-lus';
      n.textContent = sa.nonLus > 9 ? '9+' : String(sa.nonLus);
      b.append(n);
    }

    b.addEventListener('click', () => ouvrirSalon(sa.id));
    colonne.append(b);
  }

  if (salons.length && liste.length) {
    const trait = document.createElement('hr');
    trait.className = 'chats-trait';
    colonne.append(trait);
  }

  // Les personnes en ligne d'abord, puis celles qui ont écrit sans réponse.
  const ordonnes = [...liste].sort(
    (x, y) => (y.nonLus || 0) - (x.nonLus || 0)
           || Number(Boolean(y.jeu)) - Number(Boolean(x.jeu))
           || Number(y.enLigne) - Number(x.enLigne),
  );

  for (const a of ordonnes) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chat-pastille';
    b.title = a.pseudo;
    b.setAttribute('aria-label', a.pseudo);
    b.dataset.etat = a.jeu ? 'joue' : a.enLigne ? 'en-ligne' : 'hors';
    b.setAttribute('aria-current', String(etat.conversation === a.id));
    b.style.setProperty('--teinte', teinte(a.id));

    const rond = document.createElement('span');
    rond.className = 'chat-rond';
    rond.textContent = initiales(a.pseudo);
    b.append(rond);

    if (a.nonLus) {
      const n = document.createElement('b');
      n.className = 'chat-non-lus';
      n.textContent = a.nonLus > 9 ? '9+' : String(a.nonLus);
      b.append(n);
    }

    b.addEventListener('click', () => ouvrirConversation(a.id));
    colonne.append(b);
  }
}

function dessinerSalons() {
  const t = T();
  const scene = $('#scene');
  scene.textContent = '';
  scene.style.setProperty('--accent', 'var(--brand)');
  scene.style.setProperty('--accent-ink', '#080813');

  const tete = document.createElement('section');
  tete.className = 'acc-tete';
  const h1 = document.createElement('h1');
  h1.textContent = t.salons;
  tete.append(h1);

  const intro = document.createElement('p');
  intro.className = 'acc-vide';
  intro.textContent = t.salonsExplication;
  tete.append(intro);

  // --- créer ---
  const formCreer = document.createElement('form');
  formCreer.className = 'ajout-ami';
  formCreer.id = 'creerSalon';
  const nom = document.createElement('input');
  nom.type = 'text';
  nom.placeholder = t.nomDuSalon;
  nom.maxLength = 40;

  let emojiChoisi = '🎮';
  const choixEmoji = document.createElement('button');
  choixEmoji.type = 'button';
  choixEmoji.className = 'btn-mini';
  choixEmoji.dataset.ouvreEmojis = '1';
  choixEmoji.textContent = emojiChoisi;
  choixEmoji.addEventListener('click', () => {
    ouvrirSelecteurEmojis(choixEmoji, (e) => {
      emojiChoisi = e;
      choixEmoji.textContent = e;
    });
  });

  const creer = document.createElement('button');
  creer.type = 'submit';
  creer.className = 'btn-mini btn-mini--fort';
  creer.textContent = t.creer;

  const retourCreer = document.createElement('div');
  retourCreer.className = 'ajout-retour';

  formCreer.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    retourCreer.textContent = '';
    creer.disabled = true;
    const r = await window.ludopia.social.creerSalon(nom.value, emojiChoisi);
    creer.disabled = false;
    if (!r.ok) {
      retourCreer.append(bulle(messageErreur(r.erreur, r.detail)));
      return;
    }
    nom.value = '';
    await rafraichirSalons();
    ouvrirSalon(r.donnees.id);
  });
  formCreer.append(nom, choixEmoji, creer);

  // --- rejoindre ---
  const formJoindre = document.createElement('form');
  formJoindre.className = 'ajout-ami';
  formJoindre.id = 'rejoindreSalon';
  const code = document.createElement('input');
  code.type = 'text';
  code.placeholder = t.codeDuSalon;
  code.maxLength = 9;
  const joindre = document.createElement('button');
  joindre.type = 'submit';
  joindre.className = 'btn-mini';
  joindre.textContent = t.rejoindre;
  const retourJoindre = document.createElement('div');
  retourJoindre.className = 'ajout-retour';

  formJoindre.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    retourJoindre.textContent = '';
    joindre.disabled = true;
    const r = await window.ludopia.social.rejoindreSalon(code.value);
    joindre.disabled = false;
    if (!r.ok) {
      retourJoindre.append(bulle(messageErreur(r.erreur, r.detail)));
      return;
    }
    code.value = '';
    await rafraichirSalons();
    ouvrirSalon(r.donnees.id);
  });
  formJoindre.append(code, joindre);

  tete.append(formCreer, retourCreer, formJoindre, retourJoindre);
  scene.append(tete);

  // --- la liste ---
  const bloc = document.createElement('section');
  bloc.className = 'acc-bloc';
  if (!etat.salons.length) {
    bloc.append(bulle(t.aucunSalon, 'calme'));
  } else {
    const grille = document.createElement('div');
    grille.className = 'amis-grille';
    for (const sa of etat.salons) {
      const el = document.createElement('article');
      el.className = 'ami';
      const tt = document.createElement('div');
      tt.className = 'ami-tete';
      const n = document.createElement('p');
      n.className = 'ami-nom';
      n.textContent = `${sa.emoji || '🎮'} ${sa.nom}`;
      if (sa.nonLus) {
        const p = document.createElement('b');
        p.className = 'ami-pastille';
        p.textContent = String(sa.nonLus);
        n.append(p);
      }
      const sous = document.createElement('p');
      sous.className = 'ami-etat';
      sous.textContent = `${sa.membres} ${sa.membres > 1 ? t.membres : t.unMembre}`;
      tt.append(n, sous);
      el.append(tt);

      const actions = document.createElement('div');
      actions.className = 'ami-actions';
      const ouvrir = document.createElement('button');
      ouvrir.type = 'button';
      ouvrir.className = 'btn-mini btn-mini--fort';
      ouvrir.textContent = t.ecrire;
      ouvrir.addEventListener('click', () => ouvrirSalon(sa.id));
      actions.append(ouvrir);
      el.append(actions);
      grille.append(el);
    }
    bloc.append(grille);
  }
  scene.append(bloc);

  dessinerRail();
  dessinerChats();
  scene.scrollTop = 0;
}

function ouvrirLesSalons() {
  etat.vue = 'salons';
  etat.salon = null;
  window.ludopia.social.salonAffiche(null);
  etat.conversation = null;
  window.ludopia.social.conversationAffichee(null);
  dessinerSalons();

  /* Le rafraîchissement de fond ne redessine que s'il apporte quelque chose.
     Redessiner à tout coup effaçait le code que l'utilisateur était en train
     de saisir, et le message d'erreur qu'il venait de recevoir — deux façons
     de rendre l'écran inutilisable pour une mise à jour qui n'apportait rien. */
  const avant = JSON.stringify(etat.salons.map((sa) => [sa.id, sa.nonLus, sa.membres]));
  rafraichirSalons().then(() => {
    if (etat.vue !== 'salons') return;
    const apres = JSON.stringify(etat.salons.map((sa) => [sa.id, sa.nonLus, sa.membres]));
    if (avant !== apres) dessinerSalons();
  });
}

function ouvrirAmis() {
  etat.vue = 'amis';
  etat.conversation = null;
  window.ludopia.social.salonAffiche(null);
  window.ludopia.social.conversationAffichee(null);
  dessinerAmis();
  if (etat.social.connecte) {
    const avant = JSON.stringify(etat.amis?.amis?.map((a) => [a.id, a.enLigne, a.nonLus]));
    rafraichirAmis().then(() => {
      dessinerChats();
      const apres = JSON.stringify(etat.amis?.amis?.map((a) => [a.id, a.enLigne, a.nonLus]));
      // Même raison que pour les salons : ne pas effacer une saisie en cours.
      if (etat.vue === 'amis' && avant !== apres) dessinerAmis();
    });
  }
}

/**
 * Interrogation périodique : c'est ce qui remplace une connexion permanente.
 * On va plus vite quand une conversation est ouverte — l'attente d'une réponse
 * se compte en secondes — et on se calme le reste du temps.
 */
let horlogeSociale = null;
let attenteEnCours = false;

/**
 * Deux rythmes distincts.
 *
 * Les messages n'attendent pas d'horloge : une requête reste ouverte jusqu'à
 * l'arrivée du prochain, puis se relance aussitôt. Un message apparaît donc
 * en une fraction de seconde au lieu d'attendre le prochain battement.
 *
 * La présence des amis, elle, n'a pas besoin d'être instantanée — mais voir un
 * ami lancer un jeu dix secondes après coup se remarque. Six secondes est le
 * compromis : assez vif pour paraître vivant, assez espacé pour ne pas
 * solliciter le service en continu.
 */
async function ecouterLesMessages() {
  if (attenteEnCours) return;
  attenteEnCours = true;

  try {
    while (etat.social.connecte && etat.conversation) {
      const dernier = etat.messages
        .filter((m) => !m.provisoire)
        .reduce((n, m) => Math.max(n, Number(m.id) || 0), 0);
      const avec = etat.conversation;

      const r = await window.ludopia.social.attendreMessages(avec, dernier);

      // La conversation a changé pendant l'attente : la réponse ne vaut plus.
      if (etat.conversation !== avec) break;

      if (r.ok && (r.donnees.messages || []).length) {
        const connus = new Set(etat.messages.map((m) => String(m.id)));
        const neufs = r.donnees.messages.filter((m) => !connus.has(String(m.id)));
        if (neufs.length) {
          // On retire les bulles provisoires que le serveur vient de confirmer.
          etat.messages = [...etat.messages.filter((m) => !m.provisoire), ...neufs];
          dessinerAmis();
          await window.ludopia.social.marquerLus(avec);
        }
      } else if (!r.ok && r.erreur !== 'delai_depasse') {
        // Réseau coupé : on souffle avant de réessayer, plutôt que de boucler.
        await new Promise((f) => setTimeout(f, 3000));
      }
    }
  } finally {
    attenteEnCours = false;
  }
}

function suivreLeSocial() {
  clearInterval(horlogeSociale);
  horlogeSociale = setInterval(async () => {
    if (!etat.social.connecte) return;

    const photo = () => JSON.stringify([
      etat.amis?.amis?.map((a) => [a.enLigne, a.jeu, a.nonLus, a.statut]),
      etat.salons?.map((sa) => [sa.nonLus, sa.membres]),
    ]);
    const avant = photo();
    await rafraichirAmis();
    // Inutile de relever les salons quand on en lit déjà un : son propre fil
    // est en attente longue, et le compteur de non-lus s'y remet à zéro.
    if (!etat.salon) await rafraichirSalons();
    const apres = photo();
    if (avant !== apres) {
      dessinerRail();
      dessinerChats();
      if (etat.vue === 'amis' && !etat.conversation) dessinerAmis();
      else if (etat.vue === 'salons') dessinerSalons();
      else if (etat.vue === 'accueil') dessinerAccueil();
    }
  }, 6000);
}

/** Total des messages non lus, pour la pastille du rail. */
function nonLus() {
  const d = etat.amis;
  if (!d) return 0;
  return (d.amis || []).reduce((n, a) => n + (a.nonLus || 0), 0)
    + (d.demandesRecues || []).length;
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

  // --- le classement ---
  const rang = document.createElement('section');
  rang.className = 'acc-bloc';
  const h2r = document.createElement('h2');
  h2r.textContent = t.classement;
  rang.append(h2r);

  const c = etat.classement;
  if (!c || (!c.plusJoues?.length && !c.quiMontent?.length)) {
    rang.append(bulle(t.classementVide, 'calme'));
  } else {
    const nomDuJeu = (id) => etat.catalogue.jeux.find((j) => j.id === id)?.nom || id;
    const accentDuJeu = (id) => etat.catalogue.jeux.find((j) => j.id === id)?.accent || 'var(--brand)';

    const colonnes = document.createElement('div');
    colonnes.className = 'classement';

    /* Deux listes plutôt qu'un chiffre unique. Un classement brut fige la
       hiérarchie : le plus ancien est en tête, y reste, et sa position même
       lui amène des joueurs. « Ceux qui montent » compare une semaine à la
       précédente, où un petit jeu qui double passe devant un gros qui stagne.
       Deux listes honnêtes valent mieux qu'une formule qui cacherait
       l'arbitrage. */
    for (const [titre, liste, mesure] of [
      [t.plusJoues, c.plusJoues, (j) => `${j.joueurs} ${j.joueurs > 1 ? t.joueurs : t.unJoueur}`],
      [t.quiMontent, c.quiMontent,
        (j) => `${j.progression > 0 ? '+' : ''}${Math.round(j.progression * 100)} %`],
    ]) {
      if (!liste?.length) continue;
      const col = document.createElement('div');
      col.className = 'classement-col';
      const h3 = document.createElement('h3');
      h3.textContent = titre;
      col.append(h3);

      const ol = document.createElement('ol');
      liste.slice(0, 5).forEach((j, i) => {
        const li = document.createElement('li');
        li.style.setProperty('--accent', accentDuJeu(j.jeu));
        const rangNum = document.createElement('b');
        rangNum.textContent = String(i + 1);
        const nom = document.createElement('span');
        nom.textContent = nomDuJeu(j.jeu);
        const val = document.createElement('em');
        val.textContent = mesure(j);
        li.append(rangNum, nom, val);
        li.addEventListener('click', () => choisir(j.jeu));
        ol.append(li);
      });
      col.append(ol);
      colonnes.append(col);
    }
    rang.append(colonnes);

    const portee = document.createElement('p');
    portee.className = 'acc-note';
    portee.textContent = t.classementPortee;
    rang.append(portee);
  }
  scene.append(rang);

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

  // --- les amis ---
  const amis = document.createElement('section');
  amis.className = 'acc-bloc';
  const h2a = document.createElement('h2');
  h2a.textContent = t.amis;
  amis.append(h2a);

  if (!etat.social.connecte) {
    amis.append(bulle(t.amisConnecter, 'calme'));
    const inviter = document.createElement('button');
    inviter.type = 'button';
    inviter.className = 'action-secondaire';
    inviter.textContent = t.inscription;
    inviter.addEventListener('click', () => {
      etat.formulaire = 'inscription';
      ouvrirAmis();
    });
    amis.append(inviter);
  } else {
    const liste = etat.amis?.amis || [];
    if (!liste.length) {
      amis.append(bulle(t.amisAucun, 'calme'));
    } else {
      // Les personnes en ligne d'abord : c'est avec elles qu'on peut jouer
      // maintenant, et c'est la seule raison de regarder cette liste.
      const ordonnes = [...liste].sort(
        (x, y) => Number(Boolean(y.jeu)) - Number(Boolean(x.jeu))
               || Number(y.enLigne) - Number(x.enLigne),
      );
      const grille = document.createElement('div');
      grille.className = 'amis-grille';
      for (const a of ordonnes.slice(0, 6)) {
        grille.append(carteAmi(a, [[t.ecrire, 'principal', () => {
          etat.vue = 'amis';
          ouvrirConversation(a.id);
        }]]));
      }
      amis.append(grille);
    }
    const tous = document.createElement('button');
    tous.type = 'button';
    tous.className = 'action-secondaire';
    tous.textContent = t.amisTous;
    tous.addEventListener('click', ouvrirAmis);
    amis.append(tous);
  }
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

/** Redessine la vue courante — accueil, amis ou fiche de jeu. */
function redessiner() {
  window.__vue = etat.vue;
  dessinerRail();
  dessinerChats();
  if (etat.vue === 'accueil') dessinerAccueil();
  else if (etat.vue === 'amis') dessinerAmis();
  else if (etat.vue === 'salons') dessinerSalons();
  else if (etat.vue === 'salon') dessinerSalon();
  else if (etat.vue === 'reglages') dessinerReglages();
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
  const rech = $('#recherche');
  if (rech) rech.placeholder = T().chercherJeu;
  const bReglages = $('#reglagesBouton');
  if (bReglages) bReglages.textContent = T().reglages;
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

  etat.jeuOuvert = depart.ouverts[0] || null;

  await rafraichirStats();
  appliquerLangue();
  ouvrirAccueil();
  sonder();

  $('#accueil')?.addEventListener('click', ouvrirAccueil);
  $('#amis')?.addEventListener('click', ouvrirAmis);
  $('#salonsBouton')?.addEventListener('click', ouvrirLesSalons);
  $('#reglagesBouton')?.addEventListener('click', ouvrirReglages);

  etat.versionLanceur = depart.versionLanceur;
  window.ludopia.reglages().then((r) => { etat.reglages = r; });
  window.ludopia.dossierDonnees().then((d) => { etat.dossierDonnees = d; });

  const champRecherche = $('#recherche');
  if (champRecherche) {
    champRecherche.placeholder = T().chercherJeu;
    champRecherche.addEventListener('input', () => {
      etat.recherche = champRecherche.value;
      dessinerRail();
    });
  }

  // La liste d'emojis vient du service : la garder ici la ferait diverger.
  window.ludopia.social.emojis().then((r) => {
    if (r?.ok && r.donnees?.emojis?.length) EMOJIS = r.donnees.emojis;
  });

  // La session sociale est reprise par le processus principal : on lit son
  // etat, puis on suit ses changements.
  window.ludopia.social.etat().then(async (e) => {
    etat.social = e;
    if (e.connecte) {
      await rafraichirAmis();
      await rafraichirSalons();
      if (typeof rafraichirServeurs === 'function') await rafraichirServeurs();
      dessinerRail();
      dessinerChats();
      if (etat.vue === 'accueil') dessinerAccueil();
    }
    suivreLeSocial();
  });

  /* L'apparence, avant tout le reste : appliquée après le premier dessin, on
     verrait le sombre passer au clair sous les yeux de qui a choisi le clair. */
  etat.theme = await window.ludopia.theme.etat();
  appliquerTheme(etat.theme);
  window.ludopia.theme.surChangement((t) => {
    etat.theme = t;
    appliquerTheme(t);
    if (etat.vue === 'reglages') dessinerReglages();
  });

  // Le mode audio écoute dès le démarrage : un appel doit pouvoir arriver
  // sans qu'on soit passé par l'écran des amis.
  brancherVoix();

  $('#boutiqueBouton')?.addEventListener('click', ouvrirBoutique);

  /* Le solde sur le bouton, rafraîchi à la connexion : il donne une raison
     d'ouvrir la boutique sans y penser, et c'est toute la mécanique. */
  (async () => {
    if (!etat.social.connecte) return;
    const r = await window.ludopia.bourse.lire();
    const pastille = $('#railLudos');
    if (r.ok && pastille) {
      pastille.textContent = `${r.donnees.solde} Ⱡ`;
      pastille.hidden = false;
    }
  })();

  window.ludopia.social.surOuvertureDemandee((idAmi) => {
    ouvrirConversation(idAmi);
  });

  window.ludopia.social.surOuvertureSalon((idSalon) => {
    rafraichirSalons().then(() => ouvrirSalon(idSalon));
  });

  window.ludopia.social.surNouveauxMessages(async () => {
    // Le processus principal a vu passer des messages : les compteurs de
    // non-lus changent, quelle que soit la vue affichée.
    await rafraichirAmis();
    dessinerRail();
    dessinerChats();
    if (etat.vue === 'accueil') dessinerAccueil();
    else if (etat.vue === 'amis' && !etat.conversation) dessinerAmis();
  });

  window.ludopia.social.surChangement(async (e) => {
    etat.social = e;
    if (e.connecte) {
      await rafraichirAmis();
      await rafraichirSalons();
    } else {
      etat.amis = null;
      etat.conversation = null;
      etat.salons = [];
      etat.salon = null;
    }
    dessinerRail();
    dessinerChats();
    if (etat.vue === 'amis') dessinerAmis();
    else if (etat.vue === 'accueil') dessinerAccueil();
  });

  // Les nouvelles arrivent du site : la page s'affiche sans les attendre.
  window.ludopia.actualites().then((flux) => {
    if (!flux) return;
    etat.actualites = flux;
    if (etat.vue === 'accueil') dessinerAccueil();
  });

  window.ludopia.classement().then((r) => {
    if (!r?.ok) return;
    etat.classement = r.donnees;
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
    etat.jeuOuvert = ouverts[0] || null;
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
  // Quand la mise à jour est prête, le bouton doit l'installer. Il relançait
  // une recherche : l'utilisateur cliquait sur « Mise à jour prête » et rien
  // ne se passait.
  $('#maj')?.addEventListener('click', () => {
    if ($('#maj').dataset.phase === 'prete') window.ludopia.majInstaller();
    else window.ludopia.majChercher();
  });

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
