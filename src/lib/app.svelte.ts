// Shared reactive state (Svelte 5 runes). The route decides the view; everything else lives here and is mirrored to the URL query by the layout.
import { SvelteSet } from 'svelte/reactivity';
import type { Cat, Status } from '../types';
import { CATS } from './classification';
import { yearToPos, posToYear, NOW } from './time';

export type View = 'map' | 'graph' | 'threads' | 'lab' | 'ledger' | 'audit' | 'method';
export type Selection = { kind: 'entry' | 'event' | 'migration'; id: string } | null;
export type ColorBy = 'category' | 'evidence' | 'interpretation';

const browser = typeof window !== 'undefined';
export const app = $state({
  t: -9600,              // primary time cursor (signed year)
  tB: NOW,               // second cursor for compare mode
  compare: false,
  playing: false,
  speed: 1,
  dir: 1 as 1 | -1,
  selected: null as Selection,
  hover: null as Selection,
  layers: new SvelteSet<Cat>(Object.keys(CATS) as Cat[]),
  showEvents: true,
  showRoutes: true,
  showGhosts: true,
  showShelf: true,
  showLinks: true,
  colorBy: 'category' as ColorBy,
  projection: (browser && innerWidth < 720 ? 'globe' : 'flat') as 'flat' | 'globe',
  statuses: new SvelteSet<Status>(['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'] as Status[]),
  query: '',
  routeGroups: new SvelteSet<string>(),
  labPick: null as string | null,
  strand: null as string | null,
  panelOpen: !browser || innerWidth > 1100,
  geoReady: false,
  paletteOpen: false,
});

/** Patch several fields at once (the old store's `set`). */
export function set(patch: Partial<typeof app>) { Object.assign(app, patch); }

export const timePos = () => yearToPos(app.t);
export const setPos = (p: number) => { app.t = Math.round(posToYear(p)); };
