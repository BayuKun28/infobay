import React, { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import SidebarDrawer from './SidebarDrawer';
import { LanguageToggle } from '../common';
import { useLanguage } from '../../hooks';

export default function Navbar({ isLiveApi, themeMode = 'light', toggleThemeMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-[#FFFDF0] dark:bg-[#0E1524] border-b-4 border-black dark:border-slate-800 px-4 sm:px-8 py-3 transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-3 group" title="Bayu Prastyo (baydev / bayukun / masbay) - Home" aria-label="Bayu Prastyo (baydev / bayukun / masbay)">
          <div className="w-11 h-11 bg-neo-yellow border-3 border-black shadow-neo flex items-center justify-center font-black text-xl text-black tracking-tighter group-hover:rotate-6 transition-transform">
            BP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-black dark:text-white">BAYU PRASTYO</span>
              <span className="hidden sm:inline-block bg-neo-mint border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-neo-sm">
                baydev
              </span>
            </div>
            <p className="text-xs font-bold text-gray-700 dark:text-slate-300 tracking-wider">
              {t('hero.role', 'FULL-STACK ENGINEER & API ARCHITECT')}
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          <a
            href="#about"
            className="font-black text-sm uppercase hover:text-neo-pink transition-colors tracking-wide text-black dark:text-white"
          >
            {t('nav.about', 'TENTANG')}
          </a>
          <a
            href="#skills"
            className="font-black text-sm uppercase hover:text-neo-pink transition-colors tracking-wide text-black dark:text-white"
          >
            {t('nav.skills', 'KEAHLIAN')}
          </a>
          <a
            href="#services"
            className="font-black text-sm uppercase hover:text-neo-pink transition-colors tracking-wide text-black dark:text-white"
          >
            {t('nav.services', 'LAYANAN')}
          </a>
          <a
            href="#portfolio"
            className="font-black text-sm uppercase hover:text-neo-pink transition-colors tracking-wide text-black dark:text-white"
          >
            {t('nav.portfolio', 'PORTOFOLIO')}
          </a>
          <a
            href="#certifications"
            className="font-black text-sm uppercase hover:text-neo-pink transition-colors tracking-wide text-black dark:text-white"
          >
            {t('nav.certifications', 'SERTIFIKASI')}
          </a>
          <a
            href="#testimonials"
            className="font-black text-sm uppercase hover:text-neo-pink transition-colors tracking-wide text-black dark:text-white"
          >
            {t('nav.testimonials', 'TESTIMONI')}
          </a>
          <a
            href="#contact"
            className="font-black text-sm uppercase hover:text-neo-pink transition-colors tracking-wide text-black dark:text-white"
          >
            {t('nav.contact', 'KONTAK')}
          </a>

          {/* Desktop Language Toggle */}
          <LanguageToggle />

          {/* Theme Mode Toggle Button */}
          {toggleThemeMode && (
            <button
              onClick={toggleThemeMode}
              type="button"
              aria-label={themeMode === 'dark' ? t('nav.light_mode', 'Ganti ke Mode Terang') : t('nav.dark_mode', 'Ganti ke Mode Gelap')}
              title={themeMode === 'dark' ? t('nav.light_mode', 'Mode Terang') : t('nav.dark_mode', 'Mode Gelap')}
              className="flex items-center gap-1.5 bg-neo-yellow dark:bg-[#1E293B] border-2 border-black dark:border-slate-600 px-2.5 py-1 text-xs font-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-black dark:text-neo-yellow cursor-pointer ml-1 select-none"
            >
              {themeMode === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 stroke-[2.5] text-neo-yellow" />
                  <span className="font-extrabold uppercase text-[11px] text-white">LIGHT</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 stroke-[2.5] text-black" />
                  <span className="font-extrabold uppercase text-[11px] text-black">DARK</span>
                </>
              )}
            </button>
          )}
        </nav>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Language Toggle */}
          <LanguageToggle />

          {/* Mobile Theme Toggle Button */}
          {toggleThemeMode && (
            <button
              onClick={toggleThemeMode}
              type="button"
              aria-label={themeMode === 'dark' ? t('nav.light_mode', 'Mode Terang') : t('nav.dark_mode', 'Mode Gelap')}
              title={themeMode === 'dark' ? t('nav.light_mode', 'Mode Terang') : t('nav.dark_mode', 'Mode Gelap')}
              className="bg-neo-yellow dark:bg-[#1E293B] border-2 border-black dark:border-slate-600 p-2 shadow-neo-sm focus:outline-none cursor-pointer text-black dark:text-neo-yellow flex items-center justify-center"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-5 h-5 stroke-[2.5] text-neo-yellow" />
              ) : (
                <Moon className="w-5 h-5 stroke-[2.5] text-black" />
              )}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-neo-yellow border-2 border-black p-2 shadow-neo-sm focus:outline-none cursor-pointer text-black"
            aria-label="Toggle Navigation"
          >
            {isOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Reusable Mobile Drawer */}
      <SidebarDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />
    </header>
  );
}
