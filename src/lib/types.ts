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

// ─── LR(0) Types ────────────────────────────────────────────────────

export interface LR0ParseSnapshot {
  step: number;
  state_stack: number[];
  symbol_stack: string[];
  input_remaining: string[];
  action: string;
}

export interface LR0AutomatonState {
  id: number;
  items: string[];
  is_accept: boolean;
}

export interface LR0Transition {
  from: number;
  to: number;
  symbol: string;
}

export interface LR0Automaton {
  states: LR0AutomatonState[];
  transitions: LR0Transition[];
}

export interface LR0ParseResponse {
  status: 'success' | 'error';
  message?: string;
  automaton?: LR0Automaton;
  action_table?: Record<string, Record<string, string>>;
  goto_table?: Record<string, Record<string, string>>;
  terminals?: string[];
  non_terminals?: string[];
  snapshots?: LR0ParseSnapshot[];
}

// ─── SLR(1) Types ────────────────────────────────────────────────────
// SLR(1) response has identical structure to LR(0)
export type SLR1ParseResponse = LR0ParseResponse;

// ─── LR(1) Types ─────────────────────────────────────────────────────
// LR(1) response has identical structure to LR(0)
export type LR1ParseResponse = LR0ParseResponse;

// ─── LALR(1) Types ───────────────────────────────────────────────────
// LALR(1) response has identical structure to LR(0)
export type LALR1ParseResponse = LR0ParseResponse;

// ─── AI Assist Types ─────────────────────────────────────────────────

export type AiRequestType = 'explain_error' | 'fix_ambiguity' | 'suggest_ll1_transform';

export interface AiAssistRequest {
  grammar: string;
  request_type: AiRequestType;
  error_message?: string;
  input_string?: string;
  parser_type?: string;
}

export interface AiAssistResponse {
  status: 'success' | 'error';
  explanation?: string;
  suggestions?: string[];
  transformed_grammar?: string;
  message?: string;
}

