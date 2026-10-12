#!/usr/bin/env bash
# Fetch the fonts the generators need, into brand/src/fonts/.
# Quicksand is the brand font; the others are only used by the
# wordmark comparison sheet (07-WORDMARKS).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p fonts && cd fonts
base="https://github.com/google/fonts/raw/main/ofl"
curl -sL -o Quicksand-var.ttf     "$base/quicksand/Quicksand%5Bwght%5D.ttf"
curl -sL -o Baloo2-var.ttf        "$base/baloo2/Baloo2%5Bwght%5D.ttf"
curl -sL -o Comfortaa-var.ttf     "$base/comfortaa/Comfortaa%5Bwght%5D.ttf"
curl -sL -o Nunito-var.ttf        "$base/nunito/Nunito%5Bwght%5D.ttf"
curl -sL -o Poppins-SemiBold.ttf  "$base/poppins/Poppins-SemiBold.ttf"
curl -sL -o Poppins-Medium.ttf    "$base/poppins/Poppins-Medium.ttf"
echo "fonts ready:"; ls -1
