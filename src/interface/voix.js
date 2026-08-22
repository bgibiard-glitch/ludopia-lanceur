/**
 * Le mode audio, côté interface.
 *
 * C'est ici que vit la connexion. Le service n'a fait que transmettre les
 * messages de négociation ; à partir du moment où les deux machines se sont
 * entendues, la voix passe de l'une à l'autre sans repasser par lui. Personne
 * n'écoute au milieu, et ce n'est pas une promesse de politique de
 * confidentialité : c'est la manière dont c'est construit.
 *
 * Trois choses méritent une explication, parce qu'elles ne se devinent pas et
 * qu'elles sont la cause de la moitié des mystères en WebRTC :
 *
 *  1. **Le micro est demandé avant de faire sonner l'autre.** Si l'autorisation
 *     est refusée, personne n'aura été dérangé pour rien.
 *
 *  2. **Les candidats réseau arrivent souvent avant la description de session
 *     à laquelle ils se rapportent.** Les ajouter à ce moment-là lève une
 *     erreur, silencieuse, et l'appel ne s'établit jamais. Ils sont donc mis de
 *     côté puis versés d'un coup.
 *
 *  3. **Celui qui appelle propose, celui qui décroche dispose.** Un seul des
 *     deux crée l'offre. Si les deux s'y mettent, les descriptions se croisent
 *     et la négociation échoue — c'est le « glare » de la littérature.
 */

/* eslint-disable no-use-before-define */

// L'appel courant, ou null. Il n'y en a jamais deux : c'est une conversation
// entre deux personnes, pas un standard téléphonique.
let appel = null;

// Les signaux d'un appel qu'on n'a pas encore accepté. Sans cette réserve,
// l'offre arrivée pendant que la sonnerie retentit serait perdue.
const enAttente = new Map();

let horlogeDuree = null;
let horlogeSonnerie = null;

const T_VOIX = {
  fr: {
    appelle: (qui) => `${qui} vous appelle`,
    appelEnCours: 'Appel en cours',
    prepare: 'Préparation…',
    sonne: 'Sonnerie…',
    connexion: 'Connexion…',
    repondre: 'Répondre',
    refuser: 'Refuser',
    raccrocher: 'Raccrocher',
    couperMicro: 'Couper le micro',
    remettreMicro: 'Remettre le micro',
    microCoupe: 'Micro coupé',
    appeler: 'Appeler',
    sansMicro: 'Aucun micro accessible. Vérifiez qu’il est branché et autorisé.',
    microRefuse: 'Le micro a été refusé. Sans lui, pas d’appel.',
    occupe: 'Cette personne est déjà en ligne.',
    sansReponse: 'Pas de réponse.',
    refuse: 'Appel refusé.',
    termine: (duree) => `Appel terminé — ${duree}`,
    perdu: 'La connexion s’est interrompue.',
    relaisAbsent: 'Connexion directe uniquement : si elle échoue, c’est que les '
      + 'deux réseaux l’empêchent.',
  },
  en: {
    appelle: (qui) => `${qui} is calling`,
    appelEnCours: 'In call',
    prepare: 'Preparing…',
    sonne: 'Ringing…',
    connexion: 'Connecting…',
    repondre: 'Answer',
    refuser: 'Decline',
    raccrocher: 'Hang up',
    couperMicro: 'Mute',
    remettreMicro: 'Unmute',
    microCoupe: 'Muted',
    appeler: 'Call',
    sansMicro: 'No microphone available. Check that it is plugged in and allowed.',
    microRefuse: 'Microphone access was denied. There is no call without it.',
    occupe: 'That person is already in a call.',
    sansReponse: 'No answer.',
    refuse: 'Call declined.',
    termine: (duree) => `Call ended — ${duree}`,
    perdu: 'The connection dropped.',
    relaisAbsent: 'Direct connection only: if it fails, both networks are blocking it.',
  },
};

function TV() {
  return T_VOIX[typeof etat !== 'undefined' && etat.langue === 'en' ? 'en' : 'fr'];
}

function duree(secondes) {
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// =============================================================================
// La connexion
// =============================================================================

/**
 * Le micro.
 *
 * `echoCancellation` et compagnie ne sont pas des raffinements : sans elles,
 * deux personnes sur haut-parleurs s'entendent en écho et l'appel devient
 * impraticable au bout de trente secondes.
 */
async function prendreLeMicro() {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  });
}

