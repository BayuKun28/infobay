import React from 'react';
import { Cpu, Layers, Check, Terminal } from 'lucide-react';

export default function Skills({ skills = [], techStack = [] }) {
  return (
    <section id="skills" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
        <div>
          <div className="inline-block bg-neo-pink border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-2">
            03 / SKILLS & TECH ARSENAL
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black">
            KEAHLIAN & TEKNOLOGI
          </h2>
        </div>
        <div className="bg-neo-yellow border-2 border-black px-4 py-2 shadow-neo font-black text-sm">
          ⚙️ 100% PRODUCTION TESTED
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Skill Progress Bars */}
        <div className="lg:col-span-7 space-y-5">
          <div className="border-3 border-black bg-[#FFFDF0] p-6 sm:p-8 shadow-neo-lg">
            <h3 className="text-xl font-black mb-6 uppercase tracking-wider flex items-center gap-2 text-black">
              <Cpu className="w-5 h-5 text-black" />
              KOMPETENSI UTAMA
            </h3>

            <div className="space-y-6">
              {skills.map((skill, index) => {
                const colors = ['bg-neo-yellow', 'bg-neo-mint', 'bg-neo-pink', 'bg-neo-cyan', 'bg-neo-lilac'];
                const barColor = skill.color || colors[index % colors.length];

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center font-black text-sm text-black">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-black" />
                        {skill.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-black text-white px-2 py-0.5 font-black uppercase">
                          {skill.badge || (skill.percentage >= 90 ? 'MASTER' : 'ADVANCED')}
                        </span>
                        <span className="border-2 border-black bg-white px-2 py-0.5 text-xs shadow-neo-sm">
                          {skill.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Neubrutalism Progress Bar Container */}
                    <div className="h-6 w-full border-3 border-black bg-white p-0.5 shadow-neo-sm overflow-hidden">
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
          <div className="border-3 border-black bg-neo-yellow p-6 sm:p-8 shadow-neo-lg">
            <h3 className="text-xl font-black mb-4 uppercase tracking-wider flex items-center gap-2 text-black">
              <Layers className="w-5 h-5 text-black" />
              TECH STACK & TOOLS
            </h3>
            <p className="text-sm font-bold text-gray-900 mb-6 leading-relaxed">
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
                    className="bg-white border-2 border-black px-3 py-1.5 font-black text-xs uppercase tracking-wide shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-neo-mint transition-all cursor-default"
                  >
                    #{label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Terminal Box */}
          <div className="border-3 border-black bg-black text-white p-5 shadow-neo-lg font-mono text-xs">
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
