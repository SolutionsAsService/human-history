import type { Entry, Source, Link } from '../types';
import { ORIGINS } from './entries-origins';
import { SITES } from './entries-sites';
import { MEMORY } from './entries-memory';
import { FRONTIER } from './entries-frontier';
import { SOURCES as SOURCES_0 } from './sources';
import { LINKS as LINKS_0 } from './relations';
import { EVENTS as EVENTS_0 } from './events';
import { MIGRATIONS as MIGRATIONS_0 } from './migrations';
import { QUESTIONS as QUESTIONS_0 } from './hypotheses';
import { QUEUE } from './queue';
import * as XA from './extra/a';
import * as XB from './extra/b';
import * as XC from './extra/c';
import * as XD from './extra/d';
import { SOURCES_D, LINKS_D } from './extra/d';
import * as XE from './extra/e';

export const ENTRIES: Entry[] = [...ORIGINS, ...SITES, ...MEMORY, ...FRONTIER, ...XA.ENTRIES_A, ...XB.ENTRIES_B, ...XC.ENTRIES_C, ...XE.ENTRIES_E];
export const SOURCES: Source[] = [...SOURCES_0, ...XA.SOURCES_A, ...XB.SOURCES_B, ...XC.SOURCES_C, ...SOURCES_D, ...XE.SOURCES_E];
export const SOURCE_BY_ID: Record<string, Source> = Object.fromEntries(SOURCES.map(x => [x.id, x]));
export const LINKS: Link[] = [...LINKS_0, ...XA.LINKS_A, ...XB.LINKS_B, ...XC.LINKS_C, ...LINKS_D, ...XE.LINKS_E];
export const EVENTS = [...EVENTS_0, ...XA.EVENTS_A, ...XB.EVENTS_B, ...XC.EVENTS_C, ...XE.EVENTS_E];
export const MIGRATIONS = [...MIGRATIONS_0, ...XA.MIGRATIONS_A, ...XB.MIGRATIONS_B, ...XC.MIGRATIONS_C, ...XE.MIGRATIONS_E];
export const QUESTIONS = [...QUESTIONS_0, ...XA.QUESTIONS_A, ...XB.QUESTIONS_B, ...XC.QUESTIONS_C, ...XE.QUESTIONS_E];
export const ENTRY_BY_ID: Record<string, Entry> = Object.fromEntries(ENTRIES.map(e => [e.id, e]));
export { QUEUE };
export const EVENT_BY_ID = Object.fromEntries(EVENTS.map(e => [e.id, e]));
export const MIG_BY_ID = Object.fromEntries(MIGRATIONS.map(e => [e.id, e]));
export const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map(e => [e.id, e]));

export type NodeKind = 'entry' | 'event';
export const nodeTitle = (id: string): string => ENTRY_BY_ID[id]?.title ?? EVENT_BY_ID[id]?.title ?? id;
export const nodeKind = (id: string): NodeKind | null => (ENTRY_BY_ID[id] ? 'entry' : EVENT_BY_ID[id] ? 'event' : null);

/** Links touching a node, normalised so `other` is the far end. */
export function linksOf(id: string): { link: Link; other: string; outgoing: boolean }[] {
  const out: { link: Link; other: string; outgoing: boolean }[] = [];
  for (const l of LINKS) {
    if (l.a === id) out.push({ link: l, other: l.b, outgoing: true });
    else if (l.b === id) out.push({ link: l, other: l.a, outgoing: false });
  }
  return out;
}

export function sourcesOf(ids: string[]): Source[] {
  return ids.map(i => SOURCE_BY_ID[i]).filter(Boolean);
}

/** How fully an entry is filled in against the ledger template. */
export function depth(e: Entry): 'stub' | 'partial' | 'full' {
  let n = 0;
  if (e.physical?.length || e.textual?.length || e.genetic?.length) n++;
  if (e.mainstream) n++;
  if (e.alternatives?.length) n++;
  if (e.for?.length || e.against?.length) n++;
  if (e.unresolved?.length) n++;
  if (e.predictions?.length) n++;
  if (e.altChron?.length || e.datingMethod) n++;
  return n >= 6 ? 'full' : n >= 3 ? 'partial' : 'stub';
}
