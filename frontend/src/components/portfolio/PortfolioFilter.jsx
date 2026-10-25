import React from 'react';

export default function PortfolioFilter({
  categories = ['ALL'],
  selectedCategory = 'ALL',
  onSelectCategory,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-2 border-black transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-black text-neo-yellow shadow-neo translate-x-0.5 translate-y-0.5'
                : 'bg-white text-black shadow-neo-sm hover:bg-neo-yellow hover:-translate-y-0.5 hover:shadow-neo'
            }`}
          >
            {cat === 'ALL' ? '⚡ SEMUA PROYEK' : cat}
          </button>
        );
      })}
    </div>
  );
}
