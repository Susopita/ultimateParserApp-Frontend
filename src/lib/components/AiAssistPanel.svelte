<script lang="ts">
  import { ApiService } from '$lib/services/api';
  import type { AiAssistResponse, AiRequestType } from '$lib/types';

  let { grammar, errorContext }: {
    grammar: string;
    errorContext: { message: string; inputString: string; parserType: string } | null;
  } = $props();

  let isLoading = $state(false);
  let activeRequest = $state<AiRequestType | null>(null);
  let result = $state<AiAssistResponse | null>(null);
  let copied = $state(false);

  async function callAI(type: AiRequestType) {
    isLoading = true;
    activeRequest = type;
    result = null;

    result = await ApiService.askAI({
      grammar,
      request_type: type,
      ...(type === 'explain_error' && errorContext ? {
        error_message: errorContext.message,
        input_string: errorContext.inputString,
        parser_type: errorContext.parserType,
      } : {})
    });

    isLoading = false;
  }

  async function copyGrammar(text: string) {
    await navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  const borderColor = $derived(
    activeRequest === 'explain_error' ? 'border-rose-500/30' :
    activeRequest === 'fix_ambiguity' ? 'border-amber-500/30' :
    'border-violet-500/30'
  );

  const headerGlow = $derived(
    activeRequest === 'explain_error' ? 'rgba(244,63,94,0.15)' :
    activeRequest === 'fix_ambiguity' ? 'rgba(251,191,36,0.15)' :
    'rgba(139,92,246,0.15)'
  );
</script>

<div class="glass-card border-slate-700/50 space-y-5 overflow-hidden">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2.5">
      <div class="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-violet-400">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
          <path d="M20 3v4"/>
          <path d="M22 5h-4"/>
          <path d="M4 17v2"/>
          <path d="M5 18H3"/>
        </svg>
      </div>
      <span class="text-sm font-black uppercase tracking-widest text-slate-300">Asistente IA</span>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex flex-wrap gap-2">
    {#if errorContext !== null}
      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 border
          {isLoading && activeRequest === 'explain_error'
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 cursor-not-allowed'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 active:scale-95'}"
        onclick={() => callAI('explain_error')}
        disabled={isLoading}
      >
        {#if isLoading && activeRequest === 'explain_error'}
          <div class="h-3 w-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        {/if}
        Explicar Error
      </button>
    {/if}

    <button
      class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 border
        {isLoading && activeRequest === 'fix_ambiguity'
          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 cursor-not-allowed'
          : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 active:scale-95'}"
      onclick={() => callAI('fix_ambiguity')}
      disabled={isLoading}
    >
      {#if isLoading && activeRequest === 'fix_ambiguity'}
        <div class="h-3 w-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      {/if}
      Corregir Gramática
    </button>

    <button
      class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 border
        {isLoading && activeRequest === 'suggest_ll1_transform'
          ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 cursor-not-allowed'
          : 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/40 active:scale-95'}"
      onclick={() => callAI('suggest_ll1_transform')}
      disabled={isLoading}
    >
      {#if isLoading && activeRequest === 'suggest_ll1_transform'}
        <div class="h-3 w-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      {/if}
      Convertir a LL(1)
    </button>
  </div>

  <!-- Loading State -->
  {#if isLoading}
    <div class="flex items-center gap-3 py-4 px-4 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse">
      <div class="h-5 w-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
      <span class="text-sm text-slate-400">Consultando...</span>
    </div>
  {/if}

  <!-- Result Panel -->
  {#if result && !isLoading}
    <div class="rounded-xl border bg-slate-900/60 overflow-hidden animate-fade-in {borderColor}">
      {#if result.status === 'error'}
        <!-- Error State -->
        <div class="p-4 flex items-start gap-3">
          <div class="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-red-400">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Error del Asistente</p>
            <p class="text-sm text-slate-400">{result.message || 'Error desconocido al contactar al asistente.'}</p>
          </div>
        </div>

      {:else}
        <!-- Success: Explanation -->
        {#if result.explanation}
          <div class="p-4 space-y-2">
            <div class="flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                class="{activeRequest === 'explain_error' ? 'text-rose-400' : activeRequest === 'fix_ambiguity' ? 'text-amber-400' : 'text-violet-400'}">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
              </svg>
              <span class="text-[10px] font-black uppercase tracking-widest
                {activeRequest === 'explain_error' ? 'text-rose-400' : activeRequest === 'fix_ambiguity' ? 'text-amber-400' : 'text-violet-400'}">
                Explicación
              </span>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed" style="white-space: pre-wrap">{result.explanation}</p>
          </div>
        {/if}

        <!-- Suggestions -->
        {#if result.suggestions && result.suggestions.length > 0}
          <div class="px-4 pb-4 space-y-2 {result.explanation ? 'border-t border-slate-800 pt-4' : 'pt-4'}">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sugerencias</p>
            <ul class="space-y-2">
              {#each result.suggestions as suggestion}
                <li class="flex items-start gap-2 text-sm text-slate-300">
                  <span class="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                  <span style="white-space: pre-wrap">{suggestion}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Transformed Grammar -->
        {#if result.transformed_grammar}
          <div class="border-t border-slate-800">
            <div class="flex items-center justify-between px-4 py-3 bg-slate-900/80">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-violet-400">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <span class="text-[10px] font-black uppercase tracking-widest text-violet-400">Gramática Transformada</span>
              </div>
              <button
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200
                  {copied
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 active:scale-95'}"
                onclick={() => copyGrammar(result!.transformed_grammar!)}
              >
                {#if copied}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Copiado
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copiar
                {/if}
              </button>
            </div>
            <pre class="px-4 py-4 text-sm text-slate-200 font-mono overflow-x-auto bg-[#0a0f1e]/80 leading-relaxed">{result.transformed_grammar}</pre>
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>
