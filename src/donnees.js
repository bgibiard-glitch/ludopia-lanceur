'use strict';

/**
 * Petit magasin JSON pour les préférences et les statistiques de jeu.
 *
 * On n'utilise pas `electron-store` : il n'apporte ici qu'une écriture atomique
 * et un schéma, pour une dépendance de plus. Le fichier vit dans le dossier
 * utilisateur d'Electron, pas à côté de l'exécutable — un lanceur installé dans
 * « Program Files » n'a pas le droit d'y écrire.
 */

const fs = require('node:fs');
const path = require('node:path');
const { app } = require('electron');

const FICHIER = () => path.join(app.getPath('userData'), 'donnees.json');

const DEFAUTS = {
  langue: null,          // null = on suit la langue du système
  dernierJeu: null,
  jeux: {},              // id -> { minutes, lancements, derniereFois, fenetre }
  fenetre: null,         // position et taille du lanceur lui-même
};

let cache = null;
let ecritureEnAttente = null;

function lire() {
  if (cache) return cache;
  try {
    const brut = fs.readFileSync(FICHIER(), 'utf8');
    cache = { ...DEFAUTS, ...JSON.parse(brut) };
  } catch {
    // Premier lancement, fichier effacé ou JSON abîmé : on repart des défauts
    // plutôt que d'empêcher le lanceur de démarrer.
    cache = { ...DEFAUTS };
  }
  return cache;
}

/** Écrit au plus une fois par seconde : le temps de jeu se met à jour souvent. */
function ecrire() {
  if (ecritureEnAttente) return;
  ecritureEnAttente = setTimeout(() => {
    ecritureEnAttente = null;
    const cible = FICHIER();
    const provisoire = `${cible}.tmp`;
    try {
      fs.mkdirSync(path.dirname(cible), { recursive: true });
      fs.writeFileSync(provisoire, JSON.stringify(cache, null, 2), 'utf8');
      fs.renameSync(provisoire, cible);   // remplacement atomique
    } catch (err) {
      console.error('[donnees] écriture impossible :', err.message);
    }
  }, 1000);
}

/** Force l'écriture en attente — à appeler avant de quitter. */
function vider() {
  if (!ecritureEnAttente) return;
  clearTimeout(ecritureEnAttente);
  ecritureEnAttente = null;
  const cible = FICHIER();
  try {
    fs.mkdirSync(path.dirname(cible), { recursive: true });
    fs.writeFileSync(cible, JSON.stringify(cache, null, 2), 'utf8');
  } catch (err) {
    console.error('[donnees] écriture finale impossible :', err.message);
  }
}

function get(cle) {
  return lire()[cle];
}

function set(cle, valeur) {
  lire()[cle] = valeur;
  ecrire();
  return valeur;
}

/** Statistiques d'un jeu, toujours renvoyées complètes. */
function statsJeu(id) {
  const j = lire().jeux;
  if (!j[id]) j[id] = { minutes: 0, lancements: 0, derniereFois: null, fenetre: null };
  return j[id];
}

function majStatsJeu(id, modif) {
  Object.assign(statsJeu(id), modif);
  ecrire();
}

module.exports = { lire, get, set, statsJeu, majStatsJeu, vider, FICHIER };
