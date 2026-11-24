<script lang="ts">
  import type { Snippet } from 'svelte';
  import { base } from '$app/paths';
  import { openEntry } from '$lib/nav';
  let { id, children }: { id: string; children: Snippet } = $props();
</script>
<a class="xref" href="{base}/?e={id}" onclick={(e) => { e.preventDefault(); openEntry(id); }}>{@render children()}</a>
