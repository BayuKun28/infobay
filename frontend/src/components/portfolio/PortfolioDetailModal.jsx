import React from 'react';
import { ExternalLink, Github, Zap, Layers, UserCheck, ShieldCheck } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLanguage } from '../../hooks';

export default function PortfolioDetailModal({ project, onClose }) {
  const { t } = useLanguage();
  if (!project) return null;

  const techList = Array.isArray(project.tech_stack) ? project.tech_stack : [];
  const metricsList = Array.isArray(project.metrics) ? project.metrics : [];

  return (
    <Modal
      isOpen={Boolean(project)}
      onClose={onClose}
      title={project.title}
      subtitle={project.category}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto">
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
      }
    >
      <div className="space-y-6">
        {/* Modal Image */}
        <div className="border-3 border-black dark:border-slate-700 overflow-hidden bg-neo-offwhite dark:bg-[#0F1626]">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-56 sm:h-72 object-cover object-top filter contrast-105"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Project Role & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neo-offwhite dark:bg-[#1A2234] border-2 border-black dark:border-slate-700 shadow-neo-sm">
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

        {/* Highlights Badges */}
        <div className="flex flex-wrap gap-2 text-xs font-black pt-2 border-t-2 border-black/10 dark:border-slate-800">
          <span className="bg-neo-mint border-2 border-black text-black px-2.5 py-1 shadow-neo-sm flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            <span>{t('portfolio.badge_prod', '⚡ PRODUCTION READY')}</span>
          </span>
          <span className="bg-neo-cyan border-2 border-black text-black px-2.5 py-1 shadow-neo-sm">
            {t('portfolio.badge_sec', '🔒 SECURE ARCHITECTURE')}
          </span>
          <span className="bg-neo-lilac border-2 border-black text-black px-2.5 py-1 shadow-neo-sm">
            {t('portfolio.badge_resp', '📱 RESPONSIVE DESIGN')}
          </span>
        </div>
      </div>
    </Modal>
  );
}
