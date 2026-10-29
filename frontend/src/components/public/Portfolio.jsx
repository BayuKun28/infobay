import React, { useState, useMemo } from 'react';
import NeubrutalismPagination from '../common/NeubrutalismPagination';
import { PortfolioFilter, PortfolioGrid, PortfolioDetailModal } from '../portfolio';
import { useLanguage } from '../../hooks';

export default function Portfolio({ portfolios = [] }) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModalProject, setActiveModalProject] = useState(null);

  const itemsPerPage = 6; // 2 rows x 3 columns

  // Available categories
  const categories = useMemo(() => {
    const set = new Set(portfolios.map((p) => p.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [portfolios]);

  // Filtered portfolio list
  const filteredPortfolios = useMemo(() => {
    if (selectedCategory === 'ALL') return portfolios;
    return portfolios.filter(
      (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [portfolios, selectedCategory]);

  const totalPages = Math.ceil(filteredPortfolios.length / itemsPerPage) || 1;
  const activePage = Math.max(1, Math.min(currentPage, totalPages));

  // Paginated 6 items for current page
  const paginatedPortfolios = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredPortfolios.slice(start, start + itemsPerPage);
  }, [filteredPortfolios, activePage, itemsPerPage]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1); // Reset to page 1 on category filter change
  };

  return (
    <section id="portfolio" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black dark:border-slate-800 bg-[#FFFDF0] dark:bg-[#0B0F19] transition-colors duration-150">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-block bg-neo-cyan border-2 border-black text-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-3">
            {t('portfolio.badge', '04 / SHOWCASE KARYA TERPILIH')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black dark:text-white mb-2 uppercase">
            {t('portfolio.title', '15+ PORTOFOLIO NYATA')}
          </h2>
          <p className="font-bold text-gray-800 dark:text-slate-300 text-sm sm:text-base">
            {t('portfolio.subtitle', 'Proyek-proyek skala riil yang dibangun untuk instansi pemerintah, BUMD, dan aplikasi mobile.')}
          </p>
        </div>

        {/* Category Filter Pills */}
        <PortfolioFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* Grid of Portfolio Cards (6 items) */}
      <PortfolioGrid
        items={paginatedPortfolios}
        onSelectDetail={setActiveModalProject}
        activePage={activePage}
        itemsPerPage={itemsPerPage}
      />

      {/* No Results Fallback */}
      {filteredPortfolios.length === 0 && (
        <div className="border-3 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F] p-12 text-center shadow-neo-lg max-w-md mx-auto">
          <p className="font-black text-lg text-black dark:text-white mb-2 uppercase">
            {t('portfolio.not_found', 'TIDAK ADA PROYEK DITEMUKAN')}
          </p>
          <p className="text-sm font-bold text-gray-600 dark:text-slate-400 mb-4">
            {t('portfolio.select_other', 'Silakan pilih kategori lain.')}
          </p>
          <button
            onClick={() => handleCategorySelect('ALL')}
            className="neo-btn bg-neo-yellow text-black text-xs"
          >
            {t('portfolio.view_all', 'LIHAT SEMUA PROYEK')}
          </button>
        </div>
      )}

      {/* Proportional Neubrutalism Pagination Controls */}
      <NeubrutalismPagination
        currentPage={activePage}
        totalPages={totalPages}
        totalItems={filteredPortfolios.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        targetSectionId="portfolio"
        itemLabel={t('portfolio.items_label', 'proyek')}
      />

      {/* Detailed Preview Modal */}
      <PortfolioDetailModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />
    </section>
  );
}
