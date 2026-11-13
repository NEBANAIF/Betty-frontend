// Core of the Amharic translation layer.
//
// The app's source text stays English; when the language is Amharic the strings
// are looked up here (exact match, then "pattern" match for sentences that
// contain numbers / names, e.g. "Showing {1} of {2}"). Nothing here touches React,
// so it can also be used from plain modules (exports, alert(), confirm()).
import { EXACT, PATTERNS } from './dict/index.js';

export const LANG_KEY = 'erp.lang';
export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'am', label: 'አማርኛ', short: 'አማ' },
];

let current = 'en';
const listeners = new Set();

export function getLanguage() { return current; }
export function isAmharic() { return current === 'am'; }
export function onLanguageChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function initialLanguage() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'am' || saved === 'en') return saved;
  } catch { /* storage blocked - fall through */ }
  return 'en';
}

export function setLanguage(code) {
  const next = code === 'am' ? 'am' : 'en';
  if (next === current) return;
  current = next;
  try { localStorage.setItem(LANG_KEY, next); } catch { /* ignore */ }
  listeners.forEach((fn) => fn(next));
}

/** Silent set used at start-up (no listeners yet). */
export function primeLanguage(code) { current = code === 'am' ? 'am' : 'en'; }

// ---------------------------------------------------------------- lookup tables
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const looseKey = (s) => norm(s).toLowerCase().replace(/_/g, ' ');

const exact = new Map();
const loose = new Map();
for (const [en, am] of Object.entries(EXACT)) {
  exact.set(norm(en), am);
  const k = looseKey(en);
  if (!loose.has(k)) loose.set(k, am);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = Object.entries(PATTERNS)
  .map(([en, am]) => {
    const parts = norm(en).split(/\{\d+\}/);
    const literal = parts.join('');
    const source = parts.map(escapeRe).join('(.+?)');
    // Groups that hold a label or a whole message (not a user's name) are translated too.
    const nested = new Set();
    if (en.startsWith('{1} not found')) nested.add(1);
    if (en.startsWith('Row {1}: ')) nested.add(2);
    return { re: new RegExp(`^${source}$`, 's'), am, weight: literal.length, nested };
  })
  .sort((a, b) => b.weight - a.weight);

function applyPattern(p, m, depth) {
  return p.am.replace(/\{(\d+)\}/g, (_, i) => {
    const cap = m[Number(i)] ?? '';
    // Only status-like words (paid, RECEIVED, in stock) are translated inside a sentence;
    // Capitalised text is a name (branch, product, role) and is left exactly as the user typed it.
    const statusLike = cap === cap.toLowerCase() || cap === cap.toUpperCase() || p.nested.has(Number(i));
    return (statusLike ? lookup(cap, depth + 1) : null) ?? cap;
  });
}

/**
 * Translate one already-trimmed, whitespace-normalised string.
 * Returns null when there is no Amharic for it.
 */
function lookupCore(text, depth) {
  if (!text) return null;
  const hit = exact.get(text) ?? loose.get(looseKey(text));
  if (hit !== undefined) return hit;
  if (depth < 3) {
    for (const p of patterns) {
      const m = p.re.exec(text);
      if (m) return applyPattern(p, m, depth);
    }
  }
  return null;
}

// Leading bullets/symbols and trailing punctuation are kept as they are.
const AFFIX = /^([+\-−–—←→↑↓•·*#\s]*)(.*?)([:：…*.\s]*)$/s;

export function lookup(text, depth = 0) {
  if (text == null) return null;
  const n = norm(String(text));
  if (!n) return null;
  const direct = lookupCore(n, depth);
  if (direct !== null) return direct;
  const m = AFFIX.exec(n);
  if (m && (m[1] || m[3]) && m[2]) {
    const core = lookupCore(m[2], depth);
    if (core !== null) return `${m[1].trim() ? `${m[1].trim()} ` : ''}${core}${m[3].trim()}`;
  }
  return null;
}

/** Keep the original leading/trailing whitespace around the translation. */
export function translateKeepingSpace(raw) {
  const t = lookup(raw);
  if (t === null) return null;
  const lead = /^\s*/.exec(raw)[0];
  const trail = /\s*$/.exec(raw)[0];
  return lead + t + trail;
}

/** tr('Save') -> 'አስቀምጥ' when Amharic is on, otherwise the text unchanged. */
export function tr(text) {
  if (current !== 'am' || typeof text !== 'string') return text;
  return translateKeepingSpace(text) ?? text;
}

/** Locale to use for dates: Amharic month names, Gregorian calendar. */
export function dateLocale() {
  return current === 'am' ? 'am-ET-u-ca-gregory' : undefined;
}

// Native dialogs: translate their text too.
export function patchNativeDialogs() {
  if (typeof window === 'undefined' || window.__erpDialogsPatched) return;
  window.__erpDialogsPatched = true;
  const a = window.alert.bind(window);
  const c = window.confirm.bind(window);
  window.alert = (m) => a(tr(String(m ?? '')));
  window.confirm = (m) => c(tr(String(m ?? '')));
}
