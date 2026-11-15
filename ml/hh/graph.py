from __future__ import annotations
import numpy as np
import torch
from .dataset import RELS, Data

R = len(RELS)

def pair_key(a: int, b: int):
    return (a, b) if a < b else (b, a)

def split_edges(d: Data, seed: int, frac=(0.8, 0.1, 0.1)) -> dict[str, np.ndarray]:
    """Split by UNORDERED PAIR so a held-out pair never appears (under another relation) in training."""
    rng = np.random.default_rng(seed)
    groups: dict[tuple[int, int], list[int]] = {}
    for i, l in enumerate(d.links):
        groups.setdefault(pair_key(d.idx[l["a"]], d.idx[l["b"]]), []).append(i)
    keys = list(groups); rng.shuffle(keys)
    n = len(keys); n_tr, n_va = int(frac[0] * n), int(frac[1] * n)
    out: dict[str, list[int]] = {"train": [], "val": [], "test": []}
    for j, k in enumerate(keys):
        out["train" if j < n_tr else "val" if j < n_tr + n_va else "test"].extend(groups[k])
    return {k: np.array(sorted(v), dtype=np.int64) for k, v in out.items()}

def edges(d: Data, ids: np.ndarray):
    a = np.array([d.idx[d.links[i]["a"]] for i in ids], dtype=np.int64)
    b = np.array([d.idx[d.links[i]["b"]] for i in ids], dtype=np.int64)
    r = np.array([RELS.index(d.links[i]["rel"]) for i in ids], dtype=np.int64)
    return a, b, r

def adjacency(N: int, a: np.ndarray, b: np.ndarray, r: np.ndarray) -> torch.Tensor:
    """Row-normalised relation adjacency, with an inverse relation per relation. A[rel][target, source]."""
    A = np.zeros((2 * R, N, N), dtype=np.float32)
    for x, y, k in zip(a, b, r):
        A[k, y, x] = 1.0          # message x -> y under relation k
        A[k + R, x, y] = 1.0      # message y -> x under the inverse relation
    deg = A.sum(2, keepdims=True)
    return torch.from_numpy(A / np.maximum(deg, 1.0))

def known_mask(N: int, d: Data) -> np.ndarray:
    """Every linked pair in ANY split (for filtered ranking) plus the diagonal."""
    K = np.eye(N, dtype=bool)
    for l in d.links:
        i, j = d.idx[l["a"]], d.idx[l["b"]]; K[i, j] = K[j, i] = True
    return K
