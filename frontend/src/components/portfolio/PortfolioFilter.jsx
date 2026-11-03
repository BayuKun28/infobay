import React from 'react';
import { Search, X, Filter, Tag, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../hooks';

export default function PortfolioFilter({
  categories = ['ALL'],
  selectedCategory = 'ALL',
  onSelectCategory,
  techTags = [],
  selectedTech = 'ALL',
  onSelectTech,
  searchQuery = '',
  onSearchChange,
  onResetFilters,
  totalResults = 0,
}) {
  const { t } = useLanguage();
  const isFiltered = selectedCategory !== 'ALL' || selectedTech !== 'ALL' || searchQuery.trim().length > 0;

  return (
    <div className="w-full space-y-4">
      {/* Top Row: Search Input & Category Pills */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Realtime Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black dark:text-neo-yellow">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('portfolio.search_placeholder', 'Cari nama proyek, deskripsi, atau teknologi (cth: Laravel, React, Docker, Homelab)...')}
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm font-bold border-3 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F] text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400 shadow-neo-sm focus:shadow-neo focus:outline-none transition-all"
            aria-label={t('portfolio.search_label', 'Pencarian Proyek')}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-2 font-black text-xs uppercase tracking-wider border-2 border-black dark:border-slate-700 transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-black dark:bg-neo-yellow text-neo-yellow dark:text-black shadow-neo translate-x-0.5 translate-y-0.5'
                    : 'bg-white dark:bg-[#151D2F] text-black dark:text-slate-200 shadow-neo-sm hover:bg-neo-yellow hover:text-black dark:hover:bg-neo-yellow dark:hover:text-black hover:-translate-y-0.5 hover:shadow-neo'
                }`}
              >
                {cat === 'ALL' ? t('portfolio.all_filter', '⚡ SEMUA KATEGORI') : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Technology Filter Pills & Active Filter Bar */}
      {techTags.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t-2 border-black/10 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wider text-black dark:text-slate-300 mr-1">
              <Tag className="w-3.5 h-3.5 text-neo-pink" />
              <span>{t('portfolio.tech_filter_label', 'Filter Teknologi:')}</span>
            </div>

            {/* All Tech Pill */}
            <button
              onClick={() => onSelectTech('ALL')}
              className={`px-2.5 py-1 font-black text-[11px] uppercase tracking-wider border-2 border-black dark:border-slate-700 transition-all cursor-pointer ${
                selectedTech === 'ALL'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-neo-sm'
                  : 'bg-white dark:bg-[#151D2F] text-gray-700 dark:text-slate-300 hover:bg-neo-yellow hover:text-black'
              }`}
            >
              {t('portfolio.all_tech', '⚡ SEMUA TEKNO')}
            </button>

            {/* Individual Tech Tags */}
            {techTags.map((tech) => {
              const isSelected = selectedTech.toLowerCase() === tech.toLowerCase();
              return (
                <button
                  key={tech}
                  onClick={() => onSelectTech(tech)}
                  className={`px-2.5 py-1 font-black text-[11px] tracking-wide border-2 border-black dark:border-slate-700 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neo-cyan text-black shadow-neo-sm scale-105'
                      : 'bg-white dark:bg-[#151D2F] text-black dark:text-slate-200 hover:bg-neo-mint hover:text-black dark:hover:bg-neo-mint dark:hover:text-black'
                  }`}
                >
                  #{tech}
                </button>
              );
            })}
          </div>

          {/* Filter Status & Reset Action */}
          {isFiltered && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="font-mono text-xs font-bold text-gray-600 dark:text-slate-400">
                {t('portfolio.results_count', 'Ditemukan')}: <strong>{totalResults}</strong>
              </span>
              <button
                onClick={onResetFilters}
                className="px-2.5 py-1 bg-neo-pink text-black font-black text-[11px] uppercase border-2 border-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
                title={t('portfolio.reset_filter', 'Reset Filter')}
              >
                <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                <span>{t('portfolio.reset_filter', 'RESET')}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
