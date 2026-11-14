"""Independent dry run for the Nearby and alike section.

Run from the repository root:
  uv run --with shapely python scripts/nearby-dry-run.py

Neighbours here come from Shapely (GEOS) line intersection on the pinned
boundary file, a different implementation from src/lib/council-neighbours.ts,
which uses its own integer segment test. The unit tests require the two to
agree for every council. Coordinates are scaled to whole units of 0.00001
degrees first, as the site does, so both work on the same exact integers.
"""
import hashlib
import json
from pathlib import Path

from shapely.geometry import LineString, MultiLineString
from shapely.strtree import STRtree

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data/geography/lad26-england.geojson"
OUTPUT = ROOT / "docs/NEARBY-AND-ALIKE-DRY-RUN-2026-11-13.json"

raw = SOURCE.read_bytes()
features = json.loads(raw)["features"]
registry = json.loads((ROOT / "data/registry/councils.json").read_text())["councils"]
authorities = json.loads((ROOT / "data/council-tax/england-2026-27.json").read_text())["authorities"]
pages = sorted((c for c in registry.values() if c["gss"] in authorities),
               key=lambda c: authorities[c["gss"]]["name"])



def outline(geometry):
    polygons = [geometry["coordinates"]] if geometry["type"] == "Polygon" else geometry["coordinates"]
    return MultiLineString([
        LineString([(round(x * 1e5), round(y * 1e5)) for x, y in ring])
        for polygon in polygons for ring in polygon
    ])


codes = [feature["properties"]["LAD26CD"] for feature in features]
lines = [outline(feature["geometry"]) for feature in features]
tree = STRtree(lines)
touching = {code: set() for code in codes}
for i, line in enumerate(lines):
    for j in tree.query(line, predicate="intersects"):
        if i != j:
            touching[codes[i]].add(codes[int(j)])

councils = []
for council in pages:
    neighbours = sorted(touching[council["gss"]])
    county = council["county"] if council["type"] == "Non-metropolitan district" and council["parentGss"] else None
    same_county = sorted(other["gss"] for other in pages
                         if county and other["gss"] != council["gss"]
                         and other["type"] == "Non-metropolitan district"
                         and other["parentGss"] == council["parentGss"])
    councils.append({
        "gss": council["gss"], "name": authorities[council["gss"]]["name"], "slug": council["slug"],
        "boundaryCount": len(neighbours), "boundaryGss": neighbours,
        "county": county, "sameCountyCount": len(same_county), "sameCountyGss": same_county,
    })

OUTPUT.write_text(json.dumps({
    "sourceSha256": hashlib.sha256(raw).hexdigest(),
    "method": "Outlines that touch or cross in the pinned coastline-clipped England file, "
              "tested on coordinates scaled to whole units of 0.00001 degrees. "
              "County joins use registry parentGss for shire districts.",
    "councils": councils,
}, indent=2) + "\n")
pairs = sum(len(v) for v in touching.values())
print(f"{len(councils)} councils; {pairs} directed links; {pairs // 2} pairs; "
      f"neighbours per council {min(map(len, touching.values()))} to {max(map(len, touching.values()))}")
