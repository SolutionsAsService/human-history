<script lang="ts">
  import type { Status } from '../../types';
  import Badge from './Badge.svelte';
  let { ev, interp }: { ev: Status; interp: Status } = $props();
</script>
<div class="dual">
  <div><span class="dual-k">Evidence</span><Badge code={ev} /></div>
  <div><span class="dual-k">Interpretation</span><Badge code={interp} /></div>
</div>
