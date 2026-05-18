import { translations, type Lang } from '$lib/translations';

let _lang = $state<Lang>('en');

export const i18n = {
  get lang(): Lang { return _lang; },

  t(key: string, vars?: Record<string, string | number>): string {
    let str = translations[_lang]?.[key] ?? translations['en']?.[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  },

  set(l: Lang) {
    _lang = l;
    if (typeof localStorage !== 'undefined') localStorage.setItem('up-lang', l);
  },

  toggle() {
    this.set(_lang === 'en' ? 'es' : 'en');
  },

  init() {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem('up-lang') as Lang | null;
    if (stored === 'en' || stored === 'es') _lang = stored;
  },
};
