<script lang="ts">
	import { downloadLL1PDF } from '$lib/utils/pdf';
	import { i18n } from '$lib/stores/i18n.svelte';
	const t = (key: string) => i18n.t(key);

	let { table = {} } = $props<{ table: Record<string, Record<string, string>> }>();

	const nonTerminals = $derived(Object.keys(table).sort());
	const terminals = $derived(
		[...new Set((Object.values(table) as Record<string, string>[]).flatMap((row) => Object.keys(row)))].sort((a, b) => {
			if (a === '$') return 1;
			if (b === '$') return -1;
			return a.localeCompare(b);
		})
	);

	let downloading = $state(false);

	async function handleDownload() {
		downloading = true;
		try {
			await downloadLL1PDF(table);
		} finally {
			downloading = false;
		}
	}
</script>

<div class="animate-fade-in space-y-4">
	<div class="flex items-center gap-3">
		<h3 class="text-xs font-bold uppercase tracking-widest text-base-3">{t('tbl.title')}</h3>
		<div class="h-px grow bg-elevated"></div>
		<button
			onclick={handleDownload}
			disabled={downloading}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest dark:text-amber-400 text-amber-600 border border-amber-400/30 hover:bg-amber-400/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{#if downloading}
				<div class="h-3 w-3 border-2 dark:border-amber-400 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
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
					<tr class="border-b border-strong bg-elevated">
						<th class="p-4 text-[10px] font-black uppercase tracking-tighter text-base-3 bg-elevated">
							{t('tbl.non_term')}
						</th>
						{#each terminals as term}
							<th class="p-4 text-center text-sm font-mono font-bold dark:text-amber-400 text-amber-600 min-w-[80px]">
								{term}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each nonTerminals as nt}
						<tr class="border-b border-strong group hover:bg-amber-400/5 transition-colors">
							<td class="p-4 font-mono font-bold text-base-1 bg-elevated border-r border-strong">
								{nt}
							</td>
							{#each terminals as term}
								<td class="p-4 text-center">
									{#if table[nt][term]}
										<div class="inline-flex flex-col items-center gap-1">
											<span class="text-[10px] text-base-4 font-mono uppercase">{t('tbl.add')}</span>
											<span class="px-2 py-1 rounded bg-input-var border border-base text-xs font-mono text-base-2 group-hover:border-amber-400/30 transition-colors">
												{table[nt][term]}
											</span>
										</div>
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
</div>
