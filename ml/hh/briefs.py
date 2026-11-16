"""Rebuild research briefs from existing proposals without retraining: python -m hh.briefs [out_dir]"""
import json, sys
from pathlib import Path
from .dataset import load
from .sourcing import build
out = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "out")
P = json.loads((out / "proposals.json").read_text()); b = build(load(), P)
(out / "briefs.json").write_text(json.dumps({"meta": {**P["meta"], "n": len(b), "note": "Briefs for RDADA. Nothing here is evidence."}, "briefs": b}, indent=1))
print(len(b), "briefs ->", out / "briefs.json")
