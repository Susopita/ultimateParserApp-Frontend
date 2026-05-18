<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    dot: string;
    title?: string;
  }

  let { dot, title = 'Graph' }: Props = $props();

  let viz: { renderString: (dot: string, opts: { format: string }) => string } | null = $state(null);
  let svgContent = $state('');
  let error = $state('');
  let loading = $state(true);

  onMount(async () => {
    try {
      const { instance } = await import('@viz-js/viz');
      viz = await instance();
    } catch (e) {
      error = 'Failed to load Graphviz renderer.';
    } finally {
      loading = false;
    }
  });

  $effect(() => {
    if (!viz || !dot) {
      svgContent = '';
      return;
    }
    try {
      svgContent = viz.renderString(dot, { format: 'svg' });
      error = '';
    } catch (e) {
      error = `Render error: ${e}`;
      svgContent = '';
    }
  });
</script>

<div class="rounded-xl border border-base bg-elevated overflow-hidden">
  <div class="px-4 py-2 border-b border-base flex items-center gap-2">
    <span class="text-xs font-semibold text-base-3 uppercase tracking-widest">{title}</span>
  </div>

  <div class="p-4 min-h-[200px] flex items-center justify-center overflow-auto">
    {#if loading}
      <span class="text-base-3 text-sm animate-pulse">Loading renderer…</span>
    {:else if error}
      <span class="text-red-500 text-sm">{error}</span>
    {:else if svgContent}
      <div class="graphviz-output w-full overflow-auto">
        {@html svgContent}
      </div>
    {:else}
      <span class="text-base-4 text-sm">No graph data.</span>
    {/if}
  </div>
</div>

<style>
  .graphviz-output :global(svg) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
</style>
