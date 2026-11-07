import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicProfile } from '../services';
import { defaultProfileData } from '../data/profileData';

export default function ResumePage() {
  const [data, setData] = useState(defaultProfileData);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const result = await getPublicProfile();
        if (isMounted && result) {
          setData(result);
        }
      } catch (err) {
        console.error('Failed to load resume profile data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const bio = data?.biodata || defaultProfileData.biodata;
  const experiences = Array.isArray(data?.experience) ? data.experience : [];
  const educations = Array.isArray(data?.education) ? data.education : [];
  const certifications = Array.isArray(data?.certifications) ? data.certifications : [];
  const portfolios = Array.isArray(data?.portfolios) ? data.portfolios : [];
  const techStack = Array.isArray(data?.techStack) ? data.techStack : [];

  // Filter top 4 featured or recent projects for resume inclusion
  const topProjects = portfolios
    .filter((p) => p.featured || p.is_featured)
    .slice(0, 4);
  const displayProjects = topProjects.length > 0 ? topProjects : portfolios.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-slate-900 font-sans">
      {/* Floating Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <span>&larr;</span> Kembali ke Portofolio
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            {copied ? 'Tautan Disalin!' : 'Bagikan Resume'}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#FFDE59] hover:bg-[#FACC15] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* Main Resume Sheet (A4 ATS Standard) */}
      <main className="max-w-4xl mx-auto bg-white p-8 sm:p-12 border-2 border-black sm:shadow-[8px_8px_0px_#000] print:border-none print:shadow-none print:p-0">
        {loading ? (
          <div className="py-20 text-center font-mono text-sm text-slate-500">
            Menyiapkan ringkasan resume dari database...
          </div>
        ) : (
          <article className="space-y-6">
            {/* Header Section */}
            <header className="border-b-2 border-black pb-5">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black uppercase">
                {bio.name || 'Bayu Prastyo'}
              </h1>
              <p className="text-base sm:text-lg font-bold text-slate-700 mt-1 uppercase tracking-wide">
                {bio.title || 'Full-Stack Software Engineer'}
              </p>
              
              {/* Contact & Social Links */}
              <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-slate-600 print:text-[11px]">
                {bio.location && <span>📍 {bio.location}</span>}
                {bio.email && (
                  <a href={`mailto:${bio.email}`} className="hover:underline">
                    ✉️ {bio.email}
                  </a>
                )}
                {bio.phone && (
                  <a href={`tel:${bio.phone}`} className="hover:underline">
                    📞 {bio.phone}
                  </a>
                )}
                {bio.github && (
                  <a href={bio.github} target="_blank" rel="noreferrer" className="hover:underline">
                    🌐 GitHub: {bio.github.replace('https://github.com/', '')}
                  </a>
                )}
                <a href="https://baydev.my.id" target="_blank" rel="noreferrer" className="hover:underline">
                  🔗 Portfolio: baydev.my.id
                </a>
              </div>
            </header>

            {/* Professional Summary */}
            {bio.about && (
              <section className="break-inside-avoid">
                <h2 className="text-xs font-black uppercase tracking-widest text-black bg-slate-100 print:bg-transparent px-2 py-1 -mx-2 mb-2 border-l-4 border-black">
                  Ringkasan Profesional
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                  {bio.about}
                </p>
              </section>
            )}

            {/* Core Technical Competencies */}
            {techStack.length > 0 && (
              <section className="break-inside-avoid">
                <h2 className="text-xs font-black uppercase tracking-widest text-black bg-slate-100 print:bg-transparent px-2 py-1 -mx-2 mb-2 border-l-4 border-black">
                  Keahlian Teknis &amp; Tech Stack
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[11px] font-bold border border-slate-300 rounded bg-slate-50 text-slate-800 print:border-slate-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Work Experience */}
            {experiences.length > 0 && (
              <section className="break-inside-avoid">
                <h2 className="text-xs font-black uppercase tracking-widest text-black bg-slate-100 print:bg-transparent px-2 py-1 -mx-2 mb-3 border-l-4 border-black">
                  Pengalaman Kerja
                </h2>
                <div className="space-y-4">
                  {experiences.map((exp, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex flex-wrap justify-between items-baseline gap-1">
                        <h3 className="text-xs sm:text-sm font-bold text-black uppercase">
                          {exp.role || exp.title}
                          {exp.title && exp.role && exp.title !== exp.role && (
                            <span className="font-normal text-slate-600"> &bull; {exp.title}</span>
                          )}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-600 whitespace-nowrap">
                          {exp.period}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Featured Projects */}
            {displayProjects.length > 0 && (
              <section className="break-inside-avoid">
                <h2 className="text-xs font-black uppercase tracking-widest text-black bg-slate-100 print:bg-transparent px-2 py-1 -mx-2 mb-3 border-l-4 border-black">
                  Proyek Unggulan Terpilih
                </h2>
                <div className="space-y-3">
                  {displayProjects.map((p, idx) => (
                    <div key={idx} className="break-inside-avoid border-l-2 border-slate-200 pl-3">
                      <div className="flex flex-wrap justify-between items-baseline gap-1">
                        <h3 className="text-xs sm:text-sm font-bold text-black">
                          {p.title}
                          {p.category && (
                            <span className="ml-2 text-[10px] font-mono font-medium text-slate-500 uppercase">
                              [{p.category}]
                            </span>
                          )}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-500">
                          {p.project_year || 'Production'}
                        </span>
                      </div>
                      {p.description && (
                        <p className="mt-0.5 text-xs text-slate-700 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      {Array.isArray(p.tech_stack) && p.tech_stack.length > 0 && (
                        <p className="mt-1 text-[10px] text-slate-500 font-mono">
                          Tech: {p.tech_stack.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <section className="break-inside-avoid">
                <h2 className="text-xs font-black uppercase tracking-widest text-black bg-slate-100 print:bg-transparent px-2 py-1 -mx-2 mb-3 border-l-4 border-black">
                  Pendidikan Formal
                </h2>
                <div className="space-y-3">
                  {educations.map((edu, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex flex-wrap justify-between items-baseline gap-1">
                        <h3 className="text-xs sm:text-sm font-bold text-black uppercase">
                          {edu.title}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-600">
                          {edu.period}
                        </span>
                      </div>
                      {edu.field && (
                        <p className="text-xs font-medium text-slate-700">{edu.field}</p>
                      )}
                      {edu.description && (
                        <p className="mt-0.5 text-xs text-slate-600">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <section className="break-inside-avoid">
                <h2 className="text-xs font-black uppercase tracking-widest text-black bg-slate-100 print:bg-transparent px-2 py-1 -mx-2 mb-2 border-l-4 border-black">
                  Sertifikasi &amp; Pelatihan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="text-xs border border-slate-200 p-2 rounded print:border-slate-300">
                      <p className="font-bold text-black">{cert.name}</p>
                      <p className="text-[11px] text-slate-600">
                        {cert.issuer} {cert.issue_date ? `(${cert.issue_date})` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Footer / Verification */}
            <footer className="pt-4 border-t border-slate-200 text-center font-mono text-[10px] text-slate-400 print:text-slate-500">
              Dokumen ini dihasilkan secara otomatis dari infobay API (https://baydev.my.id) &bull; Terverifikasi ATS-Friendly
            </footer>
          </article>
        )}
      </main>
    </div>
  );
}
