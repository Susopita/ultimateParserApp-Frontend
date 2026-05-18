<script lang="ts">
	import { downloadLRPDF } from '$lib/utils/pdf';
	import { i18n } from '$lib/stores/i18n.svelte';
	const t = (key: string) => i18n.t(key);

	let {
		action_table = {},
		goto_table = {},
		terminals = [],
		non_terminals = [],
		stateCount = 0,
		parserName = 'LR',
	} = $props<{
		action_table: Record<string, Record<string, string>>;
		goto_table: Record<string, Record<string, string>>;
		terminals: string[];
		non_terminals: string[];
		stateCount: number;
		parserName?: string;
	}>();

	const stateIds = $derived(
		Array.from({ length: stateCount }, (_, i) => i.toString())
	);

	function getCellClass(value: string): string {
		if (!value) return '';
		if (value === 'acc') return 'dark:text-green-400 text-green-600 font-black';
		if (value.startsWith('s')) return 'dark:text-cyan-400 text-cyan-600';
		if (value.startsWith('r')) return 'dark:text-amber-400 text-amber-600';
		return 'text-base-2';
	}

	let downloading = $state(false);

	async function handleDownload() {
		downloading = true;
		try {
			await downloadLRPDF(parserName, action_table, goto_table, terminals, non_terminals, stateCount);
		} finally {
			downloading = false;
		}
	}
</script>

<div class="animate-fade-in space-y-4">
	<div class="flex items-center gap-3">
		<h3 class="text-xs font-bold uppercase tracking-widest text-base-3">{parserName} — {t('tbl.action_goto')}</h3>
		<div class="h-px grow bg-elevated"></div>
		<button
			onclick={handleDownload}
			disabled={downloading}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest dark:text-cyan-400 text-cyan-600 border border-cyan-400/30 hover:bg-cyan-400/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{#if downloading}
				<div class="h-3 w-3 border-2 dark:border-cyan-400 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
			{/if}
			PDF
		</button>
	</div>

	<div class="glass-card overflow-hidden !p-0 shadow-2xl">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<!-- Group headers -->
					<tr class="border-b border-strong bg-elevated">
						<th class="p-3 text-[10px] font-black uppercase tracking-wider text-base-4 bg-elevated" rowspan="2">
							{t('tbl.state')}
						</th>
						{#if terminals.length > 0}
							<th
								class="p-3 text-center text-[10px] font-black uppercase tracking-wider dark:text-cyan-400/70 text-cyan-600 border-l border-strong"
								colspan={terminals.length}
							>
								{t('tbl.action')}
							</th>
						{/if}
						{#if non_terminals.length > 0}
							<th
								class="p-3 text-center text-[10px] font-black uppercase tracking-wider dark:text-amber-400/70 text-amber-600 border-l-2 border-strong"
								colspan={non_terminals.length}
							>
								{t('tbl.goto')}
							</th>
						{/if}
					</tr>
					<!-- Terminal / Non-Terminal headers -->
					<tr class="border-b border-strong bg-elevated">
						{#each terminals as term}
							<th class="p-3 text-center text-sm font-mono font-bold dark:text-cyan-400 text-cyan-600 min-w-[70px] border-l border-strong">
								{term}
							</th>
						{/each}
						{#each non_terminals as nt, ntIdx}
							<th class="p-3 text-center text-sm font-mono font-bold dark:text-amber-400 text-amber-600 min-w-[70px] border-l border-strong {ntIdx === 0 ? 'border-l-2' : ''}">
								{nt}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each stateIds as sid}
						<tr class="border-b border-strong group hover:bg-amber-400/5 transition-colors">
							<td class="p-3 font-mono font-bold text-base-1 bg-elevated border-r border-strong text-center">
								{sid}
							</td>
							{#each terminals as term}
								{@const value = action_table[sid]?.[term] || ''}
								<td class="p-3 text-center border-l border-strong/50">
									{#if value}
										<span class="px-2 py-1 rounded bg-input-var border border-strong text-xs font-mono font-semibold {getCellClass(value)} group-hover:border-amber-400/30 transition-colors">
											{value}
										</span>
									{:else}
										<span class="text-base-4 font-mono">—</span>
									{/if}
								</td>
							{/each}
							{#each non_terminals as nt, ntIdx}
								{@const value = goto_table[sid]?.[nt] || ''}
								<td class="p-3 text-center {ntIdx === 0 ? 'border-l-2 border-strong' : 'border-l border-strong/50'}">
									{#if value}
										<span class="px-2 py-1 rounded bg-input-var border border-strong text-xs font-mono font-semibold text-base-2 group-hover:border-amber-400/30 transition-colors">
											{value}
										</span>
									{:else}
										<span class="text-base-4 font-mono">—</span>
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
			<span class="h-2 w-2 rounded-full bg-cyan-500"></span>
			<span class="text-[10px] font-bold uppercase tracking-widest text-base-3">{t('tbl.legend_shift')}</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="h-2 w-2 rounded-full bg-amber-500"></span>
			<span class="text-[10px] font-bold uppercase tracking-widest text-base-3">{t('tbl.legend_reduce')}</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="h-2 w-2 rounded-full bg-green-500"></span>
			<span class="text-[10px] font-bold uppercase tracking-widest text-base-3">{t('tbl.legend_accept')}</span>
		</div>
	</div>
</div>
