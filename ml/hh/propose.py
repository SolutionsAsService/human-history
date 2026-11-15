"""Turns model outputs into reviewable proposals. Nothing here writes to src/data: proposals are JSON for a person to accept or reject."""
from __future__ import annotations
import numpy as np, torch
from .dataset import RELS, STATUSES, Data
from .utils import haversine_km

PROPOSABLE = [r for r in RELS if r != "independently_corroborates"]      # corroboration needs independent sources: never proposed
NEEDS_SOURCES = {"supports", "contradicts", "derived_from"}              # relations that assert evidence, so a proposal is only a hint

def _tol(n): return max(150.0, 0.05 * abs(n["end"] - n["start"]))

def plausible(rel: str, cos: float, same_cat: bool, ov: bool, years: float) -> bool:
    """Hand-set precision filters (not learned): an evidentiary claim needs topical relatedness; 'similar to' needs a similar kind of record."""
    if rel in NEEDS_SOURCES: return cos >= 0.25 and years <= 3000
    if rel == "shares_characteristics_with": return cos >= 0.2 or same_cat
    if rel == "correlates_with": return years <= 2500 and (cos >= 0.1 or same_cat)
    if rel in ("predates", "postdates", "potentially_influenced"): return cos >= 0.15 or (same_cat and years <= 4000)
    return True

def feasible(rel: str, A: dict, B: dict) -> bool:
    """Same direction/time/geography rules the app's audit enforces (src/lib/audit.ts), so a proposal never starts with an audit error."""
    if A["deep"] or B["deep"]: return True
    ta, tb = _tol(A), _tol(B)
    if rel == "predates": return A["start"] <= B["start"] + ta + tb
    if rel == "postdates": return A["start"] >= B["start"] - ta - tb
    if rel == "derived_from": return B["start"] <= A["start"] + ta + tb + 100
    if rel == "potentially_influenced": return A["start"] <= B["end"] + tb + 200
    soft = A["dateKind"] in ("claimed", "textual") or B["dateKind"] in ("claimed", "textual") or A["cat"] == "lostciv" or B["cat"] == "lostciv"
    ov = min(A["end"], B["end"]) - max(A["start"], B["start"])
    if rel == "correlates_with": return soft or not (ov < 0 and -ov > 2500)
    if rel == "geographically_associated_with":
        if A["lat"] is None or B["lat"] is None: return False
        return float(haversine_km(A["lat"], A["lon"], B["lat"], B["lon"])) <= 1500
    return True

def link_proposals(d: Data, model, H, S: np.ndarray, known: np.ndarray, PFt, SFt, top: int = 150, pool: int = 900, rel_probs_min: float = 0.0):
    N = d.n; iu, ju = np.triu_indices(N, 1); keep = ~known[iu, ju]
    iu, ju = iu[keep], ju[keep]
    # events are context, not subjects: never propose event-event links
    isent = np.array([n["kind"] == "entry" for n in d.nodes]); ok = isent[iu] | isent[ju]; iu, ju = iu[ok], ju[ok]
    sc = (S[iu, ju] + S[ju, iu]) / 2; order = np.argsort(-sc)[:pool]
    out = []
    for o in order:
        i, j = int(iu[o]), int(ju[o]); best = None
        for a, b in ((i, j), (j, i)):
            at, bt = torch.tensor([a]), torch.tensor([b])
            with torch.no_grad(): p = torch.softmax(model.rel_logits(H, at, bt, PFt[at, bt], SFt[at, bt]), -1)[0].numpy()
            for r in np.argsort(-p):
                rel = RELS[r]
                gy_ = max(0.0, max(d.nodes[a]["start"], d.nodes[b]["start"]) - min(d.nodes[a]["end"], d.nodes[b]["end"]))
                if rel in PROPOSABLE and feasible(rel, d.nodes[a], d.nodes[b]) and plausible(rel, float(PFt[a, b, 0]), bool(PFt[a, b, 1] > 0), bool(PFt[a, b, 9] > 0), gy_):
                    if best is None or p[r] > best[0]: best = (float(p[r]), a, b, rel)
                    break
        if best is None: continue
        pr, a, b, rel = best; A, B = d.nodes[a], d.nodes[b]
        km = None if A["lat"] is None or B["lat"] is None else float(haversine_km(A["lat"], A["lon"], B["lat"], B["lon"]))
        gy = max(0.0, max(A["start"], B["start"]) - min(A["end"], B["end"]))
        out.append({"kind": "link", "a": A["id"], "b": B["id"], "relation": rel, "pair_score": float(sc[o]), "relation_prob": pr, "needs_sources": rel in NEEDS_SOURCES,
                    "evidence": {"text_cosine": float(PFt[a, b, 0]), "same_category": bool(PFt[a, b, 1] > 0), "km": None if km is None else round(km), "years_apart": round(gy)},
                    "review": {"status": "unreviewed", "by": None}})
        if len(out) >= top: break
    return out

