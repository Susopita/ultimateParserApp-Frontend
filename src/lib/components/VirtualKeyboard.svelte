<script lang="ts">
	/**
	 * VirtualKeyboard.svelte
	 * A premium keyboard component for compiler symbols.
	 * Uses Svelte 5 Runes.
	 */
	let { onInsert } = $props<{ onInsert: (symbol: string) => void }>();

	const symbols = [
		{ label: 'ϵ', value: 'ϵ', desc: 'Epsilon (Empty)' },
		{ label: '→', value: '→', desc: 'Production' },
		{ label: '|', value: '|', desc: 'Choice' },
		{ label: '$', value: '$', desc: 'EOF' },
		{ label: '(', value: '(', desc: 'LParen' },
		{ label: ')', value: ')', desc: 'RParen' },
		{ label: '*', value: '*', desc: 'Multiply' },
		{ label: '+', value: '+', desc: 'Plus' },
		{ label: '-', value: '-', desc: 'Minus' },
		{ label: '/', value: '/', desc: 'Division' },
		{ label: '^', value: '^', desc: 'Power' },
		{ label: '?', value: '?', desc: 'Optional' },
		{ label: 'α', value: 'α', desc: 'Alpha' },
		{ label: 'β', value: 'β', desc: 'Beta' },
		{ label: 'γ', value: 'γ', desc: 'Gamma' }
	];
</script>

<div class="glass-card animate-fade-in w-full max-w-md">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="text-xs font-bold uppercase tracking-widest text-content-muted">Quick Symbols</h3>
		<div class="h-1 w-12 rounded-full bg-primary-transparent"></div>
	</div>

	<div class="grid grid-cols-4 gap-3 sm:grid-cols-6">
		{#each symbols as sym}
			<button
				type="button"
				class="group relative flex aspect-square items-center justify-center rounded-xl bg-base-surface border border-border 
               text-xl text-content-2 transition-all duration-300 
               hover:border-border-focus hover:text-primary hover:-translate-y-1 
               hover:shadow-glow-primary-hover
               active:scale-95 active:translate-y-0"
				onclick={() => onInsert(sym.value)}
				title={sym.desc}
			>
				<!-- Subtle glow effect on hover -->
				<div
					class="absolute inset-0 -z-10 rounded-xl bg-primary opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20"
				></div>

				<span class="relative z-10 font-mono">{sym.label}</span>

				<!-- Bottom accent line -->
				<div
					class="absolute bottom-1.5 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-3"
				></div>
			</button>
		{/each}
	</div>
</div>
