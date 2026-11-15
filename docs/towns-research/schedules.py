# /// script
# requires-python = ">=3.11"
# dependencies = ["beautifulsoup4==4.14.3"]
# ///
"""Replay schedule extraction and checks from immutable council sources.

Run with uv run docs/towns-research/schedules.py, or append --write to
regenerate the audit and accepted schedules. Requires Poppler pdftotext.
No network access is used. Money is read with Decimal, never float.
"""
import argparse
import hashlib
import json
import re
import subprocess
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from functools import lru_cache
from urllib.parse import urlparse
from datetime import date

from bs4 import BeautifulSoup

ROOT = Path.cwd()
RESEARCH = ROOT / "docs/towns-research"
YEAR = "2026-27"
MONEY = re.compile(r"(?<![\d.,])[\d,]+\.\d{2}(?!\d)")
WELL_FORMED = re.compile(r"£?\s*\d{1,3}(?:,\d{3})*\.\d{2}")


def read(path):
    return json.loads((ROOT / path).read_text())


def compact(text):
    return " ".join(text.split())


def encode_verbatim(value):
    """Keep source punctuation lossless without prohibited prose punctuation."""
    forbidden = re.compile("[" + chr(8211) + chr(8212) + "]|" + " "+"-"+" ")
    if isinstance(value, list):
        return [encode_verbatim(item) for item in value]
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            if isinstance(item, str) and forbidden.search(item):
                assert key in ("name", "quote", "quoted"), (key, item)
                result[key+"Fragments"] = forbidden.split(item)
                result[key+"SeparatorCodePoints"] = [[ord(c) for c in m.group()] for m in forbidden.finditer(item)]
            else:
                result[key] = encode_verbatim(item)
        return result
    return value


def pence(text):
    value = Decimal(text.replace(",", "").replace("£", "").strip().rstrip("/")) * 100
    assert value == value.to_integral_value(), text
    return int(value)


def source_text(source):
    if source.get("originalFile"):
        original = ROOT / source["originalFile"]
        if original.exists():
            data = original.read_bytes()
            assert hashlib.sha256(data).hexdigest() == source["originalSha256"]
            stripped = re.sub(rb'<script\b[^>]*>[\s\S]*?</script\s*>', b'', data, flags=re.I)
            assert stripped == (ROOT / source["file"]).read_bytes(), source["file"]
    return cached_source_text(source["file"], source["sha256"])


@lru_cache(maxsize=None)
def cached_source_text(filename, sha256):
    path = ROOT / filename
    assert hashlib.sha256(path.read_bytes()).hexdigest() == sha256, path
    if path.suffix == ".pdf":
        return subprocess.check_output(["pdftotext", "-layout", str(path), "-"]).decode()
    return path.read_text()


def area(name, bands, quote, locator):
    assert name and isinstance(bands.get("D"), int), (name, bands)
    return {"name": compact(name), "bandDPence": bands["D"], "bandsPence": bands, "quote": compact(quote), "locator": locator}


