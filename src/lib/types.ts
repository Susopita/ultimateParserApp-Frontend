/**
 * types.ts
 * Mirror of Rust models for type-safe communication.
 */

export type Symbol =
  | { type: 'Terminal'; value: string }
  | { type: 'NonTerminal'; value: string }
  | { type: 'Epsilon' };

export interface Production {
  left: Symbol;
  right: Symbol[];
}

export interface Grammar {
  productions: Production[];
  start_symbol: Symbol;
}

export interface ParseSnapshot {
  step: number;
  stack: Symbol[];
  input_remaining: string[];
  action: string;
}

export interface AnalyzeRequest {
  raw_grammar: string;
}

export interface AnalyzeResponse {
  status: 'success' | 'error';
  message?: string;
  has_left_recursion?: boolean;
  start_symbol?: Symbol;
  production_count?: number;
  productions?: Production[];
}

export interface ParseRequest {
  raw_grammar: string;
  input_string: string;
}

export interface ParseResponse {
  status: 'success' | 'error';
  message?: string;
  snapshots?: ParseSnapshot[];
  parsing_table?: Record<string, Record<string, string>>;
}

export interface AutomatonJSON {
  nodes: { id: string; label: string; isFinal: boolean }[];
  links: { source: string; target: string; label: string }[];
}
