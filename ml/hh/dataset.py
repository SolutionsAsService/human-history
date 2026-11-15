"""Loads the exported dataset and shapes it into tensors.

Leakage control is explicit: `structured()` takes flags for which label-bearing fields an input may see.
 - include_status=False  : ev / interp are never inputs (used when they are the target)
 - include_status=True   : declared statuses may be inputs (used for link and archetype tasks)
Text never contains the alternative interpretations (a prediction target) or the statuses.
"""
from __future__ import annotations
import json
from dataclasses import dataclass
from pathlib import Path
import numpy as np
from .utils import haversine_km, log_years

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "dataset.json"

STATUSES = [f"E{i}" for i in range(1, 9)]
CATS = ["origins", "genetics", "cognition", "settlement", "monument", "submerged", "astronomy", "text", "artifact", "map", "lostciv", "geology", "uap", "esoteric", "event"]
RELS = ["supports", "contradicts", "correlates_with", "predates", "postdates", "derived_from", "shares_characteristics_with", "potentially_influenced", "geographically_associated_with", "independently_corroborates"]
REGIONS = ["Africa", "Europe", "West & Central Asia", "South Asia", "East Asia", "SE Asia & Australasia", "North America", "Mesoamerica & S. America", "Pacific & Atlantic islands", "Other", "global"]
DATEKINDS = ["measured", "estimated", "claimed", "textual"]
CONF = ["low", "medium", "high"]
SRC_KINDS = ["primary", "secondary", "alternative", "official", "skeptical"]
SRC_REL = ["high", "medium", "mixed", "low", "unassessed"]

def rank(s: str) -> int:
    """E1..E8 -> 0..7"""
    return int(s[1]) - 1

@dataclass
class Data:
    nodes: list[dict]
    idx: dict[str, int]
    links: list[dict]
    questions: list[dict]
    migrations: list[dict]
    meta: dict

    @property
    def n(self) -> int: return len(self.nodes)
    @property
    def entry_mask(self) -> np.ndarray: return np.array([n["kind"] == "entry" for n in self.nodes])

def load(path: Path | str = DATA) -> Data:
    raw = json.loads(Path(path).read_text())
    nodes = raw["nodes"]
    return Data(nodes=nodes, idx={n["id"]: i for i, n in enumerate(nodes)}, links=raw["links"], questions=raw["questions"], migrations=raw["migrations"], meta=raw["meta"])

def _oh(v, vocab):
    r = [0.0] * len(vocab)
    if v in vocab: r[vocab.index(v)] = 1.0
    return r

def structured(d: Data, include_status: bool = False) -> tuple[np.ndarray, list[str]]:
    """Per-node structured features, standardised later. Returns (X, names)."""
    names: list[str] = []
    def add(prefix, vals):
        names.extend(f"{prefix}:{v}" if isinstance(v, str) else prefix for v in vals)
    rows = []
    first = True
    for n in d.nodes:
        r: list[float] = []
        cur: list[str] = []
        def put(prefix, vals, labels=None):
            r.extend(vals)
            if first: cur.extend(f"{prefix}:{l}" for l in (labels if labels is not None else range(len(vals))))
        put("kind", [1.0 if n["kind"] == "entry" else 0.0], ["entry"])
        put("cat", _oh(n["cat"], CATS), CATS)
        put("priority", _oh(n["priority"], ["P1", "P2", "P3"]), ["P1", "P2", "P3"])
        put("dateKind", _oh(n["dateKind"], DATEKINDS), DATEKINDS)
        put("dateConf", [CONF.index(n["dateConfidence"]) / 2.0], ["ord"])
        p0, p1 = n["pos0"], n["pos1"]
        put("time", [p0, p1, (p0 + p1) / 2, p1 - p0, 1.0 if n["deep"] else 0.0, 1.0 if n["hasAltChron"] else 0.0, 1.0 if n["hasDatingMethod"] else 0.0], ["pos0", "pos1", "mid", "width", "deep", "altChron", "datingMethod"])
        age = max(1.0, 2026 - (n["start"] + n["end"]) / 2)
        put("year", [np.log10(age) / 7.0, np.log1p(abs(n["end"] - n["start"])) / 12.0], ["log10age", "logspan"])
        if n["lat"] is None:
            put("geo", [0.0, 0.0, 0.0, 1.0], ["x", "y", "z", "missing"])
        else:
            la, lo = np.radians(n["lat"]), np.radians(n["lon"])
            put("geo", [np.cos(la) * np.cos(lo), np.cos(la) * np.sin(lo), np.sin(la), 0.0], ["x", "y", "z", "missing"])
        put("region", _oh(n["region"], REGIONS), REGIONS)
        c = n["counts"]
        put("count", [np.log1p(c[k]) / 3.0 for k in ("sources", "physical", "textual", "genetic", "for", "against", "unresolved", "predictions", "alternatives", "lines")], ["sources", "physical", "textual", "genetic", "for", "against", "unresolved", "predictions", "alternatives", "lines"])
        put("srcKind", [np.log1p(n["srcKinds"].get(k, 0)) / 2.0 for k in SRC_KINDS], SRC_KINDS)
        put("srcRel", [np.log1p(n["srcRel"].get(k, 0)) / 2.0 for k in SRC_REL], SRC_REL)
        put("srcMisc", [np.log1p(n["srcPlaceholder"]) / 2.0, np.log1p(n["srcDisciplines"]) / 2.0], ["placeholder", "disciplines"])
        put("text", [np.log1p(len(n["text"])) / 9.0], ["len"])
        if include_status:
            put("ev", _oh(n["ev"], STATUSES), STATUSES)
            put("interp", _oh(n["interp"], STATUSES), STATUSES)
            put("gap", [(rank(n["interp"]) - rank(n["ev"])) / 7.0], ["interp-ev"])
        rows.append(r)
        if first: names = cur; first = False
    return np.asarray(rows, dtype=np.float32), names

