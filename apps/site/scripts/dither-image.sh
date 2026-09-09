#!/bin/sh
set -eu

if [ "$#" -ne 2 ]; then
  echo "usage: scripts/dither-image.sh INPUT OUTPUT" >&2
  exit 1
fi

magick "$1" \
  -auto-orient \
  -resize '900x900>' \
  -colorspace Gray \
  -contrast-stretch '2%x2%' \
  -ordered-dither 'o8x8,3' \
  -define png:color-type=0 \
  -strip \
  "$2"
