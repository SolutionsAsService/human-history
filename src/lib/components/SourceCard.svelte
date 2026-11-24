<script lang="ts">
  import { SOURCE_BY_ID } from '#data';
  import { parseCite } from '../audit';
  let { id }: { id: string } = $props();
  const KIND = { primary: 'primary', secondary: 'secondary', alternative: 'alternative', official: 'official', skeptical: 'critical' } as const;
  const s = $derived(SOURCE_BY_ID[id]);
  const p = $derived(s ? parseCite(s) : null);
</script>
{#if !s}
  <li class="src bad">Unknown source “{id}”</li>
{:else}
  <li class="src">
    <div class="src-cite">{s.cite}</div>
    <div class="src-parsed">{[p?.authors && `Author(s): ${p.authors}`, p?.year && `Year: ${p.year}`, p?.venue && `Venue: ${p.venue}`].filter(Boolean).join(' · ')}</div>
    <div class="src-meta">
      <span class="tag k-{s.kind}">{KIND[s.kind]}</span>
      <span class="tag">{s.discipline}</span>
      <span class="tag rel-{s.reliability}">reliability: {s.reliability}</span>
      {#if s.placeholder}<span class="tag warn" title="This record does not yet identify a specific publication.">citation to locate</span>
      {:else}<span class="tag dim" title="Recalled during the first build and not yet checked against the original.">unverified</span>{/if}
    </div>
    {#if s.methodology}<div class="src-f"><b>Methodology</b> {s.methodology}</div>{/if}
    {#if s.evidence}<div class="src-f"><b>Evidence presented</b> {s.evidence}</div>{/if}
    {#if s.note}<div class="src-note"><b>Limitations </b>{s.note}</div>{/if}
    {#if s.conflicts}<div class="src-f"><b>Conflicts of interest</b> {s.conflicts}</div>{/if}
  </li>
{/if}
