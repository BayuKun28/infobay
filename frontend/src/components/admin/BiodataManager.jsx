import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
  Chip,
  MenuItem,
  Card,
  CardContent,
  Tooltip,
  Link,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PublicIcon from '@mui/icons-material/Public';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getStorageUrl } from '../../utils';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TerminalIcon from '@mui/icons-material/Terminal';
import { adminService } from '../../services/api';

const POPULAR_PLATFORMS = [
  'GitHub',
  'LinkedIn',
  'Twitter / X',
  'Instagram',
  'YouTube',
  'TikTok',
  'Telegram',
  'Discord',
  'Facebook',
  'WhatsApp',
  'Personal Website / Blog',
];

export default function BiodataManager({ biodata, onRefresh, showToast, onOpenProfileModal }) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    avatar: '',
    about: '',
    hero_headline: '',
    hero_subheadline: '',
    role_badge: '',
    experience_years_text: '',
    projects_completed_text: '',
    cv_file_url: '',
    specialization: '',
    work_status: '',
    terminal_user_host: 'baydev@workstation:~$',
    terminal_lines_text: '',
    announcement_bar: '',
    meta_description: '',
    og_image: '',
  });

  // Dynamic social links array of { platform: '', url: '' }
  const [socialLinks, setSocialLinks] = useState([]);
  const [aliases, setAliases] = useState(['baydev', 'bayukun', 'masbay (Mas Bay)', 'BayuKun28']);
  const [newAliasInput, setNewAliasInput] = useState('');
  const [engineeringPrinciples, setEngineeringPrinciples] = useState([
    { title: 'Architecture First', desc: 'Desain database relasional kokoh, query terindeks, dan skema bersih.' },
    { title: 'Authentic UX', desc: 'Menghadirkan antarmuka otentik, responsif, dan bebas dari template generik.' },
    { title: 'Rock-Solid Security', desc: 'Proteksi autentikasi, CORS presisi, sanitasi input, dan audit berkelanjutan.' },
  ]);

  const defaultTerminalShortcuts = ['help', 'whoami', 'skills', 'services', 'projects', 'contact', 'clear'];
  const [terminalShortcuts, setTerminalShortcuts] = useState(defaultTerminalShortcuts);
  const [newShortcutInput, setNewShortcutInput] = useState('');
  const [customCommands, setCustomCommands] = useState([]);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // CV Upload state
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (biodata) {
      const defaultPrinciples = [
        { title: 'Architecture First', desc: 'Desain database relasional kokoh, query terindeks, dan skema bersih.' },
        { title: 'Authentic UX', desc: 'Menghadirkan antarmuka otentik, responsif, dan bebas dari template generik.' },
        { title: 'Rock-Solid Security', desc: 'Proteksi autentikasi, CORS presisi, sanitasi input, dan audit berkelanjutan.' },
      ];

      const defaultTerminalLines = [
        'whoami: Bayu Prastyo - Full-Stack Developer & Solutions Architect',
        'specialization: Laravel, React, PostgreSQL & Enterprise Architecture',
        'status: Available for Freelance & Enterprise Solutions',
      ];

      const currentTerminalLines = Array.isArray(biodata.terminal_widget?.lines)
        ? biodata.terminal_widget.lines.join('\n')
        : typeof biodata.terminal_widget === 'string'
        ? biodata.terminal_widget
        : defaultTerminalLines.join('\n');

      // Load terminal shortcuts
      if (Array.isArray(biodata.terminal_widget?.shortcuts) && biodata.terminal_widget.shortcuts.length > 0) {
        setTerminalShortcuts(biodata.terminal_widget.shortcuts);
      } else {
        setTerminalShortcuts(defaultTerminalShortcuts);
      }

      // Load custom commands
      if (Array.isArray(biodata.terminal_widget?.custom_commands)) {
        setCustomCommands(biodata.terminal_widget.custom_commands);
      } else {
        setCustomCommands([]);
      }

      setFormData({
        name: biodata.name || '',
        title: biodata.title || '',
        email: biodata.email || '',
        phone: biodata.phone || '',
        location: biodata.location || '',
        avatar: biodata.avatar || '',
        about: biodata.about || '',
        hero_headline: biodata.hero_headline || '',
        hero_subheadline: biodata.hero_subheadline || '',
        role_badge: biodata.role_badge || '',
        experience_years_text: biodata.experience_years_text || '',
        projects_completed_text: biodata.projects_completed_text || '',
        cv_file_url: biodata.cv_file_url || '',
        specialization: biodata.specialization || 'Web Application & API Systems',
        work_status: biodata.work_status || 'Open for Remote & Hybrid Roles',
        terminal_user_host: biodata.terminal_widget?.user_host || 'baydev@workstation:~$',
        terminal_lines_text: currentTerminalLines,
        announcement_bar: biodata.announcement_bar || '',
        meta_description: biodata.meta_description || '',
        og_image: biodata.og_image || '',
      });

      setAvatarPreview(biodata.avatar || '');

      // Load dynamic aliases
      if (biodata.aliases && Array.isArray(biodata.aliases) && biodata.aliases.length > 0) {
        setAliases(biodata.aliases);
      } else {
        setAliases(['baydev', 'bayukun', 'masbay (Mas Bay)', 'BayuKun28']);
      }

      // Load engineering principles
      if (biodata.engineering_principles && Array.isArray(biodata.engineering_principles) && biodata.engineering_principles.length > 0) {
        setEngineeringPrinciples(biodata.engineering_principles);
      } else {
        setEngineeringPrinciples(defaultPrinciples);
      }

      // Load dynamic social_links or fallback to legacy socials
      if (biodata.social_links && Array.isArray(biodata.social_links) && biodata.social_links.length > 0) {
        setSocialLinks(biodata.social_links);
      } else if (biodata.socials) {
        const initial = [];
        if (biodata.socials.github) initial.push({ platform: 'GitHub', url: biodata.socials.github });
        if (biodata.socials.facebook) initial.push({ platform: 'Facebook', url: biodata.socials.facebook });
        if (biodata.socials.twitter) initial.push({ platform: 'Twitter / X', url: biodata.socials.twitter });
        if (biodata.socials.instagram) initial.push({ platform: 'Instagram', url: biodata.socials.instagram });
        setSocialLinks(initial);
      } else {
        setSocialLinks([]);
      }
    }
  }, [biodata]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Hanya file PDF yang diperbolehkan untuk CV!', 'warning');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('Ukuran file CV maksimal 10MB!', 'warning');
        return;
      }
      setCvFile(file);
    }
  };

  const handleUploadCvDirect = async () => {
    if (!cvFile) return;
    setCvUploading(true);
    try {
      const res = await adminService.uploadCv(cvFile);
      if (res?.cv_file_url) {
        setFormData((prev) => ({ ...prev, cv_file_url: res.cv_file_url }));
        showToast('File CV (PDF) berhasil diunggah langsung ke server!', 'success');
        setCvFile(null);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('CV upload error:', err);
      showToast(err.response?.data?.message || 'Gagal mengunggah file CV', 'error');
    } finally {
      setCvUploading(false);
    }
  };

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'LinkedIn', url: '' }]);
  };

  const handleUpdateSocialLink = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const handleRemoveSocialLink = (index) => {
    const updated = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updated);
  };

  const handleAddAlias = () => {
    const trimmed = newAliasInput.trim();
    if (trimmed && !aliases.includes(trimmed)) {
      setAliases([...aliases, trimmed]);
      setNewAliasInput('');
    }
  };

  const handleRemoveAlias = (idx) => {
    setAliases(aliases.filter((_, i) => i !== idx));
  };

  const handleAddPrinciple = () => {
    setEngineeringPrinciples([...engineeringPrinciples, { title: '', desc: '' }]);
  };

  const handleUpdatePrinciple = (idx, field, val) => {
    const updated = [...engineeringPrinciples];
    updated[idx][field] = val;
    setEngineeringPrinciples(updated);
  };

  const handleRemovePrinciple = (idx) => {
    setEngineeringPrinciples(engineeringPrinciples.filter((_, i) => i !== idx));
  };

  const handleAddShortcut = () => {
    const trimmed = (newShortcutInput || '').trim().toLowerCase().replace(/^\$/, '').trim();
    if (!trimmed) return;
    if (terminalShortcuts.includes(trimmed)) {
      showToast('Shortcut sudah ada dalam daftar.', 'warning');
      return;
    }
    setTerminalShortcuts([...terminalShortcuts, trimmed]);
    setNewShortcutInput('');
  };

  const handleDeleteShortcut = (indexToRemove) => {
    setTerminalShortcuts(terminalShortcuts.filter((_, idx) => idx !== indexToRemove));
  };

  const handleResetShortcuts = () => {
    setTerminalShortcuts(defaultTerminalShortcuts);
    showToast('Shortcut terminal direset ke default.', 'info');
  };

  const handleAddCustomCommand = () => {
    setCustomCommands([...customCommands, { command: '', output: '' }]);
  };

  const handleUpdateCustomCommand = (index, field, value) => {
    const updated = [...customCommands];
    updated[index] = { ...updated[index], [field]: value };
    setCustomCommands(updated);
  };

  const handleDeleteCustomCommand = (indexToRemove) => {
    setCustomCommands(customCommands.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalAvatarUrl = formData.avatar;
      let finalCvUrl = formData.cv_file_url;

      // If user uploaded a new avatar file
      if (avatarFile) {
        try {
          const uploadRes = await adminService.uploadImage(avatarFile);
          if (uploadRes?.url) {
            finalAvatarUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn('Avatar upload fallback:', uploadErr);
        }
      }

      // If user selected a new CV file without clicking direct upload
      if (cvFile) {
        try {
          const cvRes = await adminService.uploadCv(cvFile);
          if (cvRes?.cv_file_url) {
            finalCvUrl = cvRes.cv_file_url;
          }
        } catch (cvErr) {
          console.warn('CV upload fallback:', cvErr);
        }
      }

      // Clean social links
      const cleanSocialLinks = socialLinks.filter((item) => item.platform && item.url);

      const payload = {
        ...formData,
        avatar: finalAvatarUrl,
        cv_file_url: finalCvUrl,
        social_links: cleanSocialLinks,
        aliases: aliases.filter(Boolean),
        engineering_principles: engineeringPrinciples.filter((p) => p.title && p.title.trim()),
        terminal_widget: {
          user_host: formData.terminal_user_host || 'baydev@workstation:~$',
          shortcuts: terminalShortcuts.filter(Boolean),
          lines: formData.terminal_lines_text
            ? formData.terminal_lines_text
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean)
            : [
                'whoami: Bayu Prastyo - Full-Stack Developer & Solutions Architect',
                'specialization: Laravel, React, PostgreSQL & Enterprise Architecture',
                'status: Available for Freelance & Enterprise Solutions',
              ],
          custom_commands: customCommands
            .filter((c) => c.command && c.command.trim())
            .map((c) => ({
              command: c.command.trim().toLowerCase().replace(/^\$/, '').trim(),
              output: c.output || '',
            })),
        },
        marquee_items: [],
      };

      await adminService.updateBiodata(payload);
      showToast('Biodata profil, Hero customizer, & CV berhasil disimpan!', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Update biodata error:', err);
      showToast(err.response?.data?.message || 'Gagal menyimpan biodata', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        {/* Profile Header Avatar Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 2.5,
            mb: 3,
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={avatarPreview || formData.avatar}
              alt={formData.name}
              sx={{
                width: 84,
                height: 84,
                border: 3,
                borderColor: 'primary.main',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              }}
            >
              <PersonIcon sx={{ fontSize: 44 }} />
            </Avatar>
            <input
              type="file"
              accept="image/*"
              id="avatar-upload-input"
              style={{ display: 'none' }}
              onChange={handleAvatarFileChange}
            />
            <label htmlFor="avatar-upload-input">
              <Button
                component="span"
                size="small"
                variant="outlined"
                startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
                sx={{
                  mt: 1.2,
                  fontSize: '0.78rem',
                  py: 0.5,
                  px: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Ubah Foto
              </Button>
            </label>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', md: 'flex-start' }, gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight="800">
                Profil Pengembang &amp; Konfigurasi Portofolio
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Kelola identitas publik, tampilan Hero Section, berkas CV, dan tautan sosial media.
              </Typography>
            </Box>

            {onOpenProfileModal && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 18 }} />}
                onClick={onOpenProfileModal}
                sx={{
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: 2,
                  py: 0.8,
                  px: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.12)' : 'rgba(67, 56, 202, 0.06)',
                  },
                }}
              >
                Ganti Password &amp; Akun Admin
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* SECTION 1: BIODATA DASAR */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={800} color="primary">
                1. Data Personal &amp; Kontak Utama
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Nama Lengkap"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Gelar / Title Profesi"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Resmi"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Nomor Telepon / WhatsApp"
                fullWidth
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Domisili / Lokasi"
                fullWidth
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="URL Avatar (Fallback)"
                fullWidth
                value={formData.avatar}
                onChange={(e) => {
                  setFormData({ ...formData, avatar: e.target.value });
                  setAvatarPreview(e.target.value);
                }}
                size="small"
                helperText="Bisa diisi URL gambar langsung atau gunakan tombol Ubah Foto di atas"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Biografi & About Me"
                fullWidth
                multiline
                rows={3}
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                size="small"
                placeholder="Ceritakan tentang diri Anda, keahlian, dan minat..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Spesialisasi Profil (About Me Box)"
                fullWidth
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                size="small"
                placeholder="e.g. Web Application & API Systems"
                helperText="Tampil di kartu profil seksi About Me halaman publik"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Status Ketersediaan Kerja"
                fullWidth
                value={formData.work_status}
                onChange={(e) => setFormData({ ...formData, work_status: e.target.value })}
                size="small"
                placeholder="e.g. Open for Remote & Hybrid Roles"
                helperText="Status ketersediaan kontrak/pekerjaan di seksi About Me"
              />
            </Grid>

            {/* SECTION 2: HERO SECTION CUSTOMIZER */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mt: 1 }}>
                2. Hero Section Customizer (Halaman Depan)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sesuaikan teks headline utama, pengantar, badge ketersediaan, dan counter statistik pada banner atas halaman depan.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Hero Headline Utama"
                fullWidth
                size="small"
                placeholder="e.g. Full-Stack Web Developer & Solutions Architect"
                value={formData.hero_headline}
                onChange={(e) => setFormData({ ...formData, hero_headline: e.target.value })}
                helperText="Headline besar yang muncul pertama kali di beranda"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Role / Availability Badge"
                fullWidth
                size="small"
                placeholder="e.g. Available for Projects atau Open for Work"
                value={formData.role_badge}
                onChange={(e) => setFormData({ ...formData, role_badge: e.target.value })}
                helperText="Badge animasi berkedip hijau di bagian atas hero"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Teks Pengalaman Kerja (Counter)"
                fullWidth
                size="small"
                placeholder="e.g. 7+ Tahun"
                value={formData.experience_years_text}
                onChange={(e) => setFormData({ ...formData, experience_years_text: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Teks Proyek Selesai (Counter)"
                fullWidth
                size="small"
                placeholder="e.g. 30+ Proyek"
                value={formData.projects_completed_text}
                onChange={(e) => setFormData({ ...formData, projects_completed_text: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Hero Subheadline / Narasi Singkat"
                fullWidth
                multiline
                rows={2}
                size="small"
                placeholder="Paragraf narasi pembuka yang menyapa pengunjung di bawah headline..."
                value={formData.hero_subheadline}
                onChange={(e) => setFormData({ ...formData, hero_subheadline: e.target.value })}
              />
            </Grid>

            {/* SECTION 3: CV / RESUME MANAGER */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mt: 1 }}>
                3. Manajemen Berkas CV / Resume (PDF)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Unggah berkas CV terbaru dalam format PDF (maks. 10MB). Tautan unduh akan otomatis muncul pada tombol di halaman publik.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15, 23, 42, 0.02)',
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={7}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'error.main', width: 44, height: 44 }}>
                        <PictureAsPdfIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {formData.cv_file_url ? 'Berkas CV Tersedia di Server' : 'Belum Ada Berkas CV'}
                        </Typography>
                        {formData.cv_file_url ? (
                          <Link
                            href={getStorageUrl(formData.cv_file_url)}
                            target="_blank"
                            rel="noreferrer"
                            sx={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}
                          >
                            Buka / Unduh CV Saat Ini <OpenInNewIcon sx={{ fontSize: 13 }} />
                          </Link>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Silakan pilih file PDF dari komputer Anda untuk mengunggah.
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={5} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, justifyContent: 'flex-end' }}>
                    <input
                      type="file"
                      accept="application/pdf"
                      id="cv-pdf-upload"
                      style={{ display: 'none' }}
                      onChange={handleCvFileChange}
                    />
                    <label htmlFor="cv-pdf-upload">
                      <Button
                        component="span"
                        size="small"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ fontWeight: 700, textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                      >
                        {cvFile ? cvFile.name : 'Pilih File PDF'}
                      </Button>
                    </label>

                    {cvFile && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={handleUploadCvDirect}
                        disabled={cvUploading}
                        sx={{ fontWeight: 700, textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                      >
                        {cvUploading ? <CircularProgress size={18} color="inherit" /> : 'Unggah Sekarang'}
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* SECTION 4: DYNAMIC SOCIAL LINKS */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.03)',
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight="800" color="text.primary">
                      4. Tautan Jejaring Sosial (Dynamic JSON)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tambah, edit, atau hapus sosmed apa saja tanpa batasan platform.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddCircleOutlineIcon sx={{ fontSize: 18 }} />}
                    onClick={handleAddSocialLink}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Tambah Media Sosial
                  </Button>
                </Box>

                {socialLinks.length === 0 ? (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <PublicIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Belum ada tautan media sosial. Klik <strong>"Tambah Media Sosial"</strong> di atas.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {socialLinks.map((item, index) => (
                      <Card
                        key={index}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          border: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Grid container spacing={1.5} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Nama Platform"
                              value={item.platform}
                              onChange={(e) => handleUpdateSocialLink(index, 'platform', e.target.value)}
                            >
                              {POPULAR_PLATFORMS.map((plat) => (
                                <MenuItem key={plat} value={plat}>
                                  {plat}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={10} sm={7}>
                            <TextField
                              fullWidth
                              size="small"
                              label="URL Profil / Tautan"
                              placeholder="https://..."
                              value={item.url}
                              onChange={(e) => handleUpdateSocialLink(index, 'url', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                            <Tooltip title="Hapus Tautan">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveSocialLink(index)}
                                sx={{
                                  p: 0.7,
                                  borderRadius: 1.5,
                                  color: (th) => th.palette.mode === 'dark' ? '#FCA5A5' : '#DC2626',
                                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(220, 38, 38, 0.08)',
                                  border: 1,
                                  borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.25)',
                                  '&:hover': {
                                    bgcolor: 'error.main',
                                    color: '#FFFFFF',
                                  },
                                }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* SECTION 5: ALIASES & MONIKERS (KNOWN AS) */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.03)',
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" fontWeight="800" color="text.primary">
                  5. Kata Kunci Monikers &amp; Alias ("Known As")
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Tag sebutan atau nama panggung developer yang tampil di Hero Section dan About Section untuk optimasi kata kunci pencarian SEO.
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <TextField
                    placeholder="Ketik alias (contoh: baydev, bayukun, masbay) lalu tekan Enter"
                    size="small"
                    fullWidth
                    value={newAliasInput}
                    onChange={(e) => setNewAliasInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAlias();
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleAddAlias}
                    disabled={!newAliasInput.trim()}
                    sx={{ height: 40, minWidth: 85, fontWeight: 700 }}
                  >
                    Tambah
                  </Button>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.8,
                    p: 1.2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    minHeight: 40,
                  }}
                >
                  {aliases.map((alias, aIdx) => (
                    <Chip
                      key={aIdx}
                      label={alias}
                      size="small"
                      onDelete={() => handleRemoveAlias(aIdx)}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                        color: '#D97706',
                        border: 1,
                        borderColor: 'rgba(245, 158, 11, 0.3)',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* SECTION 6: PRINSIP REKAYASA SISTEM */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.03)',
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="800" color="text.primary">
                      6. Prinsip Rekayasa Sistem (Core Values)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Kartu nilai dan prinsip kerja teknik rekayasa yang tampil pada seksi About Me halaman publik.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddCircleOutlineIcon sx={{ fontSize: 18 }} />}
                    onClick={handleAddPrinciple}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Tambah Prinsip
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {engineeringPrinciples.map((principle, pIdx) => (
                    <Card
                      key={pIdx}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Grid container spacing={1.5} alignItems="flex-start">
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Judul Prinsip"
                            placeholder="Contoh: Architecture First"
                            value={principle.title}
                            onChange={(e) => handleUpdatePrinciple(pIdx, 'title', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={11} sm={7}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Deskripsi / Penjelasan"
                            placeholder="Contoh: Desain database relasional kokoh, query terindeks, dan skema bersih."
                            value={principle.desc}
                            onChange={(e) => handleUpdatePrinciple(pIdx, 'desc', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={1} sm={1} sx={{ textAlign: 'center', pt: { xs: 0, sm: 0.5 } }}>
                          <Tooltip title="Hapus Prinsip">
                            <IconButton
                              size="small"
                              onClick={() => handleRemovePrinciple(pIdx)}
                              sx={{
                                p: 0.7,
                                color: 'error.main',
                                '&:hover': { bgcolor: 'error.main', color: '#fff' },
                              }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* SECTION 7: INTERACTIVE TERMINAL WIDGET */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.03)',
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="800" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TerminalIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      7. Widget Terminal Interaktif (Skills Arsenal)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Kustomisasi prompt hostname, tombol shortcut cepat, teks pembuka, dan respon perintah terminal di halaman depan.
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleResetShortcuts}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Reset Shortcut Default
                  </Button>
                </Box>

                <Grid container spacing={2.5}>
                  {/* Hostname Prompt */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Prompt User / Hostname"
                      placeholder="baydev@workstation:~$"
                      value={formData.terminal_user_host}
                      onChange={(e) => setFormData({ ...formData, terminal_user_host: e.target.value })}
                      helperText="Contoh: baydev@workstation:~$"
                    />
                  </Grid>

                  {/* Initial Terminal Lines */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      size="small"
                      label="Baris Status / Teks Pembuka Terminal (1 Baris Per Pernyataan)"
                      placeholder={'whoami: Bayu Prastyo - Full-Stack Developer & Solutions Architect\nspecialization: Laravel, React, PostgreSQL & Enterprise Architecture\nstatus: Available for Freelance & Enterprise Solutions'}
                      value={formData.terminal_lines_text}
                      onChange={(e) => setFormData({ ...formData, terminal_lines_text: e.target.value })}
                      helperText="Pernyataan yang langsung muncul di layar terminal saat halaman pertama kali dibuka."
                    />
                  </Grid>

                  {/* Shortcut Buttons Manager */}
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: (th) => th.palette.mode === 'dark' ? '#0F1626' : '#F8FAFC', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
                        Daftar Tombol Shortcut Terminal Interaktif ({terminalShortcuts.length} Tombol)
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Tombol ini akan ditampilkan di bilah atas terminal pada seksi Skills. Pengunjung cukup mengklik tombol untuk mengeksekusi perintah.
                      </Typography>

                      {/* Active Shortcut Chips */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {terminalShortcuts.map((shortcut, idx) => (
                          <Chip
                            key={`${shortcut}-${idx}`}
                            label={shortcut === 'clear' || shortcut === 'cls' ? '↺ clear' : `$ ${shortcut}`}
                            onDelete={() => handleDeleteShortcut(idx)}
                            color={shortcut === 'clear' || shortcut === 'cls' ? 'default' : 'primary'}
                            variant="outlined"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                            }}
                          />
                        ))}
                      </Box>

                      {/* Add Shortcut Form */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: 420 }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Nama shortcut baru (misal: pricing, resume, cert)"
                          value={newShortcutInput}
                          onChange={(e) => setNewShortcutInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddShortcut();
                            }
                          }}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary', fontFamily: 'monospace' }}>$</Typography>,
                          }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleAddShortcut}
                          startIcon={<AddCircleOutlineIcon />}
                          sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                          Tambah
                        </Button>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Custom Command Responses (Overrides & New Commands) */}
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: (th) => th.palette.mode === 'dark' ? '#0F1626' : '#F8FAFC', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="body2" fontWeight="700" color="text.primary">
                            Respon Perintah Tambahan / Kustom (Opsional)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Tentukan output teks kustom untuk perintah baru (misal: pricing) atau menimpa (override) perintah default.
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddCircleOutlineIcon />}
                          onClick={handleAddCustomCommand}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Tambah Respon Perintah
                        </Button>
                      </Box>

                      {customCommands.length === 0 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic', py: 1 }}>
                          Belum ada respon perintah kustom. Perintah standar (help, whoami, skills, services, projects, contact, clear) menggunakan respon dinamis bawaan.
                        </Typography>
                      ) : (
                        <Stack spacing={2} sx={{ mt: 1.5 }}>
                          {customCommands.map((cc, cIdx) => (
                            <Box
                              key={cIdx}
                              sx={{
                                p: 1.5,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1.5,
                                bgcolor: (th) => th.palette.mode === 'dark' ? '#151D2F' : '#FFFFFF',
                              }}
                            >
                              <Grid container spacing={1.5} alignItems="flex-start">
                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Nama Perintah"
                                    placeholder="pricing"
                                    value={cc.command}
                                    onChange={(e) => handleUpdateCustomCommand(cIdx, 'command', e.target.value)}
                                    helperText="Perintah yang diketikkan di terminal"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={7}>
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    size="small"
                                    label="Respon Teks Terminal (Mendukung Multi-Baris)"
                                    placeholder="Tersedia layanan konsultasi dan pengembangan enterprise..."
                                    value={cc.output}
                                    onChange={(e) => handleUpdateCustomCommand(cIdx, 'output', e.target.value)}
                                    helperText="Teks respon yang akan ditampilkan terminal saat perintah dieksekusi"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={1} sx={{ display: 'flex', justifyContent: 'center', pt: { sm: 1 } }}>
                                  <Tooltip title="Hapus Perintah">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteCustomCommand(cIdx)}
                                    >
                                      <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* SECTION 8: SEO & ANNOUNCEMENT BAR */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.03)',
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" fontWeight="800" color="text.primary" sx={{ mb: 0.5 }}>
                  8. Konfigurasi SEO &amp; Pengumuman Publik
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Kustomisasi banner pengumuman atas di halaman publik dan informasi meta tags mesin pencari (SEO &amp; Open Graph).
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Banner Pengumuman Atas (Announcement Bar)"
                      placeholder="Contoh: Membuka Peluang Kolaborasi Proyek & Remote Roles 2026"
                      value={formData.announcement_bar}
                      onChange={(e) => setFormData({ ...formData, announcement_bar: e.target.value })}
                      helperText="Jika diisi, banner pita kuning kontras akan tampil di atas bilah navigasi situs publik."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Open Graph Image URL (og:image)"
                      placeholder="https://... atau /storage/..."
                      value={formData.og_image}
                      onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                      helperText="Gambar pratinjau thumbnail saat tautan dibagikan ke WhatsApp, LinkedIn, dsb."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Meta Description SEO"
                      placeholder="Deskripsi singkat portofolio untuk Google search snippet..."
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      helperText="Deskripsi ringkas yang diindeks oleh crawler mesin pencari (maks. 160 karakter disarankan)."
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Submit Action Button */}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading}
                sx={{
                  px: 4,
                  py: 1.2,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: 2.5,
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Simpan Seluruh Konfigurasi
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
