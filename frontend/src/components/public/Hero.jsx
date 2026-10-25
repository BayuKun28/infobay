import React from 'react';
import { ArrowDown, Mail, Phone, MapPin, Download, FileText, ExternalLink, Github, Sparkles } from 'lucide-react';
import { getStorageUrl } from '../../utils';

export default function Hero({ biodata }) {
  const renderHeadline = (headline) => {
    if (!headline) {
      return (
        <>
          CRAFTING <span className="bg-neo-yellow border-2 border-black px-2 shadow-neo inline-block transform -rotate-1">ROBUST</span> WEB & MOBILE APPS.
        </>
      );
    }
    const words = headline.trim().split(/\s+/);
    if (words.length <= 2) {
      return headline;
    }
    const highlightCount = words.length > 4 ? 2 : 1;
    const mainPart = words.slice(0, words.length - highlightCount).join(' ');
    const highlighted = words.slice(words.length - highlightCount).join(' ');
    return (
      <>
        {mainPart}{' '}
        <span className="bg-neo-yellow border-2 border-black px-2 shadow-neo inline-block transform -rotate-1">
          {highlighted}
        </span>
      </>
    );
  };

  const cvUrl = biodata?.cv_file_url ? getStorageUrl(biodata.cv_file_url) : null;

  return (
    <section id="hero" className="relative px-4 sm:px-8 py-12 md:py-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headlines & Call to Action */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 bg-neo-mint border-3 border-black px-4 py-1.5 shadow-neo font-black text-xs sm:text-sm tracking-wide uppercase">
            <span className="w-2.5 h-2.5 bg-black rounded-none animate-ping" />
            <span>{biodata?.role_badge || biodata?.statusBadge || "AVAILABLE FOR WORK & CONTRACTS"}</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-black uppercase">
            {renderHeadline(biodata?.hero_headline)}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl font-bold text-gray-800 leading-relaxed border-l-4 border-black pl-4 bg-white/60 p-3 border-2 shadow-neo">
            {biodata?.hero_subheadline || (
              <>
                Halo! Saya <span className="underline decoration-4 decoration-neo-pink font-black text-black">{biodata?.name || "Bayu Prastyo"}</span> (dikenal juga sebagai <strong>{biodata?.nickname || "baydev"}</strong>, <strong>bayukun</strong>, atau <strong>masbay</strong>).
                Full-stack developer &amp; DevOps specialist spesialis ReactJS, Next.js, Laravel, PostgreSQL &amp; arsitektur sistem performa tinggi.
              </>
            )}
          </p>

          {/* Identity & Alias Chips for Search Engine Keywords */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-black">
            <span className="text-gray-700 uppercase text-[11px] tracking-wider mr-1">Known As:</span>
            <span className="bg-neo-yellow border-2 border-black px-2.5 py-0.5 shadow-neo-sm">
              baydev
            </span>
            <span className="bg-neo-mint border-2 border-black px-2.5 py-0.5 shadow-neo-sm">
              bayukun
            </span>
            <span className="bg-neo-pink border-2 border-black px-2.5 py-0.5 shadow-neo-sm">
              masbay (Mas Bay)
            </span>
            <span className="bg-neo-cyan border-2 border-black px-2.5 py-0.5 shadow-neo-sm">
              BayuKun28
            </span>
          </div>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1.5 shadow-neo-sm">
              <MapPin className="w-4 h-4 text-black" />
              <span>{biodata?.location || "Yogyakarta / Karanganyar"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-neo-cyan-light border-2 border-black px-3 py-1.5 shadow-neo-sm">
              <Mail className="w-4 h-4 text-black" />
              <span>{biodata?.email || "bayukundev@gmail.com"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-neo-pink-light border-2 border-black px-3 py-1.5 shadow-neo-sm">
              <Phone className="w-4 h-4 text-black" />
              <span>{biodata?.phone || "08991907216"}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#portfolio"
              className="neo-btn bg-neo-yellow text-black flex items-center gap-2 text-sm sm:text-base"
            >
              <Sparkles className="w-5 h-5" />
              <span>EXPLORE PROJECTS</span>
            </a>

            {/* Neubrutalism CV / Resume Download Button */}
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="neo-btn bg-neo-mint hover:bg-emerald-300 text-black flex items-center gap-2 text-sm sm:text-base border-2 border-black font-black"
                title="Download Curiculum Vitae (PDF)"
              >
                <FileText className="w-5 h-5 text-black" />
                <span>DOWNLOAD RESUME / CV</span>
              </a>
            )}

            <a
              href="#contact"
              className="neo-btn bg-white hover:bg-neo-mint text-black flex items-center gap-2 text-sm sm:text-base"
            >
              <Mail className="w-5 h-5" />
              <span>CONTACT ME</span>
            </a>

            {(biodata?.socials?.github || biodata?.github) && (
              <a
                href={biodata?.socials?.github || biodata?.github}
                target="_blank"
                rel="noreferrer"
                className="neo-btn bg-black text-white hover:bg-gray-800 flex items-center gap-2 text-sm sm:text-base"
              >
                <Github className="w-5 h-5 text-neo-yellow" />
                <span>GITHUB</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Hero Graphic / Avatar Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm">
            {/* Background offset card decoration */}
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 border-4 border-black" />
            <div className="absolute inset-0 bg-neo-pink translate-x-1.5 translate-y-1.5 border-4 border-black" />

            {/* Main Avatar Box */}
            <div className="relative border-4 border-black bg-white p-5 shadow-neo-lg">
              {/* Header inside card */}
              <div className="flex justify-between items-center pb-3 mb-3 border-b-3 border-black">
                <span className="font-black text-xs tracking-wider uppercase bg-neo-yellow border-2 border-black px-2 py-0.5 shadow-neo-sm">
                  DEV PROFILE
                </span>
                <span className="font-black text-xs tracking-wider text-black uppercase">
                  {biodata?.name || "BAYU PRASTYO"}
                </span>
              </div>

              {/* Avatar Frame with custom Neubrutalism background */}
              <div className="relative border-3 border-black bg-neo-mint p-2 mb-4 overflow-hidden group">
                <img
                  src={biodata?.avatar || "/images/avatar.png"}
                  alt={biodata?.name || "Bayu Prastyo"}
                  className="w-full h-72 object-cover object-top border-2 border-black filter contrast-105 group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/avatar.png";
                  }}
                />
                <div className="absolute bottom-4 left-4 bg-black text-white border-2 border-neo-yellow px-3 py-1 font-black text-xs uppercase shadow-neo-sm">
                  ⚡ {biodata?.title || biodata?.role || "LEAD PROGRAMMER"}
                </div>
              </div>

              {/* Stat Counters Row */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="border-2 border-black bg-neo-yellow p-2 shadow-neo-sm">
                  <div className="font-black text-2xl text-black uppercase">
                    {biodata?.experience_years_text || (biodata?.experienceYears ? `${biodata.experienceYears} TAHUN` : "7+ TAHUN")}
                  </div>
                  <div className="font-bold text-[11px] uppercase tracking-wider text-gray-800">PENGALAMAN</div>
                </div>
                <div className="border-2 border-black bg-neo-cyan p-2 shadow-neo-sm">
                  <div className="font-black text-2xl text-black uppercase">
                    {biodata?.projects_completed_text || (biodata?.completedProjects ? `${biodata.completedProjects} PROYEK` : "30+ PROYEK")}
                  </div>
                  <div className="font-bold text-[11px] uppercase tracking-wider text-gray-800">SISTEM PRODUKSI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
