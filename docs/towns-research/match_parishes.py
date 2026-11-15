"""Match MHCLG 2026-27 parish rows to ONS parish codes (April 2026) and to Westminster constituencies (July 2024) via OA21 best-fit lookups."""
import csv, json, re, sys, collections, unicodedata
ROOT = "/Users/tompickup/ukcounciltax"
DL = ROOT + "/output/town-research/downloads"
OUT = ROOT + "/output/town-research"

def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"\(grouped with[^)]*\)", " ", s)
    s = re.sub(r"\((removed|town council|parish council|parish meeting)\)", " ", s)
    s = s.replace("&", " and ").replace("-", " ").replace("'", "").replace("’", "")
    s = re.sub(r"\bst\.?\b", "st", s); s = re.sub(r"\bsaint\b", "st", s)
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    s = re.sub(r"\b(town|parish|city|village|community|neighbourhood) (council|meeting)\b", " ", s)
    return re.sub(r"\s+", " ", s).strip()
def loose(s):
    return re.sub(r"\b(and|the|with|cum|upon|on|in|next|under)\b", " ", norm(s)).replace(" ", "")

def read(path): return list(csv.DictReader(open(path, encoding="utf-8")))
eng = json.load(open(ROOT + "/data/national/england.json"))
rows = [p for p in eng["parishes"] if p["years"].get("2026-27", {}).get("status") == "published"]
nc = read(DL + "/par-apr2026-nc/PAR_APR_2026_EW_NC.csv")
nc = [r for r in nc if r["PAR26CD"].startswith("E04")]
byLad = collections.defaultdict(list)
for r in nc: byLad[r["LAD26CD"]].append(r)
ladsData = {p["gss"] for p in rows}
missingLad = sorted(ladsData - set(byLad))

# OA based parish -> PCON split
oaPar = {r["OA21CD"]: r for r in read(DL + "/oa21-parncp25/OA21_PARNCP25_LAD_CTYUA_RGN_CTRY_EW_LU.csv")}
oaPcon = {r["OA21CD"]: r for r in read(DL + "/oa21-pcon24/OA21_PCON25_LAD21_EW_LU.csv")}
parPcon = collections.defaultdict(collections.Counter); pconName = {}
parLad25 = {}
for oa, r in oaPar.items():
    pc = oaPcon.get(oa)
    if not pc: continue
    parPcon[r["PARNCP25CD"]][pc["PCON25CD"]] += 1; pconName[pc["PCON25CD"]] = pc["PCON25NM"]
    parLad25[r["PARNCP25CD"]] = r["LAD25CD"]

results = []; used = collections.Counter()
for p in rows:
    cands = byLad.get(p["gss"], [])
    n = norm(p["name"]); l = loose(p["name"])
    hit = [c for c in cands if norm(c["PAR26NM"]) == n]
    how = "exact-norm"
    if not hit:
        hit = [c for c in cands if loose(c["PAR26NM"]) == l]; how = "loose"
    if not hit and p["type"] == "Charter Trustee":
        how = "charter-trustee-unmatched"
    results.append((p, hit, how if hit else ("unmatched" if p["type"] != "Charter Trustee" else how)))
    for c in hit: used[c["PAR26CD"]] += 1

out = []
byType = collections.defaultdict(collections.Counter)
splits = collections.Counter(); unmatched = []; ambiguous = []
for p, hit, how in results:
    t = p["type"].capitalize() if p["type"] != "Charter Trustee" else p["type"]
    status = "matched" if len(hit) == 1 else ("ambiguous" if hit else "unmatched")
    byType[t][status] += 1
    rec = {"code": p["code"], "gss": p["gss"], "name": p["name"], "type": p["type"], "status": status, "how": how}
    if len(hit) == 1:
        cd = hit[0]["PAR26CD"]; rec["par26cd"] = cd; rec["par26nm"] = hit[0]["PAR26NM"]
        pcs = parPcon.get(cd)
        if pcs:
            tot = sum(pcs.values())
            rec["pcon"] = [{"pcon24cd": k, "name": pconName[k], "oaCount": v, "oaShare": round(v / tot, 4)} for k, v in pcs.most_common()]
            splits["1" if len(pcs) == 1 else ">1"] += 1
        else:
            rec["pcon"] = None; splits["no-OA (parish not in OA21-PARNCP25 or holds no OA)"] += 1
    elif hit: ambiguous.append(rec); rec["candidates"] = [c["PAR26CD"] + " " + c["PAR26NM"] for c in hit]
    else: unmatched.append(rec)
    out.append(rec)
json.dump(out, open(OUT + "/parish-match.json", "w"), indent=1)
print("MHCLG published 2026-27 rows:", len(rows))
print("LADs in MHCLG data missing from ONS Apr 2026 list:", missingLad)
for t, c in sorted(byType.items()): print(f"  {t:24s} {dict(c)}")
tot = collections.Counter(); [tot.update(c) for c in byType.values()]; print("  ALL", dict(tot))
print("PCON coverage of matched:", dict(splits))
print("ONS codes matched by >1 MHCLG row:", [(k, v) for k, v in used.items() if v > 1][:15])
print("Unmatched examples:"); [print("  ", r["gss"], r["type"], "|", r["name"]) for r in unmatched[:60]]
print("Ambiguous:"); [print("  ", r["gss"], r["name"], r["candidates"]) for r in ambiguous[:20]]
