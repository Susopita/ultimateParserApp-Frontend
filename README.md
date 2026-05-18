# Ultimate Parser — Frontend

SPA para visualizar y simular algoritmos de parsing clásicos, desarrollada para el curso de Compiladores en UTEC.

## Stack

| Tecnología | Versión |
|---|---|
| SvelteKit | ^2.57 |
| Svelte 5 (Runes) | ^5.55 |
| TypeScript | ^6.0 |
| Tailwind CSS | ^3.4 |
| Vite | ^8.0 |
| @viz-js/viz | ^3.27 (Graphviz WASM) |
| jsPDF + jspdf-autotable | exportación PDF |

## Características

- **Grammar Editor** — editor con teclado virtual para insertar símbolos especiales (ϵ, →, etc.)
- **Análisis de gramática** — detecta recursión izquierda, muestra producciones y símbolo inicial
- **Simuladores paso a paso** para 6 algoritmos:
  - Recursive Descent
  - LL(1)
  - LR(0)
  - SLR(1)
  - LR(1)
  - LALR(1)
- **Visor de autómatas** — renderiza el autómata LR via Graphviz (WASM)
- **Árbol de parseo + AST** — visualización en grafo con Graphviz
- **Exportación PDF** — tablas ACTION/GOTO y tabla LL(1) individuales o combinadas
- **AI Assist** — panel de asistencia con IA para explicar gramáticas y errores
- **Tema claro/oscuro** — toggle persistente
- **i18n** — soporte ES/EN con toggle en la interfaz
- **PWA** — instalable como aplicación de escritorio/móvil

## Requisitos previos

- Node.js >= 18 (recomendado vía NVM)
- Backend Rust corriendo en `http://127.0.0.1:3000` (ver `../ultimateParserApp-Backend/`)

## Instalación

```sh
npm install
```

## Desarrollo

```sh
npm run dev
```

La app estará disponible en `http://localhost:5173`.

## Build de producción

```sh
npm run build
npm run preview   # previsualizar el build
```

## Type-checking

```sh
npm run check
npm run check:watch
```

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:3000` | URL base del backend Rust |

Crea un `.env.local` para sobreescribir localmente:

```env
VITE_API_URL=http://127.0.0.1:3000
```

## Estructura del proyecto

```
src/
├── routes/
│   ├── +layout.svelte       # Layout raíz (tema, estilos globales)
│   └── +page.svelte         # Página principal (toda la lógica de la UI)
├── lib/
│   ├── components/
│   │   ├── VirtualKeyboard.svelte    # Teclado de símbolos especiales
│   │   ├── GrammarViewer.svelte      # Vista de producciones
│   │   ├── TableViewer.svelte        # Tabla LL(1)
│   │   ├── StepPlayer.svelte         # Reproductor paso a paso (LL/RD)
│   │   ├── LR0TableViewer.svelte     # Tabla ACTION/GOTO
│   │   ├── LR0StepPlayer.svelte      # Reproductor paso a paso (LR)
│   │   ├── AutomatonViewer.svelte    # Visor de autómata LR
│   │   ├── GraphvizViewer.svelte     # Renderizador Graphviz (árbol/AST)
│   │   └── AiAssistPanel.svelte      # Panel de asistencia IA
│   ├── services/
│   │   └── api.ts            # Cliente HTTP hacia el backend
│   ├── stores/
│   │   ├── theme.svelte.ts   # Store de tema (dark/light)
│   │   └── i18n.svelte.ts    # Store de internacionalización
│   ├── utils/
│   │   └── pdf.ts            # Exportación de tablas a PDF
│   ├── translations.ts       # Strings ES/EN
│   └── types.ts              # Tipos compartidos con el backend
```

## Endpoints del backend

Todos son `POST` con body JSON.

| Ruta | Descripción |
|---|---|
| `POST /analyze-grammar` | Analiza gramática, detecta recursión izquierda |
| `POST /parse-rd` | Recursive Descent + snapshots |
| `POST /parse-ll1` | Tabla LL(1) + snapshots |
| `POST /parse-lr0` | Autómata LR(0) + ACTION/GOTO + snapshots |
| `POST /parse-slr1` | Autómata SLR(1) + ACTION/GOTO + snapshots |
| `POST /parse-lr1` | Autómata LR(1) + ACTION/GOTO + snapshots |
| `POST /parse-lalr1` | Autómata LALR(1) + ACTION/GOTO + snapshots |
| `POST /ai-assist` | Explicaciones y sugerencias vía IA |

## Convenciones de gramática

- No-terminales: primera letra **mayúscula** (ej. `S`, `Expr`)
- Terminales: minúscula o símbolo (ej. `a`, `+`, `id`)
- Épsilon: `ϵ` (U+03F5), `ε` (U+03B5) o el string `epsilon`
- Separador de producciones: `→` o `->`
- Alternativas: `|`

Ejemplo válido:
```
S → A B
A → a | ϵ
B → b
```
Link deployado (Multiplataforma): [Ultimate Parser](https://equipodinamitaultimateparser.susopita.dev/)
