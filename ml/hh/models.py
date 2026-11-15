from __future__ import annotations
import torch
import torch.nn as nn
import torch.nn.functional as F

class RGCNLayer(nn.Module):
    """Relational graph convolution with basis decomposition (Schlichtkrull et al.), dense: the graph has a few hundred nodes."""
    def __init__(self, din: int, dout: int, n_rel: int, bases: int = 4):
        super().__init__()
        self.V = nn.Parameter(torch.empty(bases, din, dout)); self.coef = nn.Parameter(torch.empty(n_rel, bases)); self.self_loop = nn.Linear(din, dout)
        nn.init.xavier_uniform_(self.V.view(bases, -1)); nn.init.xavier_uniform_(self.coef)
    def forward(self, h: torch.Tensor, A: torch.Tensor | None) -> torch.Tensor:
        out = self.self_loop(h)
        if A is None: return out
        W = torch.einsum("rb,bio->rio", self.coef, self.V)
        hr = torch.einsum("rnm,md->rnd", A, h)
        return out + torch.einsum("rnd,rdo->no", hr, W)

class Encoder(nn.Module):
    def __init__(self, din: int, hid: int, n_rel: int, layers: int = 2, dropout: float = 0.2, graph: bool = True):
        super().__init__()
        self.graph = graph; self.inp = nn.Linear(din, hid)
        self.layers = nn.ModuleList([RGCNLayer(hid, hid, n_rel) for _ in range(layers)]); self.drop = nn.Dropout(dropout)
    def forward(self, X: torch.Tensor, A: torch.Tensor | None) -> torch.Tensor:
        h = F.relu(self.inp(X))
        for L in self.layers:
            h = self.drop(h); h = F.relu(L(h, A if self.graph else None)) + h   # residual keeps node identity
        return h

class LinkNet(nn.Module):
    """Encoder + two heads: (1) is there a link between a and b (symmetric), (2) which relation (directional)."""
    def __init__(self, din: int, P: int, S: int, n_rel: int, hid: int = 64, dropout: float = 0.2, graph: bool = True):
        super().__init__()
        self.enc = Encoder(din, hid, 2 * n_rel, dropout=dropout, graph=graph)
        self.lin = nn.Linear(P, 1)   # pair-feature logistic-regression term: a floor the network can only add to
        self.exist = nn.Sequential(nn.Linear(2 * hid + P, hid), nn.ReLU(), nn.Dropout(dropout), nn.Linear(hid, 1))
        self.rel = nn.Sequential(nn.Linear(4 * hid + P + S, hid), nn.ReLU(), nn.Dropout(dropout), nn.Linear(hid, n_rel))
    def embed(self, X, A): return self.enc(X, A)
    def exist_logit(self, H, a, b, PF):
        ha, hb = H[a], H[b]
        return (self.lin(PF) + self.exist(torch.cat([ha * hb, (ha - hb).abs(), PF], -1))).squeeze(-1)
    def rel_logits(self, H, a, b, PF, SF):
        ha, hb = H[a], H[b]
        return self.rel(torch.cat([ha, hb, ha * hb, hb - ha, PF, SF], -1))

class OrdinalMLP(nn.Module):
    """Ordinal (rank-consistent) classifier: one shared score, K-1 ordered thresholds. P(y > k) is monotone in k by construction."""
    def __init__(self, din: int, K: int = 8, hid: int = 64, dropout: float = 0.3):
        super().__init__()
        self.K = K
        self.f = nn.Sequential(nn.Linear(din, hid), nn.ReLU(), nn.Dropout(dropout), nn.Linear(hid, max(4, hid // 2)), nn.ReLU(), nn.Dropout(dropout), nn.Linear(max(4, hid // 2), 1))
        self.d = nn.Parameter(torch.zeros(K - 1))
    def cum_logits(self, x):
        b = -torch.cumsum(F.softplus(self.d + 0.5), 0)          # strictly decreasing thresholds
        return self.f(x) + b[None, :]
    def probs(self, x):
        c = torch.sigmoid(self.cum_logits(x))                    # P(y>k)
        ones, zeros = torch.ones_like(c[:, :1]), torch.zeros_like(c[:, :1])
        return (torch.cat([ones, c], 1) - torch.cat([c, zeros], 1)).clamp_min(1e-6)

class MultiLabelMLP(nn.Module):
    def __init__(self, din: int, K: int, hid: int = 128, dropout: float = 0.4):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(din, hid), nn.ReLU(), nn.Dropout(dropout), nn.Linear(hid, hid), nn.ReLU(), nn.Dropout(dropout), nn.Linear(hid, K))
    def forward(self, x): return self.net(x)
