<script lang="ts">
	/**
	 * GrammarViewer.svelte
	 * Renders parsed productions in a structured, premium way.
	 */
	import type { Production } from '$lib/types';

	let { productions = [] } = $props<{ productions: Production[] }>();
</script>

<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
	{#each productions as prod}
		<div
			class="group glass-card !p-4 flex items-center justify-between border-slate-700/30 transition-all duration-300 hover:border-amber-400/40 hover:bg-slate-800/60"
		>
			<div class="flex items-center gap-4 overflow-hidden">
				<!-- Left Side (Non-Terminal) -->
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 border border-amber-400/20"
				>
					<span class="font-mono font-bold text-amber-400">
						{prod.left.type === 'NonTerminal' ? prod.left.value : '?'}
					</span>
				</div>

				<div class="flex items-center gap-3">
					<span class="text-slate-600 font-mono">→</span>

					<!-- Right Side Symbols -->
					<div class="flex flex-wrap gap-1.5">
						{#each prod.right as sym}
							{#if sym.type === 'NonTerminal'}
								<span
									class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400 font-mono text-xs font-semibold shadow-sm"
								>
									{sym.value}
								</span>
							{:else if sym.type === 'Terminal'}
								<span
									class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 font-mono text-xs font-semibold shadow-sm"
								>
									{sym.value}
								</span>
							{:else}
								<span
									class="px-2 py-0.5 rounded bg-slate-900/50 border border-slate-800 text-slate-500 font-mono text-xs italic"
								>
									ϵ
								</span>
							{/if}
						{/each}
					</div>
				</div>
			</div>

			<!-- Subtle Decoration -->
			<div
				class="h-1 w-1 rounded-full bg-slate-700 transition-colors duration-300 group-hover:bg-amber-400"
			></div>
		</div>
	{/each}
</div>

{#if productions.length === 0}
	<div class="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
		<p class="text-slate-600 text-sm italic">No productions to display yet.</p>
	</div>
{/if}
