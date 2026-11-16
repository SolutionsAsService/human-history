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

  // --- Site / structure fields (master prompt §3.3 and §3.4). All optional; fill what is actually documented.
  culture?: string;                 // archaeological culture or civilization
  discovered?: string;              // discovery date and excavation history
  artifacts?: string[];             // associated artifacts
  construction?: string[];          // construction techniques
  purpose?: string;                 // proposed purpose
  consensus?: string;               // current archaeological consensus, if one exists
  environment?: string;             // environmental context at the time (§10)
  megalith?: {                      // §3.4 engineering record
    geology?: string; quarry?: string; transport?: string; weightT?: string; chronology?: string;
    toolMarks?: string; precision?: string; labor?: string; methods?: string[]; phases?: string;
  };
  /** Methodological lines of evidence independent of each other (e.g. radiocarbon, stratigraphy, textual). */
  lines?: string[];
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
  // --- Source record fields (master prompt §13). `authors`, `year` and `venue` are parsed from `cite` when absent.
  authors?: string;
  year?: number;
  venue?: string;
  methodology?: string;
  evidence?: string;           // what evidence the source presents
  conflicts?: string;          // conflicts of interest / positionality
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

// ---- Threads: what one culture passed to another (languages, scripts, religions, ideas, technologies, crops, people)
export type Carried = 'language' | 'writing' | 'religion' | 'idea' | 'technology' | 'crop_or_animal' | 'people' | 'institution' | 'custom';
export type Medium = 'migration' | 'conquest' | 'trade' | 'translation' | 'text' | 'teaching' | 'court_or_empire' | 'unknown';
export type Directness = 'documented' | 'inferred' | 'debated';

/** A culture, polity or tradition that appears as a lane on the Threads page. Spans are approximate and schematic. */
export interface Culture {
  id: string;
  name: string;
  group: string;       // lane band: 'Near East', 'Egypt and Africa', 'Mediterranean', 'Iran and Central Asia', 'South Asia', 'East Asia', 'Europe', 'Steppe'
  start: number;
  end: number;
  entries?: string[];  // related ledger records
}

/** A passage quoted from an ancient text, with the work's three dates kept apart. */
export interface Passage {
  id: string;
  work: string;
  locator: string;
  language: string;
  quote: string;
  edition: string;
  compStart: number | null;
  compEnd: number | null;
  compBasis: string;
  witness: string;
  src: string;          // the source record of the edition read
}

export interface Thread { id: string; name: string; carried: Carried; blurb: string }

/** One transfer. `status` grades the evidence for the transfer itself (E1–E8), not for either culture. */
export interface Strand {
  id: string;
  thread: string;
  from: string;
  to: string;
  carried: Carried;
  what: string;
  medium: Medium;
  start: number;
  end: number;
  directness: Directness;
  status: Status;
  note: string;
  for: string[];
  against: string[];
  unresolved?: string[];
  src: string[];
  entries?: string[];
  /** Ids of quoted primary passages (src/data/extra/g.ts, generated from RDADA runs). */
  passages?: string[];
}
