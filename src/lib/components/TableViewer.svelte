<script lang="ts">
	/**
	 * TableViewer.svelte
	 * Renders the LL(1) Parsing Table M.
	 */
	let { table = {} } = $props<{ table: Record<string, Record<string, string>> }>();

	const nonTerminals = $derived(Object.keys(table).sort());
	const terminals = $derived(
		[...new Set(Object.values(table).flatMap((row) => Object.keys(row)))].sort((a, b) => {
			if (a === '$') return 1;
			if (b === '$') return -1;
			return a.localeCompare(b);
		})
	);
</script>

<div class="animate-fade-in space-y-4">
	<div class="flex items-center gap-3">
		<h3 class="text-xs font-bold uppercase tracking-widest text-slate-500">Parsing Table M</h3>
		<div class="h-px grow bg-slate-800"></div>
	</div>

	<div class="glass-card overflow-hidden !p-0 border-slate-700/50 shadow-2xl">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-slate-700 bg-slate-800/80">
						<th class="p-4 text-[10px] font-black uppercase tracking-tighter text-slate-500 bg-slate-900/50">
							Non-Term
						</th>
						{#each terminals as t}
							<th class="p-4 text-center text-sm font-mono font-bold text-amber-400 min-w-[80px]">
								{t}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each nonTerminals as nt}
						<tr class="border-b border-slate-700/30 group hover:bg-amber-400/5 transition-colors">
							<td class="p-4 font-mono font-bold text-slate-200 bg-slate-800/30 border-r border-slate-700/50">
								{nt}
							</td>
							{#each terminals as t}
								<td class="p-4 text-center">
									{#if table[nt][t]}
										<div class="inline-flex flex-col items-center gap-1">
											<span class="text-[10px] text-slate-600 font-mono uppercase">Add</span>
											<span class="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 group-hover:border-amber-400/30 transition-colors">
												{table[nt][t]}
											</span>
										</div>
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
</div>
