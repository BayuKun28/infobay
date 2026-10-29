import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../hooks';

/**
 * Neubrutalism Language Toggle Component
 * Allows seamless switching between Indonesian (ID - Default) and English (EN)
 * with instant UI updates and localStorage persistence.
 */
export default function LanguageToggle({ className = '', compact = false }) {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`flex items-center gap-1 bg-neo-mint dark:bg-[#102A24] border-2 border-black dark:border-emerald-600 px-2 py-1 text-xs font-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-black dark:text-emerald-300 cursor-pointer select-none ${className}`}
        title={language === 'id' ? 'Beralih ke Bahasa Inggris (Switch to EN)' : 'Switch to Indonesian (Beralih ke ID)'}
        aria-label="Toggle Language"
      >
        <Languages className="w-3.5 h-3.5 stroke-[2.5]" />
        <span className="font-extrabold uppercase text-[11px]">
          {language === 'id' ? 'ID' : 'EN'}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center border-2 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F] shadow-neo-sm select-none overflow-hidden ${className}`}
      role="group"
      aria-label="Language Selector / Pemilih Bahasa"
    >
      <button
        type="button"
        onClick={() => setLanguage('id')}
        className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
          language === 'id'
            ? 'bg-neo-mint text-black border-r-2 border-black'
            : 'text-gray-700 dark:text-slate-300 hover:text-black dark:hover:text-white border-r-2 border-black/20 dark:border-slate-700'
        }`}
        title="Bahasa Indonesia (Default)"
        aria-pressed={language === 'id'}
      >
        <span>ID</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
          language === 'en'
            ? 'bg-neo-yellow text-black'
            : 'text-gray-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
        }`}
        title="English"
        aria-pressed={language === 'en'}
      >
        <span>EN</span>
      </button>
    </div>
  );
}
