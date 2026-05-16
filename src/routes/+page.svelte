<script lang="ts">
	import VirtualKeyboard from '$lib/components/VirtualKeyboard.svelte';
	import GrammarViewer from '$lib/components/GrammarViewer.svelte';
	import TableViewer from '$lib/components/TableViewer.svelte';
	import StepPlayer from '$lib/components/StepPlayer.svelte';
	import { ApiService } from '$lib/services/api';
	import type { AnalyzeResponse, ParseResponse } from '$lib/types';

	// State using Runes
	let grammar = $state('S → A B\nA → a | ϵ\nB → b');
	let testInput = $state('a b');
	let textarea: HTMLTextAreaElement;

	// Analysis State
	let analyzeResult = $state<AnalyzeResponse | null>(null);
	let parseResult = $state<ParseResponse | null>(null);
	let isAnalyzing = $state(false);
	let isParsing = $state(false);
	let toast = $state<{ msg: string; type: 'success' | 'error' } | null>(null);

	/**
	 * Inserts a symbol at the current cursor position in the textarea
	 */
	function handleInsert(symbol: string) {
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const before = grammar.substring(0, start);
		const after = grammar.substring(end);

		grammar = before + symbol + after;

		// Restoration of focus and cursor position
		setTimeout(() => {
			textarea.focus();
			const newPos = start + symbol.length;
			textarea.setSelectionRange(newPos, newPos);
		}, 0);
	}

	/**
	 * Analyzes the grammar structure
	 */
	async function analyzeGrammar() {
		isAnalyzing = true;
		const data = await ApiService.analyze(grammar);
		analyzeResult = data;

		if (data.status === 'success') {
			showToast(`Analysis Complete: ${data.production_count} rules found.`, 'success');
		} else {
			showToast(data.message || 'Syntax Error in Grammar', 'error');
		}
		isAnalyzing = false;
	}

	/**
	 * Simulates LL(1) parsing for a given input
	 */
	async function simulateLL1() {
		if (!grammar || !testInput) {
			showToast('Please provide both grammar and input string.', 'error');
			return;
		}

		isParsing = true;
		const data = await ApiService.parseLL1(grammar, testInput);
		parseResult = data;

		if (data.status === 'success') {
			showToast('LL(1) Simulation ready!', 'success');
		} else {
			showToast(data.message || 'Parsing error.', 'error');
		}
		isParsing = false;
	}

	function showToast(msg: string, type: 'success' | 'error') {
		toast = { msg, type };
		setTimeout(() => {
			toast = null;
		}, 4000);
	}
</script>

<svelte:head>
	<title>Ultimate Parser | LL(1) Analysis</title>
</svelte:head>

