import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Zap, Layers, UserCheck, ShieldCheck, Share2, Check, Building2, Calendar } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLanguage } from '../../hooks';

export default function PortfolioDetailModal({ project, onClose }) {
  const { t } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeImage, setActiveImage] = useState(project?.image || '');

  useEffect(() => {
    if (project?.image) {
      setActiveImage(project.image);
    }
  }, [project]);

  if (!project) return null;

  const techList = Array.isArray(project.tech_stack) ? project.tech_stack : [];
  const metricsList = Array.isArray(project.metrics) ? project.metrics : [];

  // Parse gallery screenshots
  const galleryList = Array.isArray(project.gallery)
    ? project.gallery
    : typeof project.gallery === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(project.gallery);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    : [];

  // Combine cover image with additional gallery screenshots
  const allImages = [
    ...(project.image ? [{ url: project.image, caption: 'Main Preview' }] : []),
    ...galleryList.map((g) => (typeof g === 'string' ? { url: g, caption: 'Screenshot' } : g)),
  ];

  const handleCopyLink = () => {
    const url = new URL(window.location.origin);
    url.searchParams.set('project', String(project.id));
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <Modal
      isOpen={Boolean(project)}
      onClose={onClose}
      title={project.title}
      subtitle={project.category}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
          {/* Share Deep Link Button */}
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 border-2 border-black bg-white dark:bg-[#1E293B] hover:bg-neo-yellow dark:hover:bg-neo-yellow text-black dark:text-white dark:hover:text-black font-black text-xs uppercase shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Salin tautan langsung proyek ini"
          >
            {copiedLink ? <Check className="w-4 h-4 text-green-700" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? t('portfolio.link_copied', 'TAUTAN DISALIN!') : t('portfolio.share_link', 'BAGIKAN PROYEK')}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="white" size="sm" onClick={onClose}>
              {t('portfolio.modal_close', 'TUTUP')}
            </Button>

            {/* GitHub Source Code Button (HABIBIE PLAN) */}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 border-2 border-black bg-white dark:bg-[#1E293B] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-black text-xs uppercase shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 text-black dark:text-white transition-all"
              >
                <Github className="w-4 h-4" />
                <span>{t('portfolio.source_code', 'LIHAT SOURCE CODE')}</span>
              </a>
            )}

            {/* Live Website Button */}
            {project.link && project.link !== '#' && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border-2 border-black bg-neo-yellow hover:bg-neo-mint font-black text-xs uppercase shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 text-black transition-all"
              >
                <span>{t('portfolio.modal_visit', 'KUNJUNGI WEBSITE')}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Modal Main Image Preview */}
        <div className="border-3 border-black dark:border-slate-700 overflow-hidden bg-neo-offwhite dark:bg-[#0F1626] shadow-neo-sm">
          <img
            src={activeImage || project.image}
            alt={project.title}
            className="w-full h-56 sm:h-80 object-cover object-top filter contrast-105 transition-all duration-200"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Multi-Screenshot Gallery Thumbnail Bar */}
        {allImages.length > 1 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 block tracking-wider">
              {t('portfolio.gallery_label', 'Galeri Screenshot & Arsitektur Sistem:')}
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {allImages.map((imgItem, idx) => {
                const isSelected = (activeImage || project.image) === imgItem.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgItem.url)}
                    className={`shrink-0 w-20 h-14 border-2 border-black dark:border-slate-700 overflow-hidden transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-neo-yellow scale-105 shadow-neo'
                        : 'opacity-70 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    <img
                      src={imgItem.url}
                      alt={imgItem.caption || `Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Project Metadata Bar: Client, Year, Role & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 bg-neo-offwhite dark:bg-[#1A2234] border-2 border-black dark:border-slate-700 shadow-neo-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-neo-yellow border border-black text-black">
                <UserCheck className="w-4 h-4 text-black" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 block leading-tight">
                  {t('portfolio.role_label', 'Peran Proyek')}
                </span>
                <span className="font-black text-xs sm:text-sm text-black dark:text-white">
                  {project.project_role || 'Senior Software Engineer'}
                </span>
              </div>
            </div>

            {project.client_name && (
              <div className="flex items-center gap-1.5 border-l-2 border-black/20 dark:border-slate-700 pl-3">
                <Building2 className="w-4 h-4 text-gray-700 dark:text-slate-300" />
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 block leading-tight">
                    {t('portfolio.client_label', 'Klien / Mitra')}
                  </span>
                  <span className="font-black text-xs text-black dark:text-white">
                    {project.client_name}
                  </span>
                </div>
              </div>
            )}

            {project.project_year && (
              <div className="flex items-center gap-1.5 border-l-2 border-black/20 dark:border-slate-700 pl-3">
                <Calendar className="w-4 h-4 text-gray-700 dark:text-slate-300" />
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 block leading-tight">
                    {t('portfolio.year_label', 'Tahun')}
                  </span>
                  <span className="font-black text-xs text-black dark:text-white">
                    {project.project_year}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="bg-neo-mint border-2 border-black text-black px-2.5 py-0.5 font-black text-[11px] uppercase tracking-wider">
              {project.category || 'Production'}
            </span>
            {(project.featured || project.is_featured) && (
              <span className="bg-neo-pink border-2 border-black text-black px-2 py-0.5 font-black text-[11px] uppercase tracking-wider">
                ★ FEATURED
              </span>
            )}
          </div>
        </div>

        {/* Modal Description */}
        <div className="border-l-4 border-black dark:border-neo-yellow pl-4 bg-neo-cream dark:bg-[#1A2234] p-4 border-2 border-black dark:border-slate-700 shadow-neo-sm">
          <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-200 leading-relaxed">
            {project.description ||
              t(
                'portfolio.modal_default_desc',
                'Sistem informasi aplikasi berbasis web / mobile terintegrasi dengan arsitektur database relasional, antarmuka responsif, dan performa tinggi.'
              )}
          </p>
        </div>

        {/* Case Study Key Metrics Grid (HABIBIE PLAN-20261103-01) */}
        {metricsList.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-black dark:text-white">
              <Zap className="w-4 h-4 text-neo-yellow fill-neo-yellow stroke-black" />
              <span>{t('portfolio.metrics_label', 'Dampak & Metrik Kunci')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {metricsList.map((metric, idx) => {
                const metricColors = ['bg-neo-yellow', 'bg-neo-mint', 'bg-neo-cyan', 'bg-neo-pink', 'bg-neo-lilac'];
                const cardBg = metricColors[idx % metricColors.length];
                return (
                  <div
                    key={idx}
                    className={`border-2 border-black p-3 ${cardBg} text-black shadow-neo-sm`}
                  >
                    <div className="text-[10px] font-black uppercase text-black/70 mb-0.5">
                      METRIC #{idx + 1}
                    </div>
                    <div className="font-black text-xs sm:text-sm tracking-tight leading-snug">
                      {metric}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tech Stack Chips (HABIBIE PLAN-20261103-01) */}
        {techList.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-black dark:text-white">
              <Layers className="w-4 h-4 text-neo-cyan" />
              <span>{t('portfolio.tech_stack_label', 'Tech Stack & Frameworks')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {techList.map((tech, idx) => {
                const techName = typeof tech === 'object' ? tech.name || 'tech' : tech;
                return (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white dark:bg-[#1E293B] border-2 border-black dark:border-slate-700 text-black dark:text-white font-black text-xs shadow-neo-sm tracking-wide"
                  >
                    #{techName}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Highlights Badges */}
        <div className="flex flex-wrap gap-2 text-xs font-black pt-2 border-t-2 border-black/10 dark:border-slate-800">
          {((Array.isArray(project.highlights) && project.highlights.length > 0)
            ? project.highlights
            : ['PRODUCTION READY', 'SECURE ARCHITECTURE', 'RESPONSIVE DESIGN']
          ).map((hl, hlIdx) => {
            const colors = ['bg-neo-mint', 'bg-neo-cyan', 'bg-neo-lilac', 'bg-neo-yellow', 'bg-neo-pink'];
            const colorClass = colors[hlIdx % colors.length];
            return (
              <span
                key={hlIdx}
                className={`${colorClass} border-2 border-black text-black px-2.5 py-1 shadow-neo-sm flex items-center gap-1 font-black text-xs uppercase tracking-wider`}
              >
                {hlIdx === 0 && <ShieldCheck className="w-3.5 h-3.5 text-black flex-shrink-0" />}
                <span>{hl}</span>
              </span>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
