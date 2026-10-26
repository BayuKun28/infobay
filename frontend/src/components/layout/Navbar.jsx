import React, { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import SidebarDrawer from './SidebarDrawer';

export default function Navbar({ isLiveApi, themeMode = 'light', toggleThemeMode }) {
  const [isOpen, setIsOpen] = useState(false);

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
            <p className="text-xs font-bold text-gray-700 dark:text-slate-300 tracking-wider">SOFTWARE &amp; WEB ENGINEER</p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-4 font-bold text-sm">
          <a href="#about" className="hover:bg-neo-yellow px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            About
          </a>
          <a href="#services" className="hover:bg-neo-mint px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            Services
          </a>
          <a href="#skills" className="hover:bg-neo-pink px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            Skills
          </a>
          <a href="#portfolio" className="hover:bg-neo-cyan px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            Portfolio
          </a>
          <a href="#testimonials" className="hover:bg-neo-yellow px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            Testimonials
          </a>
          <a href="#certifications" className="hover:bg-neo-mint px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            Certifications
          </a>
          <a href="#contact" className="hover:bg-neo-lilac px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            Contact
          </a>

          {/* Theme Toggle Button */}
          {toggleThemeMode && (
            <button
              onClick={toggleThemeMode}
              type="button"
              aria-label={themeMode === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              title={themeMode === 'dark' ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Dark Mode)'}
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

          {/* Status indicator */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#151D2F] border-2 border-black dark:border-slate-700 px-2.5 py-1 shadow-neo-sm text-xs ml-1">
            <span className="w-2.5 h-2.5 rounded-none border border-black bg-green-500 animate-pulse" />
            <span className="font-extrabold uppercase text-[11px] text-black dark:text-white whitespace-nowrap">
              AVAILABLE FOR WORK
            </span>
          </div>
        </nav>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Theme Toggle Button */}
          {toggleThemeMode && (
            <button
              onClick={toggleThemeMode}
              type="button"
              aria-label={themeMode === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              title={themeMode === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
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