async function fabriquerConnexion() {
  const r = await window.ludopia.voix.glace();
  const serveurs = r.ok ? (r.donnees.serveurs || []) : [{ urls: ['stun:stun.cloudflare.com:3478'] }];

  const pc = new RTCPeerConnection({
    iceServers: serveurs,
    // Rassembler les candidats sur une seule paire de ports plutôt qu'une par
    // flux : moins de candidats à échanger, donc une connexion plus rapide.
    bundlePolicy: 'max-bundle',
  });

  pc.onicecandidate = (evt) => {
    if (!evt.candidate || !appel) return;
    window.ludopia.voix.signal(appel.id, 'candidat', JSON.stringify(evt.candidate));
  };

  pc.ontrack = (evt) => {
    const audio = document.getElementById('voix-sortie');
    if (audio && evt.streams[0]) audio.srcObject = evt.streams[0];
  };

  pc.onconnectionstatechange = () => {
    if (!appel) return;
    if (pc.connectionState === 'connected') {
      appel.etat = 'en_cours';
      if (!appel.debut) appel.debut = Date.now();
      arreterSonnerie();
      dessinerBarre();
    } else if (['failed', 'closed'].includes(pc.connectionState)) {
      // `disconnected` est transitoire — un changement de réseau, un Wi-Fi qui
      // hésite — et se répare tout seul. Raccrocher dessus couperait des
      // appels qui allaient reprendre.
      terminer(pc.connectionState === 'failed' ? TV().perdu : null);
    }
  };

  return pc;
}

/** Les candidats mis de côté, versés une fois la description en place. */
async function verserLesCandidats() {
  if (!appel?.pc || !appel.candidats.length) return;
  for (const c of appel.candidats) {
    try {
      await appel.pc.addIceCandidate(new RTCIceCandidate(JSON.parse(c)));
    } catch {
      // Un candidat rejeté n'est pas fatal : il en reste d'autres, et c'est
      // le lot normal d'une négociation.
    }
  }
  appel.candidats = [];
}

// =============================================================================
// Appeler
// =============================================================================

async function appelerAmi(ami) {
  if (appel) return;

  let flux;
  try {
    flux = await prendreLeMicro();
  } catch (e) {
    // On n'a fait sonner personne : l'erreur reste entre l'utilisateur et sa
    // machine.
    annoncer(e?.name === 'NotAllowedError' ? TV().microRefuse : TV().sansMicro);
    return;
  }

  /* La barre paraît avant que le service ait répondu.

     Entre le clic et la sonnerie, il y a deux allers-retours réseau : ouvrir
     l'appel, puis demander les serveurs de négociation. Une seconde, parfois
     deux. Sans rien à l'écran pendant ce temps, on croit que le bouton n'a pas
     marché et on reclique — ce qui ouvrait un second appel. */
  appel = {
    id: null,
    avec: ami.id,
    pseudo: ami.pseudo,
    role: 'appelant',
    etat: 'prepare',
    flux,
    pc: null,
    candidats: [],
    debut: null,
    muet: false,
  };
  dessinerBarre();

  const r = await window.ludopia.voix.appeler(ami.id);
  if (!r.ok) {
    terminer(r.erreur === 'occupe' ? TV().occupe : messageErreur(r.erreur, r.detail), false);
    return;
  }
  appel.id = r.donnees.appel;
  appel.etat = 'sonne';

  appel.pc = await fabriquerConnexion();
  flux.getTracks().forEach((p) => appel.pc.addTrack(p, flux));

  const offre = await appel.pc.createOffer();
  await appel.pc.setLocalDescription(offre);
  await window.ludopia.voix.signal(appel.id, 'offre', JSON.stringify(offre));

  demarrerSonnerie();
  dessinerBarre();
}

// =============================================================================
// Décrocher
// =============================================================================

async function decrocher(id) {
  const dossier = enAttente.get(id);
  if (!dossier) return;

  let flux;
  try {
    flux = await prendreLeMicro();
  } catch (e) {
    annoncer(e?.name === 'NotAllowedError' ? TV().microRefuse : TV().sansMicro);
    await window.ludopia.voix.repondre(id, false);
    enAttente.delete(id);
    dessinerBanniere();
    return;
  }

  const r = await window.ludopia.voix.repondre(id, true);
  if (!r.ok) {
    flux.getTracks().forEach((p) => p.stop());
    enAttente.delete(id);
    dessinerBanniere();
    return;
  }

  appel = {
    id,
    avec: dossier.de,
    pseudo: dossier.pseudo,
    role: 'appele',
    etat: 'connexion',
    flux,
    pc: null,
    candidats: [...dossier.candidats],
    debut: null,
    muet: false,
  };

  appel.pc = await fabriquerConnexion();
  flux.getTracks().forEach((p) => appel.pc.addTrack(p, flux));

  if (dossier.offre) await accepterOffre(dossier.offre);

  enAttente.delete(id);
  dessinerBanniere();
  dessinerBarre();
}

