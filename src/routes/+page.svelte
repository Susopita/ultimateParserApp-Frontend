<script lang="ts">
	import { onMount } from "svelte";
	import VirtualKeyboard from "$lib/components/VirtualKeyboard.svelte";
	import { appStorage } from "$lib/stores/storage.svelte";
	import GrammarViewer from "$lib/components/GrammarViewer.svelte";
	import TableViewer from "$lib/components/TableViewer.svelte";
	import StepPlayer from "$lib/components/StepPlayer.svelte";
	import LR0TableViewer from "$lib/components/LR0TableViewer.svelte";
	import LR0StepPlayer from "$lib/components/LR0StepPlayer.svelte";

	import AiAssistPanel from "$lib/components/AiAssistPanel.svelte";
	import GraphvizViewer from "$lib/components/GraphvizViewer.svelte";
	import FirstFollowSets from "$lib/components/FirstFollowSets.svelte";
	import { ApiService } from "$lib/services/api";
	import { exportTablesPDF } from "$lib/utils/pdf";
	import type { TableSpec } from "$lib/utils/pdf";
	import type {
		AnalyzeResponse,
		ParseResponse,
		LR0ParseResponse,
		SLR1ParseResponse,
		LR1ParseResponse,
		LALR1ParseResponse,
	} from "$lib/types";
	import { theme } from "$lib/stores/theme.svelte";
	import { i18n } from "$lib/stores/i18n.svelte";
	const t = (key: string, vars?: Record<string, string | number>) =>
		i18n.t(key, vars);

	// State using Runes
	let grammar = $state("S → A B\nA → a | ϵ\nB → b");
	let testInput = $state("a b");
	let lr0TestInput = $state("a b");
	let slr1TestInput = $state("a b");
	let textarea: HTMLTextAreaElement;

	// Analysis State
	let analyzeResult = $state<AnalyzeResponse | null>(null);
	let parseResult = $state<ParseResponse | null>(null);
	let lr0Result = $state<LR0ParseResponse | null>(null);
	let slr1Result = $state<SLR1ParseResponse | null>(null);
	let isAnalyzing = $state(false);
	let isParsing = $state(false);
	let isParsingLR0 = $state(false);
	let isParsingSlr1 = $state(false);
	let lr1TestInput = $state("a b");
	let lr1Result = $state<LR1ParseResponse | null>(null);
	let isParsingLr1 = $state(false);
	let lalr1TestInput = $state("a b");
	let lalr1Result = $state<LALR1ParseResponse | null>(null);
	let isParsingLalr1 = $state(false);
	let rdTestInput = $state("a b");
	let rdResult = $state<ParseResponse | null>(null);
	let isParsingRd = $state(false);
	let toast = $state<{ msg: string; type: "success" | "error" } | null>(null);
	let errorContext = $state<{
		message: string;
		inputString: string;
		parserType: string;
	} | null>(null);

	const isLoading = $derived(
		isAnalyzing ||
			isParsing ||
			isParsingRd ||
			isParsingLR0 ||
			isParsingSlr1 ||
			isParsingLr1 ||
			isParsingLalr1,
	);
	const grammarReady = $derived(analyzeResult?.status === "success");
	const grammarReadyNoLeftRec = $derived(
		analyzeResult?.status === "success" &&
			!analyzeResult.has_left_recursion,
	);

	onMount(() => {
		if (appStorage.grammars.length > 0 && grammar === "S → A B\nA → a | ϵ\nB → b") {
			grammar = appStorage.grammars[0].grammar;
		}
		if (appStorage.lastInputLl1) testInput = appStorage.lastInputLl1;
		if (appStorage.lastInputLr0) lr0TestInput = appStorage.lastInputLr0;
		if (appStorage.lastInputSlr1) slr1TestInput = appStorage.lastInputSlr1;
		if (appStorage.lastInputLr1) lr1TestInput = appStorage.lastInputLr1;
		if (appStorage.lastInputLalr1) lalr1TestInput = appStorage.lastInputLalr1;
	});

	$effect(() => {
		appStorage.lastInputLl1 = testInput;
		appStorage.lastInputLr0 = lr0TestInput;
		appStorage.lastInputSlr1 = slr1TestInput;
		appStorage.lastInputLr1 = lr1TestInput;
		appStorage.lastInputLalr1 = lalr1TestInput;
		appStorage.save();
	});

	function handleInsert(symbol: string) {
		if (!textarea) return;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const before = grammar.substring(0, start);
		const after = grammar.substring(end);
		grammar = before + symbol + after;
		setTimeout(() => {
			textarea.focus();
			const newPos = start + symbol.length;
			textarea.setSelectionRange(newPos, newPos);
		}, 0);
	}

	async function analyzeGrammar() {
		appStorage.addGrammar(grammar);
		isAnalyzing = true;
		const data = await ApiService.analyze(grammar);
		analyzeResult = data;
		if (data.status === "success") {
			errorContext = null;
			showToast(
				t("toast.analyze_ok", { n: data.production_count ?? 0 }),
				"success",
			);
		} else {
			errorContext = {
				message: data.message || t("toast.grammar_err"),
				inputString: "",
				parserType: "Grammar Analysis",
			};
			showToast(data.message || t("toast.grammar_err"), "error");
		}
		isAnalyzing = false;
	}

	async function simulateLL1() {
		if (!grammar || !testInput) {
			showToast(t("toast.missing"), "error");
			return;
		}
		isParsing = true;
		const data = await ApiService.parseLL1(grammar, testInput);
		parseResult = data;
		if (data.status === "success") {
			errorContext = null;
			showToast(t("ll1_ok"), "success");
		} else {
			errorContext = {
				message: data.message || t("toast.parse_err"),
				inputString: testInput,
				parserType: "LL(1)",
			};
			showToast(data.message || t("toast.parse_err"), "error");
		}
		isParsing = false;
	}

	async function simulateLR0() {
		if (!grammar || !lr0TestInput) {
			showToast(t("toast.missing"), "error");
			return;
		}
		isParsingLR0 = true;
		const data = await ApiService.parseLR0(grammar, lr0TestInput);
		lr0Result = data;
		if (data.status === "success") {
			errorContext = null;
			showToast(t("toast.lr0_ok"), "success");
		} else {
			errorContext = {
				message: data.message || t("toast.parse_err"),
				inputString: lr0TestInput,
				parserType: "LR(0)",
			};
			showToast(data.message || t("toast.parse_err"), "error");
		}
		isParsingLR0 = false;
	}

	async function simulateSLR1() {
		if (!grammar || !slr1TestInput) {
			showToast(t("toast.missing"), "error");
			return;
		}
		isParsingSlr1 = true;
		const data = await ApiService.parseSLR1(grammar, slr1TestInput);
		slr1Result = data;
		if (data.status === "success") {
			errorContext = null;
			showToast(t("toast.slr1_ok"), "success");
		} else {
			errorContext = {
				message: data.message || t("toast.parse_err"),
				inputString: slr1TestInput,
				parserType: "SLR(1)",
			};
			showToast(data.message || t("toast.parse_err"), "error");
		}
		isParsingSlr1 = false;
	}

	async function simulateLR1() {
		if (!grammar || !lr1TestInput) {
			showToast(t("toast.missing"), "error");
			return;
		}
		isParsingLr1 = true;
		const data = await ApiService.parseLR1(grammar, lr1TestInput);
		lr1Result = data;
		if (data.status === "success") {
			errorContext = null;
			showToast(t("toast.lr1_ok"), "success");
		} else {
			errorContext = {
				message: data.message || t("toast.parse_err"),
				inputString: lr1TestInput,
				parserType: "LR(1)",
			};
			showToast(data.message || t("toast.parse_err"), "error");
		}
		isParsingLr1 = false;
	}

	async function simulateRD() {
		if (!grammar || !rdTestInput) {
			showToast(t("toast.missing"), "error");
			return;
		}
		isParsingRd = true;
		const data = await ApiService.parseRD(grammar, rdTestInput);
		rdResult = data;
		if (data.status === "success") {
			errorContext = null;
			showToast(t("toast.rd_ok"), "success");
		} else {
			errorContext = {
				message: data.message || t("toast.parse_err"),
				inputString: rdTestInput,
				parserType: "Recursive Descent",
			};
			showToast(data.message || t("toast.parse_err"), "error");
		}
		isParsingRd = false;
	}

	async function simulateLALR1() {
		if (!grammar || !lalr1TestInput) {
			showToast(t("toast.missing"), "error");
			return;
		}
		isParsingLalr1 = true;
		const data = await ApiService.parseLALR1(grammar, lalr1TestInput);
		lalr1Result = data;
		if (data.status === "success") {
			errorContext = null;
			showToast(t("toast.lalr1_ok"), "success");
		} else {
			errorContext = {
				message: data.message || t("toast.parse_err"),
				inputString: lalr1TestInput,
				parserType: "LALR(1)",
			};
			showToast(data.message || t("toast.parse_err"), "error");
		}
		isParsingLalr1 = false;
	}

	function symbolLabel(sym: import("$lib/types").Symbol | undefined): string {
		if (!sym) return "?";
		return sym.type === "Epsilon" ? "ϵ" : sym.value;
	}

	function showToast(msg: string, type: "success" | "error") {
		toast = { msg, type };
		setTimeout(() => {
			toast = null;
		}, 4000);
	}

	// ─── PDF export ────────────────────────────────────────────────────

	const availableTables = $derived<TableSpec[]>([
		...(analyzeResult?.first_sets && analyzeResult?.follow_sets
			? [
					{
						kind: "first-follow" as const,
						label: "FIRST & FOLLOW Sets",
						first_sets: analyzeResult.first_sets,
						follow_sets: analyzeResult.follow_sets,
					},
				]
			: []),
		...(parseResult?.parsing_table &&
		Object.keys(parseResult.parsing_table).length > 0
			? [
					{
						kind: "ll1" as const,
						label: "LL(1) — Parsing Table M",
						table: parseResult.parsing_table,
					},
				]
			: []),
		...(lr0Result?.action_table
			? [
					{
						kind: "lr" as const,
						label: "LR(0) — ACTION / GOTO Table",
						action_table: lr0Result.action_table,
						goto_table: lr0Result.goto_table ?? {},
						terminals: lr0Result.terminals ?? [],
						non_terminals: lr0Result.non_terminals ?? [],
						stateCount: lr0Result.automaton?.states.length ?? 0,
					},
				]
			: []),
		...(slr1Result?.action_table
			? [
					{
						kind: "lr" as const,
						label: "SLR(1) — ACTION / GOTO Table",
						action_table: slr1Result.action_table,
						goto_table: slr1Result.goto_table ?? {},
						terminals: slr1Result.terminals ?? [],
						non_terminals: slr1Result.non_terminals ?? [],
						stateCount: slr1Result.automaton?.states.length ?? 0,
					},
				]
			: []),
		...(lr1Result?.action_table
			? [
					{
						kind: "lr" as const,
						label: "LR(1) — ACTION / GOTO Table",
						action_table: lr1Result.action_table,
						goto_table: lr1Result.goto_table ?? {},
						terminals: lr1Result.terminals ?? [],
						non_terminals: lr1Result.non_terminals ?? [],
						stateCount: lr1Result.automaton?.states.length ?? 0,
					},
				]
			: []),
		...(lalr1Result?.action_table
			? [
					{
						kind: "lr" as const,
						label: "LALR(1) — ACTION / GOTO Table",
						action_table: lalr1Result.action_table,
						goto_table: lalr1Result.goto_table ?? {},
						terminals: lalr1Result.terminals ?? [],
						non_terminals: lalr1Result.non_terminals ?? [],
						stateCount: lalr1Result.automaton?.states.length ?? 0,
					},
				]
			: []),
	]);

	let downloadingAll = $state(false);

	async function downloadAllTables() {
		if (availableTables.length === 0) return;
		downloadingAll = true;
		try {
			await exportTablesPDF(availableTables, "all-parser-tables.pdf");
		} finally {
			downloadingAll = false;
		}
	}

	// ─── Shared parse tree (same for all parsers on the same grammar+input) ──
	const sharedParseTreeDot = $derived(
		rdResult?.parse_tree_dot ??
			parseResult?.parse_tree_dot ??
			lr0Result?.parse_tree_dot ??
			slr1Result?.parse_tree_dot ??
			lr1Result?.parse_tree_dot ??
			lalr1Result?.parse_tree_dot ??
			null,
	);
	const sharedAstDot = $derived(
		rdResult?.ast_dot ??
			parseResult?.ast_dot ??
			lr0Result?.ast_dot ??
			slr1Result?.ast_dot ??
			lr1Result?.ast_dot ??
			lalr1Result?.ast_dot ??
			null,
	);
