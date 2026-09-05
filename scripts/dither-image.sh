#!/bin/sh
set -eu

if [ "$#" -ne 2 ]; then
  echo "usage: scripts/dither-image.sh INPUT OUTPUT" >&2
  exit 1
fi

magick "$1" \
  -auto-orient \
  -resize '1440x1440>' \
  -colorspace Gray \
  -contrast-stretch '1%x1%' \
  -ordered-dither 'o8x8,4' \
  -define png:color-type=0 \
  -strip \
  "$2"
