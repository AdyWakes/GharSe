#!/usr/bin/env bash
# Rebuild the deck, validate it, export the PDF and render slide PNGs for review.
# Usage: deck/build/render.sh [png_out_dir]   (needs LibreOffice + poppler)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
deck="$(cd "$here/.." && pwd)"
out="${1:-$deck/png}"
cd "$here" && node build.js
cd "$deck"
SOFFICE="${SOFFICE:-soffice}"
if [ -n "${SOFFICE_PY:-}" ]; then python3 "$SOFFICE_PY" --headless --convert-to pdf GharSe_Pitch.pptx >/dev/null
else "$SOFFICE" --headless --convert-to pdf GharSe_Pitch.pptx >/dev/null; fi
mkdir -p "$out" && rm -f "$out"/slide-*.png
pdftoppm -png -r 80 GharSe_Pitch.pdf "$out/slide"
ls "$out"