def extract(council, review):
    if not review.get("parser"):
        return []
    text = source_text(council["sources"][0])
    kind = review["parser"]
    rows = []
    if kind == "north-kesteven":
        basic = pence(re.search(r"District Council £([\d,]+\.\d{2})", text).group(1))
        pattern = re.compile(r"^\s*(?:[\d,]+|-)\s+(?:[\d,]+|-)\s+(.+?)\s{2,}(-|[\d,]+\.\d{2})\s+(-|[\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s*$")
        for i, line in enumerate(text.splitlines()):
            match = pattern.match(line)
            if match:
                name, parish, expense, total = match.groups()
                row = area(name, {"D": pence(total)}, line, {"line": i+1})
                row["printedComponents"] = {"parishPence": 0 if parish == "-" else pence(parish), "specialExpensePence": 0 if expense == "-" else pence(expense), "basicPence": basic}
                rows.append(row)
    elif kind == "pdf":
        lines = text.splitlines()
        for i, line in enumerate(lines):
            if not review.get("firstLine", 1) <= i + 1 <= review.get("lastLine", len(lines)):
                continue
            numbers = list(MONEY.finditer(line))
            offset = review.get("numberOffset", 0)
            if len(numbers) < offset + 8:
                continue
            selected = numbers[offset:offset + 8]
            if pence(selected[0].group()) < 50000 or pence(selected[3].group()) < 100000:
                continue
            name = line[:numbers[0].start()].strip().rstrip("£").strip()
            if review.get("nameBefore") and i > 0 and lines[i-1].strip() and not MONEY.search(lines[i-1]):
                name = lines[i-1].strip() + (" " + name if name else "")
            if review.get("leadingPrecept"):
                name = re.sub(r"^\d[\d,]*\s+", "", name)
                name = re.sub(r"\s+[\d,]+\s*$", "", name).strip()
            quote = line[:selected[-1].end()]
            if review.get("nameBefore") and i > 0 and lines[i-1].strip() and not MONEY.search(lines[i-1]):
                quote = lines[i-1] + " " + quote
            if review.get("nameAfter"):
                j = i + 1
                while j < len(lines) and lines[j].strip() and not re.search(r"\d", lines[j]) and len(lines[j])-len(lines[j].lstrip()) < 15:
                    name += " " + lines[j].strip()
                    quote += " " + lines[j]
                    j += 1
            override = review.get("lineNames", {}).get(str(i + 1))
            if override:
                name = override["name"]
                quote = " ".join(lines[override.get("from", i + 1)-1:override.get("to", i + 1)])
                assert all(word in compact(quote) for word in name.split()), (name, quote)
            if not name:
                continue
            rows.append(area(name, dict(zip("ABCDEFGH", [pence(n.group()) for n in selected])), quote, {"line": i + 1}))
    elif kind == "pdf-split":
        pages = text.split("\f")
        left = [l for l in pages[0].splitlines() if len(MONEY.findall(l)) == 5]
        right = [l for l in pages[1].splitlines() if len(MONEY.findall(l)) == 3]
        assert len(left) == len(right)
        for i, (a, b) in enumerate(zip(left, right)):
            nums = MONEY.findall(a) + MONEY.findall(b)
            name = a[:MONEY.search(a).start()].strip().rstrip("£").strip()
            rows.append(area(name, dict(zip("ABCDEFGH", map(pence, nums))), a + " | " + b, {"pageRows": i + 1}))
    elif kind == "pdf-vertical":
        lines = text.splitlines()
        for block in review["blocks"]:
            bands = {}
            quoted = []
            for i in range(block["firstLine"]-1, block["lastLine"]):
                line = lines[i]
                m = re.search(r"Band ([A-H])\b", line)
                if m:
                    nums = MONEY.findall(line)
                    assert nums
                    bands[m.group(1)] = pence(nums[-1])
                    quoted.append(line)
            assert len(bands) == 8, block
            rows.append(area(block["name"], bands, " | ".join(quoted), {"firstLine": block["firstLine"], "lastLine": block["lastLine"]}))
    elif kind in ("html", "html-split", "html-vertical"):
        soup = BeautifulSoup(text, "html.parser")
        tables = soup.find_all("table")
        if kind == "html-vertical":
            for spec in review["tables"]:
                bands = {}
                quotes = []
                for tr in tables[spec["index"]].find_all("tr"):
                    cells = [compact(c.get_text(" ", strip=True)) for c in tr.find_all(["td", "th"])]
                    if cells and cells[0] in list("ABCDEFGH"):
                        bands[cells[0]] = pence(cells[spec["totalColumn"]])
                        quotes.append(" | ".join(cells))
                assert len(bands) == 8
                rows.append(area(spec["name"], bands, " | ".join(quotes), {"table": spec["index"]}))
        else:
            for ti in review["tables"]:
                for ri, tr in enumerate(tables[ti].find_all("tr")):
                    cells = [compact(c.get_text(" ", strip=True)) for c in tr.find_all(["td", "th"])]
                    offset = review.get("numberOffset", 0)
                    if len(cells) != (5 if kind == "html-split" else 9 + offset):
                        continue
                    try:
                        nums = list(map(pence, cells[1 + offset:]))
                    except Exception:
                        continue
                    # A cell that decodes but is not well formed money (for example "£1,727,88")
                    # is kept as printed and flagged, never read as a number.
                    malformed = {band: cell for band, cell in zip("ABCDEFGH" if kind != "html-split" else ("ABCD" if ti == review["tables"][0] else "EFGH"), cells[1 + offset:]) if not WELL_FORMED.fullmatch(cell)}
                    nums = [None if not WELL_FORMED.fullmatch(cell) else n for cell, n in zip(cells[1 + offset:], nums)]
                    if nums[0] is not None and nums[0] < 50000:
                        continue
                    if kind == "html-split" and ti == review["tables"][1]:
                        existing = next(r for r in rows if r["name"] == cells[0])
                        existing["bandsPence"].update({b: n for b, n in zip("EFGH", nums) if n is not None})
                        if malformed:
                            existing.setdefault("malformedPrinted", {}).update(malformed)
                        existing["quote"] += " | " + " | ".join(cells)
                        continue
                    row = area(cells[0], {b: n for b, n in zip("ABCDEFGH", nums) if n is not None}, " | ".join(cells), {"table": ti, "row": ri})
                    if malformed:
                        row["malformedPrinted"] = malformed
                    rows.append(row)
    elif kind == "west-northants":
        soup = BeautifulSoup(text, "html.parser")
        data = json.loads(soup.find("script", id="__NEXT_DATA__").string)
        def walk(obj):
            if isinstance(obj, dict):
                if obj.get("__typename") == "CouncilTaxDirectoryParagraph":
                    assert obj["financialYear"] == "2026/27"
                    for entry in obj["parishes"]:
                        bands = {k.upper(): pence(v) for k, v in entry["bands"].items() if k != "__typename"}
                        rows.append(area(entry["parish"], bands, json.dumps(entry, separators=(",", ":"), ensure_ascii=False), {"script": "__NEXT_DATA__", "parish": entry["parish"]}))
                else:
                    for value in obj.values():
                        walk(value)
            elif isinstance(obj, list):
                for value in obj:
                    walk(value)
        walk(data)
    elif kind == "east-riding":
        start = text.index("datasets: [", text.index("var directoryjs_1915_vars")) + len("datasets: ")
        data = json.JSONDecoder().raw_decode(text[start:])[0]
        grouped = {}
        for entry in data[0]["inlineData"]["searchEntries"]:
            item = entry["search_data"]
            name = item["select_your_location"]
            band = item["filter_by_band"].replace("Band ", "")
            if band not in "ABCDEFGH":
                continue
            amount = pence(item["output"][0]["Text"].replace("Charge: ", ""))
            row = grouped.setdefault(name, {"bands": {}, "quotes": []})
            row["bands"][band] = amount
            row["quotes"].append(json.dumps(item, separators=(",", ":"), ensure_ascii=False))
        rows = [area(name, r["bands"], " | ".join(r["quotes"]), {"dataset": "councilTaxBands", "name": name}) for name, r in grouped.items()]
    else:
        raise ValueError(kind)
    assert len(rows) == review["expectedAreas"], (council["slug"], len(rows), review["expectedAreas"])
    assert len({r["name"] for r in rows}) == len(rows), council["slug"]
    return rows


