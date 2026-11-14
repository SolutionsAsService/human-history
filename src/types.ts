// Core data model. Mirrors the entry template in design/ledger.md and the platform
// requirements in design/master-prompt.md (sections 10-12, 15).

/** Ledger evidence classification (design/ledger.md section 2). Used for BOTH the evidence and the interpretation. */
export type Status = 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7' | 'E8';

export type Cat =
  | 'origins' | 'genetics' | 'cognition' | 'settlement' | 'monument' | 'submerged'
  | 'astronomy' | 'text' | 'artifact' | 'map' | 'lostciv' | 'geology' | 'uap' | 'esoteric';

export type Priority = 'P1' | 'P2' | 'P3';
export type DateKind = 'measured' | 'estimated' | 'claimed' | 'textual';
export type Confidence = 'high' | 'medium' | 'low';
export type GeoKind = 'site' | 'discovery' | 'archive' | 'narrative' | 'event' | 'region';

export interface AltInterpretation { name: string; status: Status; text: string }
export interface AltChronology { label: string; start: number; end: number; source?: string }

/** Years are signed calendar years (negative = BCE; deep time is plain negative integers). See lib/time.ts. */
export interface Entry {
  id: string;
  title: string;
  cat: Cat;
  priority: Priority;
  place: string;
  lat: number;
  lon: number;
  geoKind?: GeoKind;
  /** Set when the coordinates are approximate and must be checked against a primary report. */
  geoNote?: string;
  start: number;
  end: number;
  dateKind: DateKind;
  dateConfidence: Confidence;
  datingMethod?: string;
  dateNote?: string;
  altChron?: AltChronology[];
  /** Reliability of the underlying evidence. */
  ev: Status;
  /** Reliability of the headline interpretation. Kept separate on purpose. */
  interp: Status;
  summary: string;
  claim?: string;
  physical?: string[];
  textual?: string[];
  genetic?: string[];
  mainstream?: string;
  alternatives?: AltInterpretation[];
  for?: string[];
  against?: string[];
  unresolved?: string[];
  predictions?: string[];
  sources: string[];
  reviewed: string;
}

export interface Source {
  id: string;
  cite: string;
  kind: 'primary' | 'secondary' | 'alternative' | 'official' | 'skeptical';
  discipline: string;
  note?: string;
  reliability: 'high' | 'medium' | 'mixed' | 'low' | 'unassessed';
  /** True when the exact bibliographic details are a placeholder that still needs locating. */
  placeholder?: boolean;
}

export type Relation =
  | 'supports' | 'contradicts' | 'correlates_with' | 'predates' | 'postdates'
  | 'derived_from' | 'shares_characteristics_with' | 'potentially_influenced'
  | 'geographically_associated_with' | 'independently_corroborates';

export interface Link {
  a: string;
  b: string;
  rel: Relation;
  conf: Confidence;
  note: string;
  src: string[];
}

export interface EnvEvent {
  id: string;
  title: string;
  lat?: number;
  lon?: number;
  start: number;
  end: number;
  dateKind: DateKind;
  dateConfidence: Confidence;
  ev: Status;
  summary: string;
  physical: string[];
  human?: { text: string; status: Status };
  alternatives?: string[];
  sources: string[];
}

export interface Migration {
  id: string;
  title: string;
  group: string;
  model: string;
  path: [number, number][]; // [lon, lat]
  start: number;
  end: number;
  dateConfidence: Confidence;
  ev: Status;
  interp: Status;
  summary: string;
  for: string[];
  against: string[];
  unresolved: string[];
  sources: string[];
  schematic?: boolean;
}

export interface HypothesisOption {
  id: string;
  name: string;
  status: Status;
  description: string;
  supports: string[];
  contradicts: string[];
  assumptions: string[];
  predictions: string[];
  weaknesses: string[];
  falsifiers: string[];
  sources: string[];
  entries?: string[];
}

export interface Question {
  id: string;
  question: string;
  context: string;
  options: HypothesisOption[];
  history: { date: string; note: string }[];
}

export interface QueueItem {
  title: string;
  section: string;
  cat: Cat | 'event' | 'text';
  priority: Priority;
  note?: string;
}
