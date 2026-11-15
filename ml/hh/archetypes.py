"""Task 3: alternative-interpretation archetypes.

Every record lists the alternative explanations weighed against its mainstream reading. Across the ledger these fall into a small number of
recurring KINDS (a natural formation instead of a structure, contamination instead of an early date, a later forgery, a lost advanced
civilization, a different function, ...). A human-editable taxonomy (ml/archetypes.json) assigns each alternative to archetypes; a network then
learns, from a record's evidence profile alone (NOT from its alternatives), which archetypes records like it have been weighed against.

A proposal is: "records with this profile usually have this kind of alternative weighed, and this one has not". It names real precedent
records and quotes what THEIR authors said would test it. It is a prompt to go and look, not a claim that the alternative is true.
"""
from __future__ import annotations
import json, re
from pathlib import Path
import numpy as np, torch, torch.nn.functional as F
from sklearn.metrics import average_precision_score
from sklearn.model_selection import KFold
from .models import MultiLabelMLP
from .utils import set_seed

TAXONOMY = Path(__file__).resolve().parents[1] / "archetypes.json"

def _hit(arch: dict, name: str, text: str) -> bool:
    ns = sum(bool(re.search(p, name, re.I)) for p in arch["patterns"])
    return ns >= 1 or sum(bool(re.search(p, text, re.I)) for p in arch["patterns"]) >= 2

def build(d, min_support: int = 5, taxonomy: Path = TAXONOMY):
    tax = json.loads(taxonomy.read_text())["archetypes"]
    rows = [(i, a) for i, n in enumerate(d.nodes) for a in n["alternatives"]]
    N, K = len(d.nodes), len(tax)
    Y = np.zeros((N, K), dtype=np.float32); assign = []; unassigned = []
    for (i, a) in rows:
        got = [k for k, t in enumerate(tax) if _hit(t, a["name"], a["text"])]
        assign.append(got)
        for k in got: Y[i, k] = 1.0
        if not got: unassigned.append({"record": d.nodes[i]["id"], "name": a["name"]})
    keep = [k for k in range(K) if int(Y[:, k].sum()) >= min_support]
    examples = [[a["name"] for (i, a), g in zip(rows, assign) if k in g][:3] for k in range(K)]
    return {"tax": tax, "rows": rows, "assign": assign, "Y": Y, "keep": keep, "examples": examples, "unassigned": unassigned, "k": K,
            "coverage": float(1 - len(unassigned) / max(1, len(rows)))}

def fit(X: np.ndarray, Y: np.ndarray, seed: int, epochs: int = 260, lr: float = 3e-3, wd: float = 5e-3) -> MultiLabelMLP:
    set_seed(seed); m = MultiLabelMLP(X.shape[1], Y.shape[1]); opt = torch.optim.AdamW(m.parameters(), lr=lr, weight_decay=wd)
    Xt, Yt = torch.from_numpy(X), torch.from_numpy(Y)
    for _ in range(epochs):
        m.train(); opt.zero_grad(); F.binary_cross_entropy_with_logits(m(Xt), Yt).backward(); opt.step()
    m.eval(); return m

def oof(X: np.ndarray, Y: np.ndarray, folds: int = 10, repeats: int = 2, ens: int = 2, seed: int = 0, cats: np.ndarray | None = None):
    n, k = Y.shape; P = np.zeros((repeats, n, k)); B = {"frequency prior": np.zeros((n, k)), "category prior": np.zeros((n, k)), "kNN (k=10)": np.zeros((n, k))}
    for rep in range(repeats):
        for tr, te in KFold(folds, shuffle=True, random_state=seed * 100 + rep).split(X):
            mu, sd = X[tr].mean(0, keepdims=True), X[tr].std(0, keepdims=True); sd = np.where(sd < 1e-6, 1.0, sd)
            Xtr, Xte = ((X[tr] - mu) / sd).astype(np.float32), ((X[te] - mu) / sd).astype(np.float32)
            P[rep, te] = np.mean([torch.sigmoid(fit(Xtr, Y[tr], seed * 1000 + rep * 10 + e)(torch.from_numpy(Xte))).detach().numpy() for e in range(ens)], 0)
            if rep == 0:
                B["frequency prior"][te] = Y[tr].mean(0)
                if cats is not None:
                    for c in np.unique(cats[te]):
                        m = tr[cats[tr] == c]; B["category prior"][te[cats[te] == c]] = Y[m].mean(0) if len(m) >= 5 else Y[tr].mean(0)
                Z = Xte / np.maximum(np.linalg.norm(Xte, axis=1, keepdims=True), 1e-6); Zt = Xtr / np.maximum(np.linalg.norm(Xtr, axis=1, keepdims=True), 1e-6)
                nn = np.argsort(-(Z @ Zt.T), 1)[:, :10]; B["kNN (k=10)"][te] = Y[tr][nn].mean(1)
    return P.mean(0), B

def retrieval(P: np.ndarray, Y: np.ndarray, rows: np.ndarray) -> dict[str, float]:
    """Among records with >=1 archetype: do the true archetypes rank near the top? Recall@k, MRR of the first hit, macro AP over archetypes."""
    rec3 = rec5 = mrr = 0.0; n = 0
    for i in rows:
        true = np.flatnonzero(Y[i] > 0)
        if not len(true): continue
        order = np.argsort(-P[i]); pos = {c: r for r, c in enumerate(order)}
        rec3 += np.mean([pos[c] < 3 for c in true]); rec5 += np.mean([pos[c] < 5 for c in true]); mrr += 1.0 / (min(pos[c] for c in true) + 1); n += 1
    ap = [average_precision_score(Y[rows, c], P[rows, c]) for c in range(Y.shape[1]) if Y[rows, c].sum() >= 3]
    return {"recall@3": rec3 / n, "recall@5": rec5 / n, "mrr": mrr / n, "macro_ap": float(np.mean(ap)), "n_records": n}