def alternative_proposals(d: Data, arch: dict, P_oof: np.ndarray, Xcombo: np.ndarray, per_record: int = 2, min_p: float = 0.25, max_total: int = 260):
    Y = arch["Y"]; tax = arch["tax"]; rows = arch["rows"]; assign = arch["assign"]
    entries = [i for i, n in enumerate(d.nodes) if n["kind"] == "entry"]
    Zc = Xcombo - Xcombo.mean(0, keepdims=True); Zc = Zc / np.maximum(np.linalg.norm(Zc, axis=1, keepdims=True), 1e-6)
    by_alt: dict[tuple[int, int], dict] = {}
    for (i, a), got in zip(rows, assign):
        for c in got: by_alt.setdefault((i, c), a)
    out = []
    for i in entries:
        cand = [c for c in arch["keep"] if Y[i, c] == 0 and P_oof[i, c] >= min_p]
        cand.sort(key=lambda c: -P_oof[i, c])
        for c in cand[:per_record]:
            having = np.flatnonzero(Y[:, c] > 0); having = having[having != i]
            sim = Zc[having] @ Zc[i]; prec = having[np.argsort(-sim)[:3]]
            precedents = []
            for p in prec:
                n = d.nodes[int(p)]; alt = by_alt.get((int(p), c)) or {"name": "", "status": ""}
                precedents.append({"record": n["id"], "alternative": alt["name"], "alternative_status": alt["status"], "authors_said_would_test": (n["predictions"][:1] or n["againstList"][:1] or [""])[0], "similarity": float(Zc[int(p)] @ Zc[i])})
            out.append({"kind": "alternative", "record": d.nodes[i]["id"], "archetype": {"id": tax[c]["id"], "label": tax[c]["label"], "what_to_check": tax[c]["what_to_check"], "records_with": int(len(having))}, "score": float(P_oof[i, c]),
                        "precedents": precedents, "review": {"status": "unreviewed", "by": None}})
    out.sort(key=lambda x: -x["score"])
    return out[:max_total]

def second_look_proposals(d: Data, entry_idx: np.ndarray, field: str, declared: np.ndarray, er: np.ndarray, gap: np.ndarray, std: np.ndarray, sel: np.ndarray, neigh):
    out = []
    for s in sel:
        i = int(entry_idx[s]); n = d.nodes[i]
        out.append({"kind": "status", "record": n["id"], "field": field, "declared": STATUSES[int(declared[s])], "model_expectation": round(float(er[s]) + 1, 2), "model_band": STATUSES[int(np.clip(round(float(er[s])), 0, 7))],
                    "direction": "model expects a WEAKER status than declared" if gap[s] > 0 else "model expects a STRONGER status than declared", "stability_std": round(float(std[s]), 2),
                    "similar_records_declared_differently": [{"record": d.nodes[int(entry_idx[k])]["id"], "declared": STATUSES[int(declared[k])]} for k in neigh(s)],
                    "audit_triangulation_band": n["audit"]["triangBand"], "review": {"status": "unreviewed", "by": None}})
    return out
