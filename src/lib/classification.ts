import type { Cat, Status, Relation } from '../types';

export const STATUS: Record<Status, { label: string; short: string; color: string; desc: string }> = {
  E1: { label: 'E1 · Established', short: 'Established', color: '#3ddc97', desc: 'Independently documented and supported by strong evidence.' },
  E2: { label: 'E2 · Strong evidence', short: 'Strong', color: '#9fe870', desc: 'Well-supported, with meaningful unresolved questions.' },
  E3: { label: 'E3 · Credible dispute', short: 'Credible dispute', color: '#f1d24a', desc: 'Genuine disagreement about chronology, interpretation or significance.' },
  E4: { label: 'E4 · Unresolved anomaly', short: 'Anomaly', color: '#f5a742', desc: 'Real evidence exists, but no satisfactory explanation is established.' },
  E5: { label: 'E5 · Contested claim', short: 'Contested', color: '#f07b45', desc: 'A claim exists, but its evidence or interpretation is disputed.' },
  E6: { label: 'E6 · Speculative', short: 'Speculative', color: '#b184ee', desc: 'An interesting possibility requiring substantial additional evidence.' },
  E7: { label: 'E7 · Unsupported', short: 'Unsupported', color: '#8b93a7', desc: 'Insufficient reliable evidence currently supports the claim.' },
  E8: { label: 'E8 · Contradicted', short: 'Contradicted', color: '#e5535b', desc: 'Strong evidence conflicts with the proposed explanation.' },
};
export const STATUS_ORDER: Status[] = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'];

export const CATS: Record<Cat, { label: string; color: string; group: string }> = {
  origins:    { label: 'Human origins & fossils', color: '#ff8f5a', group: 'Deep prehistory' },
  genetics:   { label: 'Ancient DNA localities',  color: '#ff5fa2', group: 'Deep prehistory' },
  cognition:  { label: 'Symbolic behaviour & art', color: '#ffd04d', group: 'Deep prehistory' },
  settlement: { label: 'Settlements & cities',    color: '#5cc8ff', group: 'Built world' },
  monument:   { label: 'Monuments & megaliths',   color: '#b8f06a', group: 'Built world' },
  astronomy:  { label: 'Astronomy & calendars',   color: '#9aa8ff', group: 'Built world' },
  submerged:  { label: 'Submerged landscapes',    color: '#2fe0d0', group: 'Lost geography' },
  geology:    { label: 'Geological formations',   color: '#c9a56a', group: 'Lost geography' },
  text:       { label: 'Ancient texts & records', color: '#e6b6ff', group: 'Memory & records' },
  artifact:   { label: 'Artifacts & technology',  color: '#ffa4c8', group: 'Memory & records' },
  map:        { label: 'Historical maps',         color: '#8fe3a8', group: 'Memory & records' },
  lostciv:    { label: 'Lost-civilization claims', color: '#ff6f91', group: 'Contested frontiers' },
  uap:        { label: 'UAP & aerial reports',    color: '#7cf0ff', group: 'Contested frontiers' },
  esoteric:   { label: 'Esoteric movements',      color: '#cfa3a3', group: 'Contested frontiers' },
};

export const REL: Record<Relation, { label: string; color: string; dash?: string; directed: boolean }> = {
  supports: { label: 'Supports', color: '#3ddc97', directed: true },
  contradicts: { label: 'Contradicts', color: '#e5535b', dash: '6 3', directed: true },
  correlates_with: { label: 'Correlates with', color: '#f1d24a', dash: '2 3', directed: false },
  predates: { label: 'Predates', color: '#8fa8ff', directed: true },
  postdates: { label: 'Postdates', color: '#8fa8ff', directed: true },
  derived_from: { label: 'Derived from', color: '#e6b6ff', directed: true },
  shares_characteristics_with: { label: 'Shares characteristics with', color: '#5cc8ff', dash: '4 2', directed: false },
  potentially_influenced: { label: 'Potentially influenced', color: '#f5a742', dash: '1 3', directed: true },
  geographically_associated_with: { label: 'Geographically associated', color: '#9aa4b8', dash: '1 4', directed: false },
  independently_corroborates: { label: 'Independently corroborates', color: '#9fe870', directed: false },
};

export const CAUTION: Record<Relation, string> = {
  supports: 'Support is not proof: weigh the independence and quality of both ends.',
  contradicts: 'A contradiction can be resolved either way: check which side has the stronger evidence.',
  correlates_with: 'Correlation does not establish causation.',
  predates: 'Chronological order does not establish a causal link.',
  postdates: 'Chronological order does not establish a causal link.',
  derived_from: 'Derivation claims need a documented transmission path.',
  shares_characteristics_with: 'Similarity does not establish contact.',
  potentially_influenced: 'Chronological overlap does not establish direct interaction.',
  geographically_associated_with: 'Proximity is context, not a connection.',
  independently_corroborates: 'Check the sources really are independent of each other.',
};