async function accepterOffre(offre) {
  if (!appel?.pc) return;
  await appel.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(offre)));
  await verserLesCandidats();
  const reponse = await appel.pc.createAnswer();
  await appel.pc.setLocalDescription(reponse);
  await window.ludopia.voix.signal(appel.id, 'reponse', JSON.stringify(reponse));
}

async function refuser(id) {
  await window.ludopia.voix.repondre(id, false);
  enAttente.delete(id);
  dessinerBanniere();
}

// =============================================================================
// Raccrocher
// =============================================================================

async function raccrocher(raison = 'raccroche') {
  if (!appel) return;
  const id = appel.id;
  const combien = appel.debut ? Math.round((Date.now() - appel.debut) / 1000) : 0;
  terminer(combien ? TV().termine(duree(combien)) : null, false);
  await window.ludopia.voix.raccrocher(id, raison);
}

/** Défait tout : la connexion, le micro, les horloges, l'affichage. */
function terminer(message, prevenirLeService = false) {
  if (!appel) return;
  const id = appel.id;

  try { appel.pc?.close(); } catch { /* déjà fermée */ }
  appel.flux?.getTracks().forEach((p) => p.stop());

  const audio = document.getElementById('voix-sortie');
  if (audio) audio.srcObject = null;

  appel = null;
  arreterSonnerie();
  if (horlogeDuree) { clearInterval(horlogeDuree); horlogeDuree = null; }

  dessinerBarre();
  if (message) annoncer(message);
  if (prevenirLeService) window.ludopia.voix.raccrocher(id, 'raccroche');
}

function basculerMicro() {
  if (!appel) return;
  appel.muet = !appel.muet;
  appel.flux.getAudioTracks().forEach((p) => { p.enabled = !appel.muet; });
  dessinerBarre();
}

// =============================================================================
// La sonnerie côté appelant
// =============================================================================

function demarrerSonnerie() {
  arreterSonnerie();
  // Quarante-cinq secondes, comme le service. Au-delà, il a déjà classé
  // l'appel sans réponse : insister ferait sonner dans le vide.
  horlogeSonnerie = setTimeout(async () => {
    if (appel && appel.etat === 'sonne') {
      const id = appel.id;
      terminer(TV().sansReponse, false);
      await window.ludopia.voix.raccrocher(id, 'sans_reponse');
    }
  }, 45000);
}

function arreterSonnerie() {
  if (horlogeSonnerie) { clearTimeout(horlogeSonnerie); horlogeSonnerie = null; }
}

// =============================================================================
// Ce qui arrive du service
// =============================================================================

async function recevoirSignaux(signaux) {
  for (const x of signaux) {
    if (x.sorte === 'sonne') {
      // Déjà en ligne : on refuse poliment plutôt que de laisser sonner une
      // ligne occupée. Le service le sait aussi, mais deux appels peuvent
      // partir dans la même seconde.
      if (appel) {
        window.ludopia.voix.repondre(x.appel, false);
        continue;
      }
      let qui = {};
      try { qui = JSON.parse(x.charge || '{}'); } catch { /* charge illisible */ }
      enAttente.set(x.appel, {
        de: x.de,
        pseudo: qui.pseudo || '…',
        offre: null,
        candidats: [],
        recuLe: Date.now(),
      });
      dessinerBanniere();
      continue;
    }

    if (x.sorte === 'raccroche') {
      if (enAttente.has(x.appel)) { enAttente.delete(x.appel); dessinerBanniere(); }
      if (appel?.id === x.appel) {
        // Raccrocher de son côté : inutile de le redire au service, il vient
        // justement de nous l'apprendre.
        terminer(appel.etat === 'sonne' ? TV().refuse : null, false);
      }
      continue;
    }

    // Les signaux d'un appel qu'on n'a pas encore accepté attendent leur tour.
    const dossier = enAttente.get(x.appel);
    if (dossier) {
      if (x.sorte === 'offre') dossier.offre = x.charge;
      else if (x.sorte === 'candidat') dossier.candidats.push(x.charge);
      continue;
    }

    if (appel?.id !== x.appel || !appel.pc) continue;

    if (x.sorte === 'offre') {
      await accepterOffre(x.charge);
    } else if (x.sorte === 'reponse') {
      await appel.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(x.charge)));
      appel.etat = 'connexion';
      arreterSonnerie();
      dessinerBarre();
      await verserLesCandidats();
    } else if (x.sorte === 'candidat') {
      /* Tant que la description distante n'est pas posée, un candidat est
         refusé. On le garde : c'est exactement le cas qui fait échouer un
         appel sur deux quand on ne le traite pas. */
      if (!appel.pc.remoteDescription) appel.candidats.push(x.charge);
      else {
        try {
          await appel.pc.addIceCandidate(new RTCIceCandidate(JSON.parse(x.charge)));
        } catch { /* candidat rejeté, sans conséquence */ }
      }
    }
  }
}

