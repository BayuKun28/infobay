import React from 'react';
import { ExternalLink, Eye, Code, Smartphone } from 'lucide-react';

export default function PortfolioGrid({
  items = [],
  onSelectDetail,
  activePage = 1,
  itemsPerPage = 6,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item, index) => {
        const isWeb = item.category?.toLowerCase().includes('web');
        const badgeBg = isWeb ? 'bg-neo-mint' : 'bg-neo-pink';
        const globalIndex = (activePage - 1) * itemsPerPage + index + 1;

        return (
          <div
            key={item.id || index}
            className="border-3 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F] shadow-neo-lg flex flex-col justify-between overflow-hidden group hover:-translate-y-2 hover:shadow-neo-xl transition-all duration-200"
          >
            <div>
              {/* Image Container with bold frame */}
              <div className="relative border-b-3 border-black dark:border-slate-700 bg-neo-offwhite dark:bg-[#0F1626] h-52 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                {/* Category Badge overlay */}
                <div
                  className={`absolute top-3 left-3 ${badgeBg} border-2 border-black text-black px-2.5 py-0.5 font-black text-[11px] uppercase tracking-wider shadow-neo-sm flex items-center gap-1`}
                >
                  {isWeb ? <Code className="w-3.5 h-3.5 text-black" /> : <Smartphone className="w-3.5 h-3.5 text-black" />}
                  <span>{item.category || 'Development'}</span>
                </div>

                {/* Project Number */}
                <div className="absolute top-3 right-3 bg-black dark:bg-slate-900 border border-black dark:border-slate-700 text-white px-2 py-0.5 font-mono text-[10px] font-bold">
                  #{String(item.id || globalIndex).padStart(2, '0')}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <h3 className="text-xl font-black text-black dark:text-white mb-2 tracking-tight line-clamp-1 group-hover:text-neo-pink dark:group-hover:text-neo-mint transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 leading-relaxed line-clamp-3 mb-4">
                  {item.description ||
                    'Aplikasi web/mobile terintegrasi dengan arsitektur tangguh dan pengalaman pengguna modern.'}
                </p>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="p-5 pt-0 border-t-2 border-black/10 dark:border-slate-700 mt-auto flex items-center justify-between gap-3">
              <button
                onClick={() => onSelectDetail(item)}
                className="flex-1 py-2 px-3 border-2 border-black bg-neo-yellow text-black font-black text-xs uppercase shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-black" />
                <span>DETAIL KARYA</span>
              </button>

              {item.link && item.link !== '#' && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border-2 border-black dark:border-slate-700 bg-white dark:bg-[#1E293B] hover:bg-neo-mint dark:hover:bg-neo-mint shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-black dark:text-white dark:hover:text-black flex items-center justify-center"
                  title="Buka Link Proyek"
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
