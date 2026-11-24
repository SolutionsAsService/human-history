<script lang="ts">
  import type { Confidence } from '../../types';
  let { c }: { c: Confidence } = $props();
  const n = $derived(c === 'high' ? 3 : c === 'medium' ? 2 : 1);
</script>
<span class="conf" title="{c} confidence"><span aria-hidden="true">{'●'.repeat(n)}</span><span class="off" aria-hidden="true">{'●'.repeat(3 - n)}</span><span class="sr-only">{c} confidence</span></span>
