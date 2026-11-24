<script lang="ts">
  import { onMount } from 'svelte';
  import { app } from '$lib/app.svelte';
  import { href } from '$lib/nav';
  import MapView from '$lib/components/MapView.svelte';
  import Dock from '$lib/components/Dock.svelte';
  import LayerPanel from '$lib/components/LayerPanel.svelte';

  let map: MapView | undefined = $state();
  let layersToggle: HTMLButtonElement | undefined = $state();
  let mapCol: HTMLDivElement | undefined = $state();
  let innerW = $state(1280);
  // the layers sheet is a modal dialog wherever it overlays the map
  const modal = $derived(app.panelOpen && innerW <= 1100);

  let wasModal = false; let prevFocus: HTMLElement | null = null;
  $effect(() => {
    const m = modal;
    if (m && !wasModal) { prevFocus = document.activeElement as HTMLElement | null; setTimeout(() => (document.querySelector('.lp-close') as HTMLElement | null)?.focus(), 0); }
    if (!m && wasModal) setTimeout(() => (prevFocus && document.contains(prevFocus) ? prevFocus : layersToggle)?.focus(), 0);
    wasModal = m;
  });
  $effect(() => { if (mapCol) (mapCol as any).inert = modal; });
  // keep --dock-h in step with the dock's height (the phone sheet is laid out against it)
  onMount(() => {
    const stage = document.querySelector('main.stage') as HTMLElement | null;
    const d = document.querySelector('.dock') as HTMLElement | null;
    if (!stage || !d) return;
    const ro = new ResizeObserver(() => stage.style.setProperty('--dock-h', d.offsetHeight + 'px'));
    ro.observe(d);
    return () => ro.disconnect();
  });
  // the map needs a re-measure whenever the route (re)appears
  onMount(() => { requestAnimationFrame(() => map?.resize()); });
</script>

<svelte:window bind:innerWidth={innerW} />
<svelte:head><title>Human History — dynamic evidence map</title></svelte:head>

<section class="view v-map" class:panel-open={app.panelOpen}>
  <LayerPanel {modal} />
  <div class="scrim" role="presentation" onclick={() => (app.panelOpen = false)}></div>
  <div class="map-col" bind:this={mapCol}>
    <div class="map-stage">
      <MapView bind:this={map} />
      <div class="map-ctrls">
        <div class="segs">
          <button class="seg" class:on={app.projection === 'flat'} onclick={() => (app.projection = 'flat')}>Map</button>
          <button class="seg" class:on={app.projection === 'globe'} onclick={() => (app.projection = 'globe')}>Globe</button>
        </div>
        <div class="zoomctl">
          <button class="btn icon" title="Zoom in" aria-label="Zoom in" onclick={() => map?.zoomBy(1.6)}>+</button>
          <button class="btn icon" title="Zoom out" aria-label="Zoom out" onclick={() => map?.zoomBy(1 / 1.6)}>−</button>
          <button class="btn icon" title="Reset view" aria-label="Reset view" onclick={() => map?.resetView()}>⟲</button>
        </div>
        <button class="btn layers-toggle" bind:this={layersToggle} aria-label="Layers and filters" onclick={() => (app.panelOpen = !app.panelOpen)}>Layers</button>
      </div>
      <div class="map-caveat">
        <span class="mc-touch">Tap a dot for its evidence. </span><span class="mc-click">Click a dot for its evidence. </span>
        Dashed ring = claimed date. Routes and the sand-tint shelf are schematic. Positions approximate; records unverified. <a href={href('/method')}>Method</a>
      </div>
      <div class="loading" class:done={app.geoReady}><div class="spin"></div>Loading the world…</div>
    </div>
    <Dock />
  </div>
</section>
