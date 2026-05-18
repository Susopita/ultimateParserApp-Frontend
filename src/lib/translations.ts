export type Lang = "en" | "es";

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // App shell
    "app.subtitle":
      "Analyze context-free grammars and visualize parsing step-by-step.",
    "app.status.busy": "Processing…",

    // Grammar editor
    "grammar.title": "Grammar Editor",
    "grammar.hint":
      "Start by writing your context-free grammar. Use → for productions, | for alternatives.",
    "grammar.analyze": "Analyze Grammar",
    "grammar.analyzing": "Analyzing…",
    "grammar.reset": "Reset",
    "grammar.productions": "productions found",
    "grammar.productions_title": "Parsed Productions",
    "grammar.start": "Start Symbol",
    "grammar.rules_title": "Grammar Rules",

    // Analysis card
    "analysis.ok": "Grammar Analysis Complete",
    "analysis.left_rec": "Left Recursion Detected",
    "analysis.left_rec_label": "Left Recursion",
    "analysis.detected": "DETECTED",
    "analysis.clean": "CLEAN",
    "analysis.rd_ok": "Compatible with Recursive Descent",
    "analysis.rd_no": "Left recursion — incompatible with Recursive Descent",
    "analysis.ll1_hint": "May be compatible with LL(1)",
    "analysis.ll1_no": "Left recursion — incompatible with LL(1)",
    "analysis.hint_nt_label": "Non-Terminals",
    "analysis.hint_t_label": "Terminals",
    "analysis.hint_nt": "Uppercase letters. Use ϵ for empty productions.",
    "analysis.hint_t": "Lowercase letters or symbols: +, -, *, /, ^",
    "analysis.hint_eps": "Use ϵ for empty rules.",

    // Shared parser controls
    "parser.input_ph": "Enter tokens separated by space (e.g., a b c)",
    "parser.input_label": "Input Stream",
    "parser.run": "Run Simulation",
    "parser.execution": "Parser Execution",
    "parser.failed": "Parsing Failed",

    // Recursive Descent
    "rd.title": "Recursive Descent",
    "rd.label": "Simulation",
    "rd.desc":
      "A top-down parser that tries productions recursively, backtracking on failure.",
    "rd.run": "Run RD",
    "rd.execution": "Recursive Descent Execution",
    "rd.failed": "Recursive Descent Failed",

    // LL(1)
    "ll1.title": "LL(1) Parsing",
    "ll1.label": "Simulation",
    "ll1.desc":
      "A top-down predictive parser that uses one lookahead token and a parsing table.",
    "ll1.run": "Run LL(1)",
    "ll1.execution": "LL(1) Parser Execution",
    "ll1.failed": "LL(1) Parsing Failed",

    // LR(0)
    "lr0.title": "LR(0) Parsing",
    "lr0.label": "Simulation",
    "lr0.desc":
      "A bottom-up shift-reduce parser using LR(0) items and an automaton.",
    "lr0.run": "Run LR(0)",
    "lr0.execution": "LR(0) Parser Execution",
    "lr0.failed": "LR(0) Parsing Failed",

    // SLR(1)
    "slr1.title": "SLR(1) Parsing",
    "slr1.label": "Simulation",
    "slr1.desc":
      "SLR(1) extends LR(0) by using FOLLOW sets to restrict reduce actions.",
    "slr1.run": "Run SLR(1)",
    "slr1.execution": "SLR(1) Parser Execution",
    "slr1.failed": "SLR(1) Parsing Failed",

    // LR(1)
    "lr1.title": "LR(1) Parsing",
    "lr1.label": "Simulation",
    "lr1.desc":
      "Full LR(1) uses lookahead sets inside items, handling a wider class of grammars.",
    "lr1.run": "Run LR(1)",
    "lr1.execution": "LR(1) Parser Execution",
    "lr1.failed": "LR(1) Parsing Failed",

    // LALR(1)
    "lalr1.title": "LALR(1) Parsing",
    "lalr1.label": "Simulation",
    "lalr1.desc":
      "LALR(1) merges LR(1) states with identical cores, reducing count while keeping precision.",
    "lalr1.run": "Run LALR(1)",
    "lalr1.execution": "LALR(1) Parser Execution",
    "lalr1.failed": "LALR(1) Parsing Failed",

    // Export
    "export.title": "Export Tables as PDF",
    "export.n_tables": "{n} table available",
    "export.n_tables_p": "{n} tables available",
    "export.all": "Download All Tables",
    "export.all_hint": "All parsers in a single PDF",
    "export.generating": "Generating…",
    "export.individual": "or individually",

    // Derivation tree
    "tree.title": "Derivation Tree & AST",
    "tree.note": "Same result for all parsers on this input",
    "tree.parse": "Parse Tree — Derivation Tree",
    "tree.ast": "AST — Abstract Syntax Tree",

    // TableViewer
    "tbl.title": "Parsing Table M",
    "tbl.non_term": "Non-Term",
    "tbl.add": "Add",

    // LR0TableViewer
    "tbl.action_goto": "ACTION / GOTO Table",
    "tbl.action": "ACTION",
    "tbl.goto": "GOTO",
    "tbl.state": "State",
    "tbl.legend_shift": "sN = Shift to state N",
    "tbl.legend_reduce": "rN = Reduce by production N",
    "tbl.legend_accept": "acc = Accept",

    // Toast
    "toast.analyze_ok": "Analysis Complete: {n} rules found.",
    "toast.grammar_err": "Syntax Error in Grammar",
    "toast.rd_ok": "Recursive Descent simulation ready!",
    ll1_ok: "LL(1) Simulation ready!",
    "toast.lr0_ok": "LR(0) Simulation ready!",
    "toast.slr1_ok": "SLR(1) Simulation ready!",
    "toast.lr1_ok": "LR(1) Simulation ready!",
    "toast.lalr1_ok": "LALR(1) Simulation ready!",
    "toast.missing": "Please provide both grammar and input string.",
    "toast.parse_err": "Parsing error.",

    // Step player
    "player.step": "Step {current} of {total}",
    "player.stack": "Stack",
    "player.parser_stack": "Parser Stack",
    "player.input_rem": "Input Remaining",
    "player.consumed": "Input consumed.",
    "player.stack_detail": "Stack Detail",
    "player.action": "CURRENT ACTION",

    // Automaton viewer
    "automaton.title": "Canonical Collection — {parser}",
    "automaton.transitions": "Transitions (GOTO function)",
    "automaton.items": "{n} items",
    "automaton.accept": "Accept",

    // AI assistant panel
    "ai.title": "AI Assistant",
    "ai.explain_error": "Explain Error",
    "ai.fix": "Fix Grammar",
    "ai.to_ll1": "Convert to LL(1)",
    "ai.loading": "Consulting…",
    "ai.error_title": "Assistant Error",
    "ai.error_unknown": "Unknown error contacting the assistant.",
    "ai.explanation": "Explanation",
    "ai.suggestions": "Suggestions",
    "ai.transformed": "Transformed Grammar",
    "ai.copy": "Copy",
    "ai.copied": "Copied",

    // Virtual keyboard
    "kb.title": "QUICK SYMBOLS",

    // Grammar viewer
    "grammar.no_prod": "No productions to display yet.",

    // Header toggles
    "ui.dark": "Dark",
    "ui.light": "Light",
    "ui.lang_switch": "ES",
  },

  es: {
    // App shell
    "app.subtitle":
      "Analiza gramáticas libres de contexto y visualiza el análisis paso a paso.",
    "app.status.busy": "Procesando…",

    // Grammar editor
    "grammar.title": "Editor de Gramática",
    "grammar.hint":
      "Escribe tu gramática libre de contexto. Usa → para producciones, | para alternativas.",
    "grammar.analyze": "Analizar Gramática",
    "grammar.analyzing": "Analizando…",
    "grammar.reset": "Restablecer",
    "grammar.productions": "producciones encontradas",
    "grammar.productions_title": "Producciones Analizadas",
    "grammar.start": "Símbolo Inicial",
    "grammar.rules_title": "Reglas de Gramática",

    // Virtual keyboard
    "kb.title": "SÍMBOLOS RÁPIDOS",

    // Analysis card
    "analysis.ok": "Análisis de Gramática Completo",
    "analysis.left_rec": "Recursión Izquierda Detectada",
    "analysis.left_rec_label": "Recursión Izquierda",
    "analysis.detected": "DETECTADA",
    "analysis.clean": "LIMPIA",
    "analysis.rd_ok": "Compatible con Descenso Recursivo",
    "analysis.rd_no":
      "Recursión izquierda — incompatible con Descenso Recursivo",
    "analysis.ll1_hint": "Puede ser compatible con LL(1)",
    "analysis.ll1_no": "Recursión izquierda — incompatible con LL(1)",
    "analysis.hint_nt_label": "No-Terminales",
    "analysis.hint_t_label": "Terminales",
    "analysis.hint_nt": "Letras mayúsculas. Usa ϵ para producciones vacías.",
    "analysis.hint_t": "Letras minúsculas o símbolos: +, -, *, /, ^",
    "analysis.hint_eps": "Usa ϵ para reglas vacías.",

    // Shared parser controls
    "parser.input_ph": "Ingresa tokens separados por espacio (ej: a b c)",
    "parser.input_label": "Cadena de Entrada",
    "parser.run": "Ejecutar Simulación",
    "parser.execution": "Ejecución del Parser",
    "parser.failed": "Análisis Fallido",

    // Recursive Descent
    "rd.title": "Descenso Recursivo",
    "rd.label": "Simulación",
    "rd.desc":
      "Parser descendente que prueba producciones recursivamente, retrocediendo ante fallos.",
    "rd.run": "Ejecutar DR",
    "rd.execution": "Ejecución Descenso Recursivo",
    "rd.failed": "Descenso Recursivo Falló",

    // LL(1)
    "ll1.title": "Parsing LL(1)",
    "ll1.label": "Simulación",
    "ll1.desc":
      "Parser predictivo descendente que usa un token de adelanto y una tabla de parsing.",
    "ll1.run": "Ejecutar LL(1)",
    "ll1.execution": "Ejecución Parser LL(1)",
    "ll1.failed": "Parsing LL(1) Falló",

    // LR(0)
    "lr0.title": "Parsing LR(0)",
    "lr0.label": "Simulación",
    "lr0.desc":
      "Parser ascendente de desplazamiento-reducción usando ítems LR(0) y un autómata.",
    "lr0.run": "Ejecutar LR(0)",
    "lr0.execution": "Ejecución Parser LR(0)",
    "lr0.failed": "Parsing LR(0) Falló",

    // SLR(1)
    "slr1.title": "Parsing SLR(1)",
    "slr1.label": "Simulación",
    "slr1.desc":
      "SLR(1) extiende LR(0) usando conjuntos FOLLOW para restringir reducciones.",
    "slr1.run": "Ejecutar SLR(1)",
    "slr1.execution": "Ejecución Parser SLR(1)",
    "slr1.failed": "Parsing SLR(1) Falló",

    // LR(1)
    "lr1.title": "Parsing LR(1)",
    "lr1.label": "Simulación",
    "lr1.desc":
      "LR(1) completo incluye conjuntos de adelanto en los ítems, cubriendo más gramáticas.",
    "lr1.run": "Ejecutar LR(1)",
    "lr1.execution": "Ejecución Parser LR(1)",
    "lr1.failed": "Parsing LR(1) Falló",

    // LALR(1)
    "lalr1.title": "Parsing LALR(1)",
    "lalr1.label": "Simulación",
    "lalr1.desc":
      "LALR(1) fusiona estados LR(1) con núcleo idéntico, reduciendo estados con alta precisión.",
    "lalr1.run": "Ejecutar LALR(1)",
    "lalr1.execution": "Ejecución Parser LALR(1)",
    "lalr1.failed": "Parsing LALR(1) Falló",

    // Export
    "export.title": "Exportar Tablas como PDF",
    "export.n_tables": "{n} tabla disponible",
    "export.n_tables_p": "{n} tablas disponibles",
    "export.all": "Descargar Todas las Tablas",
    "export.all_hint": "Todos los parsers en un único PDF",
    "export.generating": "Generando…",
    "export.individual": "o individualmente",

    // Derivation tree
    "tree.title": "Árbol de Derivación y AST",
    "tree.note": "Mismo resultado para todos los parsers con esta entrada",
    "tree.parse": "Árbol de Derivación",
    "tree.ast": "AST — Árbol de Sintaxis Abstracta",

    // TableViewer
    "tbl.title": "Tabla de Parsing M",
    "tbl.non_term": "No-Term",
    "tbl.add": "Agr",

    // LR0TableViewer
    "tbl.action_goto": "Tabla ACTION / GOTO",
    "tbl.action": "ACCIÓN",
    "tbl.goto": "IR A",
    "tbl.state": "Estado",
    "tbl.legend_shift": "sN = Desplazar al estado N",
    "tbl.legend_reduce": "rN = Reducir por producción N",
    "tbl.legend_accept": "acc = Aceptar",

    // Toast
    "toast.analyze_ok": "Análisis Completo: {n} reglas encontradas.",
    "toast.grammar_err": "Error de Sintaxis en la Gramática",
    "toast.rd_ok": "¡Simulación de Descenso Recursivo lista!",
    ll1_ok: "¡Simulación LL(1) lista!",
    "toast.lr0_ok": "¡Simulación LR(0) lista!",
    "toast.slr1_ok": "¡Simulación SLR(1) lista!",
    "toast.lr1_ok": "¡Simulación LR(1) lista!",
    "toast.lalr1_ok": "¡Simulación LALR(1) lista!",
    "toast.missing": "Ingresa la gramática y la cadena de entrada.",
    "toast.parse_err": "Error en el análisis.",

    // Step player
    "player.step": "Paso {current} de {total}",
    "player.stack": "Pila",
    "player.parser_stack": "Pila del Parser",
    "player.input_rem": "Entrada Restante",
    "player.consumed": "Entrada consumida.",
    "player.stack_detail": "Detalle de la Pila",
    "player.action": "ACCIÓN ACTUAL",

    // Header toggles
    "ui.dark": "Oscuro",
    "ui.light": "Claro",
    "ui.lang_switch": "EN",
  },
};
