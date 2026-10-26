import React from 'react';
import { X, Sun, Moon } from 'lucide-react';

export default function SidebarDrawer({ isOpen, onClose, menuLinks = [], themeMode, toggleThemeMode }) {
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
    <div className="lg:hidden mt-3 pt-3 border-t-2 border-black dark:border-slate-700 flex flex-col gap-2 font-bold text-sm bg-white dark:bg-[#151D2F] p-4 border-2 shadow-neo animate-in slide-in-from-top-2 duration-150">
      <div className="flex justify-between items-center pb-2 mb-1 border-b border-gray-200 dark:border-slate-700">
        <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-slate-300">
          Navigasi Menu
        </span>
        <div className="flex items-center gap-2">
          {toggleThemeMode && (
            <button
              onClick={toggleThemeMode}
              className="p-1 border border-black dark:border-slate-600 bg-neo-yellow dark:bg-[#1E293B] shadow-neo-sm text-black dark:text-neo-yellow flex items-center gap-1 text-[10px] font-black uppercase px-2"
              aria-label="Toggle Theme"
            >
              {themeMode === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 border border-black bg-neo-pink shadow-neo-sm text-black"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
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
