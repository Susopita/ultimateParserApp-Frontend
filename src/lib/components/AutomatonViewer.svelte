<script lang="ts">
	/**
	 * AutomatonViewer.svelte
	 * Generates a DOT representation of the LR Automaton and renders it via Graphviz.
	 */
	import type { LR0Automaton } from "$lib/types";
	import GraphvizViewer from "$lib/components/GraphvizViewer.svelte";
	import { fade, scale } from "svelte/transition";

	let { automaton, activeStateId = null } = $props<{
		automaton: LR0Automaton;
		activeStateId?: number | null;
	}>();

	let popupStateId = $state<number | null>(null);
	const popupStateData = $derived(automaton?.states.find((s: any) => s.id === popupStateId));

	const dotString = $derived.by(() => {
		if (!automaton) return "";

		let dot = "digraph Automaton {\n";
		dot += "  rankdir=LR;\n";
		dot += '  bgcolor="transparent";\n';
		dot += '  node [shape=circle, style=filled, fontname="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontsize=10, margin=0.05];\n';
		dot += '  edge [fontname="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontsize=10];\n';

		for (const state of automaton.states) {
			const isAccept = state.is_accept;
			const isActive = activeStateId !== null && activeStateId === state.id;

			let fillColor = isActive ? "#f59e0b" : "#1e293b";
			let fontColor = isActive ? "#ffffff" : "#e2e8f0";
			let borderColor = isAccept ? "#10b981" : (isActive ? "#d97706" : "#475569");
			let penwidth = isAccept ? "3.0" : "1.0";
			let nodeClass = "state-node cursor-pointer";

			if (isActive && isAccept) {
				fillColor = "#10b981"; // Green if it's the final accept state!
				borderColor = "#059669";
				nodeClass += " blink-accept";
			}

			const maxItems = 2;
			let itemsStr = state.items
				.slice(0, maxItems)
				.map((item: string) => item.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"))
				.join("\\n");
			
			if (state.items.length > maxItems) {
				itemsStr += `\\n...`;
			}

			dot += `  s${state.id} [label="I${state.id}\\n${itemsStr}", fillcolor="${fillColor}", fontcolor="${fontColor}", color="${borderColor}", penwidth="${penwidth}", class="${nodeClass}", tooltip="Ver reglas"];\n`;
		}

		for (const t of automaton.transitions) {
			const escapedSymbol = t.symbol.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			dot += `  s${t.from} -> s${t.to} [label="${escapedSymbol}", color="#64748b", fontcolor="#94a3b8"];\n`;
		}

		dot += "}\n";
		return dot;
	});

	function handleGraphClick(e: MouseEvent) {
		const target = (e.target as Element).closest('.node');
		if (target) {
			const title = target.querySelector('title')?.textContent;
			if (title && title.startsWith('s')) {
				const id = parseInt(title.substring(1), 10);
				if (!isNaN(id)) popupStateId = id;
			}
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="animate-fade-in space-y-4 relative" onclick={handleGraphClick}>
	<GraphvizViewer dot={dotString} title="Automaton (AFN/AFD)" />

	<!-- Popup Modal for Rules -->
	{#if popupStateId !== null && popupStateData}
		<div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm" transition:fade={{ duration: 150 }}>
			<div class="absolute inset-0" onclick={() => popupStateId = null}></div>
			<div class="relative glass-card shadow-2xl border border-strong bg-elevated w-full max-w-md p-6 rounded-2xl" transition:scale={{ duration: 200, start: 0.95 }}>
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-black uppercase tracking-widest text-base-1 flex items-center gap-3">
						<span class="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono text-sm">
							I{popupStateData.id}
						</span>
						Estado {popupStateData.id}
					</h3>
					<button class="text-base-4 hover:text-base-1 transition-colors" onclick={() => popupStateId = null}>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
					</button>
				</div>
				<div class="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
					{#each popupStateData.items as rule}
						<div class="px-4 py-2 rounded-lg bg-base border border-strong font-mono text-sm text-base-2">
							{rule}
						</div>
					{/each}
				</div>
				{#if popupStateData.is_accept}
					<div class="mt-4 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
						Estado de Aceptación
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.state-node) {
		transition: all 0.3s ease;
	}
	:global(.state-node:hover ellipse) {
		stroke: #06b6d4 !important;
		stroke-width: 2px !important;
		cursor: pointer;
	}
	:global(.blink-accept ellipse) {
		animation: blink-green 1s infinite alternate;
	}
	@keyframes blink-green {
		from { fill: #10b981; filter: drop-shadow(0 0 4px #10b981); }
		to { fill: #34d399; filter: drop-shadow(0 0 12px #34d399); }
	}
</style>
