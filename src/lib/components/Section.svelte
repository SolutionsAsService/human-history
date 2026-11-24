<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, open = true, count, children }: { title: string; open?: boolean; count?: number; children: Snippet } = $props();
</script>
<details class="sec" {open}><summary>{title}{#if count != null}<em>{count}</em>{/if}</summary>{@render children()}</details>
