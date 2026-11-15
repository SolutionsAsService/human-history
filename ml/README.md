# ml — learning pipeline

PyTorch models over the evidence ledger. **Everything here produces leads for a human reviewer, not evidence.** Every proposal is written with `review.status = "unreviewed"`. Statuses (E1–E8) are the authors' own judgements, so the models learn the authors' habits, and a flag means "inconsistent with similar records", not "wrong".

## Run

```
npm run export:ml                 # ledger -> ml/data/dataset.json
cd ml && python -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m hh.run        # full: 5 seeds, 300 epochs  -> ml/out/{report.md,results.json,proposals.json}
.venv/bin/python -m hh.run --fast --seeds 2 --out /tmp/x   # quick check
.venv/bin/python -m pytest tests -q
```

## Tasks

1. **Link prediction.** Relational GCN (basis decomposition) plus a pair-feature logistic term and a regularised residual head; a relation head predicts the type. Edge splits are by unordered pair; message passing sees training links only. Configuration (graph on/off, width) is chosen per seed on validation MRR. Compared with pair-feature logistic regression, text cosine, Adamic–Adar and random. Proposals pass hand-set plausibility filters (`propose.plausible`) and a mirror of the audit's feasibility rules.
2. **Status second look.** Ordinal (CORAL-style) network, out-of-fold K-fold predictions only, compared with majority, category median, logistic regression and the audit triangulation band. Records whose declared status differs from the out-of-fold expectation are flagged with the similar records judged differently.
3. **Alternative archetypes.** Multi-label MLP over a human-editable taxonomy (`archetypes.json`, regex weak labels). Predicts which kinds of alternative a record may deserve, with the three nearest precedents and what would need checking. Unmatched alternatives are listed in the report so the taxonomy can be extended.

## Leakage control

Statuses and alternatives are never in node text; status features are excluded when status is the target; features derived from shared sources are excluded for link prediction; standardisation is fit per fold. `tests/` checks these.

## Limits

Thin data (about 320 records, 226 alternatives; E4 and E6–E8 rare). Missing links are not negatives (positive-unlabelled). Read `out/report.md` for whether each model actually beats its baseline; where it does not, the report says so.
