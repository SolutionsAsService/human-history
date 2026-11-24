#!/usr/bin/env bash
# Rebuilds static/data/*.topo.json (committed). Natural Earth is public domain.
#   land      : world-atlas (npm) land-50m / land-110m
#   shelf     : Natural Earth 10m bathymetry, 0 m and 200 m isobaths, simplified with mapshaper
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"
base=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
for n in L_0 K_200; do
  curl -fsSL "$base/ne_10m_bathymetry_$n.geojson" -o "$tmp/$n.json"
  npx mapshaper "$tmp/$n.json" -simplify 4% keep-shapes -filter-fields depth \
    -o format=topojson quantization=20000 "static/data/bathy_$n.topo.json"
done
cp node_modules/world-atlas/land-50m.json  static/data/land-50m.topo.json
cp node_modules/world-atlas/land-110m.json static/data/land-110m.topo.json
echo "done. (The map drops degenerate shelf rings at load; see MapView.loadGeo.)"