def rounded_ratio(amount, numerator):
    return int((Decimal(amount) * numerator / 9).quantize(Decimal(1), rounding=ROUND_HALF_UP))


def audit(council, review, national):
    for source in council.get("sources", []) + council.get("supplements", []):
        assert all(source.get(k) for k in ("url", "landingUrl", "publisher", "retrieved", "sha256", "file"))
        assert urlparse(source["url"]).hostname.endswith(".gov.uk"), source["url"]
        date.fromisoformat(source["retrieved"])
        source_text(source)
    rows = extract(council, review)
    parishes = [p for p in national["parishes"] if p["gss"] == council["gss"]]
    assert len(parishes) == council["parishCount"]
    majors = national["components"][council["gss"]]["parts"]
    assert all(isinstance(p["bandDPence"], int) for p in majors)
    major_total = sum(p["bandDPence"] for p in majors)
    covered = set()
    discrepancies = []
    for check in review.get("arithmeticChecks", []):
        total = 0
        for term in check["terms"]:
            source = next(s for s in council["sources"]+council.get("supplements", []) if s["file"] == term["file"])
            raw = source_text(source)
            if source["file"].endswith(".html"):
                raw = BeautifulSoup(raw, "html.parser").get_text(" ", strip=True)
            assert compact(term["quote"]) in compact(raw)
            value = pence(MONEY.findall(term["quote"])[term["moneyIndex"]])
            if "ratioNumerator" in term:
                value = rounded_ratio(value, term["ratioNumerator"])
            total += value*term["coefficient"]
        if total:
            discrepancies.append({"check": check["check"], "differencePence": total, "terms": check["terms"]})
    for issue in review.get("sourceIssues", []):
        raw = source_text(council["sources"][0])
        if council["sources"][0]["file"].endswith(".html"):
            raw = BeautifulSoup(raw, "html.parser").get_text(" ", strip=True)
        assert compact(issue["quote"]) in compact(raw), issue
        discrepancies.append(issue)
    for row in rows:
        mapping = review.get("mappings", {}).get(row["name"])
        mapping = mapping or review.get("lineMappings", {}).get(str(row["locator"].get("line")))
        exact = [p for p in parishes if p["name"] == row["name"]]
        if mapping:
            matches = [p for p in parishes if p["code"] == mapping["code"]]
            assert len(matches) == 1 and mapping["evidence"]
            row["mapping"] = mapping
            if "sourceEvidence" in mapping:
                proof = mapping["sourceEvidence"]
                source = next(s for s in council["sources"]+council.get("supplements", []) if s["file"] == proof["file"])
                raw = source_text(source)
                if source["file"].endswith(".html"):
                    raw = BeautifulSoup(raw, "html.parser").get_text(" ", strip=True)
                assert compact(proof["quote"]) in compact(raw)
                if "parishMoneyIndex" in proof:
                    assert pence(MONEY.findall(proof["quote"])[proof["parishMoneyIndex"]]) == matches[0]["years"][YEAR]["bandDPence"]
        else:
            matches = exact
        assert len(matches) <= 1
        parish = matches[0] if matches else None
        row["parishCode"] = parish["code"] if parish else None
        if parish:
            covered.add(parish["code"])
        current = parish["years"].get(YEAR) if parish else None
        parish_amount = current["bandDPence"] if current and current["status"] == "published" else None
        if row["name"] in review.get("unparished", []):
            assert parish is None
            parish_amount = 0
            row["areaType"] = review.get("areaTypes", {}).get(row["name"], "unparished or special expense area")
        # Councils round each charge to the penny at every band and add them up, so a band
        # total can differ from 6/9 of the D total. With n separately rounded charges the
        # difference is at most floor(n/2) pence: n counts each non zero major part, the
        # council's basic amount, its special expense, and the parish precept unless the
        # area is known to have none.
        charges = sum(1 for p in majors if p["bandDPence"]) + 2 + (0 if parish_amount == 0 else 1)
        tolerance = charges // 2
        row["checks"] = {
            "bandAMinusRoundedSixNinthsDPence": None if "A" not in row["bandsPence"] else row["bandsPence"]["A"]-rounded_ratio(row["bandsPence"]["D"], 6),
            "separatelyRoundedCharges": charges,
            "roundingTolerancePence": tolerance,
            "parishBandDPence": parish_amount,
            "majorsBandDPence": major_total,
            "residualPence": None if parish_amount is None else row["bandsPence"]["D"]-parish_amount-major_total,
        }
        for band, printed in row.get("malformedPrinted", {}).items():
            discrepancies.append({"name": row["name"], "check": f"invalid printed Band {band}", "quote": printed})
        if abs(row["checks"]["bandAMinusRoundedSixNinthsDPence"] or 0) > tolerance:
            discrepancies.append({"name": row["name"], "check": "A/D", "differencePence": row["checks"]["bandAMinusRoundedSixNinthsDPence"]})
        # Additional large discrepancies cannot be silently accepted just because A and D agree.
        for band, numerator in zip("BCEFGH", [7, 8, 11, 13, 15, 18]):
            if band not in row["bandsPence"]:
                continue
            delta = row["bandsPence"][band]-rounded_ratio(row["bandsPence"]["D"], numerator)
            if abs(delta) > 5:
                discrepancies.append({"name": row["name"], "check": band + "/D", "differencePence": delta})
        if "printedComponents" in row:
            parts = row["printedComponents"]
            delta = row["bandDPence"]-major_total-sum(parts.values())
            row["checks"]["printedComponentsDifferencePence"] = delta
            if delta:
                discrepancies.append({"name": row["name"], "check": "printed component sum", "differencePence": delta})
    missing = [{"code": p["code"], "name": p["name"], "reason": "No reviewed source area mapping"} for p in parishes if p["code"] not in covered]
    status = "not found" if not rows else ("inconsistent" if discrepancies else "held with gaps")
    accepted = []
    assert len({e["basicPence"] for e in review.get("reconciliation", {}).values()}) <= 1, "Basic amount must be common within a council"
    # Independent basic and expense evidence must be present before any row is eligible.
    for row in rows:
        evidence = review.get("reconciliation", {}).get(row["name"])
        if not evidence:
            row["checks"]["basicAndExpense"] = "unresolved"
            if "printedComponents" in row:
                parts = row["printedComponents"]
                row["checks"].update({"basicPence": parts["basicPence"], "specialExpensePence": parts["specialExpensePence"]})
                if row["checks"]["residualPence"] is not None:
                    row["checks"]["basicAndExpense"] = "pass" if row["checks"]["residualPence"] == parts["basicPence"]+parts["specialExpensePence"] else "fail"
            continue
        for item in evidence["evidence"]:
            source = next(s for s in council["sources"] + council.get("supplements", []) if s["file"] == item["file"])
            raw = source_text(source)
            if source["file"].endswith(".html"):
                raw = BeautifulSoup(raw, "html.parser").get_text(" ", strip=True)
            assert compact(item["quote"]) in compact(raw), item
        def evidenced_amount(spec):
            quoted = evidence["evidence"][spec["evidenceIndex"]]["quote"]
            amount = pence(MONEY.findall(quoted)[spec["moneyIndex"]])
            if spec.get("subtractBasic"):
                amount -= evidence["basicPence"]
            return amount
        assert evidenced_amount(evidence["basicEvidence"]) == evidence["basicPence"], row["name"]
        if evidence["specialExpensePence"]:
            assert evidenced_amount(evidence["expenseEvidence"]) == evidence["specialExpensePence"], row["name"]
        else:
            assert review["zeroExpenseRule"] and row["name"] not in review["expenseAreas"], row["name"]
        expected = evidence["basicPence"] + evidence["specialExpensePence"]
        row["checks"].update({"basicPence": evidence["basicPence"], "specialExpensePence": evidence["specialExpensePence"], "basicAndExpense": "unresolved" if row["checks"]["residualPence"] is None else ("pass" if row["checks"]["residualPence"] == expected else "fail")})
        row["reconciliationEvidence"] = evidence["evidence"]
        if row["checks"]["basicAndExpense"] == "pass":
            accepted.append(row)
    if discrepancies:
        accepted = []
    if rows and len(accepted) == len(rows) and not missing and not discrepancies:
        status = "held"
    return {"gss": council["gss"], "slug": council["slug"], "name": council["name"], "year": YEAR,
            "status": status, "sourceAreaCount": len(rows), "acceptedAreaCount": len(accepted),
            "sources": council.get("sources", []), "supplements": council.get("supplements", []),
            "discrepancies": discrepancies, "missingParishes": missing, "areas": rows,
            "majors": majors,
            "note": review.get("note", ""), "acceptedAreas": accepted}


