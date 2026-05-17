<script lang="ts">
	/**
	 * LR0TableViewer.svelte
	 * Renders the combined ACTION/GOTO table for LR(0) parsing.
	 */
	let {
		action_table = {},
		goto_table = {},
		terminals = [],
		non_terminals = [],
		stateCount = 0
	} = $props<{
		action_table: Record<string, Record<string, string>>;
		goto_table: Record<string, Record<string, string>>;
		terminals: string[];
		non_terminals: string[];
		stateCount: number;
	}>();

	const stateIds = $derived(
		Array.from({ length: stateCount }, (_, i) => i.toString())
	);

	function getCellClass(value: string): string {
		if (!value) return '';
		if (value === 'acc') return 'text-green-400 font-black';
		if (value.startsWith('s')) return 'text-cyan-400';
		if (value.startsWith('r')) return 'text-amber-400';
		return 'text-slate-300';
	}
</script>

<div class="animate-fade-in space-y-4">
	<div class="flex items-center gap-3">
		<h3 class="text-xs font-bold uppercase tracking-widest text-slate-500">ACTION / GOTO Table</h3>
		<div class="h-px grow bg-slate-800"></div>
	</div>

	<div class="glass-card overflow-hidden !p-0 border-slate-700/50 shadow-2xl">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<!-- Group headers -->
					<tr class="border-b border-slate-700/50 bg-slate-900/80">
						<th class="p-3 text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-900" rowspan="2">
							State
						</th>
						{#if terminals.length > 0}
							<th
								class="p-3 text-center text-[10px] font-black uppercase tracking-wider text-cyan-400/70 border-l border-slate-700/50"
								colspan={terminals.length}
							>
								ACTION
							</th>
						{/if}
						{#if non_terminals.length > 0}
							<th
								class="p-3 text-center text-[10px] font-black uppercase tracking-wider text-amber-400/70 border-l-2 border-slate-600"
								colspan={non_terminals.length}
							>
								GOTO
							</th>
						{/if}
					</tr>
					<!-- Terminal / Non-Terminal headers -->
					<tr class="border-b border-slate-700 bg-slate-800/80">
						{#each terminals as t}
							<th class="p-3 text-center text-sm font-mono font-bold text-cyan-400 min-w-[70px] border-l border-slate-700/30">
								{t}
							</th>
						{/each}
						{#each non_terminals as nt}
							<th class="p-3 text-center text-sm font-mono font-bold text-amber-400 min-w-[70px] border-l border-slate-700/30 {non_terminals.indexOf(nt) === 0 ? 'border-l-2 border-l-slate-600' : ''}">
								{nt}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each stateIds as sid}
						<tr class="border-b border-slate-700/30 group hover:bg-amber-400/5 transition-colors">
							<td class="p-3 font-mono font-bold text-slate-200 bg-slate-800/30 border-r border-slate-700/50 text-center">
								{sid}
							</td>
							{#each terminals as t}
								{@const value = action_table[sid]?.[t] || ''}
								<td class="p-3 text-center border-l border-slate-700/10">
									{#if value}
										<span class="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono font-semibold {getCellClass(value)} group-hover:border-amber-400/30 transition-colors">
											{value}
										</span>
									{:else}
										<span class="text-slate-800 font-mono">—</span>
									{/if}
								</td>
							{/each}
							{#each non_terminals as nt, ntIdx}
								{@const value = goto_table[sid]?.[nt] || ''}
								<td class="p-3 text-center {ntIdx === 0 ? 'border-l-2 border-l-slate-600' : 'border-l border-slate-700/10'}">
									{#if value}
										<span class="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono font-semibold text-slate-300 group-hover:border-amber-400/30 transition-colors">
											{value}
										</span>
									{:else}
										<span class="text-slate-800 font-mono">—</span>
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Legend -->
	<div class="flex flex-wrap gap-4 px-2">
		<div class="flex items-center gap-2">
			<span class="h-2 w-2 rounded-full bg-cyan-400"></span>
			<span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">sN = Shift to state N</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="h-2 w-2 rounded-full bg-amber-400"></span>
			<span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">rN = Reduce by production N</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="h-2 w-2 rounded-full bg-green-400"></span>
			<span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">acc = Accept</span>
		</div>
	</div>
</div>
