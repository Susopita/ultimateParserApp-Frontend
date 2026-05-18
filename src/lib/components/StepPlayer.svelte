<script lang="ts">
	import type { ParseSnapshot } from '$lib/types';
	import { i18n } from '$lib/stores/i18n.svelte';
	const t = (key: string, vars?: Record<string, string | number>) => i18n.t(key, vars);

	let { snapshots = [] } = $props<{ snapshots: ParseSnapshot[] }>();

	let currentIndex = $state(0);
	let isPlaying = $state(false);
	let interval: ReturnType<typeof setInterval>;

	$effect(() => () => clearInterval(interval));

	const current = $derived(snapshots[currentIndex] || null);
	const progress = $derived(snapshots.length > 0 ? ((currentIndex + 1) / snapshots.length) * 100 : 0);

	function togglePlay() {
		isPlaying ? pause() : play();
	}

	function play() {
		if (currentIndex >= snapshots.length - 1) currentIndex = 0;
		isPlaying = true;
		interval = setInterval(() => {
			if (currentIndex < snapshots.length - 1) {
				currentIndex++;
			} else {
				pause();
			}
		}, 800);
	}

	function pause() {
		isPlaying = false;
		clearInterval(interval);
	}

	function next() { pause(); if (currentIndex < snapshots.length - 1) currentIndex++; }
	function prev() { pause(); if (currentIndex > 0) currentIndex--; }
</script>

<div class="animate-fade-in space-y-6">
	<!-- Player Controls -->
	<div class="glass-card flex items-center justify-between !py-4 shadow-xl">
		<div class="flex items-center gap-4">
			<button
				class="h-10 w-10 flex items-center justify-center rounded-full bg-elevated border border-strong text-base-3 hover:dark:text-amber-400 hover:text-amber-600 hover:border-amber-400/50 transition-all active:scale-90 disabled:opacity-30"
				aria-label="Previous step"
				onclick={prev}
				disabled={currentIndex === 0}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
			</button>

			<button
				class="h-12 w-12 flex items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-105 transition-all active:scale-95"
				onclick={togglePlay}
			>
				{#if isPlaying}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
				{/if}
			</button>

			<button
				class="h-10 w-10 flex items-center justify-center rounded-full bg-elevated border border-strong text-base-3 hover:dark:text-amber-400 hover:text-amber-600 hover:border-amber-400/50 transition-all active:scale-90 disabled:opacity-30"
				aria-label="Next step"
				onclick={next}
				disabled={currentIndex === snapshots.length - 1}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
			</button>
		</div>

		<div class="flex flex-col items-end gap-1">
			<span class="text-[10px] font-bold uppercase tracking-widest text-base-3">
				{t('player.step', { current: currentIndex + 1, total: snapshots.length })}
			</span>
			<div class="h-1.5 w-48 bg-elevated rounded-full overflow-hidden border border-strong">
				<div class="h-full bg-amber-400 transition-all duration-300" style="width: {progress}%"></div>
			</div>
		</div>
	</div>

	{#if current}
		<div class="grid grid-cols-1 md:grid-cols-12 gap-6">
			<!-- Stack Panel -->
			<div class="md:col-span-3 space-y-3">
				<h4 class="text-[10px] font-bold uppercase tracking-widest text-base-3 ml-2">{t('player.stack')}</h4>
				<div class="glass-card min-h-[300px] flex flex-col-reverse justify-start gap-2 !bg-[var(--bg-elevated)]">
					{#each current.stack as sym, i}
						<div
							class="p-3 rounded-lg border text-center font-mono text-sm font-semibold transition-all duration-300
							{i === current.stack.length - 1
								? 'bg-amber-400/20 border-amber-400/50 dark:text-amber-400 text-amber-700 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
								: 'bg-elevated border-strong text-base-2'}"
						>
							{sym.value || (sym.type === 'Epsilon' ? 'ϵ' : '$')}
							{#if i === current.stack.length - 1}
								<span class="block text-[8px] mt-1 font-black tracking-widest">TOP</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Visual Simulation Area -->
			<div class="md:col-span-9 space-y-6">
				<!-- Action Card -->
				<div class="glass-card bg-amber-400/5 border-amber-400/20 !p-8 flex flex-col items-center justify-center text-center space-y-4">
					<span class="px-3 py-1 rounded-full bg-amber-400/10 text-[10px] font-bold dark:text-amber-400 text-amber-700 border border-amber-400/30">
						{t('player.action')}
					</span>
					<h2 class="text-2xl font-black text-base-1 tracking-tight leading-tight">
						{current.action}
					</h2>
				</div>

				<!-- Input Stream -->
				<div class="glass-card space-y-4">
					<h4 class="text-[10px] font-bold uppercase tracking-widest text-base-3">{t('player.input_rem')}</h4>
					<div class="flex flex-wrap gap-2">
						{#each current.input_remaining as token, i}
							<div
								class="px-4 py-2 rounded-xl font-mono text-sm font-semibold transition-all duration-500
								{i === 0
									? 'bg-amber-400 text-slate-900 scale-110 shadow-xl'
									: 'bg-elevated text-base-3 border border-strong'}"
							>
								{token}
							</div>
						{/each}
						{#if current.input_remaining.length === 0}
							<span class="text-base-4 italic">{t('player.consumed')}</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
