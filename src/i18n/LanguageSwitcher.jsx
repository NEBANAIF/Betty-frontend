import React from 'react';
import { useI18n } from './I18nContext.jsx';
import { LANGUAGES } from './translate.js';

/** Small two-way switch: English | አማርኛ. The choice is remembered on this device. */
export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex shrink-0 overflow-hidden rounded-lg border text-xs font-semibold ${className}`}
      style={{ borderColor: 'var(--card-border)', background: 'var(--card-bg, transparent)' }}
    >
      {LANGUAGES.map((l) => {
        const on = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={on}
            title={l.label}
            translate="no"
            className="px-2.5 py-1.5 transition"
            style={{
              background: on ? 'var(--sidebar, #4a4d2e)' : 'transparent',
              color: on ? '#fff' : 'var(--text)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
