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
		{ label: '*', value: '*', desc: 'Kleene Star' },
		{ label: '+', value: '+', desc: 'One or More' },
		{ label: '?', value: '?', desc: 'Optional' },
		{ label: 'α', value: 'α', desc: 'Alpha' },
		{ label: 'β', value: 'β', desc: 'Beta' },
		{ label: 'γ', value: 'γ', desc: 'Gamma' }
	];
</script>

<div class="glass-card animate-fade-in w-full max-w-md">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="text-xs font-bold uppercase tracking-widest text-slate-500">Quick Symbols</h3>
		<div class="h-1 w-12 rounded-full bg-amber-400/20"></div>
	</div>

	<div class="grid grid-cols-4 gap-3 sm:grid-cols-6">
		{#each symbols as sym}
			<button
				type="button"
				class="group relative flex aspect-square items-center justify-center rounded-xl bg-slate-900/50 border border-slate-700/50 
               text-xl text-slate-300 transition-all duration-300 
               hover:border-amber-400/50 hover:text-amber-400 hover:-translate-y-1 
               hover:shadow-[0_8px_20px_-8px_rgba(251,191,36,0.4)]
               active:scale-95 active:translate-y-0"
				onclick={() => onInsert(sym.value)}
				title={sym.desc}
			>
				<!-- Subtle glow effect on hover -->
				<div
					class="absolute inset-0 -z-10 rounded-xl bg-amber-400/5 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
				></div>

				<span class="relative z-10 font-mono">{sym.label}</span>

				<!-- Bottom accent line -->
				<div
					class="absolute bottom-1.5 h-0.5 w-0 rounded-full bg-amber-400 transition-all duration-300 group-hover:w-3"
				></div>
			</button>
		{/each}
	</div>
</div>

<style>
	/* Any extra specific styles if needed */
</style>
