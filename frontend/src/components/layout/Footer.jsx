import React from 'react';

export default function Footer({ biodata }) {
  return (
    <footer className="border-t-4 border-black bg-black text-white px-4 sm:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b-2 border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neo-yellow border-2 border-white shadow-[2px_2px_0px_#fff] flex items-center justify-center font-black text-black text-lg">
              IB
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white">INFOBAY</span>
              <p className="text-xs font-bold text-gray-400">
                Portofolio Resmi &bull; Bayu Prastyo (baydev / bayukun / masbay)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-black">
            <span className="bg-neo-pink text-black px-2.5 py-1 border border-white">
              NEUBRUTALISM AUTHENTIC
            </span>
            <span className="bg-neo-mint text-black px-2.5 py-1 border border-white">
              PRODUCTION READY
            </span>
          </div>
        </div>

        {/* SEO Semantic Tag Cloud & Aliases (Visually hidden with sr-only for clean UI while preserving search engine crawler indexing) */}
        <div className="sr-only" aria-hidden="false">
          <span>Indexing &amp; Search Keywords:</span>
          <div>
            <span>Bayu Prastyo</span>
            <span>baydev</span>
            <span>bayukun</span>
            <span>masbay</span>
            <span>BayuKun28</span>
            <span>Full-Stack Engineer</span>
            <span>Laravel 13 &amp; PostgreSQL 17</span>
            <span>ReactJS &amp; Next.js</span>
            <span>Web Developer Yogyakarta</span>
            <span>Programmer Karanganyar</span>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-400">
          <div>
            &copy; {new Date().getFullYear()} <strong>Bayu Prastyo (baydev / bayukun / masbay)</strong>. Seluruh Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span>Dirancang &amp; Direkayasa dengan Standar Kualitas, Aksesibilitas, dan Performa Tinggi.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
