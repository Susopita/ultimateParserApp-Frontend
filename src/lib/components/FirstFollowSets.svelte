<script lang="ts">
	import { slide } from 'svelte/transition';
	import { i18n } from '$lib/stores/i18n.svelte';

	let { firstSets, followSets } = $props<{
		firstSets: Record<string, string[]>;
		followSets: Record<string, string[]>;
	}>();

	let isOpen = $state(false);

	const t = (key: string) => i18n.t(key);
	const nonTerminals = $derived(Object.keys(firstSets).sort());
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
	<!-- Collapsible Panel -->
	{#if isOpen}
		<div
			class="glass-card shadow-2xl border border-strong bg-elevated/95 backdrop-blur-xl rounded-xl w-80 max-w-[calc(100vw-3rem)] overflow-hidden animate-fade-in"
			transition:slide={{ duration: 300, axis: 'y' }}
		>
			<div class="flex items-center justify-between px-4 py-3 border-b border-strong bg-card">
				<h3 class="text-xs font-black uppercase tracking-widest text-base-1 flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
					First &amp; Follow
				</h3>
				<button
					class="text-base-4 hover:text-base-1 transition-colors"
					onclick={() => (isOpen = false)}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
				</button>
			</div>

			<div class="max-h-[60vh] overflow-y-auto p-0">
				<table class="w-full text-left text-xs border-collapse">
					<thead class="sticky top-0 bg-elevated/95 backdrop-blur-md z-10 shadow-sm">
						<tr>
							<th class="px-4 py-3 font-bold text-base-3 uppercase tracking-wider border-b border-strong text-[10px]">Non-Terminal</th>
							<th class="px-4 py-3 font-bold text-base-3 uppercase tracking-wider border-b border-strong text-[10px]">First</th>
							<th class="px-4 py-3 font-bold text-base-3 uppercase tracking-wider border-b border-strong text-[10px]">Follow</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-strong">
						{#each nonTerminals as nt}
							<tr class="hover:bg-base/50 transition-colors">
								<td class="px-4 py-3 font-black text-base-1">{nt}</td>
								<td class="px-4 py-3 font-mono text-cyan-500 dark:text-cyan-400">
									{firstSets[nt]?.join(', ') || '∅'}
								</td>
								<td class="px-4 py-3 font-mono text-amber-500 dark:text-amber-400">
									{followSets[nt]?.join(', ') || '∅'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	<!-- Toggle Button -->
	<button
		onclick={() => (isOpen = !isOpen)}
		class="h-12 w-12 rounded-full bg-amber-500 text-slate-900 shadow-[0_4px_20px_rgba(245,158,11,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
		title="Toggle First & Follow Sets"
	>
		{#if isOpen}
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
		{/if}
	</button>
</div>
