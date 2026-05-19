import { browser } from '$app/environment';

export interface GrammarHistoryItem {
    id: string;
    grammar: string;
    timestamp: number;
}

class StorageState {
    grammars = $state<GrammarHistoryItem[]>([]);
    lastInputLl1 = $state("");
    lastInputLr0 = $state("");
    lastInputSlr1 = $state("");
    lastInputLr1 = $state("");
    lastInputLalr1 = $state("");

    constructor() {
        if (browser) {
            const stored = localStorage.getItem('ultimate_parser_history');
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    this.grammars = data.grammars || [];
                    this.lastInputLl1 = data.lastInputLl1 || "";
                    this.lastInputLr0 = data.lastInputLr0 || "";
                    this.lastInputSlr1 = data.lastInputSlr1 || "";
                    this.lastInputLr1 = data.lastInputLr1 || "";
                    this.lastInputLalr1 = data.lastInputLalr1 || "";
                } catch (e) {
                    console.error("Failed to parse history", e);
                }
            }
        }
    }

    save() {
        if (browser) {
            localStorage.setItem('ultimate_parser_history', JSON.stringify({
                grammars: this.grammars,
                lastInputLl1: this.lastInputLl1,
                lastInputLr0: this.lastInputLr0,
                lastInputSlr1: this.lastInputSlr1,
                lastInputLr1: this.lastInputLr1,
                lastInputLalr1: this.lastInputLalr1,
            }));
        }
    }

    addGrammar(grammar: string) {
        if (!grammar.trim()) return;
        // Avoid consecutive exact duplicates
        if (this.grammars.length > 0 && this.grammars[0].grammar === grammar) {
            return;
        }
        // Remove older instances of the exact same grammar
        this.grammars = this.grammars.filter(g => g.grammar !== grammar);
        
        this.grammars.unshift({
            id: browser ? crypto.randomUUID() : Math.random().toString(),
            grammar,
            timestamp: Date.now()
        });
        
        // Keep only last 10
        if (this.grammars.length > 10) {
            this.grammars.pop();
        }
        this.save();
    }
}

export const appStorage = new StorageState();
