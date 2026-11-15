from __future__ import annotations
import math, os, random
import numpy as np
import torch

def set_seed(seed: int) -> None:
    random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
    torch.use_deterministic_algorithms(False)   # CPU ops here are deterministic already; kept off to avoid spurious errors

def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dphi, dl = p2 - p1, np.radians(lon2 - lon1)
    a = np.sin(dphi / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dl / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(np.clip(a, 0, 1)))

def log_years(d):
    """Signed log scale of a year difference, ~[-1, 1] over the range of the data."""
    return np.sign(d) * np.log1p(np.abs(d)) / 16.0

def threads() -> None:
    torch.set_num_threads(max(1, (os.cpu_count() or 2) - 1))
