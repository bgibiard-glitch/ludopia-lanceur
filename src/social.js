'use strict';

/**
 * Le lien du lanceur avec le service social : compte, amis, présence, messages.
 *
 * Tout passe par le processus principal. L'interface n'a ni le jeton de
 * session, ni l'adresse du service : elle demande « la liste des amis » et
 * reçoit la liste. Un défaut d'affichage ne peut donc pas faire fuiter la
 * session, et la politique de sécurité de la fenêtre reste `connect-src 'none'`.
 *
 * Le jeton est chiffré par le système quand celui-ci le propose
 * (`safeStorage`) : sur Windows via DPAPI, sur macOS via le trousseau. Sans
 * cela il resterait lisible en clair dans le dossier utilisateur, à la portée
 * de n'importe quel programme lancé par le même compte.
 */

const { net, safeStorage } = require('electron');
const donnees = require('./donnees');

const SERVICE = 'https://ludopia-social.bgibiard.workers.dev';

// Le service dit « en ligne » en deçà de 90 secondes : on bat plus vite que ça.
const BATTEMENT = 30000;

let jeton = null;
let moi = null;
let horloge = null;
let jeuEnCours = null;
let prevenir = () => {};
let surMessages = () => {};
let surInvitation = () => {};
let surMessageSalon = () => {};
let vusParSalon = new Map();
let horlogeInvitations = null;
let dernierVu = 0;
let ecouteActive = false;
let surSignaux = () => {};
let dernierSignal = 0;
let ecouteVoixActive = false;

// =============================================================================
// Transport
// =============================================================================

/**
 * `net.request` plutôt que `fetch` : il emprunte la pile réseau de Chromium,
 * donc les réglages de proxy du système, ce qu'un `fetch` de Node ignore.
 */
function appel(methode, chemin, { corps, avecJeton = true, delai = 15000 } = {}) {
  return new Promise((resolve) => {
    const fin = setTimeout(() => resolve({ ok: false, erreur: 'delai_depasse' }), delai);

    const requete = net.request({ method: methode, url: SERVICE + chemin });
    requete.setHeader('Content-Type', 'application/json');
    if (avecJeton && jeton) requete.setHeader('Authorization', `Bearer ${jeton}`);

    requete.on('response', (rep) => {
      let texte = '';
      rep.on('data', (m) => { texte += m; });
      rep.on('end', () => {
        clearTimeout(fin);
        let d = null;
        try { d = JSON.parse(texte); } catch { /* réponse vide ou HTML */ }

        if (rep.statusCode === 401) {
          // La session ne vaut plus rien : on oublie tout plutôt que de
          // laisser l'interface tourner en rond sur des refus.
          oublierSession();
          resolve({ ok: false, erreur: 'non_authentifie' });
          return;
        }
        resolve(rep.statusCode >= 200 && rep.statusCode < 300
          ? { ok: true, donnees: d }
          : { ok: false, erreur: d?.erreur || `http_${rep.statusCode}`, detail: d?.detail });
      });
    });

    requete.on('error', (e) => {
      clearTimeout(fin);
      resolve({ ok: false, erreur: 'reseau', detail: String(e?.message || e) });
    });

    if (corps) requete.write(JSON.stringify(corps));
    requete.end();
  });
}

// =============================================================================
// Session
// =============================================================================

function chiffrer(valeur) {
  if (!safeStorage.isEncryptionAvailable()) return { clair: valeur };
  return { chiffre: safeStorage.encryptString(valeur).toString('base64') };
}

function dechiffrer(enregistre) {
  if (!enregistre) return null;
  if (enregistre.clair) return enregistre.clair;
  if (!enregistre.chiffre || !safeStorage.isEncryptionAvailable()) return null;
  try {
    return safeStorage.decryptString(Buffer.from(enregistre.chiffre, 'base64'));
  } catch {
    // Profil recopié sur une autre machine : le secret ne s'y déchiffre pas.
    return null;
  }
}

function retenirSession(nouveauJeton, profil) {
  jeton = nouveauJeton;
  moi = profil;
  donnees.set('social', { jeton: chiffrer(nouveauJeton), moi: profil });
  demarrerBattement();
  demarrerInvitations();
  calerLeCurseur().then(ecouterMessages);
  calerLeSignal().then(ecouterVoix);
  prevenir();
}

function oublierSession() {
  jeton = null;
  moi = null;
  donnees.set('social', null);
  arreterBattement();
  arreterInvitations();
  prevenir();
}

