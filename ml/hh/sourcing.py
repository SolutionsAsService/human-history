"""Turn model outputs and ledger gaps into research briefs for RDADA (the research agent).

The model does not find sources. It decides WHERE a new source would change the ledger most, and writes a brief that says what
the source must show. RDADA then searches the open web, and every candidate it returns is checked by a human before it
enters the ledger (as a `placeholder` source until the exact publication is confirmed).
"""
from __future__ import annotations
import re
from .dataset import Data

SKEPTIC_TERMS = "critique OR rebuttal OR reanalysis OR \"alternative explanation\""

def thinness(n: dict) -> tuple[float, list[str]]:
    """0..1 and the reasons. Only counts facts about the record's own source list, so it is inspectable."""
    why, s = [], 0.0
    k, r = n["srcKinds"], n["srcRel"]; total = max(1, sum(k.values()))
    if total <= 2: s += 0.30; why.append(f"only {total} source(s)")
    if k["primary"] == 0: s += 0.25; why.append("no primary source")
    if k["skeptical"] == 0 and k["alternative"] == 0 and n.get("againstList"): s += 0.10; why.append("lists counter-evidence but cites no sceptical or alternative source")
    if n["srcDisciplines"] <= 1: s += 0.15; why.append("sources come from a single discipline")
    if n["srcPlaceholder"]: s += min(0.3, 0.1 * n["srcPlaceholder"]); why.append(f"{n['srcPlaceholder']} placeholder source(s) not yet identified")
    low = (r["low"] + r["unassessed"]) / total
    if low >= 0.5: s += 0.15; why.append("most sources low or unassessed reliability")
    return min(1.0, s), why

def queries(n: dict, extra: str = "") -> list[str]:
    """Search strings built only from the record's own title/place; no claims are added."""
    t = re.split(r"\s[—–-]\s", n["title"])[0].strip()
    place = n.get("place") or ""
    base = f"\"{t}\""
    q = [f"{base} {extra}".strip(), f"{base} {place.split(',')[0]} primary source OR analysis OR review".strip(), f"{base} {SKEPTIC_TERMS}"]
    return list(dict.fromkeys(q))

def build(d: Data, proposals: dict, max_records: int = 60, max_links: int = 20) -> list[dict]:
    by_id = {n["id"]: n for n in d.nodes}
    flags = {}
    for p in proposals["status_second_looks"]: flags.setdefault(p["record"], []).append(p)
    alts = {}
    for p in proposals["alternatives"]: alts.setdefault(p["record"], []).append(p)
    briefs = []
    for n in d.nodes:
        if n["kind"] != "entry": continue
        th, why = thinness(n)
        need, reasons, asks, kinds = th, list(why), [], set()
        for f in flags.get(n["id"], []):
            gap = abs(f["model_expectation"] - (int(f["declared"][1]) - 1)); need += min(0.4, 0.15 * gap)
            reasons.append(f"model second look on {f['field']}: declared {f['declared']}, similar records suggest {f['model_band']} ({f['direction']})")
            asks.append("Find an independent source that either supports or fails to support the declared status; say which." ); kinds.update({"primary", "skeptical"})
        for a in alts.get(n["id"], []):
            need += 0.12
            reasons.append(f"model suggests the alternative type “{a['archetype']['label']}” (score {a['score']:.2f}; unreviewed)")
            asks.append(f"Look for evidence on: {a['archetype']['what_to_check']}"); kinds.update({"primary", "alternative"})
        for u in n.get("unresolved", [])[:3]:
            asks.append(f"Unresolved in the ledger: {u}"); need += 0.03
        if not asks: asks.append("Find primary or review sources that bear on the record's central claim.")
        if th >= 0.3: kinds.update({"primary", "skeptical"})
        if need < 0.35: continue
        briefs.append({"id": f"rec:{n['id']}", "kind": "record", "records": [n["id"]], "need": round(float(need), 3), "reasons": reasons, "asks": list(dict.fromkeys(asks)),
                       "wanted_kinds": sorted(kinds or {"primary"}), "queries": queries(n), "context": {"title": n["title"], "place": n.get("place"), "start": n["start"], "end": n["end"], "cat": n["cat"], "current_sources": n["srcKinds"], "ev": n["ev"], "interp": n["interp"]}})
    for p in proposals["links"]:
        if not p.get("needs_sources"): continue
        a, b = by_id[p["a"]], by_id[p["b"]]
        briefs.append({"id": f"link:{p['a']}~{p['b']}", "kind": "link", "records": [p["a"], p["b"]], "need": round(0.3 + 0.2 * min(1.0, p["pair_score"] / 3), 3),
                       "reasons": [f"model proposes “{p['relation']}” between these records (unreviewed); an evidentiary relation needs a source that actually connects them"],
                       "asks": [f"Is there a published source that connects {a['title'].split(' — ')[0]} and {b['title'].split(' — ')[0]} in the way “{p['relation']}” implies? If none, say so."],
                       "wanted_kinds": ["primary", "secondary"], "queries": [f"\"{a['title'].split(' — ')[0]}\" \"{b['title'].split(' — ')[0]}\""],
                       "context": {"a": a["title"], "b": b["title"]}})
    rec = sorted([b for b in briefs if b["kind"] == "record"], key=lambda b: -b["need"])[:max_records]
    lnk = sorted([b for b in briefs if b["kind"] == "link"], key=lambda b: -b["need"])[:max_links]
    return rec + lnk
