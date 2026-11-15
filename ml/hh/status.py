"""Task 2: status second-look.

A model predicts a record's evidence status (and its interpretation status, given the evidence) from its sourcing, dating, category and text.
All predictions are OUT-OF-FOLD: a record is never scored by a model that saw its own label. Where the out-of-fold prediction is stably far from the
declared status, the record is flagged for a second look. The statuses are the authors' own judgements, so a flag means "inconsistent with how the
other records were judged", not "wrong". It is a complement to the rule-based audit, not a replacement.
"""
from __future__ import annotations
import numpy as np, torch, torch.nn.functional as F
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import cohen_kappa_score
from sklearn.model_selection import KFold
from .models import OrdinalMLP
from .utils import set_seed

K = 8

def fit_ordinal(X: np.ndarray, y: np.ndarray, seed: int, epochs: int = 220, lr: float = 3e-3, wd: float = 2e-3, hid: int = 64, dropout: float = 0.3) -> OrdinalMLP:
    set_seed(seed)
    m = OrdinalMLP(X.shape[1], K, hid=hid, dropout=dropout); opt = torch.optim.AdamW(m.parameters(), lr=lr, weight_decay=wd)
    Xt, yt = torch.from_numpy(X), torch.from_numpy(y)
    tgt = (yt[:, None] > torch.arange(K - 1)[None, :]).float()
    # inverse-frequency weights keep the rare statuses from being ignored entirely
    cnt = np.bincount(y, minlength=K).astype(float); w = torch.from_numpy((1.0 / np.sqrt(np.maximum(cnt, 1.0)))[y]).float(); w = w / w.mean()
    for _ in range(epochs):
        m.train(); opt.zero_grad()
        loss = (F.binary_cross_entropy_with_logits(m.cum_logits(Xt), tgt, reduction="none").mean(1) * w).mean()
        loss.backward(); opt.step()
    m.eval(); return m

def predict(m: OrdinalMLP, X: np.ndarray) -> np.ndarray:
    with torch.no_grad(): return m.probs(torch.from_numpy(X)).numpy()

def oof(X: np.ndarray, y: np.ndarray, folds: int = 5, repeats: int = 3, ens: int = 2, seed: int = 0, cfg: dict | None = None):
    """Returns mean class probabilities [n,K] and the std over repeats of the expected rank [n]."""
    n = len(y); P = np.zeros((repeats, n, K))
    for rep in range(repeats):
        for tr, te in KFold(folds, shuffle=True, random_state=seed * 100 + rep).split(X):
            mu, sd = X[tr].mean(0, keepdims=True), X[tr].std(0, keepdims=True); sd = np.where(sd < 1e-6, 1.0, sd)
            Xtr, Xte = ((X[tr] - mu) / sd).astype(np.float32), ((X[te] - mu) / sd).astype(np.float32)
            P[rep, te] = np.mean([predict(fit_ordinal(Xtr, y[tr], seed * 1000 + rep * 10 + e, **(cfg or {})), Xte) for e in range(ens)], 0)
    ranks = (P * np.arange(K)).sum(-1)
    return P.mean(0), ranks.std(0)

def pred_class(P: np.ndarray) -> np.ndarray:
    cum = np.cumsum(P[:, ::-1], 1)[:, ::-1][:, 1:]        # P(y > k)
    return (cum > 0.5).sum(1)

def ece(P: np.ndarray, y: np.ndarray, bins: int = 8) -> float:
    conf, hit = P.max(1), (P.argmax(1) == y); e = 0.0
    for lo in np.linspace(0, 1, bins, endpoint=False):
        m = (conf > lo) & (conf <= lo + 1 / bins)
        if m.any(): e += m.mean() * abs(hit[m].mean() - conf[m].mean())
    return float(e)

def metrics(y: np.ndarray, yhat: np.ndarray, P: np.ndarray | None = None) -> dict[str, float]:
    out = {"mae_steps": float(np.abs(y - yhat).mean()), "exact": float((y == yhat).mean()), "within1": float((np.abs(y - yhat) <= 1).mean()),
           "qwk": float(cohen_kappa_score(y, yhat, weights="quadratic")) if len(set(y)) > 1 and len(set(yhat)) > 1 else 0.0}
    if P is not None: out["ece"] = ece(P, y)
    return out

def baselines(X: np.ndarray, y: np.ndarray, cats: np.ndarray, band: np.ndarray, folds: int = 5, seed: int = 0) -> dict[str, np.ndarray]:
    n = len(y); lr = np.zeros(n, dtype=int); catmed = np.zeros(n, dtype=int); maj = np.zeros(n, dtype=int)
    for tr, te in KFold(folds, shuffle=True, random_state=seed).split(X):
        mu, sd = X[tr].mean(0, keepdims=True), X[tr].std(0, keepdims=True); sd = np.where(sd < 1e-6, 1.0, sd)
        clf = LogisticRegression(max_iter=3000, C=0.5).fit((X[tr] - mu) / sd, y[tr]); lr[te] = clf.predict((X[te] - mu) / sd)
        maj[te] = np.bincount(y[tr], minlength=K).argmax()
        for c in np.unique(cats[te]):
            idx = tr[cats[tr] == c]; catmed[te[cats[te] == c]] = int(np.median(y[idx])) if len(idx) else maj[te][0]
    return {"majority class": maj, "category median": catmed, "logistic regression": lr, "audit triangulation band": band}

def second_looks(declared: np.ndarray, P: np.ndarray, rank_std: np.ndarray, min_gap: float = 1.5, max_std: float = 0.6):
    er = (P * np.arange(K)).sum(1); gap = er - declared
    sel = np.flatnonzero((np.abs(gap) >= min_gap) & (rank_std <= max_std))
    return sel[np.argsort(-np.abs(gap[sel]))], er, gap

def neighbours(Xall: np.ndarray, i: int, y: np.ndarray, exclude_same: bool = True, k: int = 3) -> list[int]:
    Z = Xall - Xall.mean(0, keepdims=True); Z = Z / np.maximum(np.linalg.norm(Z, axis=1, keepdims=True), 1e-6)
    s = Z @ Z[i]; s[i] = -np.inf
    if exclude_same: s[y == y[i]] = -np.inf
    return list(np.argsort(-s)[:k])
