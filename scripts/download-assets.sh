#!/usr/bin/env bash
# Downloads every image used by the sinergiaocupacional.com landing page into
# this project so the new Astro site is fully self-contained.
set -euo pipefail

BASE="https://sinergiaocupacional.com"

mkdir -p public/images/customers public/img

IMAGES=(
  "img/logo.jpg"
  "img/logo2.jpg"
  "img/dandocurso.jpg"
  "img/exposicion.jpg"
  "img/intro-bg2.png"
  "img/map-image.png"
  "favicon.png"
  "images/forklift.jpg"
  "images/autoliderazgo.jpg"
  "images/part2.jpg"
  "images/comision.png"
  "images/supervision.png"
  "images/pnl.jpg"
  "images/doc.jpg"
  "images/RGD.jpg"
  "images/alfredo.jpg"
  "images/diana.jpg"
  "images/JMV.jpg"
)

CUSTOMERS=(
  "corning.png" "landis.jpg" "vertiv.png" "johnsoncontrols.png" "artron.jpg"
  "Eaton.webp" "TRW.jpg" "Panasonic.png" "TI.jpg" "Kimball.jpg" "nibco.png"
  "nidec.jpg" "logo-overly.jpg" "denso.png" "emerson.jpg" "alps-logistics-co.jpeg"
  "ITW.jpg" "MavericksElectronics.jpg" "Hydro.jpg" "copeland.png"
)

for img in "${IMAGES[@]}"; do
  echo "Downloading $img"
  curl -sf -o "public/$img" "$BASE/$img"
done

for img in "${CUSTOMERS[@]}"; do
  echo "Downloading images/customers/$img"
  curl -sf -o "public/images/customers/$img" "$BASE/images/customers/$img"
done

echo "All images downloaded."