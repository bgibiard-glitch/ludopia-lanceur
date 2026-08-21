# -*- coding: utf-8 -*-
"""Décline `ressources/icon-1024.png` en toutes les tailles attendues.

Produit sans le rendu préalable : lancer d'abord

    NODE_PATH=C:/Dev/perso/villopia/node_modules node outils/icone-source.js
    python outils/icones.py
"""
import pathlib
import sys

from PIL import Image

RACINE = pathlib.Path(__file__).resolve().parent.parent
RESSOURCES = RACINE / 'ressources'
SOURCE = RESSOURCES / 'icon-1024.png'
DOSSIER_PNG = RESSOURCES / 'icones'

TAILLES = [16, 24, 32, 48, 64, 128, 256, 512, 1024]
# Windows refuse toute couche au-delà de 256 px dans un .ico.
TAILLES_ICO = [16, 24, 32, 48, 64, 128, 256]


def main():
    if not SOURCE.exists():
        sys.exit(f'source absente : {SOURCE}\nLancer d\'abord outils/icone-source.js')

    DOSSIER_PNG.mkdir(parents=True, exist_ok=True)
    base = Image.open(SOURCE).convert('RGBA')

    for t in TAILLES:
        base.resize((t, t), Image.LANCZOS).save(DOSSIER_PNG / f'{t}x{t}.png')

    # electron-builder cherche `icon.png` pour macOS et Linux, `icon.ico` pour Windows.
    base.resize((512, 512), Image.LANCZOS).save(RESSOURCES / 'icon.png')

    # `sizes` fait décliner Pillow depuis l'image sur laquelle on appelle save().
    # L'appeler sur la couche 16 px donnerait un .ico de quelques centaines
    # d'octets où toutes les tailles sont un agrandissement du timbre-poste.
    base.save(RESSOURCES / 'icon.ico', format='ICO',
              sizes=[(t, t) for t in TAILLES_ICO])

    print(f'{len(TAILLES)} PNG dans {DOSSIER_PNG}')
    print(f'icon.png et icon.ico dans {RESSOURCES}')
    print("icon.icns : produit par electron-builder lors d'une compilation sur macOS")


if __name__ == '__main__':
    main()
