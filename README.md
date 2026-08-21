# Le lanceur Ludopia

Une application de bureau qui rassemble les jeux du studio : la bibliothèque
d'un côté, une fenêtre dédiée par jeu de l'autre. Windows, macOS et Linux.

Les jeux **ne sont pas téléchargés**. Ils restent hébergés en ligne et se
mettent à jour en continu ; le lanceur est la fenêtre, pas le jeu. C'est ce qui
lui permet de peser une poignée de mégaoctets et de ne jamais demander de
correctif.

## Démarrer en développement

```bash
npm install
npm start
```

> ⚠️ Si `npm start` affiche `Cannot read properties of undefined (reading 'app')`,
> c'est que la variable d'environnement `ELECTRON_RUN_AS_NODE=1` traîne dans le
> terminal : Electron démarre alors comme un simple Node et n'expose aucune API
> de fenêtre. Lancer `env -u ELECTRON_RUN_AS_NODE npm start`.

## Vérifier

```bash
NODE_PATH=C:/Dev/perso/villopia/node_modules node outils/verifier.js
```

Le script démarre vraiment l'application sur un profil jetable, ouvre la
bibliothèque, bascule la langue, lance World Blocks, vérifie que le temps de
jeu et le compteur de lancements bougent, referme, et relit le fichier de
données écrit sur le disque. Les captures atterrissent dans `outils/captures/`.

## Compiler

Les icônes se fabriquent depuis le favicon du site :

```bash
NODE_PATH=C:/Dev/perso/villopia/node_modules node outils/icone-source.js
python outils/icones.py
```

Puis :

```bash
npm run windows     # NSIS, un installateur par architecture
npm run macos       # DMG — à lancer depuis un Mac
npm run linux       # AppImage et .deb
```

**macOS ne se compile pas depuis Windows** : le format `.icns`, la signature et
la notarisation exigent les outils d'Apple. Il faut un Mac, ou un exécuteur
macOS d'intégration continue.

## Publier

```bash
python outils/publier-r2.py
```

Dépose les installateurs sur Cloudflare R2 derrière `dl.ludopia.fr` et écrit
`assets/telechargements.json` à la racine du site. À n'utiliser que si les
fichiers dépassent 25 Mo — en deçà, ils tiennent directement sur Cloudflare
Pages, ce qui évite d'activer R2.

## Comment c'est bâti

```
src/
  principal.js        processus principal : fenêtres, catalogue, temps de jeu
  preload.js          passerelle : quelques verbes précis, pas d'IPC brut
  donnees.js          magasin JSON dans le dossier utilisateur
  interface/          la bibliothèque (HTML, CSS, JS sans dépendance)
catalogue.json        les jeux, leurs couleurs, leurs textes bilingues
ressources/           icônes et droits macOS
outils/               icônes, vérification, publication
```

### Le catalogue

`catalogue.json` est livré avec l'application **et** publié sur
`https://ludopia.fr/assets/catalogue-jeux.json`. Au démarrage, le lanceur
affiche d'abord la copie locale, puis tente la version en ligne : un nouveau jeu
apparaît donc dans la bibliothèque sans réinstallation. Si le réseau ne répond
pas, la copie locale fait foi.

Les chemins d'images ne viennent jamais du catalogue distant — les fichiers ne
sont présents que dans l'application. Un jeu inconnu du paquet installé
s'affiche donc sans visuel plutôt qu'avec une image cassée.

### Ce qui protège l'utilisateur

- `contextIsolation`, `sandbox`, pas de `nodeIntegration` : aucune fenêtre n'a
  accès à Node.
- Chaque fenêtre de jeu est **bridée à l'origine de son jeu**. Un lien vers
  l'extérieur part dans le navigateur du système — jamais dans une fenêtre sans
  barre d'adresse, où l'utilisateur ne pourrait pas voir où il se trouve.
- Micro, caméra et position sont refusés d'office.
- Chaque jeu a sa propre partition de session : les cookies ne se mélangent pas.
- L'interface de la bibliothèque tourne sous une CSP `default-src 'none'` avec
  `connect-src 'none'` : elle ne peut joindre aucun réseau par elle-même, tout
  passe par la passerelle.

### Ce qui est écrit sur le disque

Dans `donnees.json`, au sein du dossier utilisateur d'Electron : temps de jeu,
nombre de lancements, date de dernière partie, position des fenêtres et langue
choisie. Rien n'est envoyé à Ludopia.

## Signature

Les binaires ne sont pas signés. Au premier lancement, Windows affiche
SmartScreen (« éditeur inconnu ») et macOS refuse l'ouverture par double-clic —
il faut passer par *clic droit → Ouvrir*. Y remédier demande un certificat
Authenticode annuel et, côté Apple, une adhésion au programme développeur.
