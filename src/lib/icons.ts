import { svg } from './dom';
const P: Record<string, string[]> = {
  map: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M3 12h18', 'M12 3c3 3 3 15 0 18', 'M12 3c-3 3-3 15 0 18'],
  graph: ['M6 7a2 2 0 1 0 0-.01', 'M18 6a2 2 0 1 0 0-.01', 'M12 18a2 2 0 1 0 0-.01', 'M7.7 8l3 8', 'M16.6 7.7l-3.6 8.4', 'M8 7h8'],
  threads: ['M3 7c6 0 6 10 12 10h6', 'M3 17c6 0 6-10 12-10h6', 'M3 12h18'],
  lab: ['M9 3h6', 'M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3', 'M8 15h8'],
  ledger: ['M5 5h14', 'M5 10h14', 'M5 15h9', 'M5 20h6'],
  audit: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6Z', 'M8.5 12l2.5 2.5L16 9.5'],
  about: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 11v6', 'M12 7.5v.01'],
};
export function icon(name: keyof typeof P | string): SVGElement {
  const el = svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' });
  for (const d of P[name] ?? []) el.appendChild(svg('path', { d }));
  return el;
}
