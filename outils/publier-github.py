# -*- coding: utf-8 -*-
"""Publie les installateurs compilés dans une release GitHub, puis met à jour
la page « Télécharger » du site.

Cloudflare Pages plafonne à 25 Mo par fichier : un installateur Electron n'y
tient pas. Les binaires vivent donc dans les releases du dépôt
`bgibiard-glitch/ludopia-lanceur`, et le site n'héberge qu'un index JSON qui
pointe vers eux.

    python outils/publier-github.py            # publie la version de package.json
    python outils/publier-github.py --index    # se contente de relire la release

Après quoi, régénérer les pages :

    python ../tools/gen-page-telecharger.py
"""
import argparse
import hashlib
import json
import pathlib
import subprocess
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
SITE = RACINE.parent
DIST = RACINE / 'dist'
DEPOT = 'bgibiard-glitch/ludopia-lanceur'

# Motif de fichier -> famille de système, telle que la page l'attend.
FAMILLES = [('*.exe', 'windows'), ('*.dmg', 'macos'),
            ('*.AppImage', 'linux'), ('*.deb', 'linux')]


def gh(*args):
    r = subprocess.run(['gh', *args], capture_output=True, text=True,
                       encoding='utf-8', errors='replace')
    if r.returncode != 0:
        sys.exit(f"échec de « gh {' '.join(args)} » :\n{r.stderr.strip()}")
    return r.stdout


def version():
    return json.loads((RACINE / 'package.json').read_text(encoding='utf-8'))['version']


def empreinte(chemin):
    h = hashlib.sha256()
    with chemin.open('rb') as f:
        for bloc in iter(lambda: f.read(1 << 20), b''):
            h.update(bloc)
    return h.hexdigest()


def a_publier():
    """Les installateurs de LA version courante, hors fichiers annexes.

    Le filtre sur la version n'est pas un raffinement : `dist/` garde les
    paquets des compilations précédentes, et sans lui la release v2.3.0 s'est
    retrouvée avec l'installateur de la 2.2.0, puis la v2.4.0 avec ceux de la
    2.3.0. Une page de téléchargement qui propose trois versions n'inspire
    rien de bon.
    """
    v = version()
    trouves = []
    for motif, famille in FAMILLES:
        for f in sorted(DIST.glob(motif)):
            if f.name.endswith(('.blockmap', '.yml', '.yaml')):
                continue
            if v not in f.name:
                continue
            trouves.append((f, famille))
    return trouves


def creer_release(tag, fichiers):
    existe = subprocess.run(['gh', 'release', 'view', tag, '--repo', DEPOT],
                            capture_output=True, text=True).returncode == 0
    chemins = [str(f) for f, _ in fichiers]
    if existe:
        print(f'  release {tag} déjà là — envoi des fichiers manquants')
        gh('release', 'upload', tag, *chemins, '--repo', DEPOT, '--clobber')
    else:
        sys.exit(f"la release {tag} n'existe pas.\n"
                 f"  La créer d'abord : gh release create {tag} <fichiers> --repo {DEPOT}")


def relire_release(tag):
    """Relit la release publiée : c'est elle qui fait foi, pas dist/."""
    brut = gh('release', 'view', tag, '--repo', DEPOT,
              '--json', 'assets,url,tagName,publishedAt')
    return json.loads(brut)


def toutes_les_releases():
    """Le total des telechargements, toutes versions confondues.

    Le compteur d'une release ne concerne que ses propres fichiers : sans la
    somme, chaque publication remettrait le chiffre affiche sur le site a zero.
    """
    brut = gh('release', 'list', '--repo', DEPOT, '--json', 'tagName', '--limit', '50')
    total = 0
    versions = []
    for r in json.loads(brut):
        d = json.loads(gh('release', 'view', r['tagName'], '--repo', DEPOT,
                          '--json', 'assets,publishedAt,tagName'))
        n = sum(a.get('downloadCount', 0) for a in d['assets'])
        total += n
        versions.append({'tag': d['tagName'], 'date': d['publishedAt'][:10],
                         'telechargements': n})
    return total, versions


def construire_index(tag, release):
    """Associe chaque fichier de la release à sa famille de système."""
    par_nom = {}
    for f, famille in a_publier():
        par_nom[f.name] = (famille, empreinte(f))

    fichiers = []
    for a in release['assets']:
        nom = a['name']
        famille, sha = par_nom.get(nom, (None, None))
        if not famille:
            # Un fichier publié à la main, dont on n'a pas la source locale :
            # on déduit la famille de l'extension plutôt que de l'ignorer.
            for motif, f2 in FAMILLES:
                if nom.endswith(motif.lstrip('*')):
                    famille = f2
                    break
        if not famille:
            continue
        fichiers.append({
            'cle': f'{famille}/{nom}',
            'fichier': nom,
            'octets': a['size'],
            'sha256': sha,
            'telechargements': a.get('downloadCount', 0),
            'url': a['url'],
        })

    total, versions = toutes_les_releases()

    return {'version': version(), 'tag': tag, 'release': release['url'],
            'depot': f'https://github.com/{DEPOT}',
            'publie': release.get('publishedAt', '')[:10],
            'telechargements': total,
            'versions': versions,
            'fichiers': fichiers}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--index', action='store_true',
                    help='ne rien envoyer, relire simplement la release publiée')
    opts = ap.parse_args()

    tag = f'v{version()}'
    print(f'lanceur Ludopia {tag}')

    if not opts.index:
        fichiers = a_publier()
        if not fichiers:
            sys.exit(f'aucun installateur dans {DIST}. Compiler d\'abord.')
        for f, famille in fichiers:
            print(f'  {famille:8} {f.name}  ({f.stat().st_size / 1_048_576:.1f} Mo)')
        creer_release(tag, fichiers)

    index = construire_index(tag, relire_release(tag))
    cible = SITE / 'assets' / 'telechargements.json'
    cible.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    print()
    print('index écrit :', cible)
    for f in index['fichiers']:
        print(f"  {f['cle']:12} {f['octets'] / 1_048_576:.1f} Mo  {f['url']}")
    print()
    print('Régénérer les pages :  python tools/gen-page-telecharger.py')


if __name__ == '__main__':
    main()