/** Au démarrage : reprendre la session enregistrée, si elle vaut encore. */
async function reprendre() {
  const enregistre = donnees.get('social');
  if (!enregistre?.jeton) return false;

  jeton = dechiffrer(enregistre.jeton);
  moi = enregistre.moi || null;
  if (!jeton) {
    oublierSession();
    return false;
  }

  const r = await appel('GET', '/moi');
  if (!r.ok) {
    // Hors ligne : on garde la session, elle revaudra au retour du réseau.
    if (r.erreur === 'reseau' || r.erreur === 'delai_depasse') return true;
    oublierSession();
    return false;
  }

  moi = r.donnees;
  donnees.set('social', { jeton: chiffrer(jeton), moi });
  demarrerBattement();
  demarrerInvitations();
  await calerLeCurseur();
  ecouterMessages();
  await calerLeSignal();
  ecouterVoix();
  return true;
}

// =============================================================================
// Présence
// =============================================================================

/**
 * Les invitations, relevées régulièrement.
 *
 * Contrairement aux messages, elles ne justifient pas une requête en attente :
 * une invitation à jouer n'est pas une conversation, et dix secondes de délai
 * ne se remarquent pas quand l'autre vient à peine de lancer sa partie.
 */
function demarrerInvitations() {
  arreterInvitations();
  if (!jeton) return;
  horlogeInvitations = setInterval(async () => {
    const r = await appel('GET', '/invitations');
    if (r.ok && (r.donnees.invitations || []).length) surInvitation(r.donnees.invitations);

    /* Les salons, relevés au même rythme. On ne garde pas une requête ouverte
       par salon : quelqu'un qui en a dix ouvrirait dix connexions permanentes
       pour une information qui supporte dix secondes de retard. */
    const sal = await appel('GET', '/salons');
    if (!sal.ok) return;
    for (const s2 of sal.donnees.salons || []) {
      const vu = vusParSalon.get(s2.id);
      // Premier passage : on note où l'on en est sans rien signaler, sinon
      // toute conversation existante remonterait d'un coup au démarrage.
      if (vu === undefined) {
        vusParSalon.set(s2.id, s2.lu_le || 0);
        continue;
      }
      if (s2.nonLus > 0) {
        const fil = await appel(
          'GET', `/salons/messages?salon=${encodeURIComponent(s2.id)}&depuis=${vu}`,
        );
        const neufs = (fil.donnees?.messages || []).filter((m) => m.auteur !== moi?.id);
        if (neufs.length) {
          vusParSalon.set(s2.id, neufs.reduce((n, m) => Math.max(n, m.id), vu));
          surMessageSalon(s2, neufs);
        }
      }
    }
  }, 10000);
}

function arreterInvitations() {
  if (horlogeInvitations) clearInterval(horlogeInvitations);
  horlogeInvitations = null;
  vusParSalon = new Map();
}

function demarrerBattement() {
  arreterBattement();
  if (!jeton) return;
  const battre = () => appel('POST', '/presence', { corps: { jeu: jeuEnCours } });
  battre();
  horloge = setInterval(battre, BATTEMENT);
}

function arreterBattement() {
  if (horloge) clearInterval(horloge);
  horloge = null;
}

// =============================================================================
// Surveillance des messages
// =============================================================================

/**
 * Écoute les messages entrants, en continu, dans le processus principal.
 *
 * L'interface écoute déjà la conversation ouverte — mais elle ne peut rien
 * signaler quand le lanceur est réduit et qu'on est en pleine partie, ce qui
 * est précisément le moment où un ami écrit. Cette écoute-ci ne dépend
 * d'aucune fenêtre.
 *
 * La requête reste ouverte jusqu'à l'arrivée d'un message : rien ne circule
 * tant qu'il ne se passe rien.
 */
async function ecouterMessages() {
  if (ecouteActive) return;
  ecouteActive = true;

  try {
    while (jeton) {
      const r = await appel('GET', `/messages?depuis=${dernierVu}&attendre=1`, { delai: 32000 });
      if (!jeton) break;

      if (r.ok && (r.donnees.messages || []).length) {
        const recus = r.donnees.messages;
        dernierVu = recus.reduce((n, m) => Math.max(n, Number(m.id) || 0), dernierVu);
        surMessages(recus);
      } else if (!r.ok && r.erreur !== 'delai_depasse') {
        // Réseau coupé : on souffle plutôt que de boucler sur l'échec.
        await new Promise((f) => setTimeout(f, 5000));
      }
    }
  } finally {
    ecouteActive = false;
  }
}

