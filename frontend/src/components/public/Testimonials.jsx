import React, { useState, useMemo } from 'react';
import { Quote, Star, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import NeubrutalismPagination from '../common/NeubrutalismPagination';
import { useLanguage } from '../../hooks';

export default function Testimonials({ testimonials = [] }) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 1 full row x 3 columns

  // Filter active testimonials if is_active is present, otherwise show all
  const activeTestimonials = useMemo(() => {
    return (testimonials || []).filter(t => t.is_active !== false && t.is_active !== 0);
  }, [testimonials]);

  const totalPages = Math.ceil(activeTestimonials.length / itemsPerPage) || 1;
  const activePage = Math.max(1, Math.min(currentPage, totalPages));

  const paginatedTestimonials = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return activeTestimonials.slice(start, start + itemsPerPage);
  }, [activeTestimonials, activePage, itemsPerPage]);

  if (!activeTestimonials || activeTestimonials.length === 0) {
    return null;
  }

  const stripColors = [
    'bg-neo-yellow',
    'bg-neo-mint',
    'bg-neo-pink',
    'bg-neo-cyan',
    'bg-neo-lilac',
  ];

  return (
    <section id="testimonials" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black dark:border-slate-800 bg-[#FFFDF0] dark:bg-[#0B0F19] transition-colors duration-150">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-block bg-neo-yellow border-2 border-black text-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-3">
          {t('testimonials.badge', '05 / TESTIMONI & ULASAN KLIEN')}
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black dark:text-white mb-4 uppercase">
          {t('testimonials.title', 'KATA MEREKA TENTANG SAYA')}
        </h2>
        <p className="font-bold text-base sm:text-lg text-gray-800 dark:text-slate-300">
          {t('testimonials.subtitle', 'Ulasan jujur dari institusi pemerintah, konsultan IT, dan rekan kolaborasi yang telah bermitra dalam membangun sistem produksi.')}
        </p>
      </div>

      {/* Grid Cards (3 items: 1 row x 3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedTestimonials.map((item, idx) => {
          const globalIdx = (activePage - 1) * itemsPerPage + idx;
          const stripColor = stripColors[globalIdx % stripColors.length];
          const ratingCount = Math.max(1, Math.min(5, Number(item.rating) || 5));

          return (
            <div
              key={item.id || globalIdx}
              className="border-4 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F] shadow-neo-lg hover:-translate-y-1.5 hover:shadow-neo-xl transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header Strip with Quote & Stars */}
                <div className={`p-4 border-b-3 border-black dark:border-slate-700 ${stripColor} flex items-center justify-between`}>
                  <div className="w-10 h-10 bg-white border-2 border-black shadow-neo-sm flex items-center justify-center">
                    <Quote className="w-5 h-5 text-black fill-black" />
                  </div>
                  <div className="flex items-center gap-1 bg-white border-2 border-black px-2.5 py-1 shadow-neo-sm">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx < ratingCount
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300 fill-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Content Quote */}
                <div className="p-6">
                  <p className="text-gray-900 dark:text-slate-200 font-bold text-sm sm:text-base leading-relaxed italic relative">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>
              </div>

              {/* Client Info Footer */}
              <div className="p-5 border-t-3 border-black dark:border-slate-700 bg-[#FFFDF0] dark:bg-[#1A2234] flex items-center gap-3">
                <img
                  src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={item.client_name}
                  className="w-12 h-12 object-cover border-2 border-black dark:border-slate-700 shadow-neo-sm flex-shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-black dark:text-white text-base tracking-tight truncate">
                      {item.client_name}
                    </h3>
                  </div>
                  <p className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-slate-400 truncate">
                    {item.client_title}{item.company ? ` • ${item.company}` : ''}
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1 bg-neo-mint border border-black text-black px-1.5 py-0.5 text-[10px] font-black uppercase shadow-neo-sm">
                    <CheckCircle2 className="w-3 h-3 text-black" />
                    <span>Verified Partner</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proportional Neubrutalism Pagination Controls */}
      <NeubrutalismPagination
        currentPage={activePage}
        totalPages={totalPages}
        totalItems={activeTestimonials.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        targetSectionId="testimonials"
        itemLabel={t('testimonials.items_label', 'ulasan')}
      />
    </section>
  );
}
