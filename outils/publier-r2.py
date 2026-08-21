# -*- coding: utf-8 -*-
"""Dépose les installateurs compilés sur Cloudflare R2.

Cloudflare Pages plafonne à 25 Mo par fichier : un installateur Electron n'y
tient pas. R2 sert de dépôt de fichiers, derrière le domaine `dl.ludopia.fr`.

Avant le premier passage, deux gestes à faire une seule fois dans le tableau
de bord Cloudflare :

  1. R2 → « Enable R2 » (l'offre gratuite couvre 10 Go et le trafic sortant
     n'est pas facturé, mais l'activation demande un moyen de paiement).
  2. Une fois le bucket créé par ce script :
     R2 → ludopia-telechargements → Settings → Public access →
     « Connect Domain » → `dl.ludopia.fr`.

Ensuite :

    python outils/publier-r2.py
"""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
DIST = RACINE / 'dist'
BUCKET = 'ludopia-telechargements'
DOMAINE = 'https://dl.ludopia.fr'
WRANGLER = r'C:\Users\BenoitGibiard\AppData\Roaming\npm\wrangler.cmd'

# Ce qu'on publie, et sous quel nom stable côté R2. Un nom versionné casserait
# les liens de la page « Télécharger » à chaque version ; on garde donc un nom
# fixe, et le numéro de version voyage dans `versions.json`.
MOTIFS = [
    ('*.exe',      'windows/Ludopia-Setup.exe',   'application/octet-stream'),
    ('*.dmg',      'macos/Ludopia.dmg',           'application/octet-stream'),
    ('*.AppImage', 'linux/Ludopia.AppImage',      'application/octet-stream'),
    ('*.deb',      'linux/ludopia.deb',           'application/vnd.debian.binary-package'),
]


def executer(args):
    r = subprocess.run(args, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def version():
    return json.loads((RACINE / 'package.json').read_text(encoding='utf-8'))['version']


def empreinte(chemin):
    """SHA-256, pour que quelqu'un puisse vérifier son téléchargement."""
    h = hashlib.sha256()
    with chemin.open('rb') as f:
        for bloc in iter(lambda: f.read(1 << 20), b''):
            h.update(bloc)
    return h.hexdigest()


def creer_bucket():
    code, sortie = executer([WRANGLER, 'r2', 'bucket', 'list'])
    if 'enable R2' in sortie or '10042' in sortie:
        sys.exit("R2 n'est pas activé sur le compte.\n"
                 "  Tableau de bord Cloudflare → R2 → « Enable R2 », puis relancer.")
    if code != 0:
        sys.exit('impossible de lister les buckets :\n' + sortie)
    if BUCKET in sortie:
        print(f'  bucket « {BUCKET} » déjà présent')
        return
    code, sortie = executer([WRANGLER, 'r2', 'bucket', 'create', BUCKET])
    if code != 0:
        sys.exit('création du bucket impossible :\n' + sortie)
    print(f'  bucket « {BUCKET} » créé')


def deposer():
    if not DIST.is_dir():
        sys.exit(f'rien à publier : {DIST} est absent. Compiler d\'abord.')

    publies = []
    for motif, cle, mime in MOTIFS:
        for fichier in sorted(DIST.glob(motif)):
            # electron-builder laisse des fichiers de mise à jour à côté ; on ne
            # publie que les installateurs.
            if fichier.name.endswith(('.blockmap', '.yml', '.yaml')):
                continue
            poids = fichier.stat().st_size
            print(f'  envoi {fichier.name} ({poids / 1_048_576:.1f} Mo) → {cle}')
            code, sortie = executer([
                WRANGLER, 'r2', 'object', 'put', f'{BUCKET}/{cle}',
                '--file', str(fichier), '--content-type', mime, '--remote',
            ])
            if code != 0:
                sys.exit('envoi impossible :\n' + sortie)
            publies.append({
                'cle': cle,
                'fichier': fichier.name,
                'octets': poids,
                'sha256': empreinte(fichier),
                'url': f'{DOMAINE}/{cle}',
            })
            break   # un seul fichier par motif : le premier trouvé

    return publies


def ecrire_index(publies):
    """Un petit index JSON, utile à la page « Télécharger » et au lanceur."""
    index = {'version': version(), 'fichiers': publies}
    cible = RACINE.parent / 'assets' / 'telechargements.json'
    cible.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('  index écrit :', cible)
    return index


def main():
    print(f'lanceur Ludopia v{version()}')
    creer_bucket()
    publies = deposer()
    if not publies:
        sys.exit('aucun installateur trouvé dans dist/')
    index = ecrire_index(publies)
    print()
    print('Publié :')
    for f in index['fichiers']:
        print(f"  {f['url']}   ({f['octets'] / 1_048_576:.1f} Mo)")
    print()
    print('Si le domaine public n\'est pas encore branché :')
    print(f'  R2 → {BUCKET} → Settings → Public access → Connect Domain → dl.ludopia.fr')


if __name__ == '__main__':
    main()
