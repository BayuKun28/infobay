import React from 'react';
import { Cpu, Layers, Check, Terminal } from 'lucide-react';

export default function Skills({ skills = [], techStack = [] }) {
  return (
    <section id="skills" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black dark:border-slate-800 bg-white dark:bg-[#0B0F19] transition-colors duration-150">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
        <div>
          <div className="inline-block bg-neo-pink border-2 border-black text-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-2">
            03 / SKILLS & TECH ARSENAL
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black dark:text-white">
            KEAHLIAN & TEKNOLOGI
          </h2>
        </div>
        <div className="bg-neo-yellow border-2 border-black text-black px-4 py-2 shadow-neo font-black text-sm">
          ⚙️ 100% PRODUCTION TESTED
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Skill Progress Bars */}
        <div className="lg:col-span-7 space-y-5">
          <div className="border-3 border-black dark:border-slate-700 bg-[#FFFDF0] dark:bg-[#151D2F] p-6 sm:p-8 shadow-neo-lg">
            <h3 className="text-xl font-black mb-6 uppercase tracking-wider flex items-center gap-2 text-black dark:text-white">
              <Cpu className="w-5 h-5 text-black dark:text-neo-yellow" />
              KOMPETENSI UTAMA
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

        {/* Right Column: Tech Stack Badges */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-3 border-black dark:border-slate-700 bg-neo-yellow dark:bg-[#151D2F] p-6 sm:p-8 shadow-neo-lg text-black dark:text-white">
            <h3 className="text-xl font-black mb-4 uppercase tracking-wider flex items-center gap-2 text-black dark:text-white">
              <Layers className="w-5 h-5 text-black dark:text-neo-yellow" />
              TECH STACK & TOOLS
            </h3>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-300 mb-6 leading-relaxed">
              Teknologi pilihan yang digunakan sehari-hari untuk merancang antarmuka cepat dan API tangguh.
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

          {/* Quick Terminal Box */}
          <div className="border-3 border-black dark:border-slate-700 bg-black text-white p-5 shadow-neo-lg font-mono text-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-800 text-neo-yellow">
              <Terminal className="w-4 h-4" />
              <span className="font-bold">baydev@workstation:~$</span>
            </div>
            <div className="space-y-1 text-gray-300">
              <p><span className="text-neo-mint">➜</span> git checkout -b feature/high-performance</p>
              <p><span className="text-neo-pink">➜</span> composer check &amp; npm test</p>
              <p><span className="text-neo-yellow">✔</span> All 15+ production systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
