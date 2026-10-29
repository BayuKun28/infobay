import React from 'react';
import { ExternalLink } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLanguage } from '../../hooks';

export default function PortfolioDetailModal({ project, onClose }) {
  const { t } = useLanguage();
  if (!project) return null;

  return (
    <Modal
      isOpen={Boolean(project)}
      onClose={onClose}
      title={project.title}
      subtitle={project.category}
      footer={
        <>
          <Button variant="white" size="sm" onClick={onClose}>
            {t('portfolio.modal_close', 'TUTUP')}
          </Button>
          {project.link && project.link !== '#' && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 border-2 border-black bg-neo-yellow font-black text-xs uppercase shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 text-black"
            >
              <span>{t('portfolio.modal_visit', 'KUNJUNGI WEBSITE')}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {/* Modal Image */}
        <div className="border-3 border-black dark:border-slate-700 overflow-hidden bg-neo-offwhite dark:bg-[#0F1626]">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-64 sm:h-80 object-cover object-top filter contrast-105"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Modal Description */}
        <div className="border-l-4 border-black dark:border-neo-yellow pl-3 bg-neo-cream dark:bg-[#1A2234] p-3 border-2 border-black dark:border-slate-700 shadow-neo-sm">
          <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-200 leading-relaxed">
            {project.description ||
              t(
                'portfolio.modal_default_desc',
                'Sistem informasi aplikasi berbasis web / mobile terintegrasi dengan arsitektur database relasional, antarmuka responsif, dan performa tinggi.'
              )}
          </p>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2 text-xs font-black">
          <span className="bg-neo-mint border-2 border-black text-black px-2 py-1 shadow-neo-sm">
            {t('portfolio.badge_prod', '⚡ PRODUCTION READY')}
          </span>
          <span className="bg-neo-cyan border-2 border-black text-black px-2 py-1 shadow-neo-sm">
            {t('portfolio.badge_sec', '🔒 SECURE ARCHITECTURE')}
          </span>
          <span className="bg-neo-lilac border-2 border-black text-black px-2 py-1 shadow-neo-sm">
            {t('portfolio.badge_resp', '📱 RESPONSIVE DESIGN')}
          </span>
        </div>
      </div>
    </Modal>
  );
}
