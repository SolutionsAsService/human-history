import type { Culture, Strand, Thread, Carried } from '../types';

// Threads: what one culture passed to another. Every strand below comes from a source that was opened and whose quoted
// passage was found verbatim by an independent verifier (see rdada_runs/). A resemblance noticed by an editor is not a strand.
// Culture spans are rough conventional spans used only to place lanes; they are schematic, not dated claims.

export const CARRIED: Record<Carried, { label: string; color: string }> = {
  language: { label: 'Language', color: '#ff9f6b' },
  writing: { label: 'Writing', color: '#ffd04d' },
  religion: { label: 'Religion', color: '#c7a1ff' },
  idea: { label: 'Ideas', color: '#7cf0ff' },
  technology: { label: 'Technology', color: '#6fe3a0' },
  crop_or_animal: { label: 'Crops and animals', color: '#a8e05f' },
  people: { label: 'People', color: '#ff7aa8' },
  institution: { label: 'Institutions', color: '#79b8ff' },
  custom: { label: 'Other', color: '#aab6cc' },
};

export const CULTURES: Culture[] = [];
export const THREADS: Thread[] = [];
export const STRANDS: Strand[] = [];
