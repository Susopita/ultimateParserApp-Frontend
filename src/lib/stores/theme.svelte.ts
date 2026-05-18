export type Theme = 'dark' | 'light';

let _theme = $state<Theme>('dark');

function applyToDOM(t: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', t === 'dark');
}

export const theme = {
  get current(): Theme { return _theme; },

  set(t: Theme) {
    _theme = t;
    applyToDOM(t);
    if (typeof localStorage !== 'undefined') localStorage.setItem('up-theme', t);
  },

  toggle() {
    this.set(_theme === 'dark' ? 'light' : 'dark');
  },

  init() {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem('up-theme') as Theme | null;
    const preferred: Theme =
      stored === 'dark' || stored === 'light'
        ? stored
        : window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    _theme = preferred;
    applyToDOM(preferred);
  },
};
