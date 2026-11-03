import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Server, Zap, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import SidebarDrawer from './SidebarDrawer';
import { LanguageToggle } from '../common';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLanguage } from '../../hooks';
import { getSystemHealth } from '../../services';

export default function Navbar({ isLiveApi, themeMode = 'light', toggleThemeMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [healthData, setHealthData] = useState({
    status: 'operational',
    node: 'bay-homelab-node-01',
    server_primary: '192.168.100.145',
    server_standby: '192.168.100.146',
    os: 'Debian GNU/Linux 12',
    latency: 12,
  });
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    getSystemHealth().then((res) => {
      if (isMounted && res) {
        setHealthData((prev) => ({ ...prev, ...res }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
              {t('nav.tagline', 'SOFTWARE & WEB ENGINEER')}
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-3 font-bold text-sm">
          <a href="#about" className="hover:bg-neo-yellow px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            {t('nav.about', 'About')}
          </a>
          <a href="#services" className="hover:bg-neo-mint px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            {t('nav.services', 'Services')}
          </a>
          <a href="#skills" className="hover:bg-neo-pink px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            {t('nav.skills', 'Skills')}
          </a>
          <a href="#portfolio" className="hover:bg-neo-cyan px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            {t('nav.portfolio', 'Portfolio')}
          </a>
          <a href="#testimonials" className="hover:bg-neo-yellow px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            {t('nav.testimonials', 'Testimonials')}
          </a>
          <a href="#certifications" className="hover:bg-neo-mint px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            {t('nav.certifications', 'Certifications')}
          </a>
          <a href="#contact" className="hover:bg-neo-lilac px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-black text-black dark:text-slate-200 dark:hover:text-black transition-all">
            {t('nav.contact', 'Contact')}
          </a>

          {/* Language Toggle */}
          <LanguageToggle className="ml-1" />

          {/* Theme Toggle Button */}
          {toggleThemeMode && (
            <button
              onClick={toggleThemeMode}
              type="button"
              aria-label={themeMode === 'dark' ? t('nav.light_mode', 'Mode Terang') : t('nav.dark_mode', 'Mode Gelap')}
              title={themeMode === 'dark' ? t('nav.light_mode', 'Mode Terang (Light Mode)') : t('nav.dark_mode', 'Mode Gelap (Dark Mode)')}
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

          {/* Homelab Node Health Status Badge (HABIBIE PLAN-20261103-01) */}
          <button
            type="button"
            onClick={() => setShowHealthModal(true)}
            title={t('homelab.tooltip', 'Website ini di-host secara mandiri pada bare-metal server homelab AMD E2-9000 & Standby Server 146.')}
            className="flex items-center gap-1.5 bg-white dark:bg-[#151D2F] border-2 border-black dark:border-slate-700 px-2.5 py-1 shadow-neo-sm text-xs ml-1 hover:bg-neo-yellow hover:text-black dark:hover:bg-neo-yellow dark:hover:text-black transition-all cursor-pointer select-none group"
          >
            <span className="w-2.5 h-2.5 rounded-none border border-black bg-green-500 animate-pulse" />
            <span className="font-extrabold uppercase text-[11px] text-black dark:text-white group-hover:text-black whitespace-nowrap">
              ⚡ HOMELAB NODE • {healthData.latency || '<15'}ms
            </span>
          </button>
        </nav>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Homelab Indicator */}
          <button
            type="button"
            onClick={() => setShowHealthModal(true)}
            className="p-1.5 bg-white dark:bg-[#151D2F] border-2 border-black dark:border-slate-700 shadow-neo-sm flex items-center gap-1 text-[10px] font-black"
            title="Homelab Node Status"
          >
            <span className="w-2 h-2 rounded-none bg-green-500 animate-pulse border border-black" />
            <span>NODE</span>
          </button>

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

      {/* Homelab Bare-Metal Node Status Modal (HABIBIE PLAN-20261103-01) */}
      <Modal
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        title={t('homelab.details_title', 'SPESIFIKASI HOMELAB BARE-METAL')}
        subtitle="100% SELF-HOSTED PHYSICAL HARDWARE"
        maxWidth="max-w-xl"
        footer={
          <Button variant="yellow" size="sm" onClick={() => setShowHealthModal(false)}>
            TUTUP DETAIL
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-neo-mint/20 border-2 border-black dark:border-slate-600 text-black dark:text-slate-200">
            <div className="flex items-center gap-2 mb-2 font-black text-sm uppercase">
              <CheckCircle2 className="w-5 h-5 text-green-600 stroke-[2.5]" />
              <span>CLUSTER STATUS: 100% OPERATIONAL</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              {t('homelab.tooltip', 'Website ini di-host secara mandiri pada bare-metal server homelab AMD E2-9000 milik Mas Bay.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 border-2 border-black dark:border-slate-700 bg-neo-offwhite dark:bg-[#1E293B]">
              <div className="font-black uppercase text-gray-500 dark:text-slate-400 text-[10px] flex items-center gap-1 mb-1">
                <Server className="w-3.5 h-3.5 text-neo-pink" />
                <span>Primary Server (145):</span>
              </div>
              <div className="font-mono font-black text-black dark:text-white">
                192.168.100.145 (Host Utama)
              </div>
              <div className="text-[10px] text-gray-600 dark:text-slate-400 mt-0.5">
                Nginx FastCGI • PHP 8.4 • PostgreSQL 17
              </div>
            </div>

            <div className="p-3 border-2 border-black dark:border-slate-700 bg-neo-offwhite dark:bg-[#1E293B]">
              <div className="font-black uppercase text-gray-500 dark:text-slate-400 text-[10px] flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-neo-cyan" />
                <span>Standby Mirror (146):</span>
              </div>
              <div className="font-mono font-black text-black dark:text-white">
                192.168.100.146 (HA Replica)
              </div>
              <div className="text-[10px] text-gray-600 dark:text-slate-400 mt-0.5">
                Nginx FastCGI • PHP 8.3 Standby Mirror
              </div>
            </div>

            <div className="p-3 border-2 border-black dark:border-slate-700 bg-neo-offwhite dark:bg-[#1E293B]">
              <div className="font-black uppercase text-gray-500 dark:text-slate-400 text-[10px] flex items-center gap-1 mb-1">
                <Cpu className="w-3.5 h-3.5 text-neo-yellow" />
                <span>Hardware &amp; OS:</span>
              </div>
              <div className="font-bold text-black dark:text-white">
                AMD E2-9000 Dual-Core • 3.2GB RAM
              </div>
              <div className="text-[10px] text-gray-600 dark:text-slate-400 mt-0.5">
                Debian GNU/Linux 12 (bookworm)
              </div>
            </div>

            <div className="p-3 border-2 border-black dark:border-slate-700 bg-neo-offwhite dark:bg-[#1E293B]">
              <div className="font-black uppercase text-gray-500 dark:text-slate-400 text-[10px] flex items-center gap-1 mb-1">
                <Zap className="w-3.5 h-3.5 text-neo-mint" />
                <span>Real-Time Latency:</span>
              </div>
              <div className="font-mono font-black text-green-600 dark:text-neo-mint text-sm">
                ~{healthData.latency || 12} ms
              </div>
              <div className="text-[10px] text-gray-600 dark:text-slate-400 mt-0.5">
                Zero Cloud Dependency • Self-Hosted
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </header>
  );
}
