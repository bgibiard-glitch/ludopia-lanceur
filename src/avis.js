'use strict';

/**
 * Les avis du système : un message arrive pendant que vous jouez.
 *
 * Sans cela la messagerie n'a d'intérêt que si l'on regarde le lanceur — or on
 * le quitte des yeux dès qu'on lance un jeu, ce qui est précisément le moment
 * où un ami écrit « je te rejoins ».
 *
 * Trois règles, qui tiennent en une phrase chacune :
 *
 *   - **Jamais quand la conversation est sous les yeux.** Signaler ce que
 *     l'utilisateur est en train de lire est une nuisance, pas un service.
 *   - **Un avis par personne, pas par message.** Dix messages d'affilée
 *     donnent un seul avis, mis à jour ; sinon une conversation animée
 *     ensevelit le bureau.
 *   - **Le clic ramène à la conversation.** Un avis sur lequel on ne peut rien
 *     faire ne sert à rien.
 */

const { Notification, nativeImage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const RACINE = path.join(__dirname, '..');

// Un avis par expéditeur : on remplace le précédent plutôt que d'empiler.
const enCours = new Map();

/* Les réglages de l'utilisateur. Ils sont consultés au moment d'afficher, pas
   au moment de brancher : changer un interrupteur doit agir tout de suite. */
let regles = {
  avisMessages: true, avisSalons: true, avisInvitations: true, son: true,
};

let ouvrirConversation = () => {};
let fenetreVisible = () => false;
let conversationOuverte = () => null;
let salonOuvert = () => null;

let icone = null;
function iconeAvis() {
  if (icone !== null) return icone;
  // Une icône rend l'avis reconnaissable au milieu des autres ; son absence ne
  // doit pas empêcher l'avis de partir.
  for (const c of ['ressources/icones/128x128.png', 'ressources/icon.png']) {
    const p = path.join(RACINE, c);
    if (fs.existsSync(p)) {
      icone = nativeImage.createFromPath(p);
      return icone;
    }
  }
  icone = undefined;
  return icone;
}

/**
 * @param {{id: string, pseudo: string}} ami
 * @param {string[]} textes les messages non encore vus
 */
function messageRecu(ami, textes) {
  if (!Notification.isSupported() || !textes.length) return;
  if (!regles.avisMessages) return;

  // Le lanceur est devant l'utilisateur, sur cette conversation : il la voit.
  if (fenetreVisible() && conversationOuverte() === ami.id) return;

  const precedent = enCours.get(ami.id);
  if (precedent) precedent.close();

  const corps = textes.length === 1
    ? textes[0]
    : `${textes.length} messages · ${textes[textes.length - 1]}`;

  const avis = new Notification({
    title: ami.pseudo,
    body: corps.slice(0, 220),
    icon: iconeAvis(),
    silent: !regles.son,
    // Sur Windows, une réponse directe depuis l'avis demanderait une
    // application signée et enregistrée auprès du système. On s'en tient au
    // clic, qui ouvre la conversation.
  });

  avis.on('click', () => {
    enCours.delete(ami.id);
    ouvrirConversation(ami.id);
  });
  avis.on('close', () => enCours.delete(ami.id));

  avis.show();
  enCours.set(ami.id, avis);
}

/**
 * Une invitation à rejoindre une partie.
 *
 * Deux boutons plutôt qu'un simple clic : « Rejoindre » lance le jeu tout de
 * suite, ce qui est l'intérêt de l'invitation. Sur les systèmes qui ne savent
 * pas afficher de boutons, le clic sur l'avis fait la même chose.
 */
function invitationRecue(ami, jeu, nomDuJeu, rejoindre) {
  if (!Notification.isSupported()) return;
  if (!regles.avisInvitations) return;

  const cle = `invitation:${ami.id}:${jeu}`;
  const precedent = enCours.get(cle);
  if (precedent) precedent.close();

  const avis = new Notification({
    title: `${ami.pseudo} vous invite`,
    body: `Une partie sur ${nomDuJeu} vous attend.`,
    icon: iconeAvis(),
    actions: [{ type: 'button', text: 'Rejoindre' }],
    silent: !regles.son,
  });

  avis.on('action', () => { enCours.delete(cle); rejoindre(); });
  avis.on('click', () => { enCours.delete(cle); rejoindre(); });
  avis.on('close', () => enCours.delete(cle));

  avis.show();
  enCours.set(cle, avis);
}

/**
 * Un ou plusieurs messages dans un salon.
 *
 * Le titre porte le nom du salon, pas celui de l'auteur : c'est le lieu qu'on
 * reconnaît d'abord, et plusieurs personnes peuvent y avoir parlé.
 */
function messageSalonRecu(salon, messages, ouvrir) {
  if (!Notification.isSupported() || !messages.length) return;
  if (!regles.avisSalons) return;
  if (fenetreVisible() && salonOuvert() === salon.id) return;

  const cle = `salon:${salon.id}`;
  const precedent = enCours.get(cle);
  if (precedent) precedent.close();

  const dernier = messages[messages.length - 1];
  const corps = messages.length === 1
    ? `${dernier.pseudo} : ${dernier.texte}`
    : `${messages.length} messages · ${dernier.pseudo} : ${dernier.texte}`;

  const avis = new Notification({
    title: `${salon.emoji || '🎮'} ${salon.nom}`,
    body: corps.slice(0, 220),
    icon: iconeAvis(),
    silent: !regles.son,
  });

  avis.on('click', () => { enCours.delete(cle); ouvrir(salon.id); });
  avis.on('close', () => enCours.delete(cle));
  avis.show();
  enCours.set(cle, avis);
}

/** Retire l'avis d'une personne dont on vient d'ouvrir la conversation. */
function vuePar(idAmi) {
  const a = enCours.get(idAmi);
  if (a) {
    a.close();
    enCours.delete(idAmi);
  }
}

function brancher({ ouvrir, visible, conversation, salon }) {
  ouvrirConversation = ouvrir;
  fenetreVisible = visible;
  conversationOuverte = conversation;
  if (salon) salonOuvert = salon;
}

module.exports = {
  brancher, messageRecu, messageSalonRecu, invitationRecue, vuePar,
  reglages: (r) => { regles = { ...regles, ...r }; },
};
