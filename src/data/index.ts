import type { Entry, Source, Link } from '../types';
import { ORIGINS } from './entries-origins';
import { SITES } from './entries-sites';
import { MEMORY } from './entries-memory';
import { FRONTIER } from './entries-frontier';
import { SOURCES, SOURCE_BY_ID } from './sources';
import { LINKS } from './relations';
import { EVENTS } from './events';
import { MIGRATIONS } from './migrations';
import { QUESTIONS } from './hypotheses';
import { QUEUE } from './queue';

export const ENTRIES: Entry[] = [...ORIGINS, ...SITES, ...MEMORY, ...FRONTIER];
export const ENTRY_BY_ID: Record<string, Entry> = Object.fromEntries(ENTRIES.map(e => [e.id, e]));
export { SOURCES, SOURCE_BY_ID, LINKS, EVENTS, MIGRATIONS, QUESTIONS, QUEUE };
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
