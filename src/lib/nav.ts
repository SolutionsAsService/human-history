import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { app, type Selection } from './app.svelte';

export const href = (path: string) => `${base}${path === '/' ? '/' : path}`;
/** Open a record (or event, route) on the map and show its evidence drawer. */
export function open(sel: NonNullable<Selection>, opts: { t?: number } = {}) {
  app.selected = sel; app.playing = false;
  if (opts.t != null) app.t = opts.t;
  return goto(href('/'), { keepFocus: true, noScroll: true });
}
export const openEntry = (id: string) => open({ kind: 'entry', id });
