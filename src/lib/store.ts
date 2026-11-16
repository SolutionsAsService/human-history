import type { Cat, Status } from '../types';
import { CATS } from './classification';
import { yearToPos, posToYear, NOW } from './time';

export type View = 'map' | 'graph' | 'threads' | 'lab' | 'ledger' | 'audit' | 'about';
export type Selection = { kind: 'entry' | 'event' | 'migration'; id: string } | null;
export type ColorBy = 'category' | 'evidence' | 'interpretation';

export interface State {
  view: View;
  t: number;            // primary time cursor (signed year)
  tB: number;           // second cursor for compare mode
  compare: boolean;
  playing: boolean;
  speed: number;
  dir: 1 | -1;
  selected: Selection;
  hover: Selection;
  layers: Set<Cat>;
  showEvents: boolean;
  showRoutes: boolean;
  showGhosts: boolean;
  showShelf: boolean;
  showLinks: boolean;
  colorBy: ColorBy;
  projection: 'flat' | 'globe';
  statuses: Set<Status>;
  query: string;
  routeGroups: Set<string>;
  labPick: string | null;
  strand: string | null;
  panelOpen: boolean;
}

export const state: State = {
  view: 'map',
  t: -9600,
  tB: NOW,
  compare: false,
  playing: false,
  speed: 1,
  dir: 1,
  selected: null,
  hover: null,
  layers: new Set(Object.keys(CATS) as Cat[]),
  showEvents: true,
  showRoutes: true,
  showGhosts: true,
  showShelf: true,
  showLinks: true,
  colorBy: 'category',
  projection: typeof innerWidth !== 'undefined' && innerWidth < 720 ? 'globe' : 'flat',
  statuses: new Set(['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'] as Status[]),
  query: '',
  routeGroups: new Set<string>(),
  labPick: null,
  strand: null,
  panelOpen: typeof innerWidth === 'undefined' || innerWidth > 1100,
};

type Listener = (keys: Set<string>) => void;
const listeners = new Set<Listener>();
let pending = new Set<string>();
let queued = false;

export function subscribe(fn: Listener) { listeners.add(fn); return () => listeners.delete(fn); }

/** Update state and notify subscribers once per frame. Keys name what changed. */
export function set(patch: Partial<State>) {
  for (const [k, v] of Object.entries(patch)) {
    (state as any)[k] = v;
    pending.add(k);
  }
  if (!queued) {
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const keys = pending; pending = new Set();
      listeners.forEach(fn => fn(keys));
    });
  }
}
/** For mutations of Set members etc. */
export function touch(...keys: string[]) { set({} as Partial<State>); keys.forEach(k => pending.add(k)); }

export const timePos = () => yearToPos(state.t);
export const setPos = (p: number) => set({ t: Math.round(posToYear(p)) });

// ---- URL hash: #/map?e=gobekli-tepe&t=-9600
export function readHash() {
  const m = location.hash.replace(/^#\/?/, '');
  const [view, qs] = m.split('?');
  const patch: Partial<State> = {};
  if (['map', 'graph', 'threads', 'lab', 'ledger', 'audit', 'about'].includes(view)) patch.view = view as View;
  const p = new URLSearchParams(qs ?? '');
  const e = p.get('e'); patch.selected = e ? { kind: (p.get('k') as any) || 'entry', id: e } : null;
  const t = p.get('t'); if (t && !Number.isNaN(Number(t))) patch.t = Number(t);
  const q = p.get('q'); if (q) patch.labPick = q;
  const st = p.get('s'); if (view === 'threads') patch.strand = st || null;
  set(patch);
}
export function writeHash() {
  const p = new URLSearchParams();
  if (state.selected) { p.set('e', state.selected.id); if (state.selected.kind !== 'entry') p.set('k', state.selected.kind); }
  if (state.view === 'map') p.set('t', String(Math.round(state.t)));
  if (state.view === 'lab' && state.labPick) p.set('q', state.labPick);
  if (state.view === 'threads' && state.strand) p.set('s', state.strand);
  const s = `#/${state.view}${[...p].length ? '?' + p.toString() : ''}`;
  if (location.hash !== s) history.replaceState(null, '', s);
}
