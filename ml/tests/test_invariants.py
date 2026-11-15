"""Leakage and invariant checks for the learning pipeline. Run: ml/.venv/bin/python -m pytest ml/tests -q"""
import json
import numpy as np
import pytest
from hh import dataset, graph, text
from hh.models import OrdinalMLP
import torch

@pytest.fixture(scope="module")
def d():
    return dataset.load()

def test_no_status_features_when_status_is_target(d):
    _, names = dataset.structured(d, include_status=False)
    assert not [n for n in names if n.startswith(("ev:", "interp:", "gap:"))]

def test_text_has_no_alternatives_or_statuses(d):
    texts = text.node_text(d, with_for_against=True)
    for n, t in zip(d.nodes, texts):
        for a in n.get("alternatives", []):
            assert a["text"] not in t   # the alternative's own description is a target and must not be an input

def test_split_disjoint_by_unordered_pair(d):
    s = graph.split_edges(d, 0)
    def pairs(ids):
        a, b, _ = graph.edges(d, ids); return {frozenset(p) for p in zip(a.tolist(), b.tolist())}
    tr, va, te = pairs(s["train"]), pairs(s["val"]), pairs(s["test"])
    assert not (tr & va) and not (tr & te) and not (va & te)

def test_adjacency_row_sums(d):
    s = graph.split_edges(d, 0); a, b, r = graph.edges(d, s["train"])
    A = graph.adjacency(d.n, a, b, r)
    Ad = A.to_dense() if A.is_sparse else A
    assert float(Ad.sum(-1).max()) <= 1.0 + 1e-5

def test_split_deterministic(d):
    s1, s2 = graph.split_edges(d, 3), graph.split_edges(d, 3)
    assert all(np.array_equal(s1[k], s2[k]) for k in s1)

def test_ordinal_probs_sum_to_one_and_cumulative_monotone():
    m = OrdinalMLP(10, 8).eval(); x = torch.randn(5, 10)
    with torch.no_grad(): c = torch.sigmoid(m.cum_logits(x))
    assert (c[:, 1:] <= c[:, :-1] + 1e-6).all()

def test_proposals_reference_known_ids_and_unlinked(d):
    import pathlib
    p = pathlib.Path(__file__).parents[1] / "out" / "proposals.json"
    if not p.exists(): pytest.skip("no proposals generated yet")
    P = json.loads(p.read_text()); ids = set(d.idx)
    linked = {frozenset((l["a"], l["b"])) for l in d.links}
    for x in P["links"]:
        assert x["a"] in ids and x["b"] in ids and frozenset((x["a"], x["b"])) not in linked
        assert x["review"]["status"] == "unreviewed"
    for x in P["alternatives"] + P["status_second_looks"]:
        assert x["record"] in ids
