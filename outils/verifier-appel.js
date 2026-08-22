/**
 * Un vrai appel entre deux lanceurs.
 *
 * Deux instances, deux profils, deux comptes amis. L'une appelle, l'autre
 * décroche, et l'on vérifie que des octets audio arrivent réellement de l'autre
 * côté. C'est la seule preuve qui vaille : une interface qui affiche « appel en
 * cours » sans qu'un son circule est exactement le genre de chose qu'on ne
 * découvre qu'au premier vrai usage.
 *
 * Le micro est simulé — `--use-fake-device-for-media-stream` fournit un signal
 * de test à la place d'un vrai périphérique. Sans lui, la vérification
 * dépendrait du matériel de la machine, et échouerait sur un serveur comme sur
 * un portable au micro désactivé.
 *
 *   NODE_PATH=C:/Dev/perso/villopia/node_modules node outils/verifier-appel.js
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

async function appel(methode, chemin, { jeton, corps } = {}) {
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

/** Une instance du lanceur, sur son propre profil et avec un micro simulé. */
async function lancer(nom) {
  const profil = path.join(CAPTURES, `profil-appel-${nom}`);
  fs.rmSync(profil, { recursive: true, force: true });

  const binaire = require(path.join(RACINE, 'node_modules', 'electron'));
  const app = await electron.launch({
    executablePath: binaire,
    args: [
      '.',
      `--user-data-dir=${profil}`,
      // Un micro de synthèse, et l'autorisation accordée sans boîte de
      // dialogue : sans cela le test dépendrait du matériel et d'un clic.
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
    ],
    cwd: RACINE,
  });

  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  page.on('pageerror', (e) => console.log(`    [${nom}] erreur de page : ${e.message}`));
  await page.waitForTimeout(1800);
  return { app, page };
}

/** Se connecte par le formulaire, comme un utilisateur. */
async function seConnecter(page, adresse) {
  await page.locator('.rail-chat, [data-vue="amis"], .rail-icone--amis').first().click()
    .catch(async () => {
      await page.locator('button', { hasText: /amis|friends/i }).first().click();
    });
  await page.waitForTimeout(700);

  const champs = page.locator('form input');
  await champs.nth(0).fill(adresse);
  await champs.nth(1).fill(MDP);
  await page.locator('form button[type=submit]').click();
  await page.waitForTimeout(3000);
}

/** L'état interne de l'appel, réduit à ce qui se sérialise. */
function etatAppel(page) {
  return page.evaluate(async () => {
    if (typeof appel === 'undefined' || !appel) return null;
    let recus = 0;
    let envoyes = 0;
    try {
      const stats = await appel.pc.getStats();
      stats.forEach((s) => {
        if (s.type === 'inbound-rtp' && s.kind === 'audio') recus = s.bytesReceived || 0;
        if (s.type === 'outbound-rtp' && s.kind === 'audio') envoyes = s.bytesSent || 0;
      });
    } catch { /* pas encore de statistiques */ }
    return {
      etat: appel.etat,
      role: appel.role,
      muet: appel.muet,
      connexion: appel.pc?.connectionState || null,
      glace: appel.pc?.iceConnectionState || null,
      recus,
      envoyes,
    };
  });
}

/** Attend qu'une condition sur l'état devienne vraie, ou renonce. */
async function attendre(page, condition, limite = 25000) {
  const fin = Date.now() + limite;
  let dernier = null;
  while (Date.now() < fin) {
    dernier = await etatAppel(page);
    if (dernier && condition(dernier)) return dernier;
    await new Promise((f) => { setTimeout(f, 500); });
  }
  return dernier;
}

