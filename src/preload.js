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
    ecrireSalon: (salon, texte) => ipcRenderer.invoke('social:ecrireSalon', salon, texte),
    salonLu: (salon, jusqu) => ipcRenderer.invoke('social:salonLu', salon, jusqu),
    inviterDansSalon: (salon, ami) =>
      ipcRenderer.invoke('social:inviterDansSalon', salon, ami),
    exclureDuSalon: (salon, membre) =>
      ipcRenderer.invoke('social:exclureDuSalon', salon, membre),

    reagir: (sorte, message, emoji) => ipcRenderer.invoke('social:reagir', sorte, message, emoji),
    reactions: (avec) => ipcRenderer.invoke('social:reactions', avec),
    statut: (statut) => ipcRenderer.invoke('social:statut', statut),
    profil: (de) => ipcRenderer.invoke('social:profil', de),
    emojis: () => ipcRenderer.invoke('social:emojis'),
    jeuOuvert: () => ipcRenderer.invoke('social:jeuOuvert'),

    messages: (avec, depuis) => ipcRenderer.invoke('social:messages', avec, depuis),
    attendreMessages: (avec, depuis) =>
      ipcRenderer.invoke('social:attendreMessages', avec, depuis),
    envoyer: (vers, texte) => ipcRenderer.invoke('social:envoyer', vers, texte),
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
