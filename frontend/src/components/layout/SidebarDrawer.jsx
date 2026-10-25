import React from 'react';
import { X } from 'lucide-react';

export default function SidebarDrawer({ isOpen, onClose, menuLinks = [] }) {
  if (!isOpen) return null;

  const defaultLinks = [
    { href: '#about', label: 'About Me', color: 'bg-neo-yellow' },
    { href: '#services', label: 'Services', color: 'bg-neo-mint' },
    { href: '#skills', label: 'Skills & Tech', color: 'bg-neo-pink' },
    { href: '#portfolio', label: 'Portfolio Showcase', color: 'bg-neo-cyan' },
    { href: '#testimonials', label: 'Testimonials & Reviews', color: 'bg-neo-yellow' },
    { href: '#certifications', label: 'Certifications & Licenses', color: 'bg-neo-mint' },
    { href: '#contact', label: 'Contact & Inquiries', color: 'bg-neo-lilac' },
  ];

  const links = menuLinks.length > 0 ? menuLinks : defaultLinks;

  return (
    <div className="lg:hidden mt-3 pt-3 border-t-2 border-black flex flex-col gap-2 font-bold text-sm bg-white p-4 border-2 shadow-neo animate-in slide-in-from-top-2 duration-150">
      <div className="flex justify-between items-center pb-2 mb-1 border-b border-gray-200">
        <span className="text-xs font-black uppercase tracking-wider text-gray-700">
          Navigasi Menu
        </span>
        <button
          onClick={onClose}
          className="p-1 border border-black bg-neo-pink shadow-neo-sm text-black"
          aria-label="Tutup Menu"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={onClose}
          className={`p-2.5 border-2 border-black ${link.color || 'bg-neo-yellow'} hover:translate-x-1 transition-transform flex items-center justify-between text-black font-extrabold uppercase text-xs shadow-neo-sm`}
        >
          <span>&rarr; {link.label}</span>
        </a>
      ))}
    </div>
  );
}
