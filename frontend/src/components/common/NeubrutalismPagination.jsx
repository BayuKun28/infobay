import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../hooks';

export default function NeubrutalismPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  targetSectionId,
  itemLabel = 'item',
}) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    if (targetSectionId) {
      const el = document.getElementById(targetSectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers array with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="mt-10 pt-6 border-t-3 border-black dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      {/* Item Counter Status */}
      <div className="inline-flex items-center gap-2 bg-white dark:bg-[#151D2F] border-2 border-black dark:border-slate-700 px-3.5 py-1.5 shadow-neo-sm font-bold text-xs uppercase tracking-wider text-black dark:text-slate-200">
        <span>{t('portfolio.showing', 'Menampilkan')}</span>
        <span className="font-black bg-neo-yellow px-1.5 py-0.5 border border-black text-black">
          {startItem}-{endItem}
        </span>
        <span>{t('portfolio.of', 'dari')}</span>
        <span className="font-black text-black dark:text-white">{totalItems}</span>
        <span>{itemLabel}</span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Prev Button */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label={t('common.prev', 'Halaman Sebelumnya')}
          className={`px-3 py-1.5 border-2 font-black text-xs uppercase flex items-center gap-1 transition-all ${
            currentPage === 1
              ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 border-gray-400 dark:border-slate-700 cursor-not-allowed shadow-none'
              : 'bg-white dark:bg-[#151D2F] hover:bg-neo-yellow dark:hover:bg-neo-yellow text-black dark:text-slate-200 dark:hover:text-black border-black dark:border-slate-700 shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
          }`}
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">{t('common.prev', 'PREV')}</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1.5">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="w-7 text-center font-black text-black dark:text-slate-400 select-none">
                  •••
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => handlePageClick(p)}
                aria-label={`Halaman ${p}`}
                aria-current={isActive ? 'page' : undefined}
                className={`w-9 h-9 border-2 font-black text-xs flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-neo-yellow text-black border-black shadow-neo-sm translate-x-0.5 translate-y-0.5'
                    : 'bg-white dark:bg-[#151D2F] hover:bg-neo-mint dark:hover:bg-neo-mint text-black dark:text-slate-200 dark:hover:text-black border-black dark:border-slate-700 shadow-neo-sm hover:-translate-y-0.5 hover:shadow-neo'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label={t('common.next', 'Halaman Selanjutnya')}
          className={`px-3 py-1.5 border-2 font-black text-xs uppercase flex items-center gap-1 transition-all ${
            currentPage === totalPages
              ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 border-gray-400 dark:border-slate-700 cursor-not-allowed shadow-none'
              : 'bg-white dark:bg-[#151D2F] hover:bg-neo-yellow dark:hover:bg-neo-yellow text-black dark:text-slate-200 dark:hover:text-black border-black dark:border-slate-700 shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
          }`}
        >
          <span className="hidden sm:inline">{t('common.next', 'NEXT')}</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
