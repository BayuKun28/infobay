import React from 'react';
import { Palette, Code, Smartphone, Server, ArrowUpRight } from 'lucide-react';

export default function Services({ services = [] }) {
  // Map icons if seed icon fails
  const getFallbackIcon = (title) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('design')) return <Palette className="w-8 h-8 text-black dark:text-white" />;
    if (t.includes('mobile')) return <Smartphone className="w-8 h-8 text-black dark:text-white" />;
    if (t.includes('back') || t.includes('api') || t.includes('server')) return <Server className="w-8 h-8 text-black dark:text-white" />;
    return <Code className="w-8 h-8 text-black dark:text-white" />;
  };

  return (
    <section id="services" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black dark:border-slate-800 bg-[#FFFDF0] dark:bg-[#0B0F19] transition-colors duration-150">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-block bg-neo-mint border-2 border-black text-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-3">
          02 / LAYANAN & KAPABILITAS
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black dark:text-white mb-4">
          APA YANG SAYA KERJAKAN?
        </h2>
        <p className="font-bold text-base sm:text-lg text-gray-800 dark:text-slate-300">
          Solusi terintegrasi dari visual UI/UX unik, arsitektur frontend cepat, hingga backend API berstandar korporasi.
        </p>
      </div>

      {/* Grid of 4 Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => {
          const colors = ['bg-neo-yellow', 'bg-neo-mint', 'bg-neo-pink', 'bg-neo-cyan'];
          const colorClass = service.color || colors[index % colors.length];

          return (
            <div
              key={service.id || index}
              className={`border-3 border-black dark:border-slate-700 ${colorClass} dark:bg-[#151D2F] p-6 shadow-neo-lg flex flex-col justify-between transition-all duration-200 hover:-translate-y-2 hover:shadow-neo-xl group`}
            >
              <div>
                {/* Header inside card */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 bg-white dark:bg-[#1E293B] border-2 border-black dark:border-slate-600 shadow-neo-sm flex items-center justify-center p-2 group-hover:rotate-6 transition-transform">
                    {service.icon ? (
                      <img
                        src={service.icon}
                        alt={service.title}
                        className="w-full h-full object-contain filter dark:brightness-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          const title = service.title?.toLowerCase() || '';
                          if (title.includes('design')) e.target.src = '/icons/services/web-design.svg';
                          else if (title.includes('mobile')) e.target.src = '/icons/services/mobile-apps.svg';
                          else if (title.includes('back') || title.includes('api') || title.includes('server')) e.target.src = '/icons/services/backend.svg';
                          else e.target.src = '/icons/services/web-development.svg';
                        }}
                      />
                    ) : (
                      getFallbackIcon(service.title)
                    )}
                  </div>
                  <span className="bg-black dark:bg-slate-900 border border-black dark:border-slate-700 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    {service.tag || `0${index + 1}`}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black text-black dark:text-white mb-2 tracking-tight">
                  {service.title}
                </h3>
                <div className="font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-slate-400 mb-3">
                  {service.category || "Full-Cycle Solution"}
                </div>

                {/* Description */}
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-300 leading-relaxed mb-6">
                  {service.description || "Layanan profesional dengan komitmen kualitas kode, stabilitas, dan performa tinggi."}
                </p>
              </div>

              {/* Bottom tag */}
              <div className="border-t-2 border-black dark:border-slate-700 pt-3 flex items-center justify-between font-black text-xs">
                <span className="uppercase text-black dark:text-slate-200">PRODUCTION GRADE</span>
                <ArrowUpRight className="w-4 h-4 text-black dark:text-neo-yellow group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
