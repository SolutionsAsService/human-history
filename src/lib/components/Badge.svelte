<script lang="ts">
  import type { Status } from '../../types';
  import { STATUS } from '../classification';
  let { code, label }: { code: Status; label?: string } = $props();
  const s = $derived(STATUS[code]);
</script>
<span class="badge" style="--c:{s.color}" title={s.desc}><i></i>{label ?? s.label}</span>
