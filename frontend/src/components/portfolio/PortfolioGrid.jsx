import React, { useState } from 'react';
import { ExternalLink, Eye, Code, Smartphone, Server, Star, Zap, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../hooks';

function ProgressiveCardImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition-all duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={(e) => {
          e.target.src =
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80';
          setLoaded(true);
        }}
      />
    </div>
  );
}

export default function PortfolioGrid({
  items = [],
  onSelectDetail,
  activePage = 1,
  itemsPerPage = 6,
}) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item, index) => {
        const catLower = (item.category || '').toLowerCase();
        const titleLower = (item.title || '').toLowerCase();
        const isWeb = catLower.includes('web');
        const isMobile = catLower.includes('mobile');
        const isHomelab = catLower.includes('homelab') || catLower.includes('devops');
        
        let badgeBg = 'bg-neo-mint';
        let CategoryIcon = Code;
        if (isMobile) {
          badgeBg = 'bg-neo-pink';
          CategoryIcon = Smartphone;
        } else if (isHomelab) {
          badgeBg = 'bg-neo-yellow';
          CategoryIcon = Server;
        }

        // Determine dynamic project status badge
        let statusBadge = { text: 'LIVE PRODUCTION', bg: 'bg-neo-mint', textCol: 'text-black' };
        if (isHomelab) {
          statusBadge = { text: 'HA CLUSTER', bg: 'bg-neo-cyan', textCol: 'text-black' };
        } else if (isMobile) {
          statusBadge = { text: 'MOBILE APP', bg: 'bg-neo-pink', textCol: 'text-black' };
        } else if (titleLower.includes('jamkrida') || titleLower.includes('desa') || titleLower.includes('sikap') || titleLower.includes('sigap')) {
          statusBadge = { text: 'GOV / ENTERPRISE', bg: 'bg-[#98D8AA]', textCol: 'text-black' };
        }

        const globalIndex = (activePage - 1) * itemsPerPage + index + 1;
        const techPreview = Array.isArray(item.tech_stack) ? item.tech_stack.slice(0, 3) : [];
        const primaryMetric = Array.isArray(item.metrics) && item.metrics.length > 0 ? item.metrics[0] : null;

        return (
          <div
            key={item.id || index}
            className="border-3 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F] shadow-neo-lg flex flex-col justify-between overflow-hidden group hover:-translate-y-2 hover:shadow-neo-xl transition-all duration-200"
          >
            <div>
              {/* Image Container with bold frame & Progressive Loading */}
              <div className="relative border-b-3 border-black dark:border-slate-700 bg-neo-offwhite dark:bg-[#0F1626] h-52 overflow-hidden">
                <ProgressiveCardImage
                  src={item.image}
                  alt={item.title}
                />
                
                {/* Category Badge overlay */}
                <div
                  className={`absolute top-3 left-3 ${badgeBg} border-2 border-black text-black px-2.5 py-0.5 font-black text-[11px] uppercase tracking-wider shadow-neo-sm flex items-center gap-1 z-10`}
                >
                  <CategoryIcon className="w-3.5 h-3.5 text-black" />
                  <span>{item.category || 'Development'}</span>
                </div>

                {/* Status Badge overlay */}
                <div className={`absolute bottom-3 left-3 ${statusBadge.bg} ${statusBadge.textCol} border-2 border-black px-2 py-0.5 font-black text-[10px] uppercase tracking-widest shadow-neo-sm flex items-center gap-1 z-10`}>
                  <CheckCircle2 className="w-3 h-3 text-black stroke-[3]" />
                  <span>{statusBadge.text}</span>
                </div>

                {/* Project Number */}
                <div className="absolute top-3 right-3 bg-black dark:bg-slate-900 border border-black dark:border-slate-700 text-white px-2 py-0.5 font-mono text-[10px] font-bold z-10">
                  #{String(item.id || globalIndex).padStart(2, '0')}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                {/* Project Role Pill */}
                {item.project_role && (
                  <div className="text-[11px] font-black uppercase tracking-wider text-neo-pink dark:text-neo-yellow mb-1.5 flex items-center gap-1">
                    <span>{item.project_role}</span>
                  </div>
                )}

                <h3 className="text-xl font-black text-black dark:text-white mb-2 tracking-tight line-clamp-1 group-hover:text-neo-pink dark:group-hover:text-neo-mint transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 leading-relaxed line-clamp-2 mb-3">
                  {item.description ||
                    'Aplikasi web/mobile terintegrasi dengan arsitektur tangguh dan pengalaman pengguna modern.'}
                </p>

                {/* Primary Metric Highlight */}
                {primaryMetric && (
                  <div className="mb-3 px-2.5 py-1 bg-neo-offwhite dark:bg-[#1A2234] border border-black/30 dark:border-slate-700 text-[11px] font-extrabold text-black dark:text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-neo-yellow flex-shrink-0" />
                    <span className="truncate">{primaryMetric}</span>
                  </div>
                )}

                {/* Tech Stack Preview Pills (3 tags) */}
                {techPreview.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {techPreview.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-neo-offwhite dark:bg-[#1E293B] border border-black dark:border-slate-600 text-black dark:text-slate-200 text-[10px] font-black tracking-wide"
                      >
                        #{typeof tech === 'object' ? tech.name || 'tech' : tech}
                      </span>
                    ))}
                    {item.tech_stack && item.tech_stack.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-neo-yellow/30 dark:bg-neo-yellow/20 border border-black/40 dark:border-slate-600 text-[10px] font-black text-black dark:text-neo-yellow">
                        +{item.tech_stack.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="p-5 pt-0 border-t-2 border-black/10 dark:border-slate-700 mt-auto flex items-center justify-between gap-3">
              <button
                onClick={() => onSelectDetail(item)}
                className="flex-1 py-2 px-3 border-2 border-black bg-neo-yellow text-black font-black text-xs uppercase shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-black" />
                <span>{t('portfolio.detail_btn', 'DETAIL KARYA')}</span>
              </button>

              {item.link && item.link !== '#' && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border-2 border-black dark:border-slate-700 bg-white dark:bg-[#1E293B] hover:bg-neo-mint dark:hover:bg-neo-mint shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-black dark:text-white dark:hover:text-black flex items-center justify-center"
                  title={t('portfolio.open_link', 'Buka Link Proyek')}
                >
                  <ExternalLink className="w-4 h-4 text-current" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
