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
