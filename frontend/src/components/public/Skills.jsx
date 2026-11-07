import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Layers, Terminal } from 'lucide-react';
import { useLanguage } from '../../hooks';

export default function Skills({ skills = [], techStack = [], biodata = null }) {
  const { t } = useLanguage();

  const terminalHost = biodata?.terminal_widget?.user_host || 'baydev@workstation:~$';
  const defaultTerminalLines = Array.isArray(biodata?.terminal_widget?.lines) && biodata.terminal_widget.lines.length > 0
    ? biodata.terminal_widget.lines
    : [
        'git checkout -b feature/high-performance',
        'composer check & npm test',
        'All 19+ production systems operational',
      ];

  const [activeLines, setActiveLines] = useState(defaultTerminalLines);
  const [cliInput, setCliInput] = useState('');
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeLines]);

  const executeCommand = (raw) => {
    const cmd = (raw || '').trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'clear' || cmd === 'cls') {
      setActiveLines([]);
      setCliInput('');
      return;
    }

    if (cmd === 'reset') {
      setActiveLines(defaultTerminalLines);
      setCliInput('');
      return;
    }

    let outputLines = [`$ ${raw}`];

    switch (cmd) {
      case 'help':
        outputLines.push(
          'Daftar Perintah Terminal:',
          '  whoami     - Profil & ringkasan arsitek developer',
          '  skills     - Kompetensi teknis & arsenal',
          '  projects   - Daftar portofolio terbaru',
          '  contact    - Saluran komunikasi & nomor WhatsApp',
          '  uptime     - Rekor keandalan sistem & klaster',
          '  neofetch   - Spesifikasi sistem & arsitektur server',
          '  clear      - Membersihkan tampilan layar terminal'
        );
        break;

      case 'whoami':
        outputLines.push(
          'baydev (Bayu Prastyo)',
          'Role: Full-Stack Web Developer & Solutions Architect',
          'Pengalaman: 7+ Tahun spesialisasi Laravel, PostgreSQL, & React',
          'Lokasi: Yogyakarta / Karanganyar, Indonesia',
          'Status: Tersedia untuk proyek kemitraan freelance & enterprise'
        );
        break;

      case 'skills':
        outputLines.push(
          'Arsenal Teknologi Utama:',
          '  - Backend   : Laravel 11/12, PHP 8.4 FastCGI, REST API, Sanctum',
          '  - Database  : PostgreSQL 17 (Relational & Indexed Schema)',
          '  - Frontend  : React 18, Vite, Tailwind CSS, Material-UI',
          '  - Homelab   : Docker, Debian 12, Nginx, Dual-Server HA Cluster'
        );
        break;

      case 'projects':
        outputLines.push(
          '19+ Proyek Portofolio Nyata:',
          '  1. Jamkrida Jatim & Jamkrida Bali (Penjaminan BUMD)',
          '  2. BayOffice AI Agent Orchestration (Workflow Automation)',
          '  3. Dual-Server Homelab HA Cluster (Infrastruktur High-Availability)',
          '  4. GIS Desa Pintar & CMS Portal (Sistem Informasi Geografis)',
          '  Scroll ke seksi Portofolio di bawah untuk melihat rincian lengkap.'
        );
        break;

      case 'contact':
        outputLines.push(
          'Hubungi Bayu Prastyo:',
          `  - Email    : ${biodata?.email || 'bayukundev@gmail.com'}`,
          `  - WhatsApp : ${biodata?.phone || '08991907216'}`,
          '  - GitHub   : https://github.com/BayuKun28',
          '  - Website  : https://info.baydev.my.id'
        );
        break;

      case 'uptime':
        outputLines.push(
          'workstation up 1,520 days, load average: 0.12, 0.08, 0.05',
          'Dual-Server Node 145 & 146: 100% Synced (Zero Downtime)'
        );
        break;

      case 'curl /stack':
        outputLines.push(
          'HTTP/2 200 OK',
          'Server: nginx/1.22 + php-fpm8.4',
          'Database: PostgreSQL 17.0 on Linux Debian',
          'Cache-Status: HIT'
        );
        break;

      case 'neofetch':
      case 'infobay':
        outputLines.push(
          '  [BD] baydev@infobay-cluster',
          '  ---------------------------',
          '  OS: Debian GNU/Linux 12 (bookworm) x86_64',
          '  Host: Dual-Node Production Cluster (145 & 146)',
          '  Kernel: Linux 6.1.0-amd64',
          '  Database: PostgreSQL 17.0 (infobay)',
          '  Runtime: PHP 8.4 Ondemand FastCGI + Node.js 20',
          '  Framework: Laravel 12 + React 18 (Vite Neubrutalism)'
        );
        break;

      default:
        outputLines.push(
          `bash: command not found: ${raw}`,
          "Ketik 'help' untuk melihat daftar perintah yang tersedia."
        );
        break;
    }

    setActiveLines((prev) => [...prev, ...outputLines]);
    setCliInput('');
  };

  const handleShortcutClick = (cmd) => {
    executeCommand(cmd);
  };

  return (
    <section id="skills" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black dark:border-slate-800 bg-white dark:bg-[#0B0F19] transition-colors duration-150">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
        <div>
          <div className="inline-block bg-neo-pink border-2 border-black text-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-2">
            {t('skills.badge', '03 / SKILLS & TECH ARSENAL')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black dark:text-white">
            {t('skills.title', 'KEAHLIAN & TEKNOLOGI')}
          </h2>
        </div>
        <div className="bg-neo-yellow border-2 border-black text-black px-4 py-2 shadow-neo font-black text-sm">
          {t('skills.tested_badge', '⚙️ 100% PRODUCTION TESTED')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Skill Progress Bars */}
        <div className="lg:col-span-7 space-y-5">
          <div className="border-3 border-black dark:border-slate-700 bg-[#FFFDF0] dark:bg-[#151D2F] p-6 sm:p-8 shadow-neo-lg">
            <h3 className="text-xl font-black mb-6 uppercase tracking-wider flex items-center gap-2 text-black dark:text-white">
              <Cpu className="w-5 h-5 text-black dark:text-neo-yellow" />
              {t('skills.core_competencies', 'KOMPETENSI UTAMA')}
            </h3>

            <div className="space-y-6">
              {skills.map((skill, index) => {
                const colors = ['bg-neo-yellow', 'bg-neo-mint', 'bg-neo-pink', 'bg-neo-cyan', 'bg-neo-lilac'];
                const barColor = skill.color || colors[index % colors.length];

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center font-black text-sm text-black dark:text-white">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-black dark:bg-neo-yellow" />
                        {skill.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-black dark:bg-slate-900 border border-black dark:border-slate-700 text-white px-2 py-0.5 font-black uppercase">
                          {skill.badge || (skill.percentage >= 90 ? 'MASTER' : 'ADVANCED')}
                        </span>
                        <span className="border-2 border-black dark:border-slate-700 bg-white dark:bg-[#1E293B] text-black dark:text-white px-2 py-0.5 text-xs shadow-neo-sm">
                          {skill.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Neubrutalism Progress Bar Container */}
                    <div className="h-6 w-full border-3 border-black dark:border-slate-700 bg-white dark:bg-[#0F1626] p-0.5 shadow-neo-sm overflow-hidden">
                      <div
                        className={`h-full ${barColor} border-r-2 border-black transition-all duration-1000 ease-out`}
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Tech Stack Badges & Interactive Terminal */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-3 border-black dark:border-slate-700 bg-neo-yellow dark:bg-[#151D2F] p-6 sm:p-8 shadow-neo-lg text-black dark:text-white">
            <h3 className="text-xl font-black mb-4 uppercase tracking-wider flex items-center gap-2 text-black dark:text-white">
              <Layers className="w-5 h-5 text-black dark:text-neo-yellow" />
              {t('skills.tech_stack_title', 'TECH STACK & TOOLS')}
            </h3>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-300 mb-6 leading-relaxed">
              {t('skills.tech_stack_desc', 'Teknologi pilihan yang digunakan sehari-hari untuk merancang antarmuka cepat dan API tangguh.')}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {techStack.map((tech, idx) => {
                const label = typeof tech === 'object' && tech !== null
                  ? (tech.name || tech.title || tech.label || '')
                  : String(tech || '');
                if (!label) return null;

                return (
                  <div
                    key={`${label}-${idx}`}
                    className="bg-white dark:bg-[#1E293B] border-2 border-black dark:border-slate-700 text-black dark:text-slate-100 px-3 py-1.5 font-black text-xs uppercase tracking-wide shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-neo-mint dark:hover:bg-neo-mint hover:text-black dark:hover:text-black transition-all cursor-default"
                  >
                    #{label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Keyboard & Shortcut Workstation Terminal Box */}
          <div className="border-3 border-black dark:border-slate-700 bg-black text-white p-5 shadow-neo-lg font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-800">
              <div className="flex items-center gap-2 text-neo-yellow">
                <Terminal className="w-4 h-4" />
                <span className="font-bold">{terminalHost}</span>
              </div>
              {/* Shortcut buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['help', 'whoami', 'skills', 'uptime', 'neofetch', 'clear'].map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => handleShortcutClick(cmd)}
                    className="px-2 py-0.5 border text-[10px] font-mono font-bold uppercase transition-all cursor-pointer bg-gray-900 border-gray-700 text-gray-300 hover:border-neo-yellow hover:text-neo-yellow"
                  >
                    {cmd === 'clear' ? '↺ clear' : `$ ${cmd}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Output Stream */}
            <div className="space-y-1.5 text-gray-300 max-h-56 overflow-y-auto mb-2 pr-1">
              {activeLines.map((line, lIdx) => {
                const bulletColors = ['text-neo-mint', 'text-neo-pink', 'text-neo-yellow', 'text-neo-cyan'];
                const isCheck = line.toLowerCase().includes('operational') || line.toLowerCase().includes('ready') || line.toLowerCase().includes('success') || line.toLowerCase().includes('zero downtime');
                const isPrompt = line.startsWith('$');
                return (
                  <p key={lIdx} className={isPrompt ? 'text-neo-yellow font-bold' : ''}>
                    {!isPrompt && (
                      <span className={isCheck ? 'text-neo-yellow' : bulletColors[lIdx % bulletColors.length]}>
                        {isCheck ? '✔' : '➜'}{' '}
                      </span>
                    )}
                    {line}
                  </p>
                );
              })}
              <div ref={terminalEndRef} />
            </div>

            {/* Active CLI Keyboard Input Line */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeCommand(cliInput);
              }}
              className="flex items-center gap-2 pt-2 border-t border-gray-800 text-neo-yellow"
            >
              <span className="font-bold flex-shrink-0">$</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder="Ketik perintah (contoh: help, whoami, neofetch)..."
                className="bg-transparent text-white placeholder-gray-600 focus:outline-none w-full font-mono text-xs"
                spellCheck="false"
                autoComplete="off"
              />
              <button
                type="submit"
                className="px-2 py-0.5 bg-neo-yellow text-black font-mono font-bold text-[10px] uppercase border border-black hover:bg-yellow-400 cursor-pointer"
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
