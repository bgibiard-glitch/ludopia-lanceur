/**
 * Vérifie qu'un compte suspendu comprend ce qui lui arrive.
 *
 * Le service refuse la connexion avec `compte_suspendu`, le motif et le terme.
 * Encore faut-il que le lanceur les affiche. Sans cela la personne lit « pseudo
 * ou mot de passe incorrect », passe la soirée à réessayer, et écrit pour
 * signaler une panne qui n'en est pas une.
 *
 * On fabrique donc un vrai compte, on le suspend par la console de modération,
 * et on tente de s'y connecter depuis le lanceur, à la souris et au clavier.
 *
 *   CLE_MODERATION=... NODE_PATH=C:/Dev/perso/villopia/node_modules \
 *     node outils/verifier-suspension.js
 */
'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { _electron: electron } = require('playwright');

const RACINE = path.join(__dirname, '..');
const CAPTURES = path.join(__dirname, 'captures');
const SERVICE = process.env.BASE || 'https://ludopia-social.bgibiard.workers.dev';
const CLE = process.env.CLE_MODERATION || '';

const ok = [];
const ko = [];

function verifier(intitule, condition, detail = '') {
  (condition ? ok : ko).push(intitule + (detail ? ` — ${detail}` : ''));
  console.log(`  ${condition ? 'ok  ' : 'ECHEC'} ${intitule}${detail ? ` — ${detail}` : ''}`);
}

