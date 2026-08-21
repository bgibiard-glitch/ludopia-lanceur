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

let ouvrirConversation = () => {};
let fenetreVisible = () => false;
let conversationOuverte = () => null;

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
    silent: false,
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

/** Retire l'avis d'une personne dont on vient d'ouvrir la conversation. */
function vuePar(idAmi) {
  const a = enCours.get(idAmi);
  if (a) {
    a.close();
    enCours.delete(idAmi);
  }
}

function brancher({ ouvrir, visible, conversation }) {
  ouvrirConversation = ouvrir;
  fenetreVisible = visible;
  conversationOuverte = conversation;
}

module.exports = { brancher, messageRecu, vuePar };