/**
 * L'écoute des signaux de la voix.
 *
 * Séparée de celle des messages, et pour une raison de fond : une sonnerie ne
 * peut pas attendre. Si les deux partageaient la même attente longue, un
 * appel entrant resterait muet jusqu'à ce qu'un message veuille bien arriver.
 * Deux requêtes ouvertes en parallèle coûtent deux connexions ; c'est le prix
 * d'un téléphone qui sonne quand on l'appelle.
 */
async function ecouterVoix() {
  if (ecouteVoixActive) return;
  ecouteVoixActive = true;

  try {
    while (jeton) {
      const r = await appel('GET', `/voix/signaux?depuis=${dernierSignal}&attendre=1`,
        { delai: 32000 });
      if (!jeton) break;

      if (r.ok && (r.donnees.signaux || []).length) {
        const recus = r.donnees.signaux;
        dernierSignal = recus.reduce((n, m) => Math.max(n, Number(m.id) || 0), dernierSignal);
        surSignaux(recus);
      } else if (!r.ok && r.erreur !== 'delai_depasse') {
        await new Promise((f) => setTimeout(f, 5000));
      }
    }
  } finally {
    ecouteVoixActive = false;
  }
}

/** Au démarrage : on part du dernier message existant, pour ne pas signaler
 *  d'un coup tout l'historique d'une conversation. */
async function calerLeCurseur() {
  const r = await appel('GET', '/messages?depuis=0&limite=200');
  if (r.ok) {
    dernierVu = (r.donnees.messages || [])
      .reduce((n, m) => Math.max(n, Number(m.id) || 0), 0);
  }
}

/**
 * On se cale sur le dernier signal existant avant d'écouter.
 *
 * Sans cela, une reconnexion rejouerait les signaux d'appels déjà terminés —
 * le lanceur sonnerait pour un appel d'il y a vingt minutes, auquel personne
 * ne peut plus répondre.
 */
async function calerLeSignal() {
  const r = await appel('GET', '/voix/signaux?depuis=0');
  if (r.ok) {
    dernierSignal = (r.donnees.signaux || [])
      .reduce((n, x) => Math.max(n, Number(x.id) || 0), 0);
  }
}

/** Appelé quand une fenêtre de jeu s'ouvre ou se ferme. */
function signalerJeu(id) {
  jeuEnCours = id || null;
  if (jeton) appel('POST', '/presence', { corps: { jeu: jeuEnCours } });
}

// =============================================================================
// Verbes exposés à l'interface
// =============================================================================

function profilDe(d) {
  return { id: d.id, pseudo: d.pseudo, courriel: d.courriel || null, codeAmi: d.codeAmi };
}

async function inscription(pseudo, courriel, motDePasse, machine) {
  const r = await appel('POST', '/compte', {
    avecJeton: false, corps: { pseudo, courriel, motDePasse, machine },
  });
  if (!r.ok) return r;
  retenirSession(r.donnees.jeton, profilDe(r.donnees));
  return { ok: true, donnees: moi };
}

/** `identifiant` est l'adresse ou le pseudo : le service distingue les deux. */
async function connexion(identifiant, motDePasse, machine) {
  const r = await appel('POST', '/session', {
    avecJeton: false, corps: { identifiant, motDePasse, machine },
  });
  if (!r.ok) return r;
  retenirSession(r.donnees.jeton, profilDe(r.donnees));
  return { ok: true, donnees: moi };
}

async function deconnexion() {
  await appel('POST', '/deconnexion');
  oublierSession();
  return { ok: true };
}

