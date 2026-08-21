/**
 * Rend le favicon du site en PNG 1024 px, source de toutes les icônes.
 *
 * On passe par un vrai navigateur plutôt qu'une bibliothèque de rasterisation :
 * c'est le moteur qui affiche déjà le site, le dégradé et le coin arrondi ne
 * peuvent donc pas diverger de ce que voient les visiteurs.
 *
 *   NODE_PATH=C:/Dev/perso/villopia/node_modules node outils/icone-source.js
 */
'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const RACINE = path.join(__dirname, '..');
const SITE = path.join(RACINE, '..');
const SOURCE = path.join(SITE, 'favicon.svg');
const SORTIE = path.join(RACINE, 'ressources', 'icon-1024.png');

const COTE = 1024;

(async () => {
  if (!fs.existsSync(SOURCE)) {
    console.error('favicon introuvable :', SOURCE);
    process.exit(1);
  }

  let svg = fs.readFileSync(SOURCE, 'utf8');
  svg = svg.slice(svg.indexOf('<svg'));   // un prologue XML n'a pas sa place en HTML

  const page = `<!doctype html><meta charset="utf-8">
    <style>
      html,body{margin:0;padding:0;background:transparent}
      svg{display:block;width:${COTE}px;height:${COTE}px}
    </style>${svg}`;

  fs.mkdirSync(path.dirname(SORTIE), { recursive: true });

  const nav = await chromium.launch({ channel: 'msedge' });
  const onglet = await nav.newPage({
    viewport: { width: COTE, height: COTE },
    deviceScaleFactor: 1,
  });
  await onglet.setContent(page);
  await onglet.locator('svg').screenshot({ path: SORTIE, omitBackground: true });
  await nav.close();

  console.log('rendu :', SORTIE, `(${COTE}x${COTE})`);
})();
