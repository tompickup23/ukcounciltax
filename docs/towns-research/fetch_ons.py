"""Download ONS Open Geography feature service tables to CSV via the ArcGIS REST query API (paginated)."""
import csv, json, sys, urllib.request, urllib.parse, hashlib, os, time
BASE = "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/{}/FeatureServer/0/query"
def fetch(service, outdir, item_id, title):
    os.makedirs(outdir, exist_ok=True)
    rows, offset, fields = [], 0, None
    while True:
        q = urllib.parse.urlencode({"where": "1=1", "outFields": "*", "returnGeometry": "false",
            "orderByFields": "ObjectId", "resultOffset": offset, "resultRecordCount": 2000, "f": "json"})
        with urllib.request.urlopen(BASE.format(service) + "?" + q, timeout=120) as r:
            d = json.load(r)
        if fields is None:
            fields = [f["name"] for f in d["fields"] if not f["name"].startswith("column")]
        feats = d.get("features", [])
        rows += [[f["attributes"].get(k) for k in fields] for f in feats]
        offset += len(feats)
        if not feats or not d.get("exceededTransferLimit"):
            break
    path = os.path.join(outdir, service + ".csv")
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh); w.writerow(fields); w.writerows(rows)
    h = hashlib.sha256(open(path, "rb").read()).hexdigest()
    meta = {"title": title, "publisher": "Office for National Statistics (Open Geography Portal)",
            "itemId": item_id, "itemUrl": f"https://geoportal.statistics.gov.uk/datasets/{item_id}",
            "service": BASE.format(service).rsplit('/query', 1)[0], "rows": len(rows), "sha256": h,
            "retrieved": time.strftime("%Y-%m-%d"),
            "licence": "Open Government Licence v3.0; contains OS data (c) Crown copyright and database right; ONS licences page https://www.ons.gov.uk/methodology/geography/licences"}
    json.dump(meta, open(os.path.join(outdir, service + ".source.json"), "w"), indent=1)
    print(service, len(rows), h)
if __name__ == "__main__":
    fetch(*sys.argv[1:5])
