# Learning pipeline report

Generated 2026-11-15 · 354 nodes (321 records) · 521 links · 5 seeds · 214s

> Model-generated leads for a human reviewer. Not evidence. Nothing here has been checked against a source. Statuses are the authors' own judgements.

## Task 1 — link prediction

Held-out links per seed: 52 (80/10/10 split by unordered pair, message passing uses training links only). Filtered ranking in both directions; higher is better. Mean ± std over 5 seeds.

| method | MRR | Hits@1 | Hits@10 | AUROC | AP |
|---|---|---|---|---|---|
| model | 0.415 ± 0.053 | 0.281 ± 0.064 | 0.692 ± 0.072 | 0.945 ± 0.017 | 0.660 ± 0.042 |
| pair-feature logistic regression | 0.414 ± 0.057 | 0.288 ± 0.062 | 0.692 ± 0.072 | 0.933 ± 0.026 | 0.640 ± 0.041 |
| text cosine | 0.395 ± 0.041 | 0.275 ± 0.048 | 0.647 ± 0.064 | 0.914 ± 0.028 | 0.616 ± 0.044 |
| adamic-adar (train graph) | 0.153 ± 0.034 | 0.061 ± 0.043 | 0.298 ± 0.042 | 0.653 ± 0.024 | 0.253 ± 0.044 |
| random | 0.020 ± 0.004 | 0.004 ± 0.005 | 0.027 ± 0.011 | 0.472 ± 0.081 | 0.048 ± 0.010 |

Configuration is chosen per seed by validation MRR (never the test links) from 4 options (graph encoder on/off × width 32/64). The graph encoder was chosen in 0% of seeds.

**Reading:** the network does not clearly beat the logistic regression on the same pair features (MRR 0.415 vs 0.414). Link proposals are only as good as this margin.

Relation type on held-out links:

| method | accuracy | macro-F1 |
|---|---|---|
| model | 0.427 ± 0.032 | 0.338 ± 0.047 |
| pair+signed-feature logistic regression | 0.374 ± 0.034 | 0.265 ± 0.027 |
| majority class | 0.199 ± 0.021 | 0.034 ± 0.004 |

Missing links are not negatives: a true link that the ledger simply lacks is scored as wrong here, so ranking metrics are pessimistic (positive-unlabelled setting).

## Task 2 — status second-look

Out-of-fold predictions only. Metrics are in *status steps* (E1 to E8 = 0 to 7).

### Evidence status

321 records; class counts E1..E8: [240, 41, 17, 2, 21, 0, 0, 0]; flagged for a second look: **12**

| method | MAE (steps) | exact | within 1 | weighted kappa | ECE |
|---|---|---|---|---|---|
| model | 0.31 | 0.75 | 0.95 | 0.76 | 0.09 |
| majority class | 0.51 | 0.75 | 0.88 | 0.00 | nan |
| category median | 0.44 | 0.74 | 0.91 | 0.45 | nan |
| logistic regression | 0.35 | 0.76 | 0.94 | 0.66 | nan |
| audit triangulation band | 0.81 | 0.44 | 0.81 | 0.41 | nan |
| model, structured features only (no text) | 0.33 | 0.78 | 0.94 | 0.67 | 0.10 |

### Interpretation status (given the evidence status)

321 records; class counts E1..E8: [38, 126, 86, 3, 21, 5, 24, 18]; flagged for a second look: **32**

| method | MAE (steps) | exact | within 1 | weighted kappa | ECE |
|---|---|---|---|---|---|
| model | 0.88 | 0.38 | 0.84 | 0.78 | 0.20 |
| majority class | 1.37 | 0.39 | 0.78 | 0.00 | nan |
| category median | 1.02 | 0.40 | 0.83 | 0.51 | nan |
| logistic regression | 0.73 | 0.57 | 0.87 | 0.72 | nan |
| audit triangulation band | 1.44 | 0.28 | 0.67 | 0.31 | nan |
| model, structured features only (no text) | 0.93 | 0.36 | 0.83 | 0.77 | 0.21 |

The statuses are the authors' own judgements: the model learns those habits. A flag means *inconsistent with how similar records were judged*, not *wrong*.

## Task 3 — alternative-interpretation archetypes

226 alternatives assigned by the taxonomy in `ml/archetypes.json` to 16 archetypes (64% of alternatives matched); 14 with enough support are modelled. 10-fold cross-validation by record.

