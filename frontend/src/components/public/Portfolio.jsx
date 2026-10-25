import React, { useState, useMemo } from 'react';
import NeubrutalismPagination from '../common/NeubrutalismPagination';
import { PortfolioFilter, PortfolioGrid, PortfolioDetailModal } from '../portfolio';

export default function Portfolio({ portfolios = [] }) {
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
    <section id="portfolio" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black bg-[#FFFDF0]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-block bg-neo-cyan border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-3">
            04 / SHOWCASE KARYA TERPILIH
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black mb-2 uppercase">
            15+ PORTOFOLIO NYATA
          </h2>
          <p className="font-bold text-gray-800 text-sm sm:text-base">
            Proyek-proyek skala riil yang dibangun untuk instansi pemerintah, BUMD, dan aplikasi mobile.
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
        <div className="border-3 border-black bg-white p-12 text-center shadow-neo-lg max-w-md mx-auto">
          <p className="font-black text-lg text-black mb-2 uppercase">TIDAK ADA PROYEK DITEMUKAN</p>
          <p className="text-sm font-bold text-gray-600 mb-4">Silakan pilih kategori lain.</p>
          <button
            onClick={() => handleCategorySelect('ALL')}
            className="neo-btn bg-neo-yellow text-xs"
          >
            LIHAT SEMUA PROYEK
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
        itemLabel="proyek"
      />

      {/* Detailed Preview Modal */}
      <PortfolioDetailModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />
    </section>
  );
}
