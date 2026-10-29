import React, { useState, useMemo } from 'react';
import { Award, ExternalLink, ShieldCheck, Calendar, Hash, CheckCircle2 } from 'lucide-react';
import NeubrutalismPagination from '../common/NeubrutalismPagination';
import { useLanguage } from '../../hooks';

export default function Certifications({ certifications = [] }) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 1 full row x 3 columns

  // Filter active certifications
  const activeCerts = useMemo(() => {
    return (certifications || []).filter(c => c.is_active !== false && c.is_active !== 0);
  }, [certifications]);

  const totalPages = Math.ceil(activeCerts.length / itemsPerPage) || 1;
  const activePage = Math.max(1, Math.min(currentPage, totalPages));

  const paginatedCerts = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return activeCerts.slice(start, start + itemsPerPage);
  }, [activeCerts, activePage, itemsPerPage]);

  if (!activeCerts || activeCerts.length === 0) {
    return null;
  }

  const badgeBgs = [
    'bg-neo-mint',
    'bg-neo-yellow',
    'bg-neo-cyan',
    'bg-neo-lilac',
    'bg-neo-pink',
  ];

  return (
    <section id="certifications" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black dark:border-slate-800 bg-white dark:bg-[#0B0F19] transition-colors duration-150">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-block bg-neo-cyan border-2 border-black text-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-3">
          {t('certifications.badge', '06 / LISENSI & SERTIFIKASI')}
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black dark:text-white mb-4 uppercase">
          {t('certifications.title', 'KREDENSIAL PROFESIONAL')}
        </h2>
        <p className="font-bold text-base sm:text-lg text-gray-800 dark:text-slate-300">
          {t('certifications.subtitle', 'Standar keahlian teruji yang diakui secara resmi oleh penyedia teknologi enterprise dan institusi global.')}
        </p>
      </div>

      {/* Grid of Certifications (3 items: 1 row x 3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedCerts.map((cert, idx) => {
          const globalIdx = (activePage - 1) * itemsPerPage + idx;
          const bgBadge = badgeBgs[globalIdx % badgeBgs.length];

          return (
            <div
              key={cert.id || globalIdx}
              className="border-4 border-black dark:border-slate-700 bg-[#FFFDF0] dark:bg-[#151D2F] shadow-neo-lg hover:-translate-y-1.5 hover:shadow-neo-xl transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Top Status Header */}
                <div className="p-4 border-b-3 border-black dark:border-slate-700 bg-white dark:bg-[#1A2234] flex items-center justify-between">
                  <span className={`border-2 border-black ${bgBadge} text-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider shadow-neo-sm`}>
                    {cert.issuer || 'Official Issuer'}
                  </span>
                  <div className="inline-flex items-center gap-1 bg-neo-mint border-2 border-black text-black px-2 py-0.5 text-[10px] font-black uppercase shadow-neo-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-black" />
                    <span>{t('certifications.verified', 'VERIFIED')}</span>
                  </div>
                </div>

                {/* Badge Icon & Titles */}
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-white dark:bg-[#1E293B] border-3 border-black dark:border-slate-700 shadow-neo-sm flex items-center justify-center p-2 flex-shrink-0 group-hover:rotate-6 transition-transform">
                      {cert.badge_image ? (
                        <img
                          src={cert.badge_image}
                          alt={cert.title}
                          className="w-full h-full object-contain filter dark:brightness-110"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Award className="w-8 h-8 text-black dark:text-neo-yellow" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-black dark:text-white leading-snug tracking-tight">
                        {cert.title}
                      </h3>
                      <p className="font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-slate-400 mt-1">
                        {cert.issuer}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="space-y-2 bg-white dark:bg-[#1A2234] border-2 border-black dark:border-slate-700 p-3.5 shadow-neo-sm text-xs font-bold text-gray-800 dark:text-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-black dark:text-slate-300" />
                        <span>Tahun Terbit:</span>
                      </span>
                      <span className="font-black text-black dark:text-white">{cert.issue_date || '-'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-black dark:text-slate-300" />
                        <span>Masa Berlaku:</span>
                      </span>
                      <span className="font-black text-black dark:text-white">{cert.expiration_date || 'Lifetime'}</span>
                    </div>

                    {cert.credential_id && (
                      <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                          <Hash className="w-3.5 h-3.5 text-black dark:text-slate-300" />
                          <span>Credential ID:</span>
                        </span>
                        <span className="font-mono font-bold bg-neo-yellow/30 dark:bg-yellow-950/60 text-black dark:text-yellow-200 border border-black dark:border-yellow-700 px-1.5 py-0.5 text-[11px] truncate max-w-[140px]">
                          {cert.credential_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 border-t-3 border-black dark:border-slate-700 bg-white dark:bg-[#1A2234]">
                {cert.credential_url ? (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full neo-btn bg-neo-yellow hover:bg-yellow-400 text-black flex items-center justify-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-black"
                  >
                    <span>Verifikasi Kredensial</span>
                    <ExternalLink className="w-4 h-4 text-black" />
                  </a>
                ) : (
                  <div className="w-full py-2 bg-gray-100 dark:bg-slate-800 border-2 border-black dark:border-slate-700 text-center text-xs font-black uppercase text-gray-600 dark:text-slate-300 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Terakreditasi Resmi</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Proportional Neubrutalism Pagination Controls */}
      <NeubrutalismPagination
        currentPage={activePage}
        totalPages={totalPages}
        totalItems={activeCerts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        targetSectionId="certifications"
        itemLabel={t('certifications.items_label', 'sertifikasi')}
      />
    </section>
  );
}
