import type { AnalyzeRequest, AnalyzeResponse, ParseRequest, ParseResponse, LR0ParseResponse, SLR1ParseResponse, LR1ParseResponse, LALR1ParseResponse, AiAssistRequest, AiAssistResponse } from '../types';

// Fallback to localhost if the environment variable is not defined
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

/**
 * ApiService
 * Handles all network communication with the Rust backend.
 */
export const ApiService = {
	/**
	 * Sends a raw grammar string to the backend for analysis.
	 */
	async analyze(rawGrammar: string): Promise<AnalyzeResponse> {
		const payload: AnalyzeRequest = { raw_grammar: rawGrammar };

		try {
			const response = await fetch(`${BASE_URL}/analyze-grammar`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			return await response.json();
		} catch (error) {
			return {
				status: 'error',
				message: error instanceof Error ? error.message : 'Unknown connection error'
			};
		}
	},

	/**
	 * Sends grammar and input string to simulate Recursive Descent parsing.
	 */
	async parseRD(grammar: string, input: string): Promise<ParseResponse> {
		const payload: ParseRequest = { raw_grammar: grammar, input_string: input };
		try {
			const response = await fetch(`${BASE_URL}/parse-rd`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			return await response.json();
		} catch (error) {
			return {
				status: 'error',
				message: error instanceof Error ? error.message : 'Unknown connection error'
			};
		}
	},

	/**
	 * Sends grammar and input string to simulate LL(1) parsing.
	 */
	async parseLL1(grammar: string, input: string): Promise<ParseResponse> {
		const payload: ParseRequest = { 
			raw_grammar: grammar, 
			input_string: input 
		};

		try {
			const response = await fetch(`${BASE_URL}/parse-ll1`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			return await response.json();
		} catch (error) {
			return {
				status: 'error',
				message: error instanceof Error ? error.message : 'Unknown connection error'
			};
		}
	},

	/**
	 * Sends grammar and input string to simulate LR(0) parsing.
	 */
	async parseLR0(grammar: string, input: string): Promise<LR0ParseResponse> {
		const payload: ParseRequest = {
			raw_grammar: grammar,
			input_string: input
		};

		try {
			const response = await fetch(`${BASE_URL}/parse-lr0`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			return await response.json();
		} catch (error) {
			return {
				status: 'error',
				message: error instanceof Error ? error.message : 'Unknown connection error'
			};
		}
	},

	/**
	 * Sends grammar and input string to simulate SLR(1) parsing.
	 */
	async parseSLR1(grammar: string, input: string): Promise<SLR1ParseResponse> {
		const payload: ParseRequest = { raw_grammar: grammar, input_string: input };
		try {
			const response = await fetch(`${BASE_URL}/parse-slr1`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			return await response.json();
		} catch (error) {
			return {
				status: 'error',
				message: error instanceof Error ? error.message : 'Unknown connection error'
			};
		}
	},

	/**
	 * Sends grammar and input string to simulate LR(1) parsing.
	 */
	async parseLR1(grammar: string, input: string): Promise<LR1ParseResponse> {
		const payload: ParseRequest = { raw_grammar: grammar, input_string: input };
		try {
			const response = await fetch(`${BASE_URL}/parse-lr1`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			return await response.json();
		} catch (error) {
			return {
				status: 'error',
				message: error instanceof Error ? error.message : 'Unknown connection error'
			};
		}
	},

	/**
	 * Sends grammar and input string to simulate LALR(1) parsing.
	 */
	async parseLALR1(grammar: string, input: string): Promise<LALR1ParseResponse> {
		const payload: ParseRequest = { raw_grammar: grammar, input_string: input };
		try {
			const response = await fetch(`${BASE_URL}/parse-lalr1`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			return await response.json();
		} catch (error) {
			return {
				status: 'error',
				message: error instanceof Error ? error.message : 'Unknown connection error'
			};
		}
	},

	/**
	 * Sends a grammar and AI request type to get AI-powered explanations and suggestions.
	 */
	async askAI(request: AiAssistRequest): Promise<AiAssistResponse> {
		try {
			const response = await fetch(`${BASE_URL}/ai-assist`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(request)
			});
			return await response.json();
		} catch (error) {
			return {
				status: 'error',
				message: error instanceof Error ? error.message : 'Unknown connection error'
			};
		}
	}
};

