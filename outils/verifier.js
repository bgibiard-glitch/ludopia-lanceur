/**
 * Vérifie le lanceur pour de vrai : on le démarre, on regarde la bibliothèque,
 * on ouvre un jeu, on mesure le temps de jeu, on referme.
 *
 *   NODE_PATH=C:/Dev/perso/villopia/node_modules node outils/verifier.js
 *
 * Les captures atterrissent dans `outils/captures/`.
 */
'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { _electron: electron } = require('playwright');

const RACINE = path.join(__dirname, '..');
const CAPTURES = path.join(__dirname, 'captures');

const ok = [];
const ko = [];

function verifier(intitule, condition, detail = '') {
  (condition ? ok : ko).push(intitule + (detail ? ` — ${detail}` : ''));
  console.log(`  ${condition ? 'ok  ' : 'ECHEC'} ${intitule}${detail ? ` — ${detail}` : ''}`);
}

(async () => {
  fs.mkdirSync(CAPTURES, { recursive: true });

  // Un profil jetable : les statistiques d'une exécution précédente fausseraient
  // les mesures de temps de jeu et de nombre de lancements.
  const profil = path.join(CAPTURES, 'profil-test');
  fs.rmSync(profil, { recursive: true, force: true });

  // Playwright cherche Electron dans SES propres node_modules ; ici il est
  // installé dans ceux du lanceur, il faut donc le lui désigner.
  const binaire = require(path.join(RACINE, 'node_modules', 'electron'));

  const app = await electron.launch({
    executablePath: binaire,
    args: ['.', `--user-data-dir=${profil}`],
    cwd: RACINE,
  });

  const bibliotheque = await app.firstWindow();
  await bibliotheque.waitForLoadState('domcontentloaded');
  await bibliotheque.waitForTimeout(1500);

  console.log('\n--- bibliothèque ---');
  verifier('titre de la fenêtre', (await bibliotheque.title()) === 'Ludopia');

  const entrees = bibliotheque.locator('.rail-jeu');
  const nb = await entrees.count();
  verifier('les quatre jeux sont listés', nb === 4, `${nb} entrées`);

  const noms = await bibliotheque.locator('.rail-nom').allTextContents();
  verifier('noms des jeux', noms.join(', ') === 'World Blocks, Villopia, Tradopia, Equipia',
    noms.join(', '));

  const titreAccueil = await bibliotheque.locator('.acc-tete h1').textContent();
  verifier("la page d'accueil s'ouvre au démarrage", Boolean(titreAccueil), titreAccueil);
  verifier('les quatre chiffres sont là',
    (await bibliotheque.locator('.chiffre').count()) === 4);

  // La pastille doit finir par annoncer « en ligne » : la sonde réseau répond
  // en quelques secondes.
  await bibliotheque.waitForTimeout(4000);
  const etats = await bibliotheque.locator('.rail-jeu').evaluateAll(
    (n) => n.map((e) => e.dataset.etat));
  verifier('sonde réseau aboutie',
    etats.filter((e) => e === 'en-ligne').length === 3, etats.join(', '));

  await bibliotheque.screenshot({ path: path.join(CAPTURES, '01-bibliotheque.png') });

  // --- passage d'un jeu à l'autre ---
  console.log('\n--- navigation ---');
  await entrees.nth(1).click();
  await bibliotheque.waitForTimeout(600);
  verifier('Villopia s\'affiche au clic',
    (await bibliotheque.locator('.affiche h1').textContent()) === 'Villopia');
  await bibliotheque.screenshot({ path: path.join(CAPTURES, '02-villopia.png') });

  // --- jeu à venir : le bouton doit être bloqué ---
  await entrees.nth(3).click();
  await bibliotheque.waitForTimeout(500);
  verifier('Equipia n\'est pas lançable',
    await bibliotheque.locator('.jouer').isDisabled());
  await bibliotheque.screenshot({ path: path.join(CAPTURES, '03-equipia.png') });

  // --- retour à l'accueil ---
  await bibliotheque.locator('#accueil').click();
  await bibliotheque.waitForTimeout(700);
  verifier("le bouton Accueil ramène à la page d'accueil",
    (await bibliotheque.locator('.acc-tete').count()) === 1);
  const articles = await bibliotheque.locator('.nouvelle').count();
  verifier('les nouvelles du studio sont chargées', articles > 0, `${articles} articles`);
  await bibliotheque.screenshot({ path: path.join(CAPTURES, '07-accueil.png') });

  // --- bascule de langue ---
  console.log('\n--- langue ---');
  await bibliotheque.locator('[data-langue]').click();
  await bibliotheque.waitForTimeout(500);
  const libelle = await bibliotheque.locator('.rail-titre').textContent();
  verifier('bascule vers l\'anglais', libelle.trim() === 'Library', libelle.trim());
  await bibliotheque.locator('[data-langue]').click();
  await bibliotheque.waitForTimeout(500);
  verifier('retour au français',
    (await bibliotheque.locator('.rail-titre').textContent()).trim() === 'Bibliothèque');

  // --- lancement d'un jeu ---
  console.log('\n--- lancement de World Blocks ---');
  await entrees.nth(0).click();
  await bibliotheque.waitForTimeout(400);
  await bibliotheque.locator('.jouer').click();

  const fenetreJeu = await app.waitForEvent('window', { timeout: 30000 });
  await fenetreJeu.waitForLoadState('domcontentloaded');
  await fenetreJeu.waitForTimeout(6000);

  const url = fenetreJeu.url();
  verifier('la fenêtre de jeu charge worldblocks.app', url.startsWith('https://worldblocks.app'), url);

  const titreJeu = await fenetreJeu.title();
  verifier('le jeu répond', titreJeu.length > 0, titreJeu);
  await fenetreJeu.screenshot({ path: path.join(CAPTURES, '04-jeu.png') });

  // La bibliothèque doit refléter la partie en cours.
  await bibliotheque.waitForTimeout(1200);
  const etatRail = await entrees.nth(0).getAttribute('data-etat');
  verifier('la bibliothèque signale la partie en cours', etatRail === 'joue', `état = ${etatRail}`);
  const boutonMaintenant = await bibliotheque.locator('.jouer').textContent();
  verifier('le bouton devient « Revenir au jeu »',
    boutonMaintenant.trim() === 'Revenir au jeu', boutonMaintenant.trim());
  await bibliotheque.screenshot({ path: path.join(CAPTURES, '05-en-partie.png') });

  // --- fermeture depuis la bibliothèque ---
  console.log('\n--- fermeture ---');
  await bibliotheque.locator('.action-secondaire', { hasText: 'Fermer le jeu' }).click();
  await bibliotheque.waitForTimeout(2500);
  const apres = await entrees.nth(0).getAttribute('data-etat');
  verifier('la partie est bien terminée', apres !== 'joue', `état = ${apres}`);

  const lancements = await bibliotheque.locator('.fiche-ligne', { hasText: 'Lancements' })
    .locator('dd').textContent();
  verifier('le compteur de lancements a bougé', lancements.trim() === '1', lancements.trim());

  const derniere = await bibliotheque.locator('.fiche-ligne', { hasText: 'Dernière partie' })
    .locator('dd').textContent();
  verifier('la date de dernière partie est posée', derniere.trim() === "aujourd'hui", derniere.trim());

  await bibliotheque.screenshot({ path: path.join(CAPTURES, '06-apres-partie.png') });

  // --- persistance sur le disque ---
  console.log('\n--- persistance ---');
  const fichier = path.join(profil, 'donnees.json');
  await bibliotheque.waitForTimeout(1500);
  const existe = fs.existsSync(fichier);
  verifier('le fichier de données est écrit', existe, fichier);
  if (existe) {
    const d = JSON.parse(fs.readFileSync(fichier, 'utf8'));
    verifier('le dernier jeu est mémorisé', d.dernierJeu === 'worldblocks', String(d.dernierJeu));
    verifier('les statistiques sont enregistrées',
      d.jeux?.worldblocks?.lancements === 1, JSON.stringify(d.jeux?.worldblocks));
  }

  // --- erreurs de console ---
  await app.close();

  console.log(`\n===== ${ok.length} vérifications passées, ${ko.length} en échec`);
  if (ko.length) {
    for (const e of ko) console.log('  ECHEC :', e);
    process.exitCode = 1;
  }
  console.log('captures :', CAPTURES);
})().catch((e) => {
  console.error('\nPLANTAGE :', e.message);
  process.exitCode = 1;
});
