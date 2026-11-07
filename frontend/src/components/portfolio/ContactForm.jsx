import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, RotateCcw, Sparkles } from 'lucide-react';
import { messageService, analyticsService } from '../../services/api';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useLanguage } from '../../hooks';

export default function ContactForm({ className = '' }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [projectType, setProjectType] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const projectTypes = [
    { id: 'web', label: t('contact.quick_web', 'Web Application'), icon: '🌐' },
    { id: 'api', label: t('contact.quick_api', 'Backend & REST API'), icon: '⚙️' },
    { id: 'homelab', label: t('contact.quick_homelab', 'Homelab & DevOps'), icon: '🖥️' },
    { id: 'consult', label: t('contact.quick_consult', 'Konsultasi IT & Audit'), icon: '💡' },
    { id: 'mobile', label: t('contact.quick_mobile', 'Mobile App'), icon: '📱' },
  ];

  const handleSelectProjectType = (type) => {
    if (projectType === type.label) {
      setProjectType('');
    } else {
      setProjectType(type.label);
      // Auto-suggest subject if empty or starts with previous type
      if (!formData.subject || formData.subject.startsWith('Diskusi Proyek:')) {
        setFormData((prev) => ({
          ...prev,
          subject: `Diskusi Proyek: ${type.label}`,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg(t('contact.validation_error', 'Harap lengkapi nama, email, dan pesan detail.'));
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const finalSubject = projectType && !formData.subject.includes(projectType)
        ? `[${projectType}] ${formData.subject.trim() || 'Inquiry Proyek'}`
        : formData.subject.trim() || undefined;

      await messageService.submitMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: finalSubject,
        message: formData.message.trim(),
        project_type: projectType || undefined,
        website_hp: honeypot || undefined,
      });

      try {
        analyticsService.recordVisit({
          event_type: 'contact_submit',
          page: '/#contact',
          event_data: { project_type: projectType || 'General' },
        });
      } catch (_) {}

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setProjectType('');
    } catch (err) {
      console.error('Submit message failed:', err);
      const resMsg =
        err.response?.data?.message ||
        'Gagal mengirim pesan ke server. Mohon periksa koneksi Anda dan coba lagi.';
      setErrorMsg(resMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`border-4 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F] p-6 sm:p-8 shadow-neo-lg relative ${className}`}
    >
      {/* Corner badge */}
      <div className="absolute -top-3.5 right-6 bg-neo-yellow border-2 border-black text-black px-3 py-0.5 font-black text-xs uppercase shadow-neo-sm">
        {t('contact.form_badge', 'FORMULIR PESAN')}
      </div>

      {submitted ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 bg-neo-mint border-3 border-black shadow-neo-md mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-black stroke-[2.5]" />
          </div>
          <h4 className="text-2xl font-black text-black dark:text-white">
            {t('contact.success_title', 'PESAN BERHASIL TERKIRIM!')}
          </h4>
          <p className="text-sm font-bold text-gray-700 dark:text-slate-300 max-w-md mx-auto">
            {t(
              'contact.success_desc',
              'Terima kasih telah menghubungi saya. Pesan Anda telah masuk ke inbox admin dan saya akan segera merespons via email.'
            )}
          </p>
          <Button
            variant="yellow"
            onClick={() => setSubmitted(false)}
            icon={RotateCcw}
            className="mt-4"
          >
            {t('contact.send_another', 'KIRIM PESAN LAIN')}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field for anti-spambots (invisible to humans) */}
          <div style={{ display: 'none', position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
            <label htmlFor="website_hp">Leave this empty</label>
            <input
              type="text"
              id="website_hp"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-100 dark:bg-red-950/80 border-2 border-red-500 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick-Pill Project Type Selector (HABIBIE PLAN-20261103-01) */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neo-pink" />
              <span>{t('contact.project_type_label', 'Pilih Kategori Kebutuhan Proyek (Quick Selector):')}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {projectTypes.map((type) => {
                const isSelected = projectType === type.label;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleSelectProjectType(type)}
                    className={`px-3 py-1.5 border-2 border-black dark:border-slate-600 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-neo-yellow text-black shadow-neo translate-x-0.5 translate-y-0.5'
                        : 'bg-neo-offwhite dark:bg-[#1E293B] text-black dark:text-slate-200 shadow-neo-sm hover:bg-neo-mint hover:text-black dark:hover:bg-neo-mint dark:hover:text-black'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('contact.name_label', 'Nama Lengkap')}
              placeholder={t('contact.name_placeholder', 'Contoh: Budi Santoso')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label={t('contact.email_label', 'Alamat Email')}
              type="email"
              placeholder={t('contact.email_placeholder', 'budi@example.com')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <Input
            label={t('contact.subject_label', 'Subjek / Topik Proyek')}
            placeholder={t('contact.subject_placeholder', 'Pengembangan Web App / Konsultasi API')}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />

          <Input
            label={t('contact.message_label', 'Detail Pesan / Kebutuhan')}
            multiline
            rows={5}
            placeholder={t(
              'contact.message_placeholder',
              'Jelaskan kebutuhan aplikasi, estimasi waktu, atau lingkup proyek Anda...'
            )}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
          />

          <Button
            type="submit"
            variant="yellow"
            size="lg"
            loading={loading}
            icon={Send}
            className="w-full mt-2"
          >
            {loading ? t('contact.submitting', 'MENGIRIMKAN PESAN...') : t('contact.submit', 'KIRIM PESAN SEKARANG')}
          </Button>

          {/* Direct WhatsApp Consultation Shortcut */}
          <div className="pt-2 text-center">
            <a
              href="https://wa.me/628991907216?text=Halo%20Mas%20Bay,%20saya%20tertarik%20mendiskusikan%20kebutuhan%20proyek%20sistem%20web"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-black text-gray-700 dark:text-slate-300 hover:text-black dark:hover:text-neo-yellow underline underline-offset-4 decoration-2"
            >
              <span>{t('contact.wa_direct', '💬 Butuh respon cepat? Hubungi langsung via WhatsApp Resmi')}</span>
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
