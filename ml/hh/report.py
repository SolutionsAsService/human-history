from __future__ import annotations
from pathlib import Path

def ms(x, digits=3): return f"{x['mean']:.{digits}f} ± {x['std']:.{digits}f}"

def write_report(res: dict, props: dict, path: Path) -> None:
    m = res["meta"]; L = []
    L += [f"# Learning pipeline report", "", f"Generated {m['generated']} · {m['nodes']} nodes ({m['entries']} records) · {m['links']} links · {m['seeds']} seeds · {m['seconds']}s" + (" · FAST MODE (not the full evaluation)" if m["fast"] else ""), "",
          f"> {m['warning']}", ""]
    t1 = res["task1_links"]; r = t1["ranking"]
    L += ["## Task 1 — link prediction", "", f"Held-out links per seed: {t1['n_test']} (80/10/10 split by unordered pair, message passing uses training links only). Filtered ranking in both directions; higher is better. Mean ± std over {t1['runs']} seeds.", "",
          "| method | MRR | Hits@1 | Hits@10 | AUROC | AP |", "|---|---|---|---|---|---|"]
    for k in ["model", "pair-feature logistic regression", "text cosine", "adamic-adar (train graph)", "random"]:
        v = r[k]; L.append(f"| {k} | {ms(v['mrr'])} | {ms(v['hits@1'])} | {ms(v['hits@10'])} | {ms(v['auroc'])} | {ms(v['ap'])} |")
    ch = t1["chosen_graph_share"]
    L += ["", f"Configuration is chosen per seed by validation MRR (never the test links) from {t1['grid_size']} options (graph encoder on/off × width 32/64). The graph encoder was chosen in {ch*100:.0f}% of seeds.", ""]
    mm, lr = r["model"]["mrr"], r["pair-feature logistic regression"]["mrr"]
    L += [f"**Reading:** the network {'beats' if mm['mean'] - mm['std'] > lr['mean'] + lr['std'] else 'does not clearly beat'} the logistic regression on the same pair features (MRR {mm['mean']:.3f} vs {lr['mean']:.3f}). Link proposals are only as good as this margin.", "",
          "Relation type on held-out links:", "", "| method | accuracy | macro-F1 |", "|---|---|---|"]
    for k, v in t1["relation"].items(): L.append(f"| {k} | {ms(v['accuracy'])} | {ms(v['macro_f1'])} |")
    L += ["", "Missing links are not negatives: a true link that the ledger simply lacks is scored as wrong here, so ranking metrics are pessimistic (positive-unlabelled setting).", ""]
    t2 = res["task2_status"]
    L += ["## Task 2 — status second-look", "", "Out-of-fold predictions only. Metrics are in *status steps* (E1 to E8 = 0 to 7).", ""]
    for f, v in t2.items():
        L += [f"### {'Evidence status' if f == 'ev' else 'Interpretation status (given the evidence status)'}", "", f"{v['n']} records; class counts E1..E8: {v['class_counts']}; flagged for a second look: **{v['n_flagged']}**", "", "| method | MAE (steps) | exact | within 1 | weighted kappa | ECE |", "|---|---|---|---|---|---|"]
        for k, x in v["metrics"].items(): L.append(f"| {k} | {x['mae_steps']:.2f} | {x['exact']:.2f} | {x['within1']:.2f} | {x['qwk']:.2f} | {x.get('ece', float('nan')):.2f} |")
        L.append("")
    L += ["The statuses are the authors' own judgements: the model learns those habits. A flag means *inconsistent with how similar records were judged*, not *wrong*.", ""]
    t3 = res["task3_alternatives"]; rt = t3["retrieval"]
    L += ["## Task 3 — alternative-interpretation archetypes", "", f"{t3['n_alternatives']} alternatives assigned by the taxonomy in `ml/archetypes.json` to {t3['k']} archetypes ({t3['coverage']*100:.0f}% of alternatives matched); {t3['n_archetypes_modelled']} with enough support are modelled. 10-fold cross-validation by record.", "",
          "| method | recall@3 | recall@5 | MRR | macro AP |", "|---|---|---|---|---|"]
    for k, v in rt.items(): L.append(f"| {k} | {v['recall@3']:.3f} | {v['recall@5']:.3f} | {v['mrr']:.3f} | {v['macro_ap']:.3f} |")
    g = rt["model"]["recall@3"] - rt["category prior"]["recall@3"]
    L += ["", f"**Reading:** the model's recall@3 is {g:+.3f} against the category prior; {'a real but modest gain' if g > 0.02 else 'no clear gain over knowing the category'}.", "", "Archetypes (examples are the authors' own alternative names):", ""]
    for a in t3["archetypes"]: L.append(f"- **{a['label']}** ({a['support']} records) — e.g. {'; '.join(a['examples'][:2])}")
    L += ["", f"Alternatives the taxonomy did not match ({len(t3['unassigned'])}; extend `archetypes.json` from this list): " + "; ".join(f"“{u['name']}”" for u in t3['unassigned'][:25]) + (" ..." if len(t3['unassigned']) > 25 else ""), ""]
    L += ["", "## Proposals written", "", f"- {len(props['links'])} link proposals, {len(props['alternatives'])} alternative-interpretation proposals, {len(props['status_second_looks'])} status second-looks (`out/proposals.json`). All `unreviewed`.", ""]
    L += ["## What this cannot do", "", "- It cannot discover history. It finds regularities in 300-odd records written by the same few authors, and reflects their habits and gaps.",
          "- Proposals are leads: each names precedent records and what those records' authors said would test the idea. Nothing is evidence until a human checks a source.",
          "- Statuses, relations and alternatives are judgements; where the data is thin (E6-E8 are rare) the model is weak and the report says so.", ""]
    path.write_text("\n".join(L))
