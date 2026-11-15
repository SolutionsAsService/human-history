"""Text features: TF-IDF -> truncated SVD. Unsupervised and fitted on node text only (no statuses, no alternatives)."""
from __future__ import annotations
import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize

def node_text(d, with_for_against: bool = True) -> list[str]:
    return [n["text"] + (" . " + n["textForAgainst"] if with_for_against else "") for n in d.nodes]

def embed(texts: list[str], dim: int = 64, seed: int = 0, ngram=(1, 2), min_df: int = 2):
    vec = TfidfVectorizer(sublinear_tf=True, min_df=min_df, max_df=0.6, ngram_range=ngram, stop_words="english", max_features=12000)
    X = vec.fit_transform(texts)
    k = min(dim, X.shape[1] - 1, X.shape[0] - 1)
    svd = TruncatedSVD(k, random_state=seed)
    Z = normalize(svd.fit_transform(X))
    if Z.shape[1] < dim:
        Z = np.pad(Z, ((0, 0), (0, dim - Z.shape[1])))
    return Z.astype(np.float32), vec, X