</script>

<svelte:head>
	<title>Ultimate Parser | LL(1) & LR Analysis</title>
</svelte:head>

<main
	class="min-h-screen bg-base p-6 lg:p-12 relative overflow-hidden transition-colors duration-200"
>
	<!-- Background Effects -->
	<div
		class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[120px] -z-10"
	></div>
	<div
		class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10"
	></div>

	<div class="mx-auto max-w-6xl space-y-12">
		<!-- ─── Header ─────────────────────────────────────────────────── -->
		<header
			class="animate-fade-in flex flex-col md:flex-row md:justify-between md:items-end gap-6"
		>
			<div>
				<div class="flex items-center gap-4 mb-2">
					<div
						class="h-12 w-12 rounded-xl bg-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)]"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#0f172a"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="m8 3 4 8 5-5 5 15H2L8 3z" /></svg
						>
					</div>
					<h1 class="text-4xl font-black tracking-tight text-base-1">
						Ultimate <span
							class="dark:text-amber-400 text-amber-600"
							>Parser</span
						>
					</h1>
				</div>
				<p class="text-base-3 max-w-2xl text-lg">{t("app.subtitle")}</p>
			</div>

			<div class="flex items-center gap-2 flex-wrap">
				<!-- Theme toggle -->
				<button
					onclick={() => theme.toggle()}
					class="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border border-base bg-card text-base-2 hover:text-amber-500 hover:border-amber-400/40 transition-all"
					title="{theme.current === 'dark'
						? t('ui.light')
						: t('ui.dark')} mode"
				>
					{#if theme.current === "dark"}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="13"
							height="13"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><circle cx="12" cy="12" r="5" /><line
								x1="12"
								y1="1"
								x2="12"
								y2="3"
							/><line x1="12" y1="21" x2="12" y2="23" /><line
								x1="4.22"
								y1="4.22"
								x2="5.64"
								y2="5.64"
							/><line
								x1="18.36"
								y1="18.36"
								x2="19.78"
								y2="19.78"
							/><line x1="1" y1="12" x2="3" y2="12" /><line
								x1="21"
								y1="12"
								x2="23"
								y2="12"
							/><line
								x1="4.22"
								y1="19.78"
								x2="5.64"
								y2="18.36"
							/><line
								x1="18.36"
								y1="5.64"
								x2="19.78"
								y2="4.22"
							/></svg
						>
						{t("ui.light")}
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="13"
							height="13"
							viewBox="0 0 24 24"
							fill="currentColor"
							stroke="none"
							><path
								d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
							/></svg
						>
						{t("ui.dark")}
					{/if}
				</button>

				<!-- Language toggle -->
				<button
					onclick={() => i18n.toggle()}
					class="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border border-base bg-card text-base-2 hover:text-amber-500 hover:border-amber-400/40 transition-all"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><circle cx="12" cy="12" r="10" /><line
							x1="2"
							y1="12"
							x2="22"
							y2="12"
						/><path
							d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
						/></svg
					>
					{t("ui.lang_switch")}
				</button>

				<!-- Loading indicator (only shown while processing) -->
				{#if isLoading}
					<div
						class="flex items-center gap-2 text-xs font-mono text-base-3 bg-card px-4 py-2 rounded-full border border-base backdrop-blur-sm"
					>
						<span
							class="h-2 w-2 rounded-full bg-amber-400 animate-pulse"
						></span>
						{t("app.status.busy")}
					</div>
				{/if}
			</div>
		</header>

		<!-- ─── Main Layout Grid ────────────────────────────────────────── -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
			<!-- Left Column: Grammar Editor -->
			<section
				class="lg:col-span-7 space-y-8 animate-fade-in"
				style="animation-delay: 0.1s"
			>
				<div class="glass-card overflow-hidden !p-0 shadow-2xl">
					<div
						class="flex items-center justify-between border-b border-base bg-elevated px-6 py-4"
					>
						<div class="flex items-center gap-2">
							<div class="flex gap-1.5 mr-4">
								<div
									class="h-3 w-3 rounded-full bg-red-500/40"
								></div>
								<div
									class="h-3 w-3 rounded-full bg-amber-500/40"
								></div>
								<div
									class="h-3 w-3 rounded-full bg-green-500/40"
								></div>
							</div>
							<span
								class="text-xs font-black uppercase tracking-widest text-base-3"
								>{t("grammar.title")}</span
							>
						</div>
						
						{#if appStorage.grammars.length > 0}
							<div class="relative group">
								<button class="text-xs font-bold text-base-4 hover:text-amber-500 transition-colors uppercase tracking-widest flex items-center gap-2">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg>
									Recientes
								</button>
								<div class="absolute right-0 top-full mt-2 w-72 bg-card border border-strong rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden flex flex-col">
									<div class="px-4 py-2 bg-base border-b border-strong text-[9px] uppercase tracking-widest font-black text-base-4">Historial de Gramáticas</div>
									<div class="max-h-60 overflow-y-auto">
										{#each appStorage.grammars as g}
											<button class="w-full text-left px-4 py-3 hover:bg-base/50 transition-colors border-b border-strong last:border-0" onclick={() => grammar = g.grammar}>
												<div class="text-xs font-mono text-base-2 truncate opacity-80">{g.grammar.split('\n').join(' | ')}</div>
												<div class="text-[9px] text-base-4 font-bold uppercase mt-1">{new Date(g.timestamp).toLocaleTimeString()}</div>
											</button>
										{/each}
									</div>
								</div>
							</div>
						{/if}
					</div>
					<textarea
						bind:this={textarea}
						bind:value={grammar}
						spellcheck="false"
						placeholder="S → A B..."
						class="min-h-[300px] w-full resize-none bg-transparent p-8 font-mono text-lg text-base-1 outline-none placeholder:text-base-4 transition-all focus:bg-white/[0.02]"
					></textarea>
				</div>

				<div class="flex justify-end gap-4">
					<button class="btn-ghost" onclick={() => (grammar = "")}
						>{t("grammar.reset")}</button
					>
					<button
						class="btn-primary flex items-center gap-3 px-8"
						onclick={analyzeGrammar}
						disabled={isAnalyzing}
					>
						{#if isAnalyzing}
							<div
								class="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"
							></div>
							{t("grammar.analyzing")}
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path
									d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
								/></svg
							>
							{t("grammar.analyze")}
						{/if}
					</button>
				</div>

				<!-- Productions View -->
				{#if grammarReady}
					<div class="space-y-6 animate-fade-in">
						<div class="flex items-center gap-3">
							<h3
								class="text-xs font-black uppercase tracking-widest text-base-4"
							>
								{t("grammar.productions_title")}
							</h3>
							<div class="h-px grow bg-elevated"></div>
						</div>
						<GrammarViewer
							productions={analyzeResult!.productions || []}
						/>
					</div>
				{/if}
			</section>

			<!-- Right Column: Tools & Stats -->
			<aside
				class="lg:col-span-5 space-y-8 animate-fade-in"
				style="animation-delay: 0.2s"
			>
				{#if grammarReady}
					<div
						class="glass-card grid grid-cols-2 gap-6 border-amber-400/20 bg-amber-400/[0.02]"
					>
						<div class="space-y-1">
							<p
								class="text-[10px] uppercase text-base-3 font-black tracking-widest"
							>
								{t("analysis.left_rec_label")}
							</p>
							<p
								class="text-2xl font-black {analyzeResult!
									.has_left_recursion
									? 'text-red-500'
									: 'text-green-600 dark:text-green-400'}"
							>
								{analyzeResult!.has_left_recursion
									? t("analysis.detected")
									: t("analysis.clean")}
							</p>
						</div>
						<div class="space-y-1">
							<p
								class="text-[10px] uppercase text-base-3 font-black tracking-widest"
							>
								{t("grammar.start")}
							</p>
							<p class="text-2xl font-black text-base-1">
								{symbolLabel(analyzeResult!.start_symbol)}
							</p>
						</div>
					</div>
				{/if}

				<VirtualKeyboard onInsert={handleInsert} />

				{#if grammarReady}
					<AiAssistPanel {grammar} {errorContext} />
				{/if}

				<!-- Grammar hints -->
				<div class="glass-card space-y-4">
					<h3
						class="text-xs font-black uppercase tracking-widest text-base-3"
					>
						{t("grammar.rules_title")}
					</h3>
					<div class="space-y-4">
						<div
							class="p-3 rounded-xl bg-elevated border border-base"
						>
							<span
								class="dark:text-amber-400 text-amber-600 font-mono text-sm font-bold block mb-1"
								>{t("analysis.hint_t_label")}</span
							>
							<p class="text-xs text-base-3">
								{t("analysis.hint_t")}
							</p>
						</div>
						<div
							class="p-3 rounded-xl bg-elevated border border-base"
						>
							<span
								class="dark:text-amber-400 text-amber-600 font-mono text-sm font-bold block mb-1"
								>{t("analysis.hint_nt_label")}</span
							>
							<p class="text-xs text-base-3">
								{t("analysis.hint_nt")}
							</p>
						</div>
					</div>
				</div>
			</aside>
		</div>

		<!-- ═══════════════════ PDF Export Section ═══════════════════ -->
		{#if availableTables.length > 0}
			<section class="animate-fade-in pt-8">
				<div class="glass-card p-6 space-y-4">
					<div class="flex items-center gap-3">
						<div
							class="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#a78bfa"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path
									d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
								></path><polyline points="14 2 14 8 20 8"
								></polyline><line x1="16" y1="13" x2="8" y2="13"
								></line><line x1="16" y1="17" x2="8" y2="17"
								></line><polyline points="10 9 9 9 8 9"
								></polyline></svg
							>
						</div>
						<h3
							class="text-sm font-bold uppercase tracking-widest text-base-2"
						>
							{t("export.title")}
						</h3>
						<div class="h-px grow bg-elevated"></div>
						<span class="text-xs text-base-4 font-mono">
							{availableTables.length > 1
								? t("export.n_tables_p", {
										n: availableTables.length,
									})
								: t("export.n_tables", {
										n: availableTables.length,
									})}
						</span>
					</div>

					<div class="flex flex-wrap gap-3 items-start">
						<!-- Option 1: All tables in one PDF -->
						<div class="flex flex-col gap-1">
							<button
								onclick={downloadAllTables}
								disabled={downloadingAll}
								class="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{#if downloadingAll}
									<div
										class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
									></div>
									{t("export.generating")}
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path
											d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
										></path><polyline
											points="7 10 12 15 17 10"
										></polyline><line
											x1="12"
											y1="15"
											x2="12"
											y2="3"
										></line></svg
									>
									{t("export.all")}
								{/if}
							</button>
							<span class="text-[10px] text-base-4 px-1"
								>{t("export.all_hint")}</span
							>
						</div>

						<!-- Divider -->
						<div class="flex items-center self-stretch">
							<div class="w-px h-full bg-elevated mx-2"></div>
							<span
								class="text-xs text-base-4 font-bold uppercase tracking-widest mx-2"
								>{t("export.individual")}</span
							>
							<div class="w-px h-full bg-elevated mx-2"></div>
						</div>

						<!-- Option 2: Individual per-table buttons -->
						<div class="flex flex-wrap gap-2">
							{#each availableTables as spec}
								{@const isLL1 = spec.kind === "ll1"}
								<button
									onclick={() =>
										exportTablesPDF(
											[spec],
											`${spec.label
												.split("—")[0]
												.trim()
												.replace(/[^a-z0-9]/gi, "-")
												.toLowerCase()}.pdf`,
										)}
									class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all active:scale-95 {isLL1
										? 'dark:text-amber-400 text-amber-600 border-amber-400/30 hover:bg-amber-400/10'
										: 'dark:text-cyan-400 text-cyan-600 border-cyan-400/30 hover:bg-cyan-400/10'}"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path
											d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
										></path><polyline
											points="7 10 12 15 17 10"
										></polyline><line
											x1="12"
											y1="15"
											x2="12"
											y2="3"
										></line></svg
									>
									{spec.label.split("—")[0].trim()}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</section>
		{/if}

		<!-- ═══════════════════ Shared Parse Tree & AST ═══════════════════ -->
		{#if sharedParseTreeDot}
			<section class="animate-fade-in pt-8">
				<div class="space-y-4">
					<div class="flex items-center gap-3">
						<div
							class="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#10b981"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path
									d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
								></path><circle cx="9" cy="7" r="4"
								></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"
								></path><path d="M16 3.13a4 4 0 0 1 0 7.75"
								></path></svg
							>
						</div>
						<h3
							class="text-sm font-bold uppercase tracking-widest text-base-2"
						>
							{t("tree.title")}
						</h3>
						<div class="h-px grow bg-elevated"></div>
						<span
							class="text-[10px] text-base-4 font-mono uppercase tracking-widest"
							>{t("tree.note")}</span
						>
					</div>
					<div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
						<GraphvizViewer
							dot={sharedParseTreeDot}
							title={t("tree.parse")}
						/>
						{#if sharedAstDot}
							<GraphvizViewer
								dot={sharedAstDot}
								title={t("tree.ast")}
							/>
						{/if}
					</div>
				</div>
			</section>
		{/if}

		<!-- ═══════════════════ Recursive Descent ═══════════════════ -->
		{#if grammarReadyNoLeftRec}
			<section
				class="animate-fade-in space-y-8 pt-12 border-t border-base"
			>
				<div class="max-w-3xl space-y-4">
					<h2 class="text-3xl font-black text-base-1">
						{t("rd.title")}
						<span class="dark:text-teal-400 text-teal-600"
							>{t("rd.label")}</span
						>
					</h2>
					<p class="text-base-3">{t("rd.desc")}</p>
				</div>

				<div
					class="glass-card flex flex-col md:flex-row gap-4 items-center"
				>
					<div class="relative w-full">
						<input
							type="text"
							bind:value={rdTestInput}
							placeholder={t("parser.input_ph")}
							class="w-full bg-input-var border border-base rounded-xl px-6 py-4 text-base-1 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all font-mono"
						/>
						<span
							class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-base-4 uppercase tracking-widest"
							>{t("parser.input_label")}</span
						>
					</div>
					<button
						class="min-w-[200px] h-[58px] flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white font-bold rounded-lg transition-all duration-200 hover:bg-teal-400 active:scale-95 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
						onclick={simulateRD}
						disabled={isParsingRd}
					>
						{#if isParsingRd}
							<div
								class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
							></div>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								><polyline points="23 4 23 10 17 10"
								></polyline><polyline points="1 20 1 14 7 14"
								></polyline><path
									d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
								></path></svg
							>
						{/if}
						{t("rd.run")}
					</button>
				</div>

				{#if rdResult}
					{#if rdResult.status === "success"}
						<div class="space-y-6">
							<div class="flex items-center gap-3">
								<h3
									class="text-xs font-black uppercase tracking-widest text-base-3"
								>
									{t("rd.execution")}
								</h3>
								<div class="h-px grow bg-elevated"></div>
							</div>
							<StepPlayer snapshots={rdResult.snapshots || []} />
						</div>
					{:else}
						<div
							class="glass-card border-red-500/20 bg-red-500/5 p-8 text-center space-y-3"
						>
							<div
								class="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-red-500"
									><circle cx="12" cy="12" r="10"
									></circle><line
										x1="12"
										y1="8"
										x2="12"
										y2="12"
									></line><line
										x1="12"
										y1="16"
										x2="12.01"
										y2="16"
									></line></svg
								>
							</div>
							<h3
								class="text-lg font-bold text-red-500 uppercase tracking-widest"
							>
								{t("rd.failed")}
							</h3>
							<p
								class="text-base-3 font-mono text-sm max-w-xl mx-auto"
							>
								{rdResult.message}
							</p>
						</div>
					{/if}
				{/if}
			</section>
		{/if}

		<!-- ═══════════════════ LL(1) Simulation ═══════════════════ -->
		{#if grammarReadyNoLeftRec}
			<section
				class="animate-fade-in space-y-8 pt-12 border-t border-base"
			>
				<div class="max-w-3xl space-y-4">
					<h2 class="text-3xl font-black text-base-1">
						{t("ll1.title")}
						<span class="dark:text-amber-400 text-amber-600"
							>{t("ll1.label")}</span
						>
					</h2>
					<p class="text-base-3">{t("ll1.desc")}</p>
				</div>

				<div
					class="glass-card flex flex-col md:flex-row gap-4 items-center"
				>
					<div class="relative w-full">
						<input
							type="text"
							bind:value={testInput}
							placeholder={t("parser.input_ph")}
							class="w-full bg-input-var border border-base rounded-xl px-6 py-4 text-base-1 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all font-mono"
						/>
						<span
							class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-base-4 uppercase tracking-widest"
							>{t("parser.input_label")}</span
						>
					</div>
					<button
						class="btn-primary min-w-[200px] h-[58px] flex items-center justify-center gap-2"
						onclick={simulateLL1}
						disabled={isParsing}
					>
						{#if isParsing}
							<div
								class="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"
							></div>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								><polyline points="23 4 23 10 17 10"
								></polyline><polyline points="1 20 1 14 7 14"
								></polyline><path
									d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
								></path></svg
							>
						{/if}
						{t("ll1.run")}
					</button>
				</div>

				{#if parseResult}
					{#if parseResult.status === "success"}
						<div class="grid grid-cols-1 gap-12">
							<TableViewer
								table={parseResult.parsing_table || {}}
							/>
							<div class="space-y-6">
								<div class="flex items-center gap-3">
									<h3
										class="text-xs font-black uppercase tracking-widest text-base-3"
									>
										{t("ll1.execution")}
									</h3>
									<div class="h-px grow bg-elevated"></div>
								</div>
								<StepPlayer
									snapshots={parseResult.snapshots || []}
								/>
							</div>
						</div>
					{:else}
						<div
							class="glass-card border-red-500/20 bg-red-500/5 p-8 text-center space-y-3"
						>
							<div
								class="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-red-500"
									><circle cx="12" cy="12" r="10"
									></circle><line
										x1="12"
										y1="8"
										x2="12"
										y2="12"
									></line><line
										x1="12"
										y1="16"
										x2="12.01"
										y2="16"
									></line></svg
								>
							</div>
							<h3
								class="text-lg font-bold text-red-500 uppercase tracking-widest"
							>
								{t("ll1.failed")}
							</h3>
							<p
								class="text-base-3 font-mono text-sm max-w-xl mx-auto"
							>
								{parseResult.message}
							</p>
						</div>
					{/if}
				{/if}
			</section>
		{/if}

		<!-- ═══════════════════ LR(0) Simulation ═══════════════════ -->
		{#if grammarReady}
			<section
				class="animate-fade-in space-y-8 pt-12 border-t border-base"
			>
				<div class="max-w-3xl space-y-4">
					<h2 class="text-3xl font-black text-base-1">
						{t("lr0.title")}
						<span class="dark:text-cyan-400 text-cyan-600"
							>{t("lr0.label")}</span
						>
					</h2>
					<p class="text-base-3">{t("lr0.desc")}</p>
				</div>

				<div
					class="glass-card flex flex-col md:flex-row gap-4 items-center"
				>
					<div class="relative w-full">
						<input
							type="text"
							bind:value={lr0TestInput}
							placeholder={t("parser.input_ph")}
							class="w-full bg-input-var border border-base rounded-xl px-6 py-4 text-base-1 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all font-mono"
						/>
						<span
							class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-base-4 uppercase tracking-widest"
							>{t("parser.input_label")}</span
						>
					</div>
					<button
						class="min-w-[200px] h-[58px] flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white font-bold rounded-lg transition-all duration-200 hover:bg-cyan-400 active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
						onclick={simulateLR0}
						disabled={isParsingLR0}
					>
						{#if isParsingLR0}
							<div
								class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
							></div>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								><polyline points="23 4 23 10 17 10"
								></polyline><polyline points="1 20 1 14 7 14"
								></polyline><path
									d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
								></path></svg
							>
						{/if}
						{t("lr0.run")}
					</button>
				</div>

				{#if lr0Result}
					{#if lr0Result.status === "success"}
						<div class="grid grid-cols-1 gap-12">
							<LR0TableViewer
								action_table={lr0Result.action_table || {}}
								goto_table={lr0Result.goto_table || {}}
								terminals={lr0Result.terminals || []}
								non_terminals={lr0Result.non_terminals || []}
								stateCount={lr0Result.automaton?.states
									.length || 0}
								parserName="LR(0)"
							/>
							<div class="space-y-6">
								<div class="flex items-center gap-3">
									<h3
										class="text-xs font-black uppercase tracking-widest text-base-3"
									>
										{t("lr0.execution")}
									</h3>
									<div class="h-px grow bg-elevated"></div>
								</div>
								<LR0StepPlayer
									snapshots={lr0Result.snapshots || []}
									automaton={lr0Result.automaton}
								/>
							</div>
						</div>
					{:else}
						<div
							class="glass-card border-red-500/20 bg-red-500/5 p-8 text-center space-y-3"
						>
							<div
								class="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-red-500"
									><circle cx="12" cy="12" r="10"
									></circle><line
										x1="12"
										y1="8"
										x2="12"
										y2="12"
									></line><line
										x1="12"
										y1="16"
										x2="12.01"
										y2="16"
									></line></svg
								>
							</div>
							<h3
								class="text-lg font-bold text-red-500 uppercase tracking-widest"
							>
								{t("lr0.failed")}
							</h3>
							<p
								class="text-base-3 font-mono text-sm max-w-xl mx-auto"
							>
								{lr0Result.message}
							</p>
						</div>
					{/if}
				{/if}
			</section>
		{/if}

		<!-- ═══════════════════ SLR(1) Simulation ═══════════════════ -->
		{#if grammarReady}
			<section
				class="animate-fade-in space-y-8 pt-12 border-t border-base"
			>
				<div class="max-w-3xl space-y-4">
					<h2 class="text-3xl font-black text-base-1">
						{t("slr1.title")}
						<span class="dark:text-emerald-400 text-emerald-600"
							>{t("slr1.label")}</span
						>
					</h2>
					<p class="text-base-3">{t("slr1.desc")}</p>
				</div>

				<div
					class="glass-card flex flex-col md:flex-row gap-4 items-center"
				>
					<div class="relative w-full">
						<input
							type="text"
							bind:value={slr1TestInput}
							placeholder={t("parser.input_ph")}
							class="w-full bg-input-var border border-base rounded-xl px-6 py-4 text-base-1 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all font-mono"
						/>
						<span
							class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-base-4 uppercase tracking-widest"
							>{t("parser.input_label")}</span
						>
					</div>
					<button
						class="min-w-[200px] h-[58px] flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg transition-all duration-200 hover:bg-emerald-400 active:scale-95 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
						onclick={simulateSLR1}
						disabled={isParsingSlr1}
					>
						{#if isParsingSlr1}
							<div
								class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
							></div>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								><polyline points="23 4 23 10 17 10"
								></polyline><polyline points="1 20 1 14 7 14"
								></polyline><path
									d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
								></path></svg
							>
						{/if}
						{t("slr1.run")}
					</button>
				</div>

				{#if slr1Result}
					{#if slr1Result.status === "success"}
						<div class="grid grid-cols-1 gap-12">
							<LR0TableViewer
								action_table={slr1Result.action_table || {}}
								goto_table={slr1Result.goto_table || {}}
								terminals={slr1Result.terminals || []}
								non_terminals={slr1Result.non_terminals || []}
								stateCount={slr1Result.automaton?.states
									.length || 0}
								parserName="SLR(1)"
							/>
							<div class="space-y-6">
								<div class="flex items-center gap-3">
									<h3
										class="text-xs font-black uppercase tracking-widest text-base-3"
									>
										{t("slr1.execution")}
									</h3>
									<div class="h-px grow bg-elevated"></div>
								</div>
								<LR0StepPlayer
									snapshots={slr1Result.snapshots || []}
									automaton={slr1Result.automaton}
								/>
							</div>
						</div>
					{:else}
						<div
							class="glass-card border-red-500/20 bg-red-500/5 p-8 text-center space-y-3"
						>
							<div
								class="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-red-500"
									><circle cx="12" cy="12" r="10"
									></circle><line
										x1="12"
										y1="8"
										x2="12"
										y2="12"
									></line><line
										x1="12"
										y1="16"
										x2="12.01"
										y2="16"
									></line></svg
								>
							</div>
							<h3
								class="text-lg font-bold text-red-500 uppercase tracking-widest"
							>
								{t("slr1.failed")}
							</h3>
							<p
								class="text-base-3 font-mono text-sm max-w-xl mx-auto"
							>
								{slr1Result.message}
							</p>
						</div>
					{/if}
				{/if}
			</section>
		{/if}

		<!-- ═══════════════════ LR(1) Simulation ═══════════════════ -->
		{#if grammarReady}
			<section
				class="animate-fade-in space-y-8 pt-12 border-t border-base"
			>
				<div class="max-w-3xl space-y-4">
					<h2 class="text-3xl font-black text-base-1">
						{t("lr1.title")}
						<span class="dark:text-violet-400 text-violet-600"
							>{t("lr1.label")}</span
						>
					</h2>
					<p class="text-base-3">{t("lr1.desc")}</p>
				</div>

				<div
					class="glass-card flex flex-col md:flex-row gap-4 items-center"
				>
					<div class="relative w-full">
						<input
							type="text"
							bind:value={lr1TestInput}
							placeholder={t("parser.input_ph")}
							class="w-full bg-input-var border border-base rounded-xl px-6 py-4 text-base-1 focus:outline-none focus:ring-2 focus:ring-violet-400/50 transition-all font-mono"
						/>
						<span
							class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-base-4 uppercase tracking-widest"
							>{t("parser.input_label")}</span
						>
					</div>
					<button
						class="min-w-[200px] h-[58px] flex items-center justify-center gap-2 px-4 py-2 bg-violet-500 text-white font-bold rounded-lg transition-all duration-200 hover:bg-violet-400 active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
						onclick={simulateLR1}
						disabled={isParsingLr1}
					>
						{#if isParsingLr1}
							<div
								class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
							></div>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								><polyline points="23 4 23 10 17 10"
								></polyline><polyline points="1 20 1 14 7 14"
								></polyline><path
									d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
								></path></svg
							>
						{/if}
						{t("lr1.run")}
					</button>
				</div>

				{#if lr1Result}
					{#if lr1Result.status === "success"}
						<div class="grid grid-cols-1 gap-12">
							<LR0TableViewer
								action_table={lr1Result.action_table || {}}
								goto_table={lr1Result.goto_table || {}}
								terminals={lr1Result.terminals || []}
								non_terminals={lr1Result.non_terminals || []}
								stateCount={lr1Result.automaton?.states
									.length || 0}
								parserName="LR(1)"
							/>
							<div class="space-y-6">
								<div class="flex items-center gap-3">
									<h3
										class="text-xs font-black uppercase tracking-widest text-base-3"
									>
										{t("lr1.execution")}
									</h3>
									<div class="h-px grow bg-elevated"></div>
								</div>
								<LR0StepPlayer
									snapshots={lr1Result.snapshots || []}
									automaton={lr1Result.automaton}
								/>
							</div>
						</div>
					{:else}
						<div
							class="glass-card border-red-500/20 bg-red-500/5 p-8 text-center space-y-3"
						>
							<div
								class="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-red-500"
									><circle cx="12" cy="12" r="10"
									></circle><line
										x1="12"
										y1="8"
										x2="12"
										y2="12"
									></line><line
										x1="12"
										y1="16"
										x2="12.01"
										y2="16"
									></line></svg
								>
							</div>
							<h3
								class="text-lg font-bold text-red-500 uppercase tracking-widest"
							>
								{t("lr1.failed")}
							</h3>
							<p
								class="text-base-3 font-mono text-sm max-w-xl mx-auto"
							>
								{lr1Result.message}
							</p>
						</div>
					{/if}
				{/if}
			</section>
		{/if}

		<!-- ═══════════════════ LALR(1) Simulation ═══════════════════ -->
		{#if grammarReady}
			<section
				class="animate-fade-in space-y-8 pt-12 border-t border-base"
			>
				<div class="max-w-3xl space-y-4">
					<h2 class="text-3xl font-black text-base-1">
						{t("lalr1.title")}
						<span class="dark:text-rose-400 text-rose-600"
							>{t("lalr1.label")}</span
						>
					</h2>
					<p class="text-base-3">{t("lalr1.desc")}</p>
				</div>

				<div
					class="glass-card flex flex-col md:flex-row gap-4 items-center"
				>
					<div class="relative w-full">
						<input
							type="text"
							bind:value={lalr1TestInput}
							placeholder={t("parser.input_ph")}
							class="w-full bg-input-var border border-base rounded-xl px-6 py-4 text-base-1 focus:outline-none focus:ring-2 focus:ring-rose-400/50 transition-all font-mono"
						/>
						<span
							class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-base-4 uppercase tracking-widest"
							>{t("parser.input_label")}</span
						>
					</div>
					<button
						class="min-w-[200px] h-[58px] flex items-center justify-center gap-2 px-4 py-2 bg-rose-500 text-white font-bold rounded-lg transition-all duration-200 hover:bg-rose-400 active:scale-95 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
						onclick={simulateLALR1}
						disabled={isParsingLalr1}
					>
						{#if isParsingLalr1}
							<div
								class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
							></div>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								><polyline points="23 4 23 10 17 10"
								></polyline><polyline points="1 20 1 14 7 14"
								></polyline><path
									d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
								></path></svg
							>
						{/if}
						{t("lalr1.run")}
					</button>
				</div>

				{#if lalr1Result}
					{#if lalr1Result.status === "success"}
						<div class="grid grid-cols-1 gap-12">
							<LR0TableViewer
								action_table={lalr1Result.action_table || {}}
								goto_table={lalr1Result.goto_table || {}}
								terminals={lalr1Result.terminals || []}
								non_terminals={lalr1Result.non_terminals || []}
								stateCount={lalr1Result.automaton?.states
									.length || 0}
								parserName="LALR(1)"
							/>
							<div class="space-y-6">
								<div class="flex items-center gap-3">
									<h3
										class="text-xs font-black uppercase tracking-widest text-base-3"
									>
										{t("lalr1.execution")}
									</h3>
									<div class="h-px grow bg-elevated"></div>
								</div>
								<LR0StepPlayer
									snapshots={lalr1Result.snapshots || []}
									automaton={lalr1Result.automaton}
								/>
							</div>
						</div>
					{:else}
						<div
							class="glass-card border-red-500/20 bg-red-500/5 p-8 text-center space-y-3"
						>
							<div
								class="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-red-500"
									><circle cx="12" cy="12" r="10"
									></circle><line
										x1="12"
										y1="8"
										x2="12"
										y2="12"
									></line><line
										x1="12"
										y1="16"
										x2="12.01"
										y2="16"
									></line></svg
								>
							</div>
							<h3
								class="text-lg font-bold text-red-500 uppercase tracking-widest"
							>
								{t("lalr1.failed")}
							</h3>
							<p
								class="text-base-3 font-mono text-sm max-w-xl mx-auto"
							>
								{lalr1Result.message}
							</p>
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
				? 'bg-[var(--bg-card-solid)] border-green-500/40 dark:text-green-400 text-green-700'
				: 'bg-[var(--bg-card-solid)] border-red-500/40 dark:text-red-400 text-red-700'}"
		>
			<div
				class="h-2 w-2 rounded-full {toast.type === 'success'
					? 'bg-green-500'
					: 'bg-red-500'} animate-pulse"
			></div>
			<span class="font-bold text-xs tracking-widest uppercase"
				>{toast.msg}</span
			>
		</div>
	{/if}

	<!-- Floating First & Follow Sets Panel -->
	{#if analyzeResult?.first_sets && analyzeResult?.follow_sets}
		<FirstFollowSets
			firstSets={analyzeResult.first_sets}
			followSets={analyzeResult.follow_sets}
		/>
	{/if}
</main>

<style>
	:global(body) {
		background-image: radial-gradient(
				at 0% 0%,
				rgba(251, 191, 36, 0.05) 0px,
				transparent 50%
			),
			radial-gradient(
				at 100% 100%,
				rgba(251, 191, 36, 0.02) 0px,
				transparent 50%
			);
	}
</style>
