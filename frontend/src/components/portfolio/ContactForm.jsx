import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { messageService } from '../../services/api';
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
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg(t('contact.validation_error', 'Harap lengkapi nama, email, dan pesan detail.'));
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await messageService.submitMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || undefined,
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
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
          {errorMsg && (
            <div className="p-3 bg-red-100 dark:bg-red-950/80 border-2 border-red-500 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

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
        </form>
      )}
    </div>
  );
}