async function appel(methode, chemin, { corps, jeton, cle } = {}) {
  const r = await fetch(SERVICE + chemin, {
    method: methode,
    headers: {
      ...(corps ? { 'Content-Type': 'application/json' } : {}),
      ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
      ...(cle ? { 'X-Cle-Moderation': cle } : {}),
    },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  return { statut: r.status, donnees: await r.json().catch(() => null) };
}

(async () => {
  if (!CLE) {
    console.log('  CLE_MODERATION absente de l’environnement : rien à vérifier.');
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(CAPTURES, { recursive: true });
  const marque = Math.random().toString(36).slice(2, 8);
  const adresse = `suspendu-${marque}@exemple.fr`;
  const MDP = 'mot-de-passe-solide';

  // ------------------------------------------------------- un compte suspendu
  console.log('\n--- préparation : un compte, un signalement, une suspension ---');

  const victime = await appel('POST', '/compte', {
    corps: { pseudo: `Susp ${marque}`, courriel: adresse, motDePasse: MDP, machine: 'test' },
  });
  if (victime.statut !== 201) {
    console.log('  impossible de créer le compte :', JSON.stringify(victime.donnees));
    process.exitCode = 1;
    return;
  }
  verifier('compte créé', true, victime.donnees.pseudo);

  // Il faut un signalement pour prononcer une décision : la console ne suspend
  // pas dans le vide, et c'est voulu — une sanction part toujours d'un motif
  // écrit quelque part.
  const plaignant = await appel('POST', '/compte', {
    corps: { pseudo: `Plainte ${marque}`, courriel: `plainte-${marque}@exemple.fr`,
      motDePasse: MDP, machine: 'test' },
  });
  await appel('POST', '/amis/demande', {
    jeton: plaignant.donnees.jeton, corps: { code: victime.donnees.codeAmi },
  });
  await appel('POST', '/amis/reponse', {
    jeton: victime.donnees.jeton, corps: { id: plaignant.donnees.id, accepte: true },
  });
  await appel('POST', '/messages', {
    jeton: victime.donnees.jeton,
    corps: { vers: plaignant.donnees.id, texte: 'message de test' },
  });
  await appel('POST', '/signalement', {
    jeton: plaignant.donnees.jeton,
    corps: { id: victime.donnees.id, motif: `test automatique ${marque}` },
  });

  const console_ = await appel('GET', '/moderation/etat', { cle: CLE });
  const s = (console_.donnees?.signalements || [])
    .find((x) => x.motif === `test automatique ${marque}`);
  verifier('le signalement est visible en console', Boolean(s));

  const MOTIF = 'propos inacceptables envers un autre joueur';
  const decision = await appel('POST', '/moderation/decider', {
    cle: CLE,
    corps: { signalement: s.id, decision: 'suspension', motif: MOTIF, duree: '7' },
  });
  verifier('suspension prononcée pour sept jours', decision.statut === 200);

  // ------------------------------------------------------------- le lanceur
  console.log('\n--- ce que le lanceur montre ---');

  const profil = path.join(CAPTURES, 'profil-suspension');
  fs.rmSync(profil, { recursive: true, force: true });

  const binaire = require(path.join(RACINE, 'node_modules', 'electron'));
  const app = await electron.launch({
    executablePath: binaire,
    args: ['.', `--user-data-dir=${profil}`],
    cwd: RACINE,
  });

  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1800);

  // La fonction elle-même, dans son vrai contexte : c'est elle qui compose la
  // phrase, et l'éprouver directement dit tout de suite si le format du détail
  // est bien celui qu'attend le lanceur.
  const compose = await page.evaluate((d) => window.messageSuspension
    ? window.messageSuspension(d)
    : (typeof messageSuspension === 'function' ? messageSuspension(d) : null),
  JSON.stringify({ motif: 'un motif', jusqu: 1800000000 }));
  verifier('la phrase cite le motif et le terme',
    Boolean(compose) && compose.includes('un motif') && /\d{2}\/\d{2}\/\d{4}/.test(compose),
    compose || 'fonction introuvable');

  const sansTerme = await page.evaluate((d) => (typeof messageSuspension === 'function'
    ? messageSuspension(d) : null), JSON.stringify({ motif: 'sans fin' }));
  verifier('une suspension sans terme ne prétend pas en avoir un',
    Boolean(sansTerme) && !/\d{2}\/\d{2}\/\d{4}/.test(sansTerme), sansTerme);

  // Et maintenant le vrai chemin : l'écran des amis, le formulaire, la souris.
  await page.click('[data-vue="amis"], .rail-icone--amis, [data-rail="amis"]')
    .catch(async () => {
      // Le rail des chats a changé de forme au fil des versions ; on retombe
      // sur le premier bouton qui mène aux amis plutôt que d'échouer sur un
      // sélecteur périmé.
      await page.locator('button', { hasText: /amis|friends/i }).first().click();
    });
  await page.waitForTimeout(900);

  const champs = page.locator('form input');
  const combien = await champs.count();
  verifier('le formulaire de connexion est affiché', combien >= 2, `${combien} champs`);

  await champs.nth(0).fill(adresse);
  await champs.nth(1).fill(MDP);
  await page.locator('form button[type=submit]').click();
  await page.waitForTimeout(3500);

  const bulle = await page.locator('form .bulle').first().textContent().catch(() => null);
  verifier('le lanceur dit que le compte est suspendu',
    Boolean(bulle) && /suspendu/i.test(bulle), bulle);
  verifier('il en donne le motif', Boolean(bulle) && bulle.includes(MOTIF), bulle);
  verifier('il en donne le terme', Boolean(bulle) && /\d{2}\/\d{2}\/\d{4}/.test(bulle));
  verifier('il ne parle pas de mot de passe incorrect',
    Boolean(bulle) && !/incorrect/i.test(bulle));

  await page.screenshot({ path: path.join(CAPTURES, 'lanceur-suspension.png') });
  await app.close();

  // ------------------------------------------------------------- on nettoie
  console.log('\n--- on ne laisse rien derrière ---');
  await appel('POST', '/moderation/retablir', {
    cle: CLE, corps: { compte: victime.donnees.id, motif: 'fin du test' },
  });
  const revenu = await appel('POST', '/session', {
    corps: { identifiant: adresse, motDePasse: MDP },
  });
  verifier('le compte est rétabli', revenu.statut === 200);
  await appel('DELETE', '/moi', { jeton: revenu.donnees?.jeton });
  await appel('DELETE', '/moi', { jeton: plaignant.donnees.jeton });

  console.log(`\n===== ${ok.length} vérifications passées, ${ko.length} en échec`);
  if (ko.length) {
    for (const e of ko) console.log('  ECHEC :', e);
    process.exitCode = 1;
  }
})().catch((e) => { console.error('\nPLANTAGE :', e.message); process.exitCode = 1; });
