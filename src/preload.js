'use strict';

/**
 * Passerelle entre l'interface de la bibliothèque et le processus principal.
 *
 * L'interface n'a accès qu'à ces quelques fonctions : ni `require`, ni système
 * de fichiers, ni `ipcRenderer` brut. On expose des verbes précis, pas un canal
 * générique — un `invoke(canal, ...)` ouvert reviendrait à rendre le pont inutile.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ludopia', {
  demarrage: () => ipcRenderer.invoke('catalogue:lire'),
  stats: () => ipcRenderer.invoke('stats:lire'),
  rafraichirCatalogue: () => ipcRenderer.invoke('catalogue:rafraichir'),

  lancer: (id) => ipcRenderer.invoke('jeu:lancer', id),
  fermer: (id) => ipcRenderer.invoke('jeu:fermer', id),
  joignable: (id) => ipcRenderer.invoke('jeu:joignable', id),

  definirLangue: (langue) => ipcRenderer.invoke('langue:definir', langue),
  ouvrirLien: (url) => ipcRenderer.invoke('lien:ouvrir', url),

  actualites: () => ipcRenderer.invoke('actualites:lire'),
  classement: () => ipcRenderer.invoke('classement:lire'),

  reglages: () => ipcRenderer.invoke('reglages:lire'),
  definirReglages: (valeurs) => ipcRenderer.invoke('reglages:definir', valeurs),
  dossierDonnees: () => ipcRenderer.invoke('donnees:dossier'),
  ouvrirDossierDonnees: () => ipcRenderer.invoke('donnees:ouvrir'),

  /* Le service social. L'interface ne voit jamais le jeton de session ni
     l'adresse du service : elle demande, le processus principal répond. */
  social: {
    etat: () => ipcRenderer.invoke('social:etat'),
    inscription: (pseudo, courriel, mdp) =>
      ipcRenderer.invoke('social:inscription', pseudo, courriel, mdp),
    connexion: (identifiant, mdp) =>
      ipcRenderer.invoke('social:connexion', identifiant, mdp),
    deconnexion: () => ipcRenderer.invoke('social:deconnexion'),

    amis: () => ipcRenderer.invoke('social:amis'),
    ajouterAmi: (code) => ipcRenderer.invoke('social:ajouterAmi', code),
    repondreAmi: (id, accepte) => ipcRenderer.invoke('social:repondreAmi', id, accepte),
    retirerAmi: (id) => ipcRenderer.invoke('social:retirerAmi', id),
    bloquer: (id, actif) => ipcRenderer.invoke('social:bloquer', id, actif),
    signaler: (id, motif) => ipcRenderer.invoke('social:signaler', id, motif),
    inviter: (vers, jeu) => ipcRenderer.invoke('social:inviter', vers, jeu),

    salons: () => ipcRenderer.invoke('social:salons'),
    creerSalon: (nom, emoji) => ipcRenderer.invoke('social:creerSalon', nom, emoji),
    rejoindreSalon: (code) => ipcRenderer.invoke('social:rejoindreSalon', code),
    quitterSalon: (salon) => ipcRenderer.invoke('social:quitterSalon', salon),
    renommerSalon: (salon, nom, emoji) =>
      ipcRenderer.invoke('social:renommerSalon', salon, nom, emoji),
    membresSalon: (salon) => ipcRenderer.invoke('social:membresSalon', salon),
    messagesSalon: (salon, depuis) => ipcRenderer.invoke('social:messagesSalon', salon, depuis),
    attendreSalon: (salon, depuis) => ipcRenderer.invoke('social:attendreSalon', salon, depuis),
    ecrireSalon: (salon, texte, repondA) =>
      ipcRenderer.invoke('social:ecrireSalon', salon, texte, repondA),
    salonLu: (salon, jusqu) => ipcRenderer.invoke('social:salonLu', salon, jusqu),
    inviterDansSalon: (salon, ami) =>
      ipcRenderer.invoke('social:inviterDansSalon', salon, ami),
    exclureDuSalon: (salon, membre) =>
      ipcRenderer.invoke('social:exclureDuSalon', salon, membre),

    reagir: (sorte, message, emoji) => ipcRenderer.invoke('social:reagir', sorte, message, emoji),
    reactions: (avec) => ipcRenderer.invoke('social:reactions', avec),
    statut: (statut) => ipcRenderer.invoke('social:statut', statut),
    profil: (de) => ipcRenderer.invoke('social:profil', de),
    modifierProfil: (d) => ipcRenderer.invoke('social:modifierProfil', d),
    passeport: (d) => ipcRenderer.invoke('social:passeport', d),
    emojis: () => ipcRenderer.invoke('social:emojis'),
    jeuOuvert: () => ipcRenderer.invoke('social:jeuOuvert'),

    messages: (avec, depuis) => ipcRenderer.invoke('social:messages', avec, depuis),
    attendreMessages: (avec, depuis) =>
      ipcRenderer.invoke('social:attendreMessages', avec, depuis),
    envoyer: (vers, texte, repondA) =>
      ipcRenderer.invoke('social:envoyer', vers, texte, repondA),
    marquerLus: (avec) => ipcRenderer.invoke('social:marquerLus', avec),

    surChangement: (rappel) => {
      const ecouteur = (_evt, etat) => rappel(etat);
      ipcRenderer.on('social:changement', ecouteur);
      return () => ipcRenderer.removeListener('social:changement', ecouteur);
    },

    /** Le système demande d'ouvrir une conversation : clic sur un avis. */
    surOuvertureDemandee: (rappel) => {
      const ecouteur = (_evt, id) => rappel(id);
      ipcRenderer.on('social:ouvrirConversation', ecouteur);
      return () => ipcRenderer.removeListener('social:ouvrirConversation', ecouteur);
    },

    /** Des messages sont arrivés, quelle que soit la vue affichée. */
    surNouveauxMessages: (rappel) => {
      const ecouteur = (_evt, messages) => rappel(messages);
      ipcRenderer.on('social:nouveauxMessages', ecouteur);
      return () => ipcRenderer.removeListener('social:nouveauxMessages', ecouteur);
    },

    /** Dit au processus principal ce qui est affiché, pour qu'il n'envoie pas
     *  d'avis sur une conversation déjà sous les yeux. */
    conversationAffichee: (id) => ipcRenderer.send('social:conversationAffichee', id),
    salonAffiche: (id) => ipcRenderer.send('social:salonAffiche', id),

    surOuvertureSalon: (rappel) => {
      const ecouteur = (_evt, id) => rappel(id);
      ipcRenderer.on('social:ouvrirSalon', ecouteur);
      return () => ipcRenderer.removeListener('social:ouvrirSalon', ecouteur);
    },
  },

  /* Le mode audio. La négociation passe par le processus principal, mais la
     connexion elle-même vit dans l'interface : c'est là que se trouvent
     RTCPeerConnection et le micro. */
  serveurs: {
    mesServeurs: () => ipcRenderer.invoke('srv:liste'),
    creer: (d) => ipcRenderer.invoke('srv:creer', d),
    rejoindre: (d) => ipcRenderer.invoke('srv:rejoindre', d),
    quitter: (id) => ipcRenderer.invoke('srv:quitter', id),
    modifier: (d) => ipcRenderer.invoke('srv:modifier', d),
    contenu: (id) => ipcRenderer.invoke('srv:contenu', id),
    membres: (id) => ipcRenderer.invoke('srv:membres', id),
    exclure: (id, compte) => ipcRenderer.invoke('srv:exclure', id, compte),
    ajouterSalon: (d) => ipcRenderer.invoke('srv:ajouterSalon', d),
    supprimerSalon: (salon) => ipcRenderer.invoke('srv:supprimerSalon', salon),
    annuaire: (filtres) => ipcRenderer.invoke('srv:annuaire', filtres),
    roles: (id) => ipcRenderer.invoke('srv:roles', id),
    creerRole: (d) => ipcRenderer.invoke('srv:creerRole', d),
    modifierRole: (d) => ipcRenderer.invoke('srv:modifierRole', d),
    supprimerRole: (role) => ipcRenderer.invoke('srv:supprimerRole', role),
    attribuerRole: (role, compte, retirer) =>
      ipcRenderer.invoke('srv:attribuerRole', role, compte, retirer),
    surnom: (id, surnom) => ipcRenderer.invoke('srv:surnom', id, surnom),
  },

  evenements: {
    liste: (serveur) => ipcRenderer.invoke('ev:liste', serveur),
    creer: (d) => ipcRenderer.invoke('ev:creer', d),
    participer: (id, venir) => ipcRenderer.invoke('ev:participer', id, venir),
    annuler: (id) => ipcRenderer.invoke('ev:annuler', id),
    miens: () => ipcRenderer.invoke('ev:miens'),
  },

  boutique: {
    lire: (langue) => ipcRenderer.invoke('boutique:lire', langue),
    acheter: (article) => ipcRenderer.invoke('boutique:acheter', article),
    equiper: (emplacement, article) =>
      ipcRenderer.invoke('boutique:equiper', emplacement, article),
  },

  bourse: {
    lire: () => ipcRenderer.invoke('bourse:lire'),
    bonus: () => ipcRenderer.invoke('bourse:bonus'),
    offrir: (vers, montant, mot) => ipcRenderer.invoke('bourse:offrir', vers, montant, mot),
  },

  surimpression: {
    basculer: () => ipcRenderer.send('surimpression:basculer'),
    masquer: () => ipcRenderer.send('surimpression:masquer'),
    surSalon: (rappel) => {
      const ecouteur = (_evt, d) => rappel(d);
      ipcRenderer.on('surimpression:salon', ecouteur);
      return () => ipcRenderer.removeListener('surimpression:salon', ecouteur);
    },
  },

  theme: {
    etat: () => ipcRenderer.invoke('theme:etat'),
    surChangement: (rappel) => {
      const ecouteur = (_evt, t) => rappel(t);
      ipcRenderer.on('theme:changement', ecouteur);
      return () => ipcRenderer.removeListener('theme:changement', ecouteur);
    },
  },

  voix: {
    glace: () => ipcRenderer.invoke('voix:glace'),
    appeler: (vers) => ipcRenderer.invoke('voix:appeler', vers),
    repondre: (appel, accepte) => ipcRenderer.invoke('voix:repondre', appel, accepte),
    raccrocher: (appel, raison) => ipcRenderer.invoke('voix:raccrocher', appel, raison),
    signal: (appel, sorte, charge) => ipcRenderer.invoke('voix:signal', appel, sorte, charge),
    etat: (appel) => ipcRenderer.invoke('voix:etat', appel),

    surSignaux: (rappel) => {
      const ecouteur = (_evt, signaux) => rappel(signaux);
      ipcRenderer.on('voix:signaux', ecouteur);
      return () => ipcRenderer.removeListener('voix:signaux', ecouteur);
    },

    /** L'utilisateur a cliqué « Répondre » dans l'avis système. */
    salonEntrer: (salon) => ipcRenderer.invoke('voix:salonEntrer', salon),
    salonBattement: (salon, muet) => ipcRenderer.invoke('voix:salonBattement', salon, muet),
    salonSortir: (salon) => ipcRenderer.invoke('voix:salonSortir', salon),
    salonSignal: (salon, vers, sorte, charge) =>
      ipcRenderer.invoke('voix:salonSignal', salon, vers, sorte, charge),

    surDecrocher: (rappel) => {
      const ecouteur = (_evt, appel) => rappel(appel);
      ipcRenderer.on('voix:decrocher', ecouteur);
      return () => ipcRenderer.removeListener('voix:decrocher', ecouteur);
    },
  },

  majEtat: () => ipcRenderer.invoke('maj:etat'),
  majChercher: () => ipcRenderer.invoke('maj:chercher'),
  majInstaller: () => ipcRenderer.invoke('maj:installer'),

  /** Suit la recherche, le téléchargement et la disponibilité d'une mise à jour. */
  surMaj: (rappel) => {
    const ecouteur = (_evt, etat) => rappel(etat);
    ipcRenderer.on('maj:changement', ecouteur);
    return () => ipcRenderer.removeListener('maj:changement', ecouteur);
  },

  /** Prévient quand une fenêtre de jeu s'ouvre ou se ferme. */
  surChangementJeux: (rappel) => {
    const ecouteur = (_evt, ouverts) => rappel(ouverts);
    ipcRenderer.on('jeux:changement', ecouteur);
    return () => ipcRenderer.removeListener('jeux:changement', ecouteur);
  },

  /** Prévient quand le catalogue distant a été récupéré. */
  surCatalogue: (rappel) => {
    const ecouteur = (_evt, catalogue) => rappel(catalogue);
    ipcRenderer.on('catalogue:maj', ecouteur);
    return () => ipcRenderer.removeListener('catalogue:maj', ecouteur);
  },

  plateforme: process.platform,
});
