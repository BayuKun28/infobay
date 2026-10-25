import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import SidebarDrawer from './SidebarDrawer';

export default function Navbar({ isLiveApi }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FFFDF0] border-b-4 border-black px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-3 group" title="Bayu Prastyo (baydev / bayukun / masbay) - Home" aria-label="Bayu Prastyo (baydev / bayukun / masbay)">
          <div className="w-11 h-11 bg-neo-yellow border-3 border-black shadow-neo flex items-center justify-center font-black text-xl tracking-tighter group-hover:rotate-6 transition-transform">
            BP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-black">BAYU PRASTYO</span>
              <span className="hidden sm:inline-block bg-neo-mint border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-neo-sm">
                baydev
              </span>
            </div>
            <p className="text-xs font-bold text-gray-700 tracking-wider">SOFTWARE &amp; WEB ENGINEER</p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 font-bold text-sm">
          <a href="#about" className="hover:bg-neo-yellow px-2 py-1 border-2 border-transparent hover:border-black transition-all">
            About
          </a>
          <a href="#services" className="hover:bg-neo-mint px-2 py-1 border-2 border-transparent hover:border-black transition-all">
            Services
          </a>
          <a href="#skills" className="hover:bg-neo-pink px-2 py-1 border-2 border-transparent hover:border-black transition-all">
            Skills
          </a>
          <a href="#portfolio" className="hover:bg-neo-cyan px-2 py-1 border-2 border-transparent hover:border-black transition-all">
            Portfolio
          </a>
          <a href="#testimonials" className="hover:bg-neo-yellow px-2 py-1 border-2 border-transparent hover:border-black transition-all">
            Testimonials
          </a>
          <a href="#certifications" className="hover:bg-neo-mint px-2 py-1 border-2 border-transparent hover:border-black transition-all">
            Certifications
          </a>
          <a href="#contact" className="hover:bg-neo-lilac px-2 py-1 border-2 border-transparent hover:border-black transition-all">
            Contact
          </a>

          {/* Status indicator */}
          <div className="flex items-center gap-1.5 bg-white border-2 border-black px-2.5 py-1 shadow-neo-sm text-xs ml-2">
            <span className="w-2.5 h-2.5 rounded-none border border-black bg-green-500 animate-pulse" />
            <span className="font-extrabold uppercase text-[11px] text-black whitespace-nowrap">
              AVAILABLE FOR WORK
            </span>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-neo-yellow border-2 border-black p-2 shadow-neo-sm focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Reusable Mobile Drawer */}
      <SidebarDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  );
}
