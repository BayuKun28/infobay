import React, { useState, useMemo, useEffect } from 'react';
import NeubrutalismPagination from '../common/NeubrutalismPagination';
import { PortfolioFilter, PortfolioGrid, PortfolioDetailModal } from '../portfolio';
import { useLanguage } from '../../hooks';

export default function Portfolio({ portfolios = [] }) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTech, setSelectedTech] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModalProject, setActiveModalProject] = useState(null);

  const itemsPerPage = 6; // 2 rows x 3 columns

  // Deep linking: read ?project=id from URL on load
  useEffect(() => {
    if (portfolios.length > 0 && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get('project');
      if (projectId) {
        const found = portfolios.find(
          (p) => String(p.id) === projectId || (p.title && p.title.toLowerCase().replace(/\s+/g, '-') === projectId)
        );
        if (found) {
          setActiveModalProject(found);
        }
      }
    }
  }, [portfolios]);

  const handleOpenDetail = (proj) => {
    setActiveModalProject(proj);
    if (proj?.id && typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('project', String(proj.id));
      window.history.replaceState({}, '', url);
    }
  };

  const handleCloseDetail = () => {
    setActiveModalProject(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.delete('project');
      window.history.replaceState({}, '', url);
    }
  };

  // Extract all categories dynamically
  const categories = useMemo(() => {
    const set = new Set(portfolios.map((p) => p.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [portfolios]);

  // Extract top tech tags dynamically from portfolios
  const techTags = useMemo(() => {
    const tagCount = new Map();
    portfolios.forEach((p) => {
      if (Array.isArray(p.tech_stack)) {
        p.tech_stack.forEach((tech) => {
          const name = typeof tech === 'object' ? tech.name : tech;
          if (name && typeof name === 'string') {
            const clean = name.trim();
            tagCount.set(clean, (tagCount.get(clean) || 0) + 1);
          }
        });
      }
    });

    // Curate popular tags (sorted by frequency)
    const sorted = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    // Pick top 8 tags for clean, non-cluttered pills
    return sorted.slice(0, 8);
  }, [portfolios]);

  // Realtime Filtered Portfolio List (Zero lag client-side)
  const filteredPortfolios = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return portfolios.filter((item) => {
      // 1. Category match
      if (selectedCategory !== 'ALL') {
        const cat = (item.category || '').toLowerCase();
        if (cat !== selectedCategory.toLowerCase()) return false;
      }

      // 2. Tech tag match
      if (selectedTech !== 'ALL') {
        const itemTechs = Array.isArray(item.tech_stack)
          ? item.tech_stack.map((t) => (typeof t === 'object' ? t.name : t).toLowerCase())
          : [];
        const hasTech = itemTechs.some((t) => t.includes(selectedTech.toLowerCase()));
        if (!hasTech) return false;
      }

      // 3. Search query match (Title, description, project_role, tech_stack)
      if (query) {
        const titleMatch = (item.title || '').toLowerCase().includes(query);
        const descMatch = (item.description || '').toLowerCase().includes(query);
        const roleMatch = (item.project_role || '').toLowerCase().includes(query);
        const catMatch = (item.category || '').toLowerCase().includes(query);
        const techMatch = Array.isArray(item.tech_stack)
          ? item.tech_stack.some((t) => {
              const name = typeof t === 'object' ? t.name : t;
              return (name || '').toLowerCase().includes(query);
            })
          : false;

        if (!titleMatch && !descMatch && !roleMatch && !catMatch && !techMatch) {
          return false;
        }
      }

      return true;
    });
  }, [portfolios, selectedCategory, selectedTech, searchQuery]);

  const totalPages = Math.ceil(filteredPortfolios.length / itemsPerPage) || 1;
  const activePage = Math.max(1, Math.min(currentPage, totalPages));

  // Paginated 6 items for current page
  const paginatedPortfolios = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredPortfolios.slice(start, start + itemsPerPage);
  }, [filteredPortfolios, activePage, itemsPerPage]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleTechSelect = (tech) => {
    setSelectedTech(tech);
    setCurrentPage(1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedTech('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <section id="portfolio" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black dark:border-slate-800 bg-[#FFFDF0] dark:bg-[#0B0F19] transition-colors duration-150">
      {/* Section Header */}
      <div className="mb-10">
        <div className="inline-block bg-neo-cyan border-2 border-black text-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-3">
          {t('portfolio.badge', '04 / SHOWCASE KARYA TERPILIH')}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black dark:text-white uppercase">
            {t('portfolio.title', '17+ PORTOFOLIO NYATA')}
          </h2>
          <div className="bg-neo-yellow border-2 border-black text-black px-3 py-1 font-black text-xs uppercase shadow-neo-sm">
            {filteredPortfolios.length === portfolios.length
              ? `Total: ${portfolios.length} Proyek`
              : `Menampilkan ${filteredPortfolios.length} dari ${portfolios.length} Proyek`}
          </div>
        </div>
        <p className="font-bold text-gray-800 dark:text-slate-300 text-sm sm:text-base max-w-3xl">
          {t('portfolio.subtitle', 'Proyek-proyek skala riil yang dibangun untuk instansi pemerintah, BUMD, aplikasi mobile, dan infrastruktur homelab.')}
        </p>
      </div>

      {/* Realtime Search & Category/Tech Filter Bar */}
      <div className="mb-10 bg-neo-cream dark:bg-[#151D2F] p-4 sm:p-6 border-3 border-black dark:border-slate-700 shadow-neo">
        <PortfolioFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          techTags={techTags}
          selectedTech={selectedTech}
          onSelectTech={handleTechSelect}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onResetFilters={handleResetFilters}
          totalResults={filteredPortfolios.length}
        />
      </div>

      {/* Grid of Portfolio Cards (6 items per page) */}
      <PortfolioGrid
        items={paginatedPortfolios}
        onSelectDetail={handleOpenDetail}
        activePage={activePage}
        itemsPerPage={itemsPerPage}
      />

      {/* No Results Fallback */}
      {filteredPortfolios.length === 0 && (
        <div className="border-3 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F] p-10 sm:p-14 text-center shadow-neo-lg max-w-lg mx-auto">
          <p className="font-black text-xl text-black dark:text-white mb-2 uppercase">
            {t('portfolio.not_found', 'TIDAK ADA PROYEK DITEMUKAN')}
          </p>
          <p className="text-sm font-bold text-gray-600 dark:text-slate-400 mb-6">
            {t('portfolio.select_other', 'Silakan pilih kategori atau tag teknologi lain, atau reset kata kunci pencarian Anda.')}
          </p>
          <button
            onClick={handleResetFilters}
            className="neo-btn bg-neo-yellow text-black font-black text-xs uppercase"
          >
            {t('portfolio.reset_filter', 'RESET SEMUA FILTER')}
          </button>
        </div>
      )}

      {/* Proportional Neubrutalism Pagination Controls */}
      {filteredPortfolios.length > 0 && (
        <NeubrutalismPagination
          currentPage={activePage}
          totalPages={totalPages}
          totalItems={filteredPortfolios.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          targetSectionId="portfolio"
          itemLabel={t('portfolio.items_label', 'proyek')}
        />
      )}

      {/* Detailed Preview Modal with Case Study Metrics & Keyboard Navigation */}
      <PortfolioDetailModal
        project={activeModalProject}
        onClose={handleCloseDetail}
        allProjects={filteredPortfolios}
        onSelectProject={handleOpenDetail}
      />
    </section>
  );
}
