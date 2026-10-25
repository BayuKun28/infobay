import React from 'react';
import { User, Briefcase, GraduationCap, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function About({ biodata, education = [], experience = [] }) {
  return (
    <section id="about" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <div className="inline-block bg-neo-yellow border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-2">
            01 / PROFIL & REKAM JEJAK
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black">
            TENTANG BAYU PRASTYO
          </h2>
        </div>
        <div className="border-2 border-black bg-white px-4 py-2 shadow-neo font-bold text-sm">
          📍 Base: <strong className="underline decoration-neo-mint">{biodata?.location || "Yogyakarta / Karanganyar"}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Bio Narrative */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border-3 border-black bg-white p-6 sm:p-8 shadow-neo-lg">
            <h3 className="text-2xl font-black mb-4 flex items-center gap-2 text-black">
              <span className="bg-neo-pink p-1.5 border-2 border-black shadow-neo-sm">
                <User className="w-5 h-5 text-black" />
              </span>
              BIOGRAFI SINGKAT
            </h3>
            <p className="text-base sm:text-lg font-medium leading-relaxed text-gray-800 mb-4">
              {biodata?.about || (
                <>
                  Hi there, <strong>Bayu Prastyo</strong> here 👋 Selamat datang di website portofolio saya! Saya seorang Senior Programmer &amp; Fullstack Developer yang di dunia komunitas developer juga dikenal dengan handle <strong>baydev</strong>, <strong>bayukun</strong> (GitHub: <a href="https://github.com/BayuKun28" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-600">BayuKun28</a>), atau akrab dipanggil <strong>Mas Bay / masbay</strong>. Berpengalaman dalam rekayasa sistem web skala produksi, arsitektur RESTful API, dan infrastruktur DevOps.
                </>
              )}
            </p>
            <div className="border-t-2 border-black pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-bold">
              <div className="p-3 bg-neo-cream border-2 border-black">
                <span className="text-xs text-gray-600 block uppercase">Spesialisasi:</span>
                Web Application & API Systems
              </div>
              <div className="p-3 bg-neo-mint-light border-2 border-black">
                <span className="text-xs text-gray-600 block uppercase">Status Kerja:</span>
                Open for Remote & Hybrid Roles
              </div>
            </div>

            {/* Online Monikers & Aliases for Search Engines */}
            <div className="border-t-2 border-black pt-4">
              <span className="text-xs font-black text-gray-700 block uppercase tracking-wider mb-2">
                Dikenal Juga Sebagai (Online Monikers &amp; Aliases):
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-black">
                <span className="bg-neo-yellow border-2 border-black px-2.5 py-1 shadow-neo-sm">
                  🏷️ baydev
                </span>
                <span className="bg-neo-mint border-2 border-black px-2.5 py-1 shadow-neo-sm">
                  🏷️ bayukun (BayuKun28)
                </span>
                <span className="bg-neo-pink border-2 border-black px-2.5 py-1 shadow-neo-sm">
                  🏷️ masbay (Mas Bayu)
                </span>
                <span className="bg-neo-cyan border-2 border-black px-2.5 py-1 shadow-neo-sm">
                  📍 Yogyakarta &amp; Karanganyar
                </span>
              </div>
            </div>
          </div>

          {/* Core Values / Work Ethic */}
          <div className="border-3 border-black bg-neo-yellow p-6 shadow-neo-md">
            <h4 className="font-black text-lg uppercase tracking-wider mb-3 text-black">
              ⚡ PRINSIP REKAYASA SISTEM
            </h4>
            <ul className="space-y-2.5 font-bold text-sm text-gray-900">
              <li className="flex items-start gap-2 bg-white p-2 border-2 border-black shadow-neo-sm">
                <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
                <span><strong>Architecture First:</strong> Desain database relasional kokoh, query terindeks, dan skema bersih.</span>
              </li>
              <li className="flex items-start gap-2 bg-white p-2 border-2 border-black shadow-neo-sm">
                <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
                <span><strong>Authentic UX:</strong> Menghadirkan antarmuka otentik, responsif, dan bebas dari template generik.</span>
              </li>
              <li className="flex items-start gap-2 bg-white p-2 border-2 border-black shadow-neo-sm">
                <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
                <span><strong>Rock-Solid Security:</strong> Proteksi autentikasi, CORS presisi, sanitasi input, dan audit berkelanjutan.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Experience & Education Timeline */}
        <div className="lg:col-span-6 space-y-6">
          {/* Experience */}
          <div className="border-3 border-black bg-white p-6 shadow-neo-lg">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2 text-black">
              <span className="bg-neo-cyan p-1.5 border-2 border-black shadow-neo-sm">
                <Briefcase className="w-5 h-5 text-black" />
              </span>
              PENGALAMAN KERJA
            </h3>
            <div className="space-y-4">
              {experience && experience.length > 0 ? (
                experience.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="border-2 border-black bg-neo-offwhite p-4 shadow-neo-sm hover:translate-x-1 transition-transform"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                      <span className="font-black text-base text-black">{item.title}</span>
                      <span className="bg-black text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                        {item.period}
                      </span>
                    </div>
                    <div className="inline-block bg-neo-yellow border border-black px-2 py-0.5 text-xs font-black mb-2">
                      {item.role || "Web Programmer"}
                    </div>
                    <p className="text-sm font-medium text-gray-800 leading-normal">
                      {item.description || "Pengembangan aplikasi web skala korporat dan instansi."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs font-bold text-gray-600">Belum ada riwayat pengalaman kerja.</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="border-3 border-black bg-neo-lilac p-6 shadow-neo-lg">
            <h3 className="text-2xl font-black mb-4 flex items-center gap-2 text-black">
              <span className="bg-white p-1.5 border-2 border-black shadow-neo-sm">
                <GraduationCap className="w-5 h-5 text-black" />
              </span>
              PENDIDIKAN
            </h3>
            <div className="space-y-3">
              {education && education.length > 0 ? (
                education.map((item, idx) => (
                  <div key={item.id || idx} className="border-2 border-black bg-white p-4 shadow-neo-sm">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-black text-base text-black">{item.title}</h4>
                      <span className="bg-neo-pink border border-black px-2 py-0.5 text-xs font-black">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-700">{item.field || "Teknik Komputer & Jaringan"}</p>
                    {item.description && (
                      <p className="text-xs text-gray-600 mt-1 font-medium">{item.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs font-bold text-gray-600">Belum ada riwayat pendidikan.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
