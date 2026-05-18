<script lang="ts">
	import type { LR0ParseSnapshot } from '$lib/types';
	import { i18n } from '$lib/stores/i18n.svelte';
	const t = (key: string, vars?: Record<string, string | number>) => i18n.t(key, vars);

	let { snapshots = [] } = $props<{ snapshots: LR0ParseSnapshot[] }>();

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
		}, 1000);
	}

	function pause() {
		isPlaying = false;
		clearInterval(interval);
	}

	function next() { pause(); if (currentIndex < snapshots.length - 1) currentIndex++; }
	function prev() { pause(); if (currentIndex > 0) currentIndex--; }

	type ActionKind = 'accept' | 'shift' | 'reduce' | 'error';

	function actionKind(action: string): ActionKind {
		if (action.includes('Accept')) return 'accept';
		if (action.includes('Shift'))  return 'shift';
		if (action.includes('Reduce')) return 'reduce';
		return 'error';
	}

	const actionStyles: Record<ActionKind, { card: string; badge: string }> = {
		accept: {
			card:  'bg-green-400/5 border-green-400/20',
			badge: 'bg-green-400/10 dark:text-green-400 text-green-700 border-green-400/30',
		},
		shift: {
			card:  'bg-cyan-400/5 border-cyan-400/20',
			badge: 'bg-cyan-400/10 dark:text-cyan-400 text-cyan-700 border-cyan-400/30',
		},
		reduce: {
			card:  'bg-amber-400/5 border-amber-400/20',
			badge: 'bg-amber-400/10 dark:text-amber-400 text-amber-700 border-amber-400/30',
		},
		error: {
			card:  'bg-red-400/5 border-red-400/20',
			badge: 'bg-red-400/10 dark:text-red-400 text-red-700 border-red-400/30',
		},
	};
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
		{@const kind = actionKind(current.action)}
		{@const styles = actionStyles[kind]}

		<div class="grid grid-cols-1 md:grid-cols-12 gap-6">
			<!-- Stack Panel -->
			<div class="md:col-span-4 space-y-3">
				<h4 class="text-[10px] font-bold uppercase tracking-widest text-base-3 ml-2">{t('player.parser_stack')}</h4>
				<div class="glass-card min-h-[300px] flex flex-col-reverse justify-start gap-1.5 !bg-[var(--bg-elevated)]">
					{#each current.state_stack as state, i}
						{@const isTop = i === current.state_stack.length - 1}
						{@const symbol = current.symbol_stack[i - 1]}

						<!-- State chip -->
						<div
							class="p-2 rounded-lg border text-center font-mono text-xs font-semibold transition-all duration-300
							{isTop
								? 'bg-cyan-400/20 border-cyan-400/50 dark:text-cyan-400 text-cyan-700 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
								: 'bg-elevated border-strong text-base-3'}"
						>
							s{state}
							{#if isTop}
								<span class="block text-[8px] mt-0.5 font-black tracking-widest">TOP</span>
							{/if}
						</div>

						<!-- Symbol chip (between states) -->
						{#if symbol !== undefined}
							<div class="p-2.5 rounded-lg border text-center font-mono text-sm font-semibold transition-all duration-300
								bg-amber-400/15 border-amber-400/40 dark:text-amber-400 text-amber-700">
								{symbol}
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<!-- Visual Simulation Area -->
			<div class="md:col-span-8 space-y-6">
				<!-- Action Card -->
				<div class="glass-card !p-8 flex flex-col items-center justify-center text-center space-y-4 {styles.card}">
					<span class="px-3 py-1 rounded-full text-[10px] font-bold border {styles.badge}">
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

				<!-- Stack Detail -->
				<div class="glass-card space-y-4 !bg-[var(--bg-elevated)]">
					<h4 class="text-[10px] font-bold uppercase tracking-widest text-base-3">{t('player.stack_detail')}</h4>
					<div class="flex flex-wrap gap-2 items-center font-mono text-sm">
						{#each current.state_stack as state, i}
							<span class="px-2 py-1 rounded bg-cyan-400/10 border border-cyan-400/30 dark:text-cyan-400 text-cyan-700 text-xs font-semibold">
								s{state}
							</span>
							{#if current.symbol_stack[i]}
								<span class="px-2 py-1 rounded bg-amber-400/10 border border-amber-400/30 dark:text-amber-400 text-amber-700 text-xs font-semibold">
									{current.symbol_stack[i]}
								</span>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
