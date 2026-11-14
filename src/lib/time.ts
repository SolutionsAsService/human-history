// Time handling. Years are signed calendar years (BCE negative). Deep time is expressed as plain negative years.
// "BP" here follows the radiocarbon convention: age BP = 1950 - year.

export const bp = (age: number) => 1950 - age;
export const bce = (n: number) => -n;
export const ka = (n: number) => 1950 - n * 1000;
export const Ma = (n: number) => 1950 - n * 1_000_000;

export const NOW = 2026;

/** Slider anchors: equal slider width per interval, so recent history is not crushed into a pixel. */
export const ANCHORS: number[] = [-3_500_000, -1_000_000, -300_000, -100_000, -50_000, -25_000, -12_000, -6_000, -3_000, 0, 1_000, NOW];

export const TIME_MIN = ANCHORS[0];
export const TIME_MAX = ANCHORS[ANCHORS.length - 1];

/** year -> 0..1 */
export function yearToPos(y: number): number {
  if (y <= TIME_MIN) return 0;
  if (y >= TIME_MAX) return 1;
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const a = ANCHORS[i], b = ANCHORS[i + 1];
    if (y <= b) return (i + (y - a) / (b - a)) / (ANCHORS.length - 1);
  }
  return 1;
}

/** 0..1 -> year */
export function posToYear(p: number): number {
  const n = ANCHORS.length - 1;
  const x = Math.min(1, Math.max(0, p)) * n;
  const i = Math.min(n - 1, Math.floor(x));
  const f = x - i;
  return ANCHORS[i] + f * (ANCHORS[i + 1] - ANCHORS[i]);
}

const nf = (n: number, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });

/** Human readable year. Deep time is shown as years/ka/Ma ago; the Holocene as BCE/CE. */
export function fmtYear(y: number, compact = false): string {
  const ago = NOW - y;
  if (y <= -1_000_000) return `${nf((1950 - y) / 1e6, 2)} Ma`;
  if (y <= -11_000) {
    const k = (1950 - y) / 1000;
    return `${nf(k, k < 100 ? 1 : 0)} ka${compact ? '' : ' BP'}`;
  }
  if (y < 0) return `${nf(-y)} BCE`;
  if (y === 0) return `1 BCE/CE`;
  if (ago < 1 && compact) return 'present';
  return `${nf(Math.round(y))} CE`;
}

export function fmtRange(a: number, b: number): string {
  if (a === b) return `c. ${fmtYear(a)}`;
  return `${fmtYear(a)} – ${fmtYear(b)}`;
}

/** Approximate global mean sea level relative to present, in metres.
 *  Hand-tabulated from published curves (e.g. Lambeck et al. 2014, Spratt & Lisiecki 2016) as a
 *  schematic only. Regional relative sea level differs by tens of metres because of glacio-isostasy. */
const SL: [number, number][] = [
  // age BP, metres
  [0, 0], [2000, -0.5], [4000, -1.5], [6000, -3], [7000, -6], [8000, -15], [9000, -28], [10000, -40],
  [11000, -52], [12000, -62], [13000, -75], [14000, -82], [14300, -85], [14650, -100], [15000, -98],
  [17000, -115], [19000, -125], [20000, -130], [22000, -130], [24000, -127], [26000, -120],
  [30000, -90], [35000, -75], [40000, -75], [50000, -75], [60000, -80], [70000, -85], [80000, -35],
  [90000, -55], [100000, -35], [110000, -65], [118000, -20], [125000, 6], [130000, -10], [140000, -125],
];

export interface SeaLevel { m: number; grade: 'approx' | 'schematic' | 'none' }

export function seaLevel(year: number): SeaLevel {
  const age = 1950 - year;
  if (age <= 0) return { m: 0, grade: 'approx' };
  if (age <= 140000) {
    for (let i = 0; i < SL.length - 1; i++) {
      const [a0, m0] = SL[i], [a1, m1] = SL[i + 1];
      if (age <= a1) return { m: m0 + ((age - a0) / (a1 - a0)) * (m1 - m0), grade: 'approx' };
    }
  }
  if (age <= 800000) {
    // schematic ~100 ka glacial cycle, interglacial peaks at 125 ka + n*100 ka
    return { m: -60 + 60 * Math.cos((2 * Math.PI * (age - 125000)) / 100000), grade: 'schematic' };
  }
  return { m: 0, grade: 'none' };
}

export type Phase = 'future' | 'active' | 'past';
export function phase(start: number, end: number, t: number): Phase {
  if (t < start) return 'future';
  if (t > end) return 'past';
  return 'active';
}
