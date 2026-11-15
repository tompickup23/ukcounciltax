"""Tiered match of MHCLG 2026-27 parish rows to ONS PAR26 codes, then constituency via ward and OA lookups."""
import csv, json, re, collections, unicodedata, difflib
ROOT = "/Users/tompickup/ukcounciltax"; DL = ROOT + "/output/town-research/downloads"; OUT = ROOT + "/output/town-research"
def read(p): return list(csv.DictReader(open(p, encoding="utf-8")))
def base(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    s = s.replace("&", " and ").replace("-", " ").replace("'", "").replace(",", " ")
    s = re.sub(r"\bst\.?(?=\s)", "st", s); s = re.sub(r"\bsaint\b", "st", s)
    s = re.sub(r"[^a-z0-9() ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()
def strip_br(s): return re.sub(r"\s*\(.*$", "", s).strip()
def clean(s):
    s = re.sub(r"\b(town|parish|city|village|community|neighbourhood)? ?(council|meeting|charter trustees?)\b", " ", s)
    s = re.sub(r"\b(grouped|group)\b.*$", " ", s)
    s = re.sub(r"\s(town|parish)$", "", s.strip())
    return re.sub(r"\s+", " ", s).strip()
def keys(name):
    b = base(name); k = [clean(b), clean(strip_br(b))]
    return [x for x in dict.fromkeys(k) if x]
eng = json.load(open(ROOT + "/data/national/england.json"))
rows = [p for p in eng["parishes"] if p["years"].get("2026-27", {}).get("status") == "published"]
nc = [r for r in read(DL + "/par-apr2026-nc/PAR_APR_2026_EW_NC.csv") if r["PAR26CD"].startswith("E04")]
byLad = collections.defaultdict(list)
for r in nc: r["k"] = clean(base(r["PAR26NM"])); byLad[r["LAD26CD"]].append(r)

def match(p):
    cands = byLad.get(p["gss"], [])
    if not cands: return [], "lad-not-in-ons-list"
    ks = keys(p["name"])
    for i, k in enumerate(ks):
        h = [c for c in cands if c["k"] == k]
        if h: return h, "exact" if i == 0 else "exact-after-bracket-strip"
    k = ks[-1]
    # combined units: "a and b", "great and little x"
    m = re.match(r"^(great|little|east|west|north|south|upper|lower|high|nether|over|long|old|new) and (great|little|east|west|north|south|upper|lower|high|nether|over|long|old|new) (.+)$", k)
    parts = [m.group(1) + " " + m.group(3), m.group(2) + " " + m.group(3)] if m else [x.strip() for x in re.split(r" and | with ", k) if x.strip()]
    if len(parts) > 1:
        h = [c for part in parts for c in cands if c["k"] == part]
        if len(h) == len(parts): return h, "combined-unit"
    h = [c for c in cands if c["k"].startswith(k + " ") or k.startswith(c["k"] + " and ")]
    if len(h) == 1: return h, "prefix-REVIEW"
    best = difflib.get_close_matches(k, [c["k"] for c in cands], n=1, cutoff=0.88)
    if best: return [c for c in cands if c["k"] == best[0]], "spelling-REVIEW"
    return [], "unmatched"

# geography
pw = collections.defaultdict(set)
for r in read(DL + "/par25-wd25-lad25/PAR25_WD25_LAD25_EW_LU.csv"): pw[r["PAR25CD"]].add(r["WD25CD"])
pw26 = collections.defaultdict(set)
for r in read(DL + "/par26-wd26-lad26/PAR26_WD26_LAD26_EW_LU.csv"): pw26[r["PARNCP26CD"]].add(r["WD26CD"])
wp = collections.defaultdict(set); split = set(); pname = {}
for r in read(DL + "/wd25-pcon24/WD25_PCON24_LAD25_CTYUA25_UK_LU.csv"):
    wp[r["WD25CD"]].add(r["PCON24CD"]); pname[r["PCON24CD"]] = r["PCON24NM"]
    if r["SPLIT_WARD"] in ("Yes", "TRUE"): split.add(r["WD25CD"])
oaPar = {r["OA21CD"]: r["PARNCP25CD"] for r in read(DL + "/oa21-parncp25/OA21_PARNCP25_LAD_CTYUA_RGN_CTRY_EW_LU.csv")}
parOA = collections.defaultdict(collections.Counter)
for r in read(DL + "/oa21-pcon24/OA21_PCON25_LAD21_EW_LU.csv"):
    if r["OA21CD"] in oaPar: parOA[oaPar[r["OA21CD"]]][r["PCON25CD"]] += 1

def geo(codes):
    wards = set().union(*[pw.get(c, set()) for c in codes])
    missing = [c for c in codes if c not in pw]
    wardP = set().union(*[wp.get(w, set()) for w in wards]) if wards else set()
    oa = collections.Counter()
    for c in codes: oa.update(parOA.get(c, {}))
    if missing or not wards: basis = "no-ward-lookup"
    elif len(wardP) == 1: basis = "single"  # every ward the parish touches lies in one constituency
    else:
        basis = "multi-candidate"
    return {"basis": basis, "wardCandidates": sorted(wardP), "splitWardInvolved": bool(wards & split),
            "oaBestFit": dict(oa.most_common()), "wards": sorted(wards), "codesMissingWard": missing}

out = []
for p in rows:
    h, how = match(p)
    rec = {"code": p["code"], "gss": p["gss"], "name": p["name"], "type": p["type"], "how": how,
           "par26": [c["PAR26CD"] + " " + c["PAR26NM"] for c in h]}
    if h and len({c["PAR26CD"] for c in h}) >= 1 and not (len(h) > 1 and how in ("exact", "exact-after-bracket-strip")):
        rec.update(geo([c["PAR26CD"] for c in h]))
    elif len(h) > 1: rec["how"] = "ambiguous-same-name"
    out.append(rec)
json.dump(out, open(OUT + "/parish-match.json", "w"), indent=1)
T = collections.defaultdict(collections.Counter)
for r in out: T[r["type"].lower()][r["how"]] += 1
for t, c in T.items(): print(t, dict(c))
allc = collections.Counter(r["how"] for r in out); print("ALL", dict(allc), len(out))
B = collections.Counter(r.get("basis") for r in out if "basis" in r); print("PCON basis:", dict(B))
mc = [r for r in out if r.get("basis") == "multi-candidate"]
oaSplit = sum(1 for r in mc if len(r["oaBestFit"]) > 1); oaOne = sum(1 for r in mc if len(r["oaBestFit"]) == 1); oaNone = sum(1 for r in mc if not r["oaBestFit"])
print(f"multi-candidate: OA shows >1 PCON {oaSplit}; OA shows 1 PCON {oaOne}; OA none {oaNone}")
print("single-basis rows where OA disagrees:", sum(1 for r in out if r.get("basis") == "single" and r["oaBestFit"] and set(r["oaBestFit"]) != set(r["wardCandidates"])))
print("matched ONS parishes used by >1 MHCLG row:", [k for k, v in collections.Counter(x for r in out for x in r["par26"] if r["how"] != "ambiguous-same-name").items() if v > 1][:20])
with open(OUT + "/unmatched.txt", "w") as fh:
    for r in out:
        if r["how"] in ("unmatched", "ambiguous-same-name", "lad-not-in-ons-list") or "REVIEW" in r["how"]:
            fh.write(f'{r["how"]}\t{r["gss"]}\t{r["type"]}\t{r["name"]}\t{"; ".join(r["par26"])}\n')
