#!/usr/bin/env bash
#
# trace-logo.sh — Vectorise le vrai logo Maison Ipuin (PNG/JPG) en SVG fidèle.
#
# Pourquoi : le logo officiel est un aplat bleu marine sur fond transparent.
# potrace produit un tracé vectoriel net (contours exacts) à partir du raster.
#
# Utilisation :
#   1. Place le fichier source du logo ici :  assets/logo-source.png
#      (PNG avec transparence de préférence ; JPG accepté aussi)
#   2. Lance :  bash scripts/trace-logo.sh
#   3. Le script écrit  assets/logo-maison-ipuin.svg  (déjà référencé par le site)
#
# Le script installe potrace + ImageMagick si besoin (apt).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-$ROOT/assets/logo-source.png}"
OUT="${2:-$ROOT/assets/logo-maison-ipuin.svg}"
COLOR="#1f2741"   # bleu marine du logo

if [[ ! -f "$SRC" ]]; then
  echo "ERREUR : fichier source introuvable -> $SRC" >&2
  echo "Place ton logo dans assets/logo-source.png puis relance." >&2
  exit 1
fi

# Dépendances
if ! command -v potrace >/dev/null 2>&1 || ! command -v convert >/dev/null 2>&1; then
  echo "Installation de potrace + imagemagick…"
  sudo apt-get update -y && sudo apt-get install -y potrace imagemagick
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# 1) Aplatir sur blanc, passer en niveaux de gris, seuiller -> bitmap (PBM)
#    -alpha remove évite les artefacts de transparence.
convert "$SRC" -alpha remove -alpha off \
  -colorspace Gray -threshold 55% \
  -negate "$TMP/logo.pbm"

# 2) Vectoriser (contours lisses, tolérance basse pour rester fidèle)
potrace "$TMP/logo.pbm" \
  --svg \
  --turdsize 2 \
  --alphamax 1.0 \
  --opttolerance 0.2 \
  -o "$TMP/logo.svg"

# 3) Recolorer en bleu marine + ajouter un viewBox propre
#    potrace met fill="#000000" ; on le remplace par la couleur du logo.
sed "s/fill=\"#000000\"/fill=\"$COLOR\"/g; s/fill:#000000/fill:$COLOR/g" \
  "$TMP/logo.svg" > "$OUT"

echo "OK -> $OUT"
echo "Le site l'utilise déjà (header, section « La maison », footer, favicon)."
