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
			class="group glass-card !p-4 flex items-center justify-between border-border transition-all duration-300 hover:border-border-focus hover:bg-base-surface"
		>
			<div class="flex items-center gap-4 overflow-hidden">
				<!-- Left Side (Non-Terminal) -->
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-transparent border border-border-focus"
				>
					<span class="font-mono font-bold text-primary">
						{prod.left.type === 'NonTerminal' ? prod.left.value : '?'}
					</span>
				</div>

				<div class="flex items-center gap-3">
					<span class="text-content-muted font-mono">→</span>

					<!-- Right Side Symbols -->
					<div class="flex flex-wrap gap-1.5">
						{#each prod.right as sym}
							{#if sym.type === 'NonTerminal'}
								<span
									class="px-2 py-0.5 rounded bg-base-surface border border-border text-primary font-mono text-xs font-semibold shadow-sm"
								>
									{sym.value}
								</span>
							{:else if sym.type === 'Terminal'}
								<span
									class="px-2 py-0.5 rounded bg-base-surface border border-border text-secondary font-mono text-xs font-semibold shadow-sm"
								>
									{sym.value}
								</span>
							{:else}
								<span
									class="px-2 py-0.5 rounded bg-base-surface border border-border text-content-muted font-mono text-xs italic"
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
				class="h-1 w-1 rounded-full bg-content-muted transition-colors duration-300 group-hover:bg-primary"
			></div>
		</div>
	{/each}
</div>

{#if productions.length === 0}
	<div class="p-8 text-center border-2 border-dashed border-border rounded-2xl">
		<p class="text-content-muted text-sm italic">No productions to display yet.</p>
	</div>
{/if}
