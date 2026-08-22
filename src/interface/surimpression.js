/**
 * Le tchat en surimpression, côté page.
 *
 * Une seule idée directrice : répondre sans quitter le jeu. La fenêtre montre
 * les derniers messages reçus — conversations et salons mêlés — et le champ
 * répond au **dernier interlocuteur**, affiché à côté. Choisir sa conversation,
 * gérer ses salons, tout cela reste dans la fenêtre principale : une
 * surimpression qui veut tout faire finit par cacher le jeu.
 */
(() => {
  'use strict';

  const fil = document.getElementById('fil');
  const vide = document.getElementById('vide');
  const form = document.getElementById('form');
  const champ = document.getElementById('champ');
  const vers = document.getElementById('vers');

  // À qui répond le champ : le dernier qui a écrit.
  let interlocuteur = null; // { id, pseudo }

  const MESSAGES_MAX = 40;

  function pousser(pseudo, texte, ou) {
    vide?.remove();

    const el = document.createElement('div');
    el.className = 'msg';

    const tete = document.createElement('b');
    tete.textContent = pseudo;
    if (ou) {
      const lieu = document.createElement('span');
      lieu.className = 'ou';
      lieu.textContent = ` · ${ou}`;
      tete.append(lieu);
    }

    const corps = document.createElement('p');
    corps.textContent = texte;

    el.append(tete, corps);
    fil.append(el);

    // Le fil ne grossit pas sans fin : quarante messages suffisent à une
    // partie, et une surimpression n'est pas une archive.
    while (fil.children.length > MESSAGES_MAX) fil.firstChild.remove();
    fil.scrollTop = fil.scrollHeight;
  }

  async function pseudoDe(id) {
    const r = await window.ludopia.social.amis();
    if (!r.ok) return null;
    const ami = (r.donnees.amis || []).find((a) => a.id === id);
    return ami ? ami.pseudo : null;
  }

  // --- les messages qui arrivent -------------------------------------------
  window.ludopia.social.surNouveauxMessages(async (messages) => {
    for (const m of messages) {
      const pseudo = await pseudoDe(m.expediteur) || '…';
      pousser(pseudo, m.texte, null);
      interlocuteur = { id: m.expediteur, pseudo };
    }
    if (interlocuteur) {
      vers.textContent = `→ ${interlocuteur.pseudo}`;
      vers.hidden = false;
    }
  });

  // --- répondre --------------------------------------------------------------
  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const texte = champ.value.trim();
    if (!texte || !interlocuteur) return;
    champ.value = '';

    const r = await window.ludopia.social.envoyer(interlocuteur.id, texte);
    if (r.ok) pousser('Vous', texte, interlocuteur.pseudo);
    else champ.value = texte;
  });

  // --- la transparence, en trois crans ---------------------------------------
  const crans = [0.82, 0.6, 0.95];
  let cran = 0;
  document.getElementById('opacite').addEventListener('click', () => {
    cran = (cran + 1) % crans.length;
    document.documentElement.style.setProperty('--fond', `rgba(8, 8, 19, ${crans[cran]})`);
    document.body.style.background = `rgba(8, 8, 19, ${crans[cran]})`;
  });

  document.getElementById('fermer').addEventListener('click', () => {
    window.ludopia.surimpression.masquer();
  });
})();