module.exports = {
  etat: () => ({ connecte: Boolean(jeton), moi }),
  reprendre,
  inscription,
  connexion,
  deconnexion,
  signalerJeu,
  surChangement: (f) => { prevenir = f; },
  surMessages: (f) => { surMessages = f; },
  surInvitation: (f) => { surInvitation = f; },
  surMessageSalon: (f) => { surMessageSalon = f; },
  surSignaux: (f) => { surSignaux = f; },
  salonVu: (id, jusqu) => vusParSalon.set(id, jusqu),

  amis: () => appel('GET', '/amis'),
  ajouterAmi: (code) => appel('POST', '/amis/demande', { corps: { code } }),
  repondreAmi: (id, accepte) => appel('POST', '/amis/reponse', { corps: { id, accepte } }),
  retirerAmi: (id) => appel('POST', '/amis/retirer', { corps: { id } }),
  bloquer: (id, actif) => appel('POST', '/blocages', { corps: { id, bloquer: actif } }),
  signaler: (id, motif) => appel('POST', '/signalement', { corps: { id, motif } }),

  inviter: (vers, jeu) => appel('POST', '/invitations', { corps: { vers, jeu } }),
  invitations: () => appel('GET', '/invitations'),
  invitationVue: (id) => appel('POST', '/invitations/vue', { corps: { id } }),

  // --- salons privés ---
  salons: () => appel('GET', '/salons'),
  creerSalon: (nom, emoji) => appel('POST', '/salons', { corps: { nom, emoji } }),
  rejoindreSalon: (code) => appel('POST', '/salons/rejoindre', { corps: { code } }),
  quitterSalon: (salon) => appel('POST', '/salons/quitter', { corps: { salon } }),
  renommerSalon: (salon, nom, emoji) =>
    appel('POST', '/salons/renommer', { corps: { salon, nom, emoji } }),
  membresSalon: (salon) => appel('GET', `/salons/membres?salon=${encodeURIComponent(salon)}`),
  messagesSalon: (salon, depuis = 0) => appel(
    'GET', `/salons/messages?salon=${encodeURIComponent(salon)}&depuis=${depuis}`,
  ),
  attendreSalon: (salon, depuis) => appel(
    'GET', `/salons/messages?salon=${encodeURIComponent(salon)}&depuis=${depuis}&attendre=1`,
    { delai: 32000 },
  ),
  ecrireSalon: (salon, texte) => appel('POST', '/salons/messages', { corps: { salon, texte } }),
  salonLu: (salon, jusqu) => appel('POST', '/salons/lu', { corps: { salon, jusqu } }),
  inviterDansSalon: (salon, ami) => appel('POST', '/salons/inviter', { corps: { salon, ami } }),
  exclureDuSalon: (salon, membre) => appel('POST', '/salons/exclure', { corps: { salon, membre } }),

  // --- réactions, statut, profil ---
  reagir: (sorte, message, emoji) =>
    appel('POST', '/reactions', { corps: { sorte, message, emoji } }),
  reactions: (avec) => appel('GET', `/reactions?avec=${encodeURIComponent(avec)}`),
  definirStatut: (statut) => appel('POST', '/statut', { corps: { statut } }),
  profil: (de) => appel('GET', de ? `/profil?de=${encodeURIComponent(de)}` : '/profil'),
  emojis: () => appel('GET', '/emojis', { avecJeton: false }),

  messages: (avec, depuis = 0) => appel(
    'GET', `/messages?avec=${encodeURIComponent(avec)}&depuis=${depuis}`,
  ),

  /* Attente longue : la requête ne rend la main qu'à l'arrivée d'un message,
     ou au bout de vingt-cinq secondes. Interroger périodiquement donnait une
     conversation qui traîne — jusqu'à cinq secondes avant qu'un message
     n'apparaisse, ce qui se sent tout de suite. Le délai client doit dépasser
     celui du serveur, sinon on abandonne juste avant sa réponse. */
  attendreMessages: (avec, depuis) => appel(
    'GET', `/messages?avec=${encodeURIComponent(avec)}&depuis=${depuis}&attendre=1`,
    { delai: 32000 },
  ),
  envoyer: (vers, texte) => appel('POST', '/messages', { corps: { vers, texte } }),
  marquerLus: (avec) => appel('POST', '/messages/lus', { corps: { avec } }),

  /* Le mode audio. Le service n'aiguille que la négociation : la voix va d'une
     machine à l'autre sans repasser par lui. */
  glace: () => appel('GET', '/voix/glace'),
  appelerVoix: (vers) => appel('POST', '/voix/appeler', { corps: { vers } }),
  repondreVoix: (appelId, accepte) =>
    appel('POST', '/voix/repondre', { corps: { appel: appelId, accepte } }),
  raccrocherVoix: (appelId, raison) =>
    appel('POST', '/voix/raccrocher', { corps: { appel: appelId, raison } }),
  signalVoix: (appelId, sorte, charge) =>
    appel('POST', '/voix/signal', { corps: { appel: appelId, sorte, charge } }),
  etatVoix: (appelId) => appel('GET', `/voix/etat?appel=${encodeURIComponent(appelId)}`),

  actualites: () => appel('GET', '/actualites', { avecJeton: false }),
  classement: () => appel('GET', '/classement', { avecJeton: false }),
};
