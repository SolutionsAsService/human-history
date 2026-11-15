"""Task 1: link prediction on the evidence graph.

Question: given the records and a training subset of the links, can a model rank the held-out true links above other pairs better than
simple baselines? If it cannot, its proposed links are not worth a reviewer's time, and the report says so.
"""
from __future__ import annotations
import numpy as np, torch, torch.nn.functional as F
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, f1_score, roc_auc_score
from .dataset import RELS, Data
from .graph import adjacency, edges, known_mask, pair_key, split_edges
from .models import LinkNet
from .utils import set_seed

def hard_candidates(PF: np.ndarray) -> np.ndarray:
    """Plausible-looking non-links: same category, or overlapping in time. Used for half of the negatives."""
    return (PF[..., 1] > 0) | (PF[..., 9] > 0)

def sample_negatives(rng, a: np.ndarray, known: np.ndarray, hard: np.ndarray, k: int):
    N = known.shape[0]; na, nb = [], []
    for x in a:
        got = 0
        while got < k:
            if got % 2 == 0:
                c = rng.choice(np.flatnonzero(hard[x] & ~known[x])) if (hard[x] & ~known[x]).any() else rng.integers(N)
            else:
                c = rng.integers(N)
            if not known[x, c]:
                na.append(x); nb.append(c); got += 1
    return np.array(na), np.array(nb)

@torch.no_grad()
def score_matrix(model: LinkNet, H, PFt) -> np.ndarray:
    N = H.shape[0]
    ii, jj = torch.meshgrid(torch.arange(N), torch.arange(N), indexing="ij")
    out = model.exist_logit(H, ii.reshape(-1), jj.reshape(-1), PFt.reshape(N * N, -1))
    return out.reshape(N, N).numpy()

def ranking(S: np.ndarray, pairs: np.ndarray, known: np.ndarray) -> dict[str, float]:
    """Filtered ranking in both directions: rank b among all columns for row a (excluding other known neighbours), and vice versa."""
    rr, hits = [], {1: 0, 3: 0, 10: 0}
    for a, b in pairs:
        for x, y in ((a, b), (b, a)):
            row = S[x].copy(); mask = known[x].copy(); mask[y] = False
            row[mask] = -np.inf
            r = 1 + int((row > row[y]).sum()) + 0.5 * int(((row == row[y]).sum() - 1))
            rr.append(1.0 / r)
            for k in hits: hits[k] += r <= k
    n = 2 * len(pairs)
    return {"mrr": float(np.mean(rr)), **{f"hits@{k}": v / n for k, v in hits.items()}}

def pair_auc(S: np.ndarray, pos: np.ndarray, known: np.ndarray, rng, ratio: int = 20) -> dict[str, float]:
    N = S.shape[0]; neg = []
    while len(neg) < ratio * len(pos):
        i, j = rng.integers(N, size=2)
        if not known[i, j]: neg.append((i, j))
    neg = np.array(neg)
    y = np.r_[np.ones(len(pos)), np.zeros(len(neg))]
    s = np.r_[S[pos[:, 0], pos[:, 1]], S[neg[:, 0], neg[:, 1]]]
    return {"auroc": float(roc_auc_score(y, s)), "ap": float(average_precision_score(y, s))}

def adamic_adar(N: int, a: np.ndarray, b: np.ndarray) -> np.ndarray:
    M = np.zeros((N, N)); M[a, b] = M[b, a] = 1.0
    w = 1.0 / np.log(np.maximum(M.sum(1), 2.0))
    return (M * w[None, :]) @ M

