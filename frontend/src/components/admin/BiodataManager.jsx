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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getStorageUrl } from '../../utils';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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

const DEFAULT_MARQUEE_ITEMS = [
  'LARAVEL 13',
  'POSTGRESQL 17',
  'REACTJS VITE',
  'TAILWIND CSS',
  'MATERIAL UI',
  'DOCKER HOMELAB',
  'REST API ARCHITECTURE',
  'LINUX DEBIAN',
  'SYSTEM AUTOMATION',
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
  });

  // Dynamic social links array of { platform: '', url: '' }
  const [socialLinks, setSocialLinks] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // CV Upload state
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);

  // Marquee items state
  const [marqueeItems, setMarqueeItems] = useState(DEFAULT_MARQUEE_ITEMS);
  const [newMarqueeInput, setNewMarqueeInput] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (biodata) {
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
      });

      setAvatarPreview(biodata.avatar || '');

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

      // Load dynamic marquee items
      if (biodata.marquee_items && Array.isArray(biodata.marquee_items) && biodata.marquee_items.length > 0) {
        setMarqueeItems(biodata.marquee_items);
      } else {
        setMarqueeItems(DEFAULT_MARQUEE_ITEMS);
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

  const handleAddMarqueeItem = () => {
    const trimmed = newMarqueeInput.trim().toUpperCase();
    if (trimmed && !marqueeItems.includes(trimmed)) {
      setMarqueeItems([...marqueeItems, trimmed]);
      setNewMarqueeInput('');
    }
  };

  const handleRemoveMarqueeItem = (index) => {
    setMarqueeItems(marqueeItems.filter((_, i) => i !== index));
  };

  const handleResetMarquee = () => {
    setMarqueeItems(DEFAULT_MARQUEE_ITEMS);
    showToast('Daftar teks marquee direset ke default', 'info');
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
        marquee_items: marqueeItems,
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
                Kelola identitas publik, tampilan Hero Section, berkas CV, running marquee, dan tautan sosial media.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Chip size="small" label="Dynamic API Sync" color="info" variant="outlined" />
                <Chip size="small" label="PostgreSQL 17 Linked" color="success" variant="outlined" />
              </Box>
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
              <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" /> 1. Data Personal &amp; Kontak Utama
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

            {/* SECTION 2: HERO SECTION CUSTOMIZER */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <AutoAwesomeIcon fontSize="small" /> 2. Hero Section Customizer (Halaman Depan)
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
              <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <PictureAsPdfIcon fontSize="small" /> 3. Manajemen Berkas CV / Resume (PDF)
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

            {/* SECTION 4: RUNNING MARQUEE TICKER */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ViewCarouselIcon fontSize="small" /> 4. Running Marquee Banner (Ticker Teks Berjalan)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Daftar slogan atau highlight kompetensi yang berputar horizontal di bawah navbar.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetMarquee}
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}
                >
                  Reset Default
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2, maxWidth: 500 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Tambah item marquee baru (e.g. CLOUD ARCHITECTURE)..."
                  value={newMarqueeInput}
                  onChange={(e) => setNewMarqueeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMarqueeItem();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddMarqueeItem}
                  disabled={!newMarqueeInput.trim()}
                  sx={{ fontWeight: 700, px: 2.5, whiteSpace: 'nowrap' }}
                >
                  Tambah
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {marqueeItems.map((item, idx) => (
                  <Chip
                    key={idx}
                    label={item}
                    onDelete={() => handleRemoveMarqueeItem(idx)}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      letterSpacing: '0.04em',
                      bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255, 222, 89, 0.15)' : 'rgba(255, 222, 89, 0.3)',
                      color: (th) => th.palette.mode === 'dark' ? '#FFDE59' : '#000000',
                      border: 1,
                      borderColor: (th) => th.palette.mode === 'dark' ? '#FFDE59' : '#000000',
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {/* SECTION 5: DYNAMIC SOCIAL LINKS */}
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
                      5. Tautan Jejaring Sosial (Dynamic JSON)
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