<main class="min-h-screen bg-[#0f172a] p-6 lg:p-12 relative overflow-hidden">
	<!-- Background Effects -->
	<div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[120px] -z-10"></div>
	<div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>

	<div class="mx-auto max-w-6xl space-y-12">
		<!-- Header Section -->
		<header class="animate-fade-in flex flex-col md:flex-row md:justify-between md:items-end gap-6">
			<div>
				<div class="flex items-center gap-4 mb-2">
					<div class="h-12 w-12 rounded-xl bg-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)]">
						<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
					</div>
					<h1 class="text-4xl font-black tracking-tight text-white">
						Ultimate <span class="text-amber-400">Parser</span>
					</h1>
				</div>
				<p class="text-slate-400 max-w-2xl text-lg">
					Analyze context-free grammars and visualize LL(1) parsing step-by-step.
				</p>
			</div>

			<div class="flex items-center gap-3 text-xs font-mono text-slate-500 bg-slate-900/50 px-5 py-2.5 rounded-full border border-slate-700/50 backdrop-blur-sm">
				<span class="h-2 w-2 rounded-full {isAnalyzing || isParsing ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}"></span>
				{isAnalyzing || isParsing ? 'Processing...' : 'Backend Active'}
			</div>
		</header>

		<!-- Main Layout Grid -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
			<!-- Left Column: Grammar Editor & Analysis -->
			<section class="lg:col-span-7 space-y-8 animate-fade-in" style="animation-delay: 0.1s">
				<div class="glass-card overflow-hidden !p-0 border-slate-700/50 shadow-2xl">
					<div class="flex items-center justify-between border-b border-slate-700/50 bg-slate-800/40 px-6 py-4">
						<div class="flex items-center gap-2">
							<div class="flex gap-1.5 mr-4">
								<div class="h-3 w-3 rounded-full bg-red-500/30"></div>
								<div class="h-3 w-3 rounded-full bg-amber-500/30"></div>
								<div class="h-3 w-3 rounded-full bg-green-500/30"></div>
							</div>
							<span class="text-xs font-black uppercase tracking-widest text-slate-500">Grammar Definition</span>
						</div>
					</div>

					<textarea
						bind:this={textarea}
						bind:value={grammar}
						spellcheck="false"
						placeholder="S → A B..."
						class="min-h-[300px] w-full resize-none bg-transparent p-8 font-mono text-lg text-slate-200 outline-none placeholder:text-slate-800 transition-all focus:bg-white/[0.02]"
					></textarea>
				</div>

				<div class="flex justify-end gap-4">
					<button class="btn-ghost" onclick={() => (grammar = '')}>Reset</button>
					<button
						class="btn-primary flex items-center gap-3 px-8"
						onclick={analyzeGrammar}
						disabled={isAnalyzing}
					>
						{#if isAnalyzing}
							<div class="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
						{/if}
						Analyze Structure
					</button>
				</div>

				<!-- Productions View -->
				{#if analyzeResult && analyzeResult.status === 'success'}
					<div class="space-y-6 animate-fade-in">
						<div class="flex items-center gap-3">
							<h3 class="text-xs font-black uppercase tracking-widest text-slate-600">Parsed Productions</h3>
							<div class="h-px grow bg-slate-800/50"></div>
						</div>
						<GrammarViewer productions={analyzeResult.productions || []} />
					</div>
				{/if}
			</section>

			<!-- Right Column: Tools & Stats -->
			<aside class="lg:col-span-5 space-y-8 animate-fade-in" style="animation-delay: 0.2s">
				{#if analyzeResult && analyzeResult.status === 'success'}
					<div class="glass-card grid grid-cols-2 gap-6 border-amber-400/20 bg-amber-400/[0.02]">
						<div class="space-y-1">
							<p class="text-[10px] uppercase text-slate-500 font-black tracking-widest">Left Recursion</p>
							<p class="text-2xl font-black {analyzeResult.has_left_recursion ? 'text-red-400' : 'text-green-400'}">
								{analyzeResult.has_left_recursion ? 'DETECTED' : 'CLEAN'}
							</p>
						</div>
						<div class="space-y-1">
							<p class="text-[10px] uppercase text-slate-500 font-black tracking-widest">Start Symbol</p>
							<p class="text-2xl font-black text-white">{analyzeResult.start_symbol?.value || '?'}</p>
						</div>
					</div>
				{/if}

				<VirtualKeyboard onInsert={handleInsert} />

				<div class="glass-card border-slate-700/50 space-y-4">
					<h3 class="text-xs font-black uppercase tracking-widest text-slate-400">Grammar Rules</h3>
					<div class="space-y-4">
						<div class="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
							<span class="text-amber-400 font-mono text-sm font-bold block mb-1">Terminals</span>
							<p class="text-xs text-slate-500">Represented by lowercase letters or symbols like <code class="text-slate-300">+</code>, <code class="text-slate-300">*</code>.</p>
						</div>
						<div class="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
							<span class="text-amber-400 font-mono text-sm font-bold block mb-1">Non-Terminals</span>
							<p class="text-xs text-slate-500">Represented by uppercase letters. Use <code class="text-slate-300">ϵ</code> for empty rules.</p>
						</div>
					</div>
				</div>
			</aside>
		</div>

		<!-- LL(1) Simulation Section (New for Phase 3) -->
		{#if analyzeResult && analyzeResult.status === 'success' && !analyzeResult.has_left_recursion}
			<section class="animate-fade-in space-y-8 pt-12 border-t border-slate-800">
				<div class="max-w-3xl space-y-4">
					<h2 class="text-3xl font-black text-white">LL(1) Parsing <span class="text-amber-400">Simulation</span></h2>
					<p class="text-slate-400">Enter a sequence of tokens to simulate how the parser processes the input using the stack.</p>
				</div>

				<div class="glass-card flex flex-col md:flex-row gap-4 items-center border-slate-700/50 bg-slate-800/20">
					<div class="relative w-full">
						<input 
							type="text" 
							bind:value={testInput} 
							placeholder="Enter tokens separated by space (e.g., a b c)"
							class="w-full bg-slate-900 border border-slate-700 rounded-xl px-6 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all font-mono"
						/>
						<span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Input Stream</span>
					</div>
					<button 
						class="btn-primary min-w-[200px] h-[58px] flex items-center justify-center gap-2"
						onclick={simulateLL1}
						disabled={isParsing}
					>
						{#if isParsing}
							<div class="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
						{/if}
						Run Simulation
					</button>
				</div>

				{#if parseResult}
					{#if parseResult.status === 'success'}
						<div class="grid grid-cols-1 gap-12">
							<TableViewer table={parseResult.parsing_table || {}} />
							
							<div class="space-y-6">
								<div class="flex items-center gap-3">
									<h3 class="text-xs font-black uppercase tracking-widest text-slate-500">Parser Execution</h3>
									<div class="h-px grow bg-slate-800"></div>
								</div>
								<StepPlayer snapshots={parseResult.snapshots || []} />
							</div>
						</div>
					{:else}
						<div class="glass-card border-red-500/20 bg-red-500/5 p-8 text-center space-y-3">
							<div class="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-red-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
							</div>
							<h3 class="text-lg font-bold text-red-400 uppercase tracking-widest">Parsing Failed</h3>
							<p class="text-slate-400 font-mono text-sm max-w-xl mx-auto">{parseResult.message}</p>
						</div>
					{/if}
				{/if}
			</section>
		{/if}
	</div>

	<!-- Toast Notifications -->
	{#if toast}
		<div
			class="fixed bottom-8 right-8 z-50 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-fade-in
			{toast.type === 'success'
				? 'bg-slate-900/90 border-green-500/30 text-green-400'
				: 'bg-slate-900/90 border-red-500/30 text-red-400'}"
		>
			<div class="h-2 w-2 rounded-full {toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse"></div>
			<span class="font-bold text-xs tracking-widest uppercase">{toast.msg}</span>
		</div>
	{/if}
</main>

<style>
	:global(body) {
		background-image: radial-gradient(at 0% 0%, rgba(251, 191, 36, 0.05) 0px, transparent 50%),
			radial-gradient(at 100% 100%, rgba(251, 191, 36, 0.02) 0px, transparent 50%);
	}
</style>