def train_one(d: Data, Xin: np.ndarray, PF: np.ndarray, SF: np.ndarray, split: dict, seed: int, hid: int = 32, epochs: int = 300, graph: bool = True,
              lr: float = 3e-3, wd: float = 1e-2, dropout: float = 0.3, use_val: bool = True, k_neg: int = 5, patience: int = 8, verbose: bool = False):
    set_seed(seed); rng = np.random.default_rng(seed)
    N = d.n; known = known_mask(N, d)
    tr = split["train"] if not use_val else split["train"]
    a, b, r = edges(d, tr)
    A = adjacency(N, a, b, r)
    X = torch.from_numpy(Xin); PFt = torch.from_numpy(PF); SFt = torch.from_numpy(SF)
    model = LinkNet(X.shape[1], PF.shape[-1], SF.shape[-1], len(RELS), hid=hid, dropout=dropout, graph=graph)
    net = [p for n_, p in model.named_parameters() if not n_.startswith('lin.')]
    opt = torch.optim.AdamW([{'params': net, 'weight_decay': wd}, {'params': model.lin.parameters(), 'weight_decay': 1e-4}], lr=lr)
    hard = hard_candidates(PF)
    va_pairs = None
    if len(split["val"]):
        va, vb, _ = edges(d, split["val"]); va_pairs = np.stack([va, vb], 1)
    best, best_state, best_ep, bad = -1.0, None, 0, 0
    at, bt, rt = torch.from_numpy(a), torch.from_numpy(b), torch.from_numpy(r)
    for ep in range(1, epochs + 1):
        model.train(); opt.zero_grad()
        H = model.embed(X, A)
        na, nb = sample_negatives(rng, a, known, hard, k_neg)
        na_t, nb_t = torch.from_numpy(na), torch.from_numpy(nb)
        pos = model.exist_logit(H, at, bt, PFt[at, bt]); neg = model.exist_logit(H, na_t, nb_t, PFt[na_t, nb_t])
        loss = F.binary_cross_entropy_with_logits(torch.cat([pos, neg]), torch.cat([torch.ones_like(pos), torch.zeros_like(neg)]), pos_weight=torch.tensor(1.0))
        loss = loss + 0.5 * F.cross_entropy(model.rel_logits(H, at, bt, PFt[at, bt], SFt[at, bt]), rt, label_smoothing=0.05)
        loss.backward(); opt.step()
        if va_pairs is not None and ep % 10 == 0:
            model.eval()
            with torch.no_grad(): Hv = model.embed(X, A)
            m = ranking(score_matrix(model, Hv, PFt), va_pairs, known)["mrr"]
            if verbose: print(f"  ep {ep:3d} loss {loss.item():.3f} val-mrr {m:.3f}")
            if m > best: best, best_ep, bad = m, ep, 0; best_state = {k: v.clone() for k, v in model.state_dict().items()}
            else:
                bad += 1
                if bad >= patience: break
    if best_state is not None: model.load_state_dict(best_state)
    model.eval()
    return model, A, best_ep, best

GRID = [dict(graph=False, hid=32), dict(graph=True, hid=32), dict(graph=False, hid=64), dict(graph=True, hid=64)]

def evaluate(d: Data, Xin, Z, PF, SF, seed: int, grid=None, **kw) -> dict:
    """One seed: split edges, pick the configuration by VALIDATION MRR (never test links), then score held-out test links."""
    split = split_edges(d, seed); N = d.n; known = known_mask(N, d); rng = np.random.default_rng(1000 + seed)
    tried = []
    for cfg in (grid or [dict()]):
        m_, A_, ep_, v_ = train_one(d, Xin, PF, SF, split, seed, **{**kw, **cfg}); tried.append((v_, cfg, m_, A_, ep_))
    best_val, cfg, model, A, best_ep = max(tried, key=lambda x: x[0])
    X, PFt = torch.from_numpy(Xin), torch.from_numpy(PF)
    with torch.no_grad(): H = model.embed(X, A)
    S = score_matrix(model, H, PFt)
    ta, tb, tr_ = edges(d, split["test"]); test = np.stack([ta, tb], 1)
    a, b, r = edges(d, split["train"])
    # pair-feature logistic regression: same inputs as the model's pair features, no graph, no learned embeddings
    X_lr, y_lr = [], []
    hard = hard_candidates(PF); nr, nc = sample_negatives(rng, np.repeat(a, 1), known, hard, 5)
    feats_pos = PF[a, b]; feats_neg = PF[nr, nc]
    lr = LogisticRegression(max_iter=2000, C=1.0).fit(np.r_[feats_pos, feats_neg], np.r_[np.ones(len(a)), np.zeros(len(nr))])
    S_lr = lr.decision_function(PF.reshape(N * N, -1)).reshape(N, N)
    scores = {"model": S, "pair-feature logistic regression": S_lr, "text cosine": PF[..., 0], "adamic-adar (train graph)": adamic_adar(N, a, b), "random": rng.random((N, N))}
    res = {name: {**ranking(M, test, known), **pair_auc(M, test, known, np.random.default_rng(7 + seed))} for name, M in scores.items()}
    # relation type on held-out links
    rl = model.rel_logits(H, torch.from_numpy(ta), torch.from_numpy(tb), PFt[ta, tb], torch.from_numpy(SF)[ta, tb]).argmax(-1).numpy()
    rel_lr = LogisticRegression(max_iter=3000, C=1.0).fit(np.c_[PF[a, b], SF[a, b]], r)
    maj = np.bincount(r, minlength=len(RELS)).argmax()
    rel = {"model": rl, "pair+signed-feature logistic regression": rel_lr.predict(np.c_[PF[ta, tb], SF[ta, tb]]), "majority class": np.full_like(tr_, maj)}
    relres = {k: {"accuracy": float((v == tr_).mean()), "macro_f1": float(f1_score(tr_, v, average="macro", labels=sorted(set(tr_)), zero_division=0))} for k, v in rel.items()}
    return {"seed": seed, "best_epoch": best_ep, "chosen": cfg, "val_mrr_by_config": [{**c, "val_mrr": float(v)} for v, c, *_ in tried], "n_train": int(len(split["train"])), "n_val": int(len(split["val"])), "n_test": int(len(split["test"])), "ranking": res, "relation": relres}
