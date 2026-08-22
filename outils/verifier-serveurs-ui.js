/**
 * Les serveurs, à travers l'interface — deux vraies instances.
 *
 * A crée un serveur public au clavier et à la souris. B le trouve dans
 * l'annuaire, entre, et les deux échangent des messages dans le salon
 * général. C'est le parcours qu'un joueur fera réellement, et c'est donc le
 * seul qui prouve quelque chose : les 43 vérifications côté service ne disent
 * rien d'un bouton mal câblé.
 *
 *   NODE_PATH=C:/Dev/perso/villopia/node_modules node outils/verifier-serveurs-ui.js
 */
'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { _electron: electron } = require('playwright');

const RACINE = path.join(__dirname, '..');
const CAPTURES = path.join(__dirname, 'captures');
const SERVICE = process.env.BASE || 'https://ludopia-social.bgibiard.workers.dev';

const ok = [];
const ko = [];

function verifier(intitule, condition, detail = '') {
  (condition ? ok : ko).push(intitule + (detail ? ` — ${detail}` : ''));
  console.log(`  ${condition ? 'ok  ' : 'ECHEC'} ${intitule}${detail ? ` — ${detail}` : ''}`);
}

async function service(methode, chemin, { jeton, corps } = {}) {
  const r = await fetch(SERVICE + chemin, {
    method: methode,
    headers: {
      ...(corps ? { 'Content-Type': 'application/json' } : {}),
      ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
    },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  return { statut: r.status, donnees: await r.json().catch(() => null) };
}

const marque = Math.random().toString(36).slice(2, 8);
const MDP = 'mot-de-passe-solide';

async function lancer(nom) {
  const profil = path.join(CAPTURES, `profil-srvui-${nom}`);
  fs.rmSync(profil, { recursive: true, force: true });
  const binaire = require(path.join(RACINE, 'node_modules', 'electron'));
  const app = await electron.launch({
    executablePath: binaire,
    args: ['.', `--user-data-dir=${profil}`,
      '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
    cwd: RACINE,
  });
  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  page.on('pageerror', (e) => console.log(`    [${nom}] erreur de page : ${e.message}`));
  await page.waitForTimeout(1800);
  return { app, page };
}

async function seConnecter(page, adresse) {
  await page.locator('#amis').click();
  await page.waitForTimeout(700);
  const champs = page.locator('form input');
  await champs.nth(0).fill(adresse);
  await champs.nth(1).fill(MDP);
  await page.locator('form button[type=submit]').click();
  await page.waitForTimeout(3200);
}

(async () => {
  fs.mkdirSync(CAPTURES, { recursive: true });

  console.log('\n--- deux comptes ---');
  const adresseA = `srvui-a-${marque}@exemple.fr`;
  const adresseB = `srvui-b-${marque}@exemple.fr`;
  const a = await service('POST', '/compte', {
    corps: { pseudo: `Fond ${marque}`, courriel: adresseA, motDePasse: MDP, machine: 'test' },
  });
  const b = await service('POST', '/compte', {
    corps: { pseudo: `Venu ${marque}`, courriel: adresseB, motDePasse: MDP, machine: 'test' },
  });
  if (a.statut !== 201 || b.statut !== 201) {
    console.log('  création impossible :', JSON.stringify(a.donnees || b.donnees));
    process.exitCode = 1;
    return;
  }
  verifier('comptes créés', true);

  console.log('\n--- A crée un serveur, au clavier ---');
  const A = await lancer('a');
  await seConnecter(A.page, adresseA);

  const connecte = await A.page.evaluate(() => Boolean(etat.social?.connecte));
  verifier('A est connecté', connecte);

  // Le bouton « + » de la colonne mène à l'annuaire.
  await A.page.locator('.chat-pastille--plus').click();
  await A.page.waitForTimeout(1200);
  verifier('l’annuaire s’ouvre', await A.page.locator('.srv-annuaire').count() === 1);

  await A.page.locator('button', { hasText: 'Créer un serveur' }).first().click();
  await A.page.waitForTimeout(600);

  await A.page.locator('.srv-form input[type=text]').fill(`Les Batisseurs ${marque}`);
  await A.page.locator('.srv-form textarea')
    .fill('Un serveur de test fabriqué par la vérification automatique, pour les plans de ville.');
  await A.page.locator('.srv-visi', { hasText: 'Ouvert à tous' }).click();
  await A.page.locator('.srv-form button[type=submit]').click();
  await A.page.waitForTimeout(3000);

  const ouvert = await A.page.evaluate(() => ({
    vue: etat.vue,
    serveur: srv.contenu?.serveur?.nom,
    salons: (srv.contenu?.salons || []).map((x) => x.nom),
  }));
  verifier('le serveur s’ouvre après création', ouvert.vue === 'serveur', ouvert.serveur);
  verifier('ses trois salons sont dans la colonne', ouvert.salons.length === 3,
    ouvert.salons.join(', '));
  await A.page.screenshot({ path: path.join(CAPTURES, 'srv-cree.png') });

  console.log('\n--- A écrit dans le salon général ---');
  await A.page.locator('.srv-ecrire input').fill('Bienvenue chez les bâtisseurs !');
  await A.page.locator('.srv-ecrire button[type=submit]').click();
  await A.page.waitForTimeout(1500);
  const messagesA = await A.page.evaluate(() => srv.messages.map((m) => m.texte));
  verifier('le message est dans le fil', messagesA.includes('Bienvenue chez les bâtisseurs !'));

  console.log('\n--- B le trouve dans l’annuaire et entre ---');
  const B = await lancer('b');
  await seConnecter(B.page, adresseB);

  await B.page.locator('.chat-pastille--plus').click();
  await B.page.waitForTimeout(2000);

  const carte = B.page.locator('.srv-carte', { hasText: `Batisseurs ${marque}` });
  verifier('le serveur figure dans l’annuaire de B', await carte.count() === 1);
  await B.page.screenshot({ path: path.join(CAPTURES, 'srv-annuaire.png') });

  await carte.locator('button', { hasText: 'Entrer' }).click();
  await B.page.waitForTimeout(3000);

  const chezB = await B.page.evaluate(() => ({
    vue: etat.vue,
    nom: srv.contenu?.serveur?.nom,
    messages: srv.messages.map((m) => m.texte),
  }));
  verifier('B est dans le serveur', chezB.vue === 'serveur', chezB.nom);
  verifier('B lit le message de A sans avoir été inscrit au salon',
    chezB.messages.includes('Bienvenue chez les bâtisseurs !'));

  console.log('\n--- B répond, A le reçoit sans rien toucher ---');
  await B.page.locator('.srv-ecrire input').fill('Merci, content d’être là.');
  await B.page.locator('.srv-ecrire button[type=submit]').click();
  await B.page.waitForTimeout(4000);

  const recuParA = await A.page.evaluate(() => srv.messages.map((m) => m.texte));
  verifier('A reçoit la réponse par l’attente longue',
    recuParA.includes('Merci, content d’être là.'), `${recuParA.length} messages`);

  const filA = await A.page.locator('.srv-msg').count();
  verifier('le fil de A est dessiné', filA >= 2, `${filA} messages affichés`);
  await A.page.screenshot({ path: path.join(CAPTURES, 'srv-conversation.png') });

  console.log('\n--- la liste des membres ---');
  await A.page.locator('.srv-bandeau-outils .btn-mini', { hasText: 'Membres' }).click();
  await A.page.waitForTimeout(1500);
  const membres = await A.page.locator('.membre').count();
  verifier('les deux membres sont listés', membres === 2, `${membres} affichés`);

  console.log('\n--- le vocal, avec de vrais micros simulés ---');
  await A.page.locator('.srv-salon[data-sorte=vocal]').click();
  await A.page.waitForTimeout(700);
  await A.page.locator('.srv-salle-barre button').click();
  await A.page.waitForTimeout(2500);
  const enVocalA = await A.page.evaluate(() => Boolean(typeof salle !== 'undefined' && salle));
  verifier('A entre en vocal', enVocalA);

  await B.page.locator('.srv-salon[data-sorte=vocal]').click();
  await B.page.waitForTimeout(700);
  await B.page.locator('.srv-salle-barre button').click();

  /* On attend la condition, pas un délai : l'établissement prend de quatre à
     dix secondes selon l'humeur des longs sondages, et un délai fixe fait un
     test qui ment dans les deux sens. */
  const fin = Date.now() + 30000;
  let pret = false;
  while (Date.now() < fin && !pret) {
    pret = await B.page.evaluate(() => {
      if (typeof salle === 'undefined' || !salle) return false;
      for (const [, pair] of salle.pairs) {
        if (pair.pc.connectionState === 'connected') return true;
      }
      return false;
    });
    if (!pret) await B.page.waitForTimeout(800);
  }
  await B.page.waitForTimeout(1500); // le temps que des octets circulent

  const liaisons = await B.page.evaluate(async () => {
    if (typeof salle === 'undefined' || !salle) return { present: false };
    const etats = [];
    for (const [, pair] of salle.pairs) etats.push(pair.pc.connectionState);
    let recus = 0;
    for (const [, pair] of salle.pairs) {
      const stats = await pair.pc.getStats();
      stats.forEach((s) => {
        if (s.type === 'inbound-rtp' && s.kind === 'audio') recus += s.bytesReceived || 0;
      });
    }
    return { present: true, etats, recus };
  });
  verifier('B est en vocal avec une liaison vers A',
    liaisons.present && liaisons.etats.length === 1, JSON.stringify(liaisons.etats));
  verifier('la liaison s’établit', (liaisons.etats || []).includes('connected'));
  verifier('de l’audio circule dans la salle', (liaisons.recus || 0) > 0,
    `${liaisons.recus} octets`);
  await B.page.screenshot({ path: path.join(CAPTURES, 'srv-vocal.png') });

  await A.app.close();
  await B.app.close();

  // --- on nettoie ---
  await service('DELETE', '/moi', { jeton: a.donnees.jeton });
  await service('DELETE', '/moi', { jeton: b.donnees.jeton });

  console.log(`\n===== ${ok.length} vérifications passées, ${ko.length} en échec`);
  if (ko.length) {
    for (const e of ko) console.log('  ECHEC :', e);
    process.exitCode = 1;
  }
})().catch((e) => { console.error('\nPLANTAGE :', e.message); process.exitCode = 1; });
