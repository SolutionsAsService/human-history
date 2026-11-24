import type { Entry } from '../types';

export function yaml(e: Entry): string {
  const q = (s: string) => JSON.stringify(s);
  const list = (k: string, v?: string[]) => (v?.length ? `${k}:\n${v.map(x => `  - ${q(x)}`).join('\n')}\n` : `${k}: []\n`);
  return [
    `id: ${e.id}`, `title: ${q(e.title)}`, `category: ${e.cat}`, `location: ${q(e.place)}`,
    `coordinates: [${e.lat}, ${e.lon}]${e.geoNote ? `  # ${e.geoNote}` : ''}`,
    `estimated_date: [${e.start}, ${e.end}]`, `date_confidence: ${e.dateConfidence}  # date kind: ${e.dateKind}`,
    `discovery: ${q(e.summary)}`, `original_claim: ${q(e.claim ?? '')}`,
    list('physical_evidence', e.physical), list('textual_evidence', e.textual), list('genetic_evidence', e.genetic),
    `mainstream_interpretation: ${q(e.mainstream ?? '')}`,
    `alternative_interpretations:\n${(e.alternatives ?? []).map(a => `  - {name: ${q(a.name)}, status: ${a.status}}`).join('\n') || '  []'}`,
    list('supporting_evidence', e.for), list('contradicting_evidence', e.against),
    `independent_sources: [${e.sources.join(', ')}]`,
    `evidence_status: ${e.ev}`, `interpretation_status: ${e.interp}`,
    list('unresolved_questions', e.unresolved), list('testable_predictions', e.predictions),
    `research_priority: ${e.priority}`, `last_reviewed: ${e.reviewed}`,
  ].join('\n');
}

export async function copy(text: string, btn: HTMLElement, done = 'Copied') {
  const old = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = done; } catch { btn.textContent = 'Copy failed'; }
  setTimeout(() => { btn.textContent = old; }, 1400);
}