| method | recall@3 | recall@5 | MRR | macro AP |
|---|---|---|---|---|
| model | 0.692 | 0.815 | 0.625 | 0.284 |
| frequency prior | 0.187 | 0.470 | 0.244 | 0.024 |
| category prior | 0.689 | 0.814 | 0.591 | 0.108 |
| kNN (k=10) | 0.661 | 0.732 | 0.614 | 0.197 |
| model without for/against text | 0.653 | 0.741 | 0.562 | 0.246 |
| model without declared statuses | 0.615 | 0.796 | 0.592 | 0.265 |

**Reading:** the model's recall@3 is +0.003 against the category prior; no clear gain over knowing the category.

Archetypes (examples are the authors' own alternative names):

- **A lost advanced civilization or unknown technology** (15 records) — e.g. Work of a technologically advanced lost civilization; Lost advanced construction technology
- **A non-human craft or intelligence** (9 records) — e.g. Technological craft; Non-human technology
- **Misidentification or a mundane cause** (7 records) — e.g. Sensor artefacts or misidentification; Mundane explanation
- **A natural formation rather than a human construction** (5 records) — e.g. Natural fracture / non-hominin percussion; Pre-dynastic Ice Age/Holocene date by rain weathering
- **Contamination, intrusion or a dating artefact** (5 records) — e.g. Younger occupation with downward movement of artefacts; Contamination by old carbon
- **A forgery, hoax or later invention** (6 records) — e.g. Folk tale or garbled account of a foreign vessel; A real völkisch group exaggerated by later occult mythology
- **A symbolic, literary or non-literal reading** (9 records) — e.g. Deliberate burial and symbolic engraving; Reigns as symbolic numbers (sexagesimal)
- **A memory of a real event** (10 records) — e.g. Memory of regional flooding; Memory of the Thera/Minoan catastrophe
- **Contact, diffusion or outside influence** (13 records) — e.g. Folk tale or garbled account of a foreign vessel; Destroyed by Indo-Aryan invasion
- **A different function or purpose** (16 records) — e.g. Practical uses of ochre only; Feasting and prestige-competition hub
- **A different (older or younger) date** (14 records) — e.g. Early Dynastic, before Khafre; Pre-dynastic Ice Age/Holocene date by rain weathering
- **A different population, lineage or species** (13 records) — e.g. Archaic Levantine population with some modern traits; Pathological modern human
- **Over-reading a pattern or selective matching** (11 records) — e.g. Stellar record of a Younger Dryas cometary event; Angle change for a royal reason, not a structural problem
- **A different cause (climate, ecology or politics)** (9 records) — e.g. Sedentism driven by climate stress; Collapsed because of a structural flaw in a rapid design change

Alternatives the taxonomy did not match (81; extend `archetypes.json` from this list): “Debated detail: the ramp system”; “Impossible-precision claims”; “Source region of later Southeast Asian and Pacific cultures”; “Refugium for early modern humans”; “Natural seabed features (paleochannels and bedrock)”; “A global flood at a specific date”; “Specific location candidates (Richat, Bimini, etc.)”; “Speculative Terra Australis”; “Concealed programme / incomplete review”; “Younger Dryas impact destroyed the village”; “Mass human sacrifice at royal funerals”; “A source for Israelite sojourn traditions”; “Evans’s “Minoan thalassocracy” as peaceful priest-kings”; “Homeric Agamemnon’s capital”; “Unlimited unskilled labour or slaves”; “A complete record of all kings”; “The capital of the Xia dynasty”; “Small-scale cultivation supplemented foraging”; “Wine or rice-beer vessels of a legendary giant”; “Borrowed from Near Eastern flood tradition”; “Contains advanced scientific knowledge”; “Inscribed by Hermes Trismegistus in Atlantis or ancient Egypt”; “Secret ancient knowledge suppressed by the Church”; “A direct record of an Ice Age flood”; “Clovis-first” ...


## Proposals written

- 150 link proposals, 53 alternative-interpretation proposals, 44 status second-looks (`out/proposals.json`). All `unreviewed`.

## What this cannot do

- It cannot discover history. It finds regularities in 300-odd records written by the same few authors, and reflects their habits and gaps.
- Proposals are leads: each names precedent records and what those records' authors said would test the idea. Nothing is evidence until a human checks a source.
- Statuses, relations and alternatives are judgements; where the data is thin (E6-E8 are rare) the model is weak and the report says so.
