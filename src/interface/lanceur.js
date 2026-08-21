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
    },
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
  $('#accueil')?.setAttribute('aria-current', String(etat.vue === 'accueil'));
  const boutonAmis = $('#amis');
  if (boutonAmis) {
    boutonAmis.setAttribute('aria-current', String(etat.vue === 'amis'));
    const n = nonLus();
    boutonAmis.dataset.nonLus = n > 0 ? String(n) : '';
    $('.rail-amis-libelle', boutonAmis).textContent = T().amisTitre;
  }

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
// Amis
// =============================================================================

const ICONE_AMIS =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
  + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />'
  + '<circle cx="10" cy="8" r="3.5" /><path d="M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4" />'
  + '<path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8" /></svg>';

/** Traduit un code d'erreur du service ; à défaut, on montre le code brut
 *  plutôt qu'un « une erreur est survenue » qui n'aide personne. */
function messageErreur(code, detail) {
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

function etatAmi(ami) {
  const t = T();
  if (ami.jeu) {
    const jeu = etat.catalogue.jeux.find((j) => j.id === ami.jeu);
    return { texte: `${t.joueA} ${jeu ? jeu.nom : ami.jeu}`, sorte: 'joue' };
  }
  if (ami.enLigne) return { texte: t.enLigne, sorte: 'en-ligne' };
  return { texte: `${t.horsLigne} · ${quand(ami.vuLe ? ami.vuLe * 1000 : null)}`, sorte: 'hors' };
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

  const sous = document.createElement('p');
  sous.className = 'ami-etat';
  sous.innerHTML = '<i></i>';
  sous.append(e.texte);

  tete.append(nom, sous);
  el.append(tete);

  const barre = document.createElement('div');
  barre.className = 'ami-actions';
  for (const [libelle, sorte, action] of actions) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = sorte === 'principal' ? 'btn-mini btn-mini--fort' : 'btn-mini';
    b.textContent = libelle;
    b.addEventListener('click', action);
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
      liste.append(carteAmi(a, [
        [t.ecrire, 'principal', () => ouvrirConversation(a.id)],
        [t.bloquerAmi, 'discret', async () => {
          if (!window.confirm(t.confirmerBlocage)) return;
          await window.ludopia.social.bloquer(a.id, true);
          await rafraichirAmis();
          dessinerAmis();
        }],
        [t.signalerAmi, 'discret', async () => {
          const motif = window.prompt(t.motifSignalement);
          if (motif === null) return;
          await window.ludopia.social.signaler(a.id, motif);
          await rafraichirAmis();
          dessinerAmis();
          window.alert(t.signalementEnvoye);
        }],
      ]));
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
  const ami = (etat.amis?.amis || []).find((a) => a.id === etat.conversation);
  if (!ami) {
    etat.conversation = null;
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
  const nom = document.createElement('p');
  nom.className = 'conv-nom';
  nom.textContent = ami.pseudo;
  const e = etatAmi(ami);
  const sous = document.createElement('p');
  sous.className = 'ami-etat';
  sous.dataset.etat = e.sorte;
  sous.innerHTML = '<i></i>';
  sous.append(e.texte);
  qui.append(nom, sous);

  tete.append(retour, qui);
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

  form.append(saisie, envoyer);
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

async function rafraichirAmis() {
  const r = await window.ludopia.social.amis();
  if (r.ok) etat.amis = r.donnees;
  return r.ok;
}

async function rafraichirConversation() {
  if (!etat.conversation) return;
  const r = await window.ludopia.social.messages(etat.conversation, 0);
  if (r.ok) etat.messages = r.donnees.messages || [];
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
  colonne.hidden = liste.length === 0;
  document.body.classList.toggle('avec-chats', liste.length > 0);
  if (!liste.length) return;

  colonne.textContent = '';

  const titre = document.createElement('p');
  titre.className = 'chats-titre';
  titre.textContent = T().conversations;
  colonne.append(titre);

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

function ouvrirAmis() {
  etat.vue = 'amis';
  etat.conversation = null;
  window.ludopia.social.conversationAffichee(null);
  dessinerAmis();
  if (etat.social.connecte) {
    rafraichirAmis().then(() => {
      dessinerChats();
      if (etat.vue === 'amis') dessinerAmis();
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

    const avant = JSON.stringify(etat.amis?.amis?.map((a) => [a.enLigne, a.jeu, a.nonLus]));
    await rafraichirAmis();
    const apres = JSON.stringify(etat.amis?.amis?.map((a) => [a.enLigne, a.jeu, a.nonLus]));
    if (avant !== apres) {
      dessinerRail();
      dessinerChats();
      if (etat.vue === 'amis' && !etat.conversation) dessinerAmis();
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
  dessinerRail();
  dessinerChats();
  if (etat.vue === 'accueil') dessinerAccueil();
  else if (etat.vue === 'amis') dessinerAmis();
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
  $('#amis')?.addEventListener('click', ouvrirAmis);

  // La session sociale est reprise par le processus principal : on lit son
  // etat, puis on suit ses changements.
  window.ludopia.social.etat().then(async (e) => {
    etat.social = e;
    if (e.connecte) {
      await rafraichirAmis();
      dessinerRail();
      dessinerChats();
      if (etat.vue === 'accueil') dessinerAccueil();
    }
    suivreLeSocial();
  });

  window.ludopia.social.surOuvertureDemandee((idAmi) => {
    ouvrirConversation(idAmi);
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
    if (e.connecte) await rafraichirAmis();
    else { etat.amis = null; etat.conversation = null; }
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