def standardise(X: np.ndarray) -> np.ndarray:
    mu, sd = X.mean(0, keepdims=True), X.std(0, keepdims=True)
    return ((X - mu) / np.where(sd < 1e-6, 1.0, sd)).astype(np.float32)

def pair_features(d: Data, Z: np.ndarray):
    """Dense N x N pair features. Symmetric block PF (for 'is there a link') and signed block SF (for 'which relation').
    Deliberately excludes shared-source counts: link sources were written from the records' own sources, so that would leak the label."""
    N = d.n
    lat = np.array([np.nan if n["lat"] is None else n["lat"] for n in d.nodes]); lon = np.array([np.nan if n["lon"] is None else n["lon"] for n in d.nodes])
    p0 = np.array([n["pos0"] for n in d.nodes]); p1 = np.array([n["pos1"] for n in d.nodes])
    s = np.array([n["start"] for n in d.nodes], dtype=float); e = np.array([n["end"] for n in d.nodes], dtype=float)
    cat = np.array([CATS.index(n["cat"]) for n in d.nodes]); reg = np.array([REGIONS.index(n["region"]) for n in d.nodes]); kind = np.array([n["kind"] == "entry" for n in d.nodes])
    cos = Z @ Z.T
    km = haversine_km(lat[:, None], lon[:, None], lat[None, :], lon[None, :])
    miss = np.isnan(km); km = np.where(miss, 0.5 * 20000, km)
    ov = np.clip(np.minimum(p1[:, None], p1[None, :]) - np.maximum(p0[:, None], p0[None, :]), 0, None)
    gp = np.clip(np.maximum(p0[:, None], p0[None, :]) - np.minimum(p1[:, None], p1[None, :]), 0, None)
    gy = np.clip(np.maximum(s[:, None], s[None, :]) - np.minimum(e[:, None], e[None, :]), 0, None)
    PF = np.stack([cos, (cat[:, None] == cat[None, :]).astype(float), (reg[:, None] == reg[None, :]).astype(float), (kind[:, None] == kind[None, :]).astype(float),
                   km / 20000.0, miss.astype(float), ov, gp, np.log1p(gy) / 16.0, (ov > 0).astype(float), np.log1p(np.abs(km)) / 10.0], -1).astype(np.float32)
    SF = np.stack([p0[None, :] - p0[:, None], p1[None, :] - p1[:, None], log_years(s[None, :] - s[:, None]), log_years(e[None, :] - e[:, None]),
                   log_years((s[None, :] + e[None, :]) / 2 - (s[:, None] + e[:, None]) / 2)], -1).astype(np.float32)
    return PF, SF