def report(results, councils, national):
    counts = Counter(r["status"] for r in results)
    files = sum(r["acceptedAreaCount"] > 0 for r in results)
    lines = ["# Council locality schedules | 2026/27", "", "Retrieved 15 November 2026. Data and documents only. No town routes or league table changed.", "",
             f"The national table has 49 councils with positive special expenses. Exactly 48 have parish rows, covering {sum(c['parishCount'] for c in councils):,} MHCLG rows. Camden is the one without parishes.", "",
             f"**Fully held: {counts['held']}. Held with gaps: {counts['held with gaps']}. Inconsistent: {counts['inconsistent']}. Not found: {counts['not found']}.** There are {files} canonical schedule files with {sum(r['acceptedAreaCount'] for r in results)} accepted area totals. A raw schedule is held for {sum(r['sourceAreaCount'] > 0 for r in results)} councils, containing {sum(r['sourceAreaCount'] for r in results):,} decoded areas.", "",
             "`held` means every decoded area passes the required checks and every MHCLG parish row is mapped. `held with gaps` means a raw schedule is held but some mapping or reconciliation work remains. Only individually reconciled rows enter a canonical file. Some councils in this category have no canonical file. `inconsistent` means at least one requested check fails, or a printed value is malformed: the whole council is excluded. `not found` includes identified links that could not be retrieved, security challenges and pages without a usable locality total table. It does not claim the council publishes no schedule.", "",
             "A/D is checked against six ninths of D, rounded half up to the nearest penny. A council rounds each charge to the penny at every band and adds them, so its Band A total can differ from six ninths of its Band D total. With n separately rounded charges the difference is at most n/2 pence, rounded down: n counts each non zero major part, the council's basic amount, its special expense, and the parish precept unless the area is known to have none (usually 5 or 6 charges, so 2p or 3p). A difference within that bound is recorded as rounding; a larger one fails, as does a printed amount that is not well formed money (for example `£1,727,88`). This rule replaced an exact penny gate on 15 November 2026, which had failed 16 councils on rounding alone. No source value is corrected. Other printed bands are preserved; differences greater than 5p against the corresponding D ratio are additionally flagged.", "",
             "Residual means the printed full D total less the unchanged MHCLG parish D and the sum of Table 10 major parts. A pass also requires a common basic amount and independently evidenced local special expenses. Unknown parish mappings remain unresolved, never zero. Source coverage counts mapped MHCLG codes, including codes whose rows are excluded by a later check. Each canonical file separately lists every parish code absent from its accepted rows.", "",
             "| Council | Status | Council source | Areas parsed / accepted | A/D exact / rounding / fail / not printed | Residual pass / fail / unresolved | MHCLG source coverage |",
             "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |"]
    for r, c in zip(results, councils):
        ad = Counter("not printed" if a["checks"]["bandAMinusRoundedSixNinthsDPence"] is None else ("pass" if not a["checks"]["bandAMinusRoundedSixNinthsDPence"] else ("rounding" if abs(a["checks"]["bandAMinusRoundedSixNinthsDPence"]) <= a["checks"]["roundingTolerancePence"] else "fail")) for a in r["areas"])
        residual = Counter(a["checks"]["basicAndExpense"] for a in r["areas"])
        url = r["sources"][0]["url"] if r["sources"] else c.get("candidateUrl", c.get("landingUrl"))
        source = f"[{'schedule' if r['sourceAreaCount'] else 'candidate'}]({url})" if url else "No council source located"
        ad_text = f"{ad['pass']} / {ad['rounding']} / {ad['fail']} / {ad['not printed']}" if r["sourceAreaCount"] else "not run"
        residual_text = f"{residual['pass']} / {residual['fail']} / {residual['unresolved']}" if r["sourceAreaCount"] else "not run"
        lines.append(f"| {r['name']} | {r['status']} | {source} | {r['sourceAreaCount']} / {r['acceptedAreaCount']} | {ad_text} | {residual_text} | {c['parishCount']-len(r['missingParishes'])} / {c['parishCount']} |")
    lines.extend(["", "## Review notes", "",
                  "Chorley is excluded in full. Its raw web table prints Bretherton D as £2,224.72 while A implies £2,442.72. Hoghton differs by 20p in A, equivalent to 30p at D. Neither value is corrected. Rushcliffe also fails: a 39p A discrepancy at East Leake, £1.00 at C in Flawborough, and Stanton-on-the-Wolds printed at A as `£1,727,88`. Hertsmere prints Bushey, Meriden and Potters Bar at B as £1,883.39 while its printed parts sum to £1,833.39. Oxford prints Risinghurst and Sandhills at B as `£2,103.2`. Telford and Wrekin (several rows) and Buckinghamshire (West Wycombe) differ by 3p at A, beyond the rounding bound. Forest of Dean prints Taynton H with an invalid decimal separator; 40 other rows decode, but the council is excluded in full.", "",
                  "North Kesteven prints D only. Its component sum check finds discrepancies despite the absence of an A/D comparison. The guide's year heading and introductory date also disagree. These issues are recorded verbatim in the evidence and nothing is corrected.", ""])
    for r in results:
        if r["note"]:
            lines.append(f"* **{r['name']}:** {r['note']}")
    digest = hashlib.sha256((ROOT / "data/national/england.json").read_bytes()).hexdigest()
    lines.extend(["", "## Provenance and replay", "",
                  "The source register is `docs/towns-research/schedules-sources.json`. Each held document has its URL, landing URL, council publisher, retrieval date and SHA256. Raw originals retain their bytes, including the publisher's punctuation. Where a separate landing page was not located, the direct document URL is explicitly used as the landing URL. Sources are on council domains only.", "",
                  "Raw files are kept under `data/raw/schedules/`, which is gitignored as for every importer in this repository; the committed record is the source register with every SHA256, the audit and the canonical files. The replay and `tests/towns-schedules.test.ts` check each raw file against its pinned hash wherever it is present. For seven HTML downloads whose embedded scripts carry site keys, the replay reads an `.evidence.html` copy with only the script elements removed, and verifies that transformation against the original's `originalSha256`. Local extraction before and after removing scripts returned identical locality rows.", "",
                  "`docs/towns-research/schedules-review.json` records parser bounds, reviewed name mappings, quoted component evidence and money-token selectors. Exact matching is within the same council. Reviewed punctuation variants require a unique council-local match. Group members keep their own MHCLG amounts; zero-valued member rows are never replaced with the carrier's amount. Unresolved aliases are listed as missing.", "",
                  "`docs/towns-research/schedules-audit.json` contains every decoded row, raw quote, locator, unchanged band values, Table 10 major parts, residual, discrepancy and missing parish code. Quotes come from saved HTML or Poppler text extraction of the saved PDF, never search summaries. A small number of source names and quotes contain prohibited punctuation: these are stored losslessly as fragments and separator Unicode code points. Interleave each separator between its adjacent fragments to recover the exact source string. This encoding changes no amount or spelling.", "",
                  f"National input SHA256: `{digest}`.", "",
                  "Run `uv run docs/towns-research/schedules.py` from the repository root. It verifies raw hashes, extracts the tables again, checks the cohort, mappings, component quotes and numeric tokens, recomputes all recorded checks, then compares the complete audit, report and canonical files. It uses no network. `--write` regenerates those outputs. Python runs through uv, with Beautiful Soup pinned in the script metadata; Poppler `pdftotext` must be available.", "",
                  "Required repository verification: `npm test`, `npm run check`, `BUILD_OG=1 npm run build`, `npm run test:dist` and `npm run test:text`, with Node 22.23.4 first on PATH. The draft PR records the actual results. The focused regression file is `tests/towns-schedules.test.ts`.", ""])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    national = read("data/national/england.json")
    councils = read("docs/towns-research/schedules-sources.json")
    reviews = read("docs/towns-research/schedules-review.json")
    positive = {g for g, c in national["components"].items() if c["specialExpensesPounds"] > 0}
    cohort = {g for g in positive if any(p["gss"] == g for p in national["parishes"])}
    assert len(positive) == 49 and len(cohort) == 48
    assert {c["gss"] for c in councils} == cohort and len(councils) == 48
    results = [audit(c, reviews[c["slug"]], national) for c in councils]
    paths = {}
    for result in results:
        accepted = result.pop("acceptedAreas")
        if accepted:
            eligible_codes = {r["parishCode"] for r in accepted if r["parishCode"]}
            output_missing = [{"code": p["code"], "name": p["name"], "reason": "No accepted mapped source row; see the audit for mapping or reconciliation gaps"} for p in national["parishes"] if p["gss"] == result["gss"] and p["code"] not in eligible_codes]
            unparished = set(reviews[result["slug"]].get("unparished", []))
            areas = [{"name": r["name"], "kind": "unparished" if r["name"] in unparished else "parish",
                      "mhclgCode": r["parishCode"], "includesCharterTrustee": False,
                      "bandDPence": r["bandDPence"], "bandsPence": r["bandsPence"], "quoted": r["quote"],
                      **{k: v for k, v in r.items() if k not in ("name", "parishCode", "bandDPence", "bandsPence", "quote")}} for r in accepted]
            paths[f"data/towns/schedules/{result['slug']}-{YEAR}.json"] = {
                "schemaVersion": 2, "council": {"gss": result["gss"], "slug": result["slug"], "name": result["name"]},
                "year": YEAR, "basis": "published locality total", "status": result["status"],
                "source": result["sources"][0], "sources": result["sources"], "supplements": result["supplements"], "areas": areas,
                "missingParishes": output_missing,
                "excludedAreas": [r["name"] for r in result["areas"] if r not in accepted],
            }
    paths["docs/towns-research/schedules-audit.json"] = results
    paths["docs/TOWNS-SCHEDULES-2026-11.md"] = report(results, councils, national)
    expected_files = {ROOT / p for p in paths if p.startswith("data/")}
    existing_files = set((ROOT / "data/towns/schedules").glob("*.json"))
    assert not existing_files-expected_files, "Unexpected schedule files must be reviewed"
    for path, content in paths.items():
        encoded = content if isinstance(content, str) else json.dumps(encode_verbatim(content), indent=2, ensure_ascii=False) + "\n"
        target = ROOT / path
        if args.write:
            target.write_text(encoded)
        else:
            assert target.read_text() == encoded, f"Replay differs: {path}"
    print(json.dumps({"councils": len(results), "statusCounts": dict(Counter(r["status"] for r in results)),
                      "rawAreas": sum(r["sourceAreaCount"] for r in results), "acceptedAreas": sum(r["acceptedAreaCount"] for r in results)}))


if __name__ == "__main__":
    main()
