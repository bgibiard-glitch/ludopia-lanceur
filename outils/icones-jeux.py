# -*- coding: utf-8 -*-
"""Récupère les vraies icônes des jeux depuis leurs manifestes PWA.

Le lanceur affichait des logos redessinés pour le site. Chaque jeu publie déjà
son icône d'application dans son `manifest.webmanifest` — c'est celle que voient
les joueurs sur leur écran d'accueil, et c'est donc la bonne.

    python outils/icones-jeux.py
"""
import io
import json
import sys
import pathlib
import urllib.request
import urllib.parse

from PIL import Image

RACINE = pathlib.Path(__file__).resolve().parent.parent
MEDIAS = RACINE / 'src' / 'interface' / 'medias' / 'icones'
CATALOGUES = [RACINE / 'catalogue.json', RACINE.parent / 'assets' / 'catalogue-jeux.json']

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')

COTE = 256   # largement assez : le rail les affiche en 34 px, l'affiche en 52 px


def lire(url, delai=25):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=delai) as r:
        return r.read()


def manifeste(base):
    """Trouve et lit le manifeste, quel que soit son nom."""
    page = lire(base).decode('utf-8', 'replace')
    import re
    m = re.search(r'<link[^>]+rel="manifest"[^>]+href="([^"]+)"', page) \
        or re.search(r'<link[^>]+href="([^"]+)"[^>]+rel="manifest"', page)
    if not m:
        return None
    return json.loads(lire(urllib.parse.urljoin(base, m.group(1))))


def meilleure_icone(man, base):
    """La plus grande icône déclarée : on réduit ensuite, jamais l'inverse."""
    def surface(i):
        t = (i.get('sizes') or '0x0').split(' ')[0]
        try:
            l, h = t.lower().split('x')
            return int(l) * int(h)
        except ValueError:
            return 0

    icones = sorted(man.get('icons') or [], key=surface, reverse=True)
    if not icones:
        return None
    return urllib.parse.urljoin(base, icones[0]['src'])


def main():
    # La console Windows est en cp1252 : une fleche ou un accent dans un message
    # ferait echouer le print, et l'echec serait pris pour un echec de
    # telechargement.
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    MEDIAS.mkdir(parents=True, exist_ok=True)
    catalogue = json.loads(CATALOGUES[0].read_text(encoding='utf-8'))
    recuperees = {}

    for jeu in catalogue['jeux']:
        if not jeu.get('url'):
            print(f"  {jeu['id']:12} pas de site — on garde le logo dessiné")
            continue
        try:
            man = manifeste(jeu['url'])
            if not man:
                print(f"  {jeu['id']:12} pas de manifeste")
                continue
            src = meilleure_icone(man, jeu['url'])
            if not src:
                print(f"  {jeu['id']:12} manifeste sans icône")
                continue

            im = Image.open(io.BytesIO(lire(src))).convert('RGBA')
            origine = f'{im.width}x{im.height}'
            if im.width > COTE:
                im = im.resize((COTE, COTE), Image.LANCZOS)
            cible = MEDIAS / f"{jeu['id']}.png"
            im.save(cible, 'PNG', optimize=True)

            recuperees[jeu['id']] = f'medias/icones/{jeu["id"]}.png'
            print(f"  {jeu['id']:12} {origine} → {im.width}x{im.height}  "
                  f"({cible.stat().st_size / 1024:.0f} Ko)  depuis {man.get('name', '?')}")
        except Exception as err:
            print(f"  {jeu['id']:12} échec : {err}")

    if not recuperees:
        raise SystemExit('aucune icône récupérée, catalogues laissés tels quels')

    # Les deux catalogues doivent rester identiques : celui livré avec
    # l'application et celui publié sur le site.
    for chemin in CATALOGUES:
        d = json.loads(chemin.read_text(encoding='utf-8'))
        for jeu in d['jeux']:
            if jeu['id'] in recuperees:
                jeu['logo'] = recuperees[jeu['id']]
        chemin.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print('  catalogue mis à jour :', chemin.name)


if __name__ == '__main__':
    main()
