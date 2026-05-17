<script lang="ts">
	/**
	 * LR0StepPlayer.svelte
	 * Interactive player for LR(0) parsing simulation steps.
	 * Displays separate state stack and symbol stack.
	 */
	import type { LR0ParseSnapshot } from '$lib/types';

	let { snapshots = [] } = $props<{ snapshots: LR0ParseSnapshot[] }>();

	let currentIndex = $state(0);
	let isPlaying = $state(false);
	let interval: ReturnType<typeof setInterval>;

	$effect(() => () => clearInterval(interval));

	const current = $derived(snapshots[currentIndex] || null);
	const progress = $derived(snapshots.length > 0 ? ((currentIndex + 1) / snapshots.length) * 100 : 0);

	function togglePlay() {
		if (isPlaying) {
			pause();
		} else {
			play();
		}
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

	function next() {
		pause();
		if (currentIndex < snapshots.length - 1) currentIndex++;
	}

	function prev() {
		pause();
		if (currentIndex > 0) currentIndex--;
	}

</script>

<div class="animate-fade-in space-y-6">
	<!-- Player Controls -->
	<div class="glass-card flex items-center justify-between !py-4 border-slate-700/50 shadow-xl">
		<div class="flex items-center gap-4">
			<button
				class="h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-400/50 transition-all active:scale-90"
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
				class="h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-400/50 transition-all active:scale-90"
				aria-label="Next step"
				onclick={next}
				disabled={currentIndex === snapshots.length - 1}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
			</button>
		</div>

		<div class="flex flex-col items-end gap-1">
			<span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Step {currentIndex + 1} of {snapshots.length}</span>
			<div class="h-1.5 w-48 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
				<div class="h-full bg-amber-400 transition-all duration-300" style="width: {progress}%"></div>
			</div>
		</div>
	</div>

	{#if current}
		<div class="grid grid-cols-1 md:grid-cols-12 gap-6">
			<!-- Stack Panel -->
			<div class="md:col-span-4 space-y-3">
				<h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Parser Stack</h4>
				<div class="glass-card min-h-[300px] flex flex-col-reverse justify-start gap-1.5 bg-slate-900/30">
					<!-- Interleave state and symbol stacks: s0 X s1 Y s2 -->
					{#each current.state_stack as state, i}
						{@const isTop = i === current.state_stack.length - 1}
						{@const symbol = current.symbol_stack[i - 1]}
						
						<!-- Show the state -->
						<div
							class="p-2 rounded-lg border text-center font-mono text-xs transition-all duration-300
							{isTop 
								? 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
								: 'bg-slate-800/30 border-slate-700/50 text-slate-500'}"
						>
							s{state}
							{#if isTop}
								<span class="block text-[8px] mt-0.5 font-bold">TOP</span>
							{/if}
						</div>
						
						<!-- Show the symbol below the state (if exists) -->
						{#if symbol !== undefined}
							<div
								class="p-2.5 rounded-lg border text-center font-mono text-sm transition-all duration-300
								bg-amber-400/10 border-amber-400/30 text-amber-400"
							>
								{symbol}
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<!-- Visual Simulation Area -->
			<div class="md:col-span-8 space-y-6">
				<!-- Action Card -->
				<div class="glass-card !p-8 flex flex-col items-center justify-center text-center space-y-4
					{current.action.includes('Accept') 
						? 'bg-green-400/5 border-green-400/20' 
						: current.action.includes('Shift') 
							? 'bg-cyan-400/5 border-cyan-400/20' 
							: current.action.includes('Reduce') 
								? 'bg-amber-400/5 border-amber-400/20' 
								: 'bg-red-400/5 border-red-400/20'}"
				>
					<span class="px-3 py-1 rounded-full text-[10px] font-bold border
						{current.action.includes('Accept') 
							? 'bg-green-400/10 text-green-400 border-green-400/20' 
							: current.action.includes('Shift') 
								? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20' 
								: current.action.includes('Reduce') 
									? 'bg-amber-400/10 text-amber-400 border-amber-400/20' 
									: 'bg-red-400/10 text-red-400 border-red-400/20'}"
					>
						CURRENT ACTION
					</span>
					<h2 class="text-2xl font-black text-white tracking-tight leading-tight">
						{current.action}
					</h2>
				</div>

				<!-- Input Stream -->
				<div class="glass-card space-y-4">
					<h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Input Remaining</h4>
					<div class="flex flex-wrap gap-2">
						{#each current.input_remaining as token, i}
							<div 
								class="px-4 py-2 rounded-xl font-mono text-sm transition-all duration-500
								{i === 0 ? 'bg-white text-slate-900 font-bold scale-110 shadow-xl' : 'bg-slate-900 text-slate-500 border border-slate-800'}"
							>
								{token}
							</div>
						{/each}
						{#if current.input_remaining.length === 0}
							<span class="text-slate-600 italic">Input consumed.</span>
						{/if}
					</div>
				</div>

				<!-- State + Symbol Info -->
				<div class="glass-card space-y-4 bg-slate-900/30">
					<h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Stack Detail</h4>
					<div class="flex flex-wrap gap-2 items-center font-mono text-sm">
						{#each current.state_stack as state, i}
							<span class="px-2 py-1 rounded bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs">
								s{state}
							</span>
							{#if current.symbol_stack[i]}
								<span class="px-2 py-1 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs">
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
