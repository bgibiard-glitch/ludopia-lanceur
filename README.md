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
gh release create v1.2.0 dist/*.exe dist/latest.yml --repo bgibiard-glitch/ludopia-lanceur
python outils/publier-github.py --index
python ../tools/gen-page-telecharger.py
```

Les installateurs vivent dans les releases GitHub : Cloudflare Pages plafonne à
25 Mo par fichier et un paquet Electron pèse quatre fois plus. Le site n'héberge
que `assets/telechargements.json`, qui pointe vers eux et porte les compteurs de
téléchargement — la page « Télécharger » se remplit seule à partir de ce fichier.

**`latest.yml` doit accompagner l'installateur** dans la release : c'est le flux
que lit `electron-updater`. Sans lui, les lanceurs déjà installés cherchent une
mise à jour et ne trouvent rien.

`outils/publier-r2.py` fait la même chose sur Cloudflare R2, si l'on préfère un
hébergement privé. R2 doit alors être activé sur le compte.

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

### Les amis et la messagerie

`src/social.js` relie le lanceur au service social — voir `serveur/README.md`.

Tout passe par le processus principal : l'interface n'a ni le jeton de session,
ni l'adresse du service. Elle demande « la liste des amis » et reçoit la liste.
Un défaut d'affichage ne peut donc pas faire fuiter la session, et la fenêtre
garde sa politique `connect-src 'none'`.

Le jeton est chiffré par le système quand celui-ci le propose (`safeStorage` :
DPAPI sur Windows, trousseau sur macOS). Sans cela il resterait lisible en clair
dans le dossier utilisateur.

On interroge le service toutes les cinq secondes quand une conversation est
ouverte, plus lentement sinon. Une connexion permanente exigerait des Durable
Objects, donc un plan payant, pour un gain imperceptible sur une conversation à
deux.

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
nombre de lancements, date de dernière partie, position des fenêtres, langue
choisie, et la session sociale (chiffrée).

**Une mise à jour ne remet jamais ces compteurs à zéro.** Les données vivent
dans `%APPDATA%\Ludopia` alors que le programme s'installe dans
`%LOCALAPPDATA%\Programs\Ludopia` : l'installateur ne touche pas le premier
dossier. C'est structurel, pas un réglage.

Le temps de jeu ne quitte pas la machine. Ce qui part au service, une fois
connecté, se limite au pseudo, au code ami, aux messages, et au jeu ouvert —
pour que les amis le voient.

## Signature

Les binaires ne sont pas signés. Au premier lancement, Windows affiche
SmartScreen (« éditeur inconnu ») et macOS refuse l'ouverture par double-clic —
il faut passer par *clic droit → Ouvrir*. Y remédier demande un certificat
Authenticode annuel et, côté Apple, une adhésion au programme développeur.