(async () => {
  fs.mkdirSync(CAPTURES, { recursive: true });

  // ------------------------------------------------------------- les comptes
  console.log('\n--- deux comptes amis ---');
  const adresseA = `appel-a-${marque}@exemple.fr`;
  const adresseB = `appel-b-${marque}@exemple.fr`;

  const a = await appel('POST', '/compte', {
    corps: { pseudo: `Appel A ${marque}`, courriel: adresseA, motDePasse: MDP, machine: 'test' },
  });
  if (a.statut !== 201) {
    console.log('  création impossible :', JSON.stringify(a.donnees));
    process.exitCode = 1;
    return;
  }
  const b = await appel('POST', '/compte', {
    corps: { pseudo: `Appel B ${marque}`, courriel: adresseB, motDePasse: MDP, machine: 'test' },
  });
  verifier('les deux comptes existent', a.statut === 201 && b.statut === 201);

  await appel('POST', '/amis/demande', {
    jeton: a.donnees.jeton, corps: { code: b.donnees.codeAmi },
  });
  const lien = await appel('POST', '/amis/reponse', {
    jeton: b.donnees.jeton, corps: { id: a.donnees.id, accepte: true },
  });
  verifier('ils sont amis', lien.statut === 200);

  // ------------------------------------------------------------ les lanceurs
  console.log('\n--- deux lanceurs ---');
  const A = await lancer('a');
  const B = await lancer('b');
  verifier('les deux lanceurs sont ouverts', true);

  await seConnecter(A.page, adresseA);
  await seConnecter(B.page, adresseB);

  const connecteA = await A.page.evaluate(() => Boolean(etat.social?.connecte));
  const connecteB = await B.page.evaluate(() => Boolean(etat.social?.connecte));
  verifier('A est connecté', connecteA);
  verifier('B est connecté', connecteB);

  if (!connecteA || !connecteB) {
    await A.page.screenshot({ path: path.join(CAPTURES, 'appel-echec-a.png') });
    await B.page.screenshot({ path: path.join(CAPTURES, 'appel-echec-b.png') });
    await A.app.close();
    await B.app.close();
    console.log(`\n===== ${ok.length} passées, ${ko.length} en échec`);
    process.exitCode = 1;
    return;
  }

  // La présence : le bouton d'appel n'apparaît que si l'ami est en ligne.
  await A.page.evaluate(() => rafraichirAmis().then(dessinerAmis));
  await A.page.waitForTimeout(1500);

  // ------------------------------------------------------------- on appelle
  console.log('\n--- A appelle B ---');
  await A.page.evaluate((id) => ouvrirConversation(id), b.donnees.id);
  await A.page.waitForTimeout(1200);

  const bouton = A.page.locator('.conv-appel');
  const visible = await bouton.count();
  verifier('le bouton d’appel est proposé', visible === 1, `${visible} bouton(s)`);
  if (!visible) {
    const enLigne = await A.page.evaluate((id) => {
      const x = (etat.amis?.amis || []).find((y) => y.id === id);
      return x ? x.enLigne : 'ami introuvable';
    }, b.donnees.id);
    console.log('       B vu en ligne par A :', enLigne);
  }

  if (visible) await bouton.click();
  await A.page.waitForTimeout(1500);

  const sonne = await etatAppel(A.page);
  verifier('A est en sonnerie', sonne?.etat === 'sonne', JSON.stringify(sonne));

  // ------------------------------------------------------------ B décroche
  console.log('\n--- B décroche ---');
  const banniere = B.page.locator('#voix-entrant .voix-oui');
  await banniere.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  const affichee = await banniere.count();
  verifier('la bannière d’appel entrant s’affiche chez B', affichee === 1);
  await B.page.screenshot({ path: path.join(CAPTURES, 'appel-entrant.png') });

  if (affichee) await banniere.click();

  const etabliB = await attendre(B.page, (x) => x.connexion === 'connected', 30000);
  verifier('la connexion s’établit chez B', etabliB?.connexion === 'connected',
    JSON.stringify(etabliB));

  const etabliA = await attendre(A.page, (x) => x.connexion === 'connected', 15000);
  verifier('la connexion s’établit chez A', etabliA?.connexion === 'connected',
    JSON.stringify(etabliA));

  // ------------------------------------------------------ le son circule-t-il
  console.log('\n--- le son circule-t-il vraiment ---');
  const sonA = await attendre(A.page, (x) => x.recus > 0, 15000);
  const sonB = await attendre(B.page, (x) => x.recus > 0, 15000);
  verifier('A reçoit de l’audio de B', (sonA?.recus || 0) > 0, `${sonA?.recus} octets`);
  verifier('B reçoit de l’audio de A', (sonB?.recus || 0) > 0, `${sonB?.recus} octets`);
  verifier('A en envoie aussi', (sonA?.envoyes || 0) > 0, `${sonA?.envoyes} octets`);

  await A.page.screenshot({ path: path.join(CAPTURES, 'appel-en-cours.png') });

  // ------------------------------------------------------------- le micro
  console.log('\n--- couper le micro ---');
  await A.page.locator('#voix-barre .voix-mini').click();
  await A.page.waitForTimeout(600);
  const coupe = await A.page.evaluate(() => ({
    muet: appel?.muet,
    pistesActives: appel?.flux.getAudioTracks().filter((p) => p.enabled).length,
  }));
  verifier('le micro est coupé, et la piste vraiment désactivée',
    coupe.muet === true && coupe.pistesActives === 0, JSON.stringify(coupe));

  await A.page.locator('#voix-barre .voix-mini').click();
  await A.page.waitForTimeout(400);
  const remis = await A.page.evaluate(() => appel?.muet);
  verifier('et remis', remis === false);

  // ------------------------------------------------------------ on raccroche
  console.log('\n--- A raccroche ---');
  await A.page.locator('#voix-barre .voix-fin').click();
  await A.page.waitForTimeout(2500);

  const finA = await A.page.evaluate(() => (typeof appel === 'undefined' ? 'absent' : appel));
  verifier('l’appel est fermé chez A', finA === null, String(finA));

  const finB = await attendre(B.page, () => false, 6000);
  verifier('et chez B aussi, sans qu’il ait à cliquer', finB === null, String(finB));

  const barreB = await B.page.locator('#voix-barre').isHidden();
  verifier('la barre a disparu chez B', barreB);

  await A.app.close();
  await B.app.close();

  // ------------------------------------------------------------- on nettoie
  await appel('DELETE', '/moi', { jeton: a.donnees.jeton });
  await appel('DELETE', '/moi', { jeton: b.donnees.jeton });

  console.log(`\n===== ${ok.length} vérifications passées, ${ko.length} en échec`);
  if (ko.length) {
    for (const e of ko) console.log('  ECHEC :', e);
    process.exitCode = 1;
  }
})().catch((e) => { console.error('\nPLANTAGE :', e.message); process.exitCode = 1; });
