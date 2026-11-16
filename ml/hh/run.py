"""End-to-end: shape data -> evaluate three tasks against baselines (multi-seed) -> train final models -> write proposals and a report.

    python -m hh.run                  # full (about 10-20 min on 4 CPU cores)
    python -m hh.run --seeds 2 --fast # quick check
"""
from __future__ import annotations
import argparse, json, time
from pathlib import Path
import numpy as np, torch
from . import __version__, archetypes as arch_mod, links, status as st
from .dataset import CATS, STATUSES, load, pair_features, rank, standardise, structured
from .graph import adjacency, edges, known_mask
from .propose import alternative_proposals, link_proposals, second_look_proposals
from .report import write_report
from .text import embed, node_text
from .utils import set_seed, threads

OUT = Path(__file__).resolve().parents[1] / "out"

def agg(runs: list[dict]) -> dict:
    """mean/std over seeds for a nested dict of numbers"""
    if isinstance(runs[0], dict):
        return {k: agg([r[k] for r in runs]) for k in runs[0]}
    a = np.array(runs, dtype=float); return {"mean": float(a.mean()), "std": float(a.std())}

def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument("--seeds", type=int, default=5); ap.add_argument("--fast", action="store_true"); ap.add_argument("--out", default=str(OUT))
    args = ap.parse_args(argv); out = Path(args.out); out.mkdir(parents=True, exist_ok=True); threads(); t0 = time.time()
    d = load(); N = d.n; entries = np.flatnonzero(d.entry_mask)
    Xs, names = structured(d, include_status=False); Xst, _ = structured(d, include_status=True)
    Z, _, _ = embed(node_text(d)); Z_noFA, _, _ = embed(node_text(d, with_for_against=False), seed=1)
    PF, SF = pair_features(d, Z)
    Xlink = np.c_[standardise(Xs), Z].astype(np.float32)
    seeds = list(range(args.seeds)); epochs = 120 if args.fast else 300
    print(f"[data] {N} nodes ({len(entries)} entries), {len(d.links)} links, {Xlink.shape[1]} input features")

    # ---------- Task 1: links
    print("[task 1] link prediction"); runs = []; abl = []
    grid = links.GRID[:2] if args.fast else links.GRID
    for s in seeds:
        runs.append(links.evaluate(d, Xlink, Z, PF, SF, s, grid=grid, epochs=epochs)); print(f"  seed {s}: model MRR {runs[-1]['ranking']['model']['mrr']:.3f} | pair-LR {runs[-1]['ranking']['pair-feature logistic regression']['mrr']:.3f} | chosen {runs[-1]['chosen']} | best epoch {runs[-1]['best_epoch']}")
    t1 = {"runs": len(runs), "ranking": agg([r["ranking"] for r in runs]), "relation": agg([r["relation"] for r in runs]), "best_epochs": [r["best_epoch"] for r in runs], "n_test": runs[0]["n_test"],
          "grid_size": len(grid), "chosen_graph_share": float(np.mean([r["chosen"].get("graph", True) for r in runs])), "chosen": [r["chosen"] for r in runs]}

    # ---------- Task 2: statuses (entries only)
    print("[task 2] status second-look"); ent_X = np.c_[standardise(Xs), Z][entries]
    declared_ev = np.array([rank(d.nodes[i]["ev"]) for i in entries]); declared_in = np.array([rank(d.nodes[i]["interp"]) for i in entries])
    cats = np.array([CATS.index(d.nodes[i]["cat"]) for i in entries]); band = np.array([rank(d.nodes[i]["audit"]["triangBand"]) for i in entries])
    rep = 1 if args.fast else 3
    t2 = {}; sl_all = []
    ent_X_status = np.c_[standardise(Xst), Z][entries]
    CFGS = [dict(hid=64, dropout=0.3, wd=2e-3, epochs=220), dict(hid=32, dropout=0.5, wd=1e-2, epochs=300), dict(hid=16, dropout=0.2, wd=5e-2, epochs=300)]
    for field, y, X in (("ev", declared_ev, ent_X), ("interp", declared_in, np.c_[ent_X, np.eye(8)[declared_ev]])):
        # configuration chosen by cross-validated MAE (tuned on the same folds: a small optimism, noted in the report)
        scored = []
        for cfg in CFGS[:2] if args.fast else CFGS:
            Pc, _ = st.oof(X, y, repeats=1, ens=1, cfg=cfg); scored.append((st.metrics(y, st.pred_class(Pc))["mae_steps"], cfg))
        cfg = min(scored, key=lambda x: x[0])[1]
        P, sd = st.oof(X, y, repeats=rep, ens=1 if args.fast else 2, cfg=cfg)
        yh = st.pred_class(P); m = {"model": st.metrics(y, yh, P)}
        for k, v in st.baselines(X, y, cats, band).items(): m[k] = st.metrics(y, v)
        # ablation: structured only (no text)
        Pn, _ = st.oof(ent_X[:, :Xs.shape[1]] if field == "ev" else X[:, :Xs.shape[1]], y, repeats=1, ens=1, cfg=cfg); m["model, structured features only (no text)"] = st.metrics(y, st.pred_class(Pn), Pn)
        sel, er, gap = st.second_looks(y, P, sd)
        neigh = lambda s, X=X, y=y: [int(k) for k in st.neighbours(np.c_[ent_X], int(s), y)]
        sl_all += second_look_proposals(d, entries, field, y, er, gap, sd, sel, neigh)
        t2[field] = {"config": cfg, "metrics": m, "n_flagged": int(len(sel)), "n": int(len(y)), "class_counts": np.bincount(y, minlength=8).tolist()}
        print(f"  {field}: model MAE {m['model']['mae_steps']:.2f} within1 {m['model']['within1']:.2f} | logreg MAE {m['logistic regression']['mae_steps']:.2f} | audit band MAE {m['audit triangulation band']['mae_steps']:.2f} | flagged {len(sel)}")

    # ---------- Task 3: alternative archetypes
    print("[task 3] alternative archetypes"); arch = arch_mod.build(d)
    keep = arch["keep"]; Yk = arch["Y"][:, keep]; ent_rows = entries
    Xa = np.c_[standardise(Xst), Z]; Xa_noFA = np.c_[standardise(Xst), Z_noFA]; Xa_nostatus = np.c_[standardise(Xs), Z]
    cats_all = np.array([CATS.index(n["cat"]) for n in d.nodes])
    P3, B3 = arch_mod.oof(Xa[ent_rows], Yk[ent_rows], repeats=1 if args.fast else 2, ens=1 if args.fast else 2, cats=cats_all[ent_rows])
    t3 = {"k": arch["k"], "coverage": arch["coverage"], "unassigned": arch["unassigned"], "n_archetypes_modelled": len(keep), "n_alternatives": len(arch["rows"]),
          "retrieval": {"model": arch_mod.retrieval(P3, Yk[ent_rows], np.arange(len(ent_rows))), **{k: arch_mod.retrieval(v, Yk[ent_rows], np.arange(len(ent_rows))) for k, v in B3.items()}}}
    for name, X in (("model without for/against text", Xa_noFA), ("model without declared statuses", Xa_nostatus)):
        Pa, _ = arch_mod.oof(X[ent_rows], Yk[ent_rows], repeats=1, ens=1, cats=cats_all[ent_rows]); t3["retrieval"][name] = arch_mod.retrieval(Pa, Yk[ent_rows], np.arange(len(ent_rows)))
    r = t3["retrieval"]; print(f"  recall@3 model {r['model']['recall@3']:.3f} | category prior {r['category prior']['recall@3']:.3f} | frequency prior {r['frequency prior']['recall@3']:.3f} | kNN {r['kNN (k=10)']['recall@3']:.3f}")
    # expand OOF to full node index space, restricted to kept archetypes -> map back to archetype ids
    Pfull = np.zeros((N, arch["Y"].shape[1])); Pfull[np.ix_(ent_rows, keep)] = P3
    alt_props = alternative_proposals(d, arch, Pfull, Xa)

    # ---------- final link model on ALL edges, with the epoch count the validation runs chose
    print("[final] link model on all edges"); all_ids = np.arange(len(d.links)); final_split = {"train": all_ids, "val": np.array([], dtype=np.int64), "test": np.array([], dtype=np.int64)}
    ep = int(np.median(t1["best_epochs"])) or epochs
    cfgs = t1["chosen"]; cfg = max(cfgs, key=lambda c: sum(c == x for x in cfgs))     # the most frequently validated configuration
    model, A, *_ = links.train_one(d, Xlink, PF, SF, final_split, seed=0, epochs=ep, **cfg)
    with torch.no_grad(): H = model.embed(torch.from_numpy(Xlink), A)
    S = links.score_matrix(model, H, torch.from_numpy(PF))
    link_props = link_proposals(d, model, H, S, known_mask(N, d), torch.from_numpy(PF), torch.from_numpy(SF))

    result = {"meta": {"version": __version__, "generated": time.strftime("%Y-%m-%d"), "nodes": N, "entries": int(len(entries)), "links": len(d.links), "seeds": len(seeds), "fast": args.fast, "seconds": round(time.time() - t0),
                       "warning": "Model-generated leads for a human reviewer. Not evidence. Nothing here has been checked against a source. Statuses are the authors' own judgements."},
              "task1_links": t1, "task2_status": t2, "task3_alternatives": {**t3, "archetypes": [{"id": arch["tax"][c]["id"], "label": arch["tax"][c]["label"], "examples": arch["examples"][c], "support": int(arch["Y"][:, c].sum())} for c in keep]}}
    proposals = {"meta": result["meta"], "links": link_props, "alternatives": alt_props, "status_second_looks": sl_all}
    (out / "results.json").write_text(json.dumps(result, indent=1)); (out / "proposals.json").write_text(json.dumps(proposals, indent=1))
    from .sourcing import build as build_briefs
    briefs = build_briefs(d, proposals); (out / "briefs.json").write_text(json.dumps({"meta": {**result["meta"], "n": len(briefs), "note": "Briefs for RDADA. Nothing here is evidence."}, "briefs": briefs}, indent=1))
    write_report(result, proposals, out / "report.md")
    print(f"[done] {len(link_props)} link proposals, {len(alt_props)} alternative proposals, {len(sl_all)} status second-looks in {time.time() - t0:.0f}s -> {out}")

if __name__ == "__main__":
    main()