// =============================================================================
// L'affichage
// =============================================================================

function annoncer(texte) {
  if (!texte) return;
  const zone = document.getElementById('voix-avis');
  if (!zone) return;
  zone.textContent = texte;
  zone.hidden = false;
  clearTimeout(annoncer.horloge);
  annoncer.horloge = setTimeout(() => { zone.hidden = true; }, 5000);
}

function dessinerBanniere() {
  const zone = document.getElementById('voix-entrant');
  if (!zone) return;
  zone.textContent = '';

  const premier = [...enAttente.entries()][0];
  if (!premier || appel) { zone.hidden = true; return; }

  const [id, dossier] = premier;
  const t = TV();

  const nom = document.createElement('p');
  nom.className = 'voix-qui';
  nom.textContent = t.appelle(dossier.pseudo);

  const boutons = document.createElement('div');
  boutons.className = 'voix-boutons';

  const oui = document.createElement('button');
  oui.type = 'button';
  oui.className = 'voix-oui';
  oui.textContent = t.repondre;
  oui.addEventListener('click', () => decrocher(id));

  const non = document.createElement('button');
  non.type = 'button';
  non.className = 'voix-non';
  non.textContent = t.refuser;
  non.addEventListener('click', () => refuser(id));

  boutons.append(oui, non);
  zone.append(nom, boutons);
  zone.hidden = false;
}

function dessinerBarre() {
  const zone = document.getElementById('voix-barre');
  if (!zone) return;
  zone.textContent = '';

  if (!appel) { zone.hidden = true; return; }
  const t = TV();

  const point = document.createElement('i');
  point.className = 'voix-point';
  point.dataset.etat = appel.etat;

  const qui = document.createElement('span');
  qui.className = 'voix-qui';
  qui.textContent = appel.pseudo;

  const sous = document.createElement('span');
  sous.className = 'voix-sous';
  sous.id = 'voix-duree';
  sous.textContent = appel.etat === 'prepare' ? t.prepare
    : appel.etat === 'sonne' ? t.sonne
      : appel.etat === 'connexion' ? t.connexion : '0:00';

  const micro = document.createElement('button');
  micro.type = 'button';
  micro.className = appel.muet ? 'voix-mini voix-mini--actif' : 'voix-mini';
  micro.textContent = appel.muet ? t.remettreMicro : t.couperMicro;
  micro.addEventListener('click', basculerMicro);

  const fin = document.createElement('button');
  fin.type = 'button';
  fin.className = 'voix-fin';
  fin.textContent = t.raccrocher;
  fin.addEventListener('click', () => raccrocher());

  zone.append(point, qui, sous, micro, fin);
  zone.hidden = false;

  if (horlogeDuree) clearInterval(horlogeDuree);
  horlogeDuree = setInterval(() => {
    const el = document.getElementById('voix-duree');
    if (!el || !appel) return;
    if (appel.etat === 'en_cours' && appel.debut) {
      el.textContent = duree(Math.round((Date.now() - appel.debut) / 1000))
        + (appel.muet ? ` · ${TV().microCoupe}` : '');
    }
  }, 1000);
}

// =============================================================================
// Branchement
// =============================================================================

function brancherVoix() {
  window.ludopia.voix.surSignaux((signaux) => { recevoirSignaux(signaux); });
  window.ludopia.voix.surDecrocher((id) => { decrocher(id); });

  /* Une sonnerie ne dure pas indéfiniment de ce côté non plus : le service a
     déjà classé l'appel sans réponse, et une bannière qui resterait proposerait
     de décrocher un appel qui n'existe plus. */
  setInterval(() => {
    let change = false;
    for (const [id, d] of enAttente) {
      if (Date.now() - d.recuLe > 48000) { enAttente.delete(id); change = true; }
    }
    if (change) dessinerBanniere();
  }, 4000);
}

/** Vrai si un appel est en cours avec cette personne : le bouton s'efface. */
function enAppelAvec(id) {
  return Boolean(appel && appel.avec === id);
}
