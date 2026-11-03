import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, ExternalLink, Copy, Check } from 'lucide-react';
import ContactForm from '../portfolio/ContactForm';
import { useLanguage } from '../../hooks';

export default function Contact({ biodata }) {
  const { t } = useLanguage();
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <section id="contact" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto border-t-4 border-black dark:border-slate-800 bg-white dark:bg-[#0B0F19] transition-colors duration-150">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-block bg-neo-lilac border-2 border-black text-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm mb-3">
          {t('contact.badge', '07 / HUBUNGI & KOLABORASI')}
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black dark:text-white mb-3 uppercase">
          {t('contact.title', 'MARI MEMULAI PROYEK BARU')}
        </h2>
        <p className="font-bold text-gray-700 dark:text-slate-300 text-sm sm:text-base">
          {t('contact.subtitle', 'Punya ide aplikasi, butuh audit sistem, atau ingin mendiskusikan peluang kerja sama? Kirimkan pesan Anda langsung.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-3 border-black dark:border-slate-700 bg-neo-yellow dark:bg-[#151D2F] p-6 shadow-neo-lg text-black dark:text-white">
            <h3 className="text-xl font-black uppercase mb-4 text-black dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-black dark:text-neo-yellow" />
              {t('contact.direct_title', 'KONTAK LANGSUNG')}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-[#1E293B] border-2 border-black dark:border-slate-700 shadow-neo-sm group">
                <a
                  href={`mailto:${biodata?.email || 'bayukundev@gmail.com'}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="p-2 bg-neo-mint border border-black text-black flex-shrink-0">
                    <Mail className="w-5 h-5 text-black" />
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] font-black uppercase text-gray-600 dark:text-slate-400">
                      {t('contact.email_label', 'Email Address')}
                    </div>
                    <div className="font-bold text-sm text-black dark:text-white group-hover:underline truncate">
                      {biodata?.email || 'bayukundev@gmail.com'}
                    </div>
                  </div>
                </a>

                <button
                  type="button"
                  onClick={(e) => handleCopy(biodata?.email || 'bayukundev@gmail.com', 'email', e)}
                  className={`px-2.5 py-1 text-[11px] font-black uppercase border-2 border-black shadow-neo-sm transition-all flex items-center gap-1 cursor-pointer select-none flex-shrink-0 ${
                    copiedField === 'email'
                      ? 'bg-neo-mint text-black scale-105 shadow-none'
                      : 'bg-neo-yellow text-black hover:bg-black hover:text-white'
                  }`}
                  title={t('contact.copy_btn', 'Salin Email')}
                >
                  {copiedField === 'email' ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{t('contact.copied', '✓ TERSALIN!')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{t('contact.copy_btn', 'SALIN')}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-[#1E293B] border-2 border-black dark:border-slate-700 shadow-neo-sm group">
                <a
                  href={`https://wa.me/62${(biodata?.phone || '08991907216').replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="p-2 bg-neo-pink border border-black text-black flex-shrink-0">
                    <Phone className="w-5 h-5 text-black" />
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] font-black uppercase text-gray-600 dark:text-slate-400">
                      {t('contact.phone_label', 'Phone / WhatsApp')}
                    </div>
                    <div className="font-bold text-sm text-black dark:text-white group-hover:underline truncate">
                      {biodata?.phone || '08991907216'}
                    </div>
                  </div>
                </a>

                <button
                  type="button"
                  onClick={(e) => handleCopy(biodata?.phone || '08991907216', 'phone', e)}
                  className={`px-2.5 py-1 text-[11px] font-black uppercase border-2 border-black shadow-neo-sm transition-all flex items-center gap-1 cursor-pointer select-none flex-shrink-0 ${
                    copiedField === 'phone'
                      ? 'bg-neo-mint text-black scale-105 shadow-none'
                      : 'bg-neo-yellow text-black hover:bg-black hover:text-white'
                  }`}
                  title={t('contact.copy_btn', 'Salin Nomor WhatsApp')}
                >
                  {copiedField === 'phone' ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{t('contact.copied', '✓ TERSALIN!')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{t('contact.copy_btn', 'SALIN')}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#1E293B] border-2 border-black dark:border-slate-700 shadow-neo-sm">
                <div className="p-2 bg-neo-cyan border border-black text-black">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-600 dark:text-slate-400">
                    {t('contact.location_label', 'Lokasi / Domisili')}
                  </div>
                  <div className="font-bold text-sm text-black dark:text-white">
                    {biodata?.location || 'Yogyakarta / Karanganyar'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Profiles Grid */}
          <div className="border-3 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F] p-5 shadow-neo-lg text-black dark:text-white">
            <h4 className="font-black text-sm uppercase mb-3 text-black dark:text-white">
              {t('contact.social_title', 'MEDIA SOSIAL & JEJARING RESMI')}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-black">
              {biodata?.social_links && biodata.social_links.length > 0 ? (
                biodata.social_links.map((linkItem, idx) => (
                  <a
                    key={idx}
                    href={linkItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 border-2 border-black dark:border-slate-700 bg-neo-offwhite dark:bg-[#1E293B] hover:bg-neo-yellow hover:text-black dark:hover:bg-neo-yellow dark:hover:text-black shadow-neo-sm transition-colors text-black dark:text-slate-200"
                  >
                    <ExternalLink className="w-4 h-4 text-current flex-shrink-0" />
                    <span className="truncate">{linkItem.platform}</span>
                  </a>
                ))
              ) : (
                <>
                  <a
                    href={biodata?.socials?.github || 'https://github.com/BayuKun28'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 border-2 border-black dark:border-slate-700 bg-neo-offwhite dark:bg-[#1E293B] hover:bg-neo-yellow hover:text-black dark:hover:bg-neo-yellow dark:hover:text-black shadow-neo-sm transition-colors text-black dark:text-slate-200"
                  >
                    <ExternalLink className="w-4 h-4 text-current flex-shrink-0" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href={biodata?.socials?.facebook || 'https://www.facebook.com/bhayou.bluedevil/'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 border-2 border-black dark:border-slate-700 bg-neo-offwhite dark:bg-[#1E293B] hover:bg-neo-mint hover:text-black dark:hover:bg-neo-mint dark:hover:text-black shadow-neo-sm transition-colors text-black dark:text-slate-200"
                  >
                    <ExternalLink className="w-4 h-4 text-current flex-shrink-0" />
                    <span>Facebook</span>
                  </a>
                  <a
                    href={biodata?.socials?.twitter || 'https://x.com/namedbay33'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 border-2 border-black dark:border-slate-700 bg-neo-offwhite dark:bg-[#1E293B] hover:bg-neo-pink hover:text-black dark:hover:bg-neo-pink dark:hover:text-black shadow-neo-sm transition-colors text-black dark:text-slate-200"
                  >
                    <ExternalLink className="w-4 h-4 text-current flex-shrink-0" />
                    <span>Twitter (X)</span>
                  </a>
                  <a
                    href={biodata?.socials?.instagram || 'https://www.instagram.com/bayukun_28/'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 border-2 border-black dark:border-slate-700 bg-neo-offwhite dark:bg-[#1E293B] hover:bg-neo-cyan hover:text-black dark:hover:bg-neo-cyan dark:hover:text-black shadow-neo-sm transition-colors text-black dark:text-slate-200"
                  >
                    <ExternalLink className="w-4 h-4 text-current flex-shrink-0" />
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
