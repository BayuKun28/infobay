import React from 'react';
import { ExternalLink } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function PortfolioDetailModal({ project, onClose }) {
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
            TUTUP
          </Button>
          {project.link && project.link !== '#' && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 border-2 border-black bg-neo-yellow font-black text-xs uppercase shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 text-black"
            >
              <span>KUNJUNGI WEBSITE</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {/* Modal Image */}
        <div className="border-3 border-black overflow-hidden bg-neo-offwhite">
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
        <div className="border-l-4 border-black pl-3 bg-neo-cream p-3 border-2 shadow-neo-sm">
          <p className="font-bold text-sm sm:text-base text-gray-900 leading-relaxed">
            {project.description ||
              'Sistem informasi aplikasi berbasis web / mobile terintegrasi dengan arsitektur database relasional, antarmuka responsif, dan performa tinggi.'}
          </p>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2 text-xs font-black">
          <span className="bg-neo-mint border-2 border-black px-2 py-1 shadow-neo-sm">
            ⚡ PRODUCTION READY
          </span>
          <span className="bg-neo-cyan border-2 border-black px-2 py-1 shadow-neo-sm">
            🔒 SECURE ARCHITECTURE
          </span>
          <span className="bg-neo-lilac border-2 border-black px-2 py-1 shadow-neo-sm">
            📱 RESPONSIVE DESIGN
          </span>
        </div>
      </div>
    </Modal>
  );
}
