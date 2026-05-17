<script lang="ts">
	/**
	 * AutomatonViewer.svelte
	 * Renders the LR(0) canonical collection of states and transitions.
	 */
	import type { LR0Automaton } from '$lib/types';

	let { automaton } = $props<{ automaton: LR0Automaton }>();

	const sortedStates = $derived(
		[...automaton.states].sort((a, b) => a.id - b.id)
	);

	const sortedTransitions = $derived(
		[...automaton.transitions].sort((a, b) => a.from - b.from || a.to - b.to)
	);
</script>

<div class="animate-fade-in space-y-6">
	<div class="flex items-center gap-3">
		<h3 class="text-xs font-bold uppercase tracking-widest text-slate-500">Canonical Collection of LR(0) Item Sets</h3>
		<div class="h-px grow bg-slate-800"></div>
	</div>

	<!-- States Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each sortedStates as state}
			<div 
				class="glass-card !p-4 space-y-3 transition-all duration-300 
				{state.is_accept 
					? 'border-green-400/40 bg-green-400/[0.03] hover:border-green-400/60' 
					: 'border-slate-700/30 hover:border-amber-400/40'}"
			>
				<!-- State Header -->
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="h-8 w-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm
							{state.is_accept 
								? 'bg-green-400/20 text-green-400 border border-green-400/30' 
								: 'bg-amber-400/10 text-amber-400 border border-amber-400/20'}"
						>
							I{state.id}
						</div>
						{#if state.is_accept}
							<span class="px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 text-[9px] font-bold uppercase tracking-widest">
								Accept
							</span>
						{/if}
					</div>
					<span class="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
						{state.items.length} items
					</span>
				</div>

				<!-- Items List -->
				<div class="space-y-1">
					{#each state.items as item}
						<div class="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/50 font-mono text-xs text-slate-300">
							{item}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Transitions -->
	<div class="space-y-4">
		<div class="flex items-center gap-3">
			<h3 class="text-xs font-bold uppercase tracking-widest text-slate-500">Transitions (GOTO function)</h3>
			<div class="h-px grow bg-slate-800"></div>
		</div>

		<div class="glass-card !p-4 overflow-x-auto">
			<div class="flex flex-wrap gap-3">
				{#each sortedTransitions as t}
					<div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800/50 transition-all hover:border-amber-400/30">
						<span class="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-xs font-bold">
							I{t.from}
						</span>
						<span class="text-slate-600">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
						</span>
						<span class="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400 font-mono text-xs font-bold">
							{t.symbol}
						</span>
						<span class="text-slate-600">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
						</span>
						<span class="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-xs font-bold">
							I{t.to}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
