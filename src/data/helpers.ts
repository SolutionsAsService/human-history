import type { Entry } from '../types';
export const REVIEWED = '2026-11-14';
type Partial_ = Omit<Entry, 'reviewed' | 'geoKind'> & { geoKind?: Entry['geoKind'] };
/** Entry constructor: stamps the review date. */
export const entry = (e: Partial_): Entry => ({ geoKind: 'site', ...e, reviewed: REVIEWED });
