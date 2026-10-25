import React from 'react';
import { Mail, Phone, MapPin, MessageSquare, ExternalLink } from 'lucide-react';
import ContactForm from '../portfolio/ContactForm';

export default function Contact({ biodata }) {
  return (
    <section id="contact" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black bg-white">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-block bg-neo-lilac border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-3">
          07 / HUBUNGI &amp; KOLABORASI
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black mb-3 uppercase">
          MARI MEMULAI PROYEK BARU
        </h2>
        <p className="font-bold text-gray-700 text-sm sm:text-base">
          Punya ide aplikasi, butuh audit sistem, atau ingin mendiskusikan peluang kerja sama? Kirimkan pesan Anda langsung.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-3 border-black bg-neo-yellow p-6 shadow-neo-lg">
            <h3 className="text-xl font-black uppercase mb-4 text-black flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-black" />
              KONTAK LANGSUNG
            </h3>

            <div className="space-y-3">
              <a
                href={`mailto:${biodata?.email || 'bayukundev@gmail.com'}`}
                className="flex items-center gap-3 p-3 bg-white border-2 border-black shadow-neo-sm hover:translate-x-1 transition-transform group"
              >
                <div className="p-2 bg-neo-mint border border-black">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-600">Email Address</div>
                  <div className="font-bold text-sm text-black group-hover:underline">
                    {biodata?.email || 'bayukundev@gmail.com'}
                  </div>
                </div>
              </a>

              <a
                href={`https://wa.me/62${(biodata?.phone || '08991907216').replace(/^0/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-white border-2 border-black shadow-neo-sm hover:translate-x-1 transition-transform group"
              >
                <div className="p-2 bg-neo-pink border border-black">
                  <Phone className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-600">Phone / WhatsApp</div>
                  <div className="font-bold text-sm text-black group-hover:underline">
                    {biodata?.phone || '08991907216'}
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 bg-white border-2 border-black shadow-neo-sm">
                <div className="p-2 bg-neo-cyan border border-black">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-600">Lokasi / Domisili</div>
                  <div className="font-bold text-sm text-black">
                    {biodata?.location || 'Yogyakarta / Karanganyar'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Profiles Grid */}
          <div className="border-3 border-black bg-white p-5 shadow-neo-lg">
            <h4 className="font-black text-sm uppercase mb-3 text-black">MEDIA SOSIAL &amp; JEJARING RESMI</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-black">
              {biodata?.social_links && biodata.social_links.length > 0 ? (
                biodata.social_links.map((linkItem, idx) => (
                  <a
                    key={idx}
                    href={linkItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 border-2 border-black bg-neo-offwhite hover:bg-neo-yellow shadow-neo-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-black flex-shrink-0" />
                    <span className="truncate">{linkItem.platform}</span>
                  </a>
                ))
              ) : (
                <>
                  <a
                    href={biodata?.socials?.github || 'https://github.com/BayuKun28'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 border-2 border-black bg-neo-offwhite hover:bg-neo-yellow shadow-neo-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-black flex-shrink-0" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href={biodata?.socials?.facebook || 'https://www.facebook.com/bhayou.bluedevil/'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 border-2 border-black bg-neo-offwhite hover:bg-neo-mint shadow-neo-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-black flex-shrink-0" />
                    <span>Facebook</span>
                  </a>
                  <a
                    href={biodata?.socials?.twitter || 'https://x.com/namedbay33'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 border-2 border-black bg-neo-offwhite hover:bg-neo-pink shadow-neo-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-black flex-shrink-0" />
                    <span>Twitter (X)</span>
                  </a>
                  <a
                    href={biodata?.socials?.instagram || 'https://www.instagram.com/bayukun_28/'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 border-2 border-black bg-neo-offwhite hover:bg-neo-cyan shadow-neo-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-black flex-shrink-0" />
                    <span>Instagram</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Reusable ContactForm */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
