import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Grid,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ClearIcon from '@mui/icons-material/Clear';
import TuneIcon from '@mui/icons-material/Tune';
import LinkIcon from '@mui/icons-material/Link';
import LayersIcon from '@mui/icons-material/Layers';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

export default function PortfolioEditorScreen({
  formData,
  setFormData,
  isEditing,
  onSave,
  onCancel,
  loading,
  uploadingImage,
  allCategoryNames = [],
  setOpenCategoryModal,
  selectedFile,
  previewUrl,
  handleFileChange,
  newTechInput,
  setNewTechInput,
  handleAddTechTag,
  handleRemoveTechTag,
  newMetricInput,
  setNewMetricInput,
  handleAddMetric,
  handleRemoveMetric,
  newHighlightInput,
  setNewHighlightInput,
  handleAddHighlight,
  handleRemoveHighlight,
  newGalleryUrl,
  setNewGalleryUrl,
  newGalleryCaption,
  setNewGalleryCaption,
  handleAddGalleryItem,
  handleRemoveGalleryItem,
  handleUploadGalleryFile,
  uploadingGallery,
  onOpenMediaSelector,
  onPreview,
}) {
  return (
    <Box component="form" onSubmit={onSave} sx={{ width: '100%', maxWidth: 1400, mx: 'auto', pb: 8 }}>
      {/* Sticky Top Header Navigation */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: { xs: 56, sm: 64 },
          zIndex: 10,
          p: { xs: 1.5, sm: 2 },
          mb: 3,
          borderRadius: 2.5,
          border: 1,
          borderColor: 'divider',
          bgcolor: (th) =>
            th.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 253, 240, 0.95)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={onCancel}
            sx={{ fontWeight: 700, fontSize: '0.78rem' }}
          >
            Kembali
          </Button>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, lineHeight: 1.2 }}>
              {isEditing ? `Edit Proyek: ${formData.title || 'Portofolio'}` : 'Tambah Proyek Portofolio Baru'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Layar editor mandiri &bull; Data tersimpan aman di PostgreSQL
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={onPreview}
            sx={{ fontWeight: 700, fontSize: '0.78rem' }}
          >
            Pratinjau Publik
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={loading || uploadingImage}
            startIcon={loading || uploadingImage ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{ fontWeight: 700, fontSize: '0.78rem', px: 2.5 }}
          >
            {loading ? 'Menyimpan...' : isEditing ? 'Perbarui Proyek' : 'Simpan Proyek'}
          </Button>
        </Box>
      </Paper>

      {/* Main Form 2-Column Grid */}
      <Grid container spacing={3}>
        {/* LEFT COLUMN: Main Information, Gallery, Links */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* CARD 1: Informasi Utama & Detail */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DescriptionOutlinedIcon color="primary" sx={{ fontSize: 22 }} />
                <Typography variant="subtitle1" fontWeight={800}>
                  Informasi Utama Proyek
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Judul Portofolio / Nama Aplikasi"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: SIMPATIK - Sistem Informasi Manajemen Pinjaman"
                  size="small"
                  helperText="Judul proyek yang tampil paling menonjol pada showcase portofolio publik"
                />

                {/* Dynamic Category Selector & Manage Button */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    select
                    label="Kategori Portofolio"
                    fullWidth
                    required
                    value={formData.category}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setOpenCategoryModal(true);
                      } else {
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    size="small"
                  >
                    {allCategoryNames.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                    <MenuItem
                      value="__NEW__"
                      sx={{
                        fontStyle: 'italic',
                        color: 'primary.main',
                        fontWeight: 700,
                        borderTop: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      + Tambah / Kelola Kategori...
                    </MenuItem>
                  </TextField>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setOpenCategoryModal(true)}
                    sx={{
                      height: 40,
                      whiteSpace: 'nowrap',
                      minWidth: 100,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    }}
                  >
                    Kelola
                  </Button>
                </Box>

                {/* Client Name & Project Year */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Nama Klien / Lembaga Mitra"
                    fullWidth
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    size="small"
                    placeholder="Contoh: PT Jamkrida Jatim, Diskominfo"
                    helperText="Nama instansi pemilik atau klien proyek"
                  />
                  <TextField
                    label="Tahun Rilis"
                    fullWidth
                    value={formData.project_year}
                    onChange={(e) => setFormData({ ...formData, project_year: e.target.value })}
                    size="small"
                    placeholder="Contoh: 2024"
                    helperText="Tahun pengerjaan / peluncuran"
                  />
                </Box>

                <TextField
                  label="Peran Proyek (Project Role)"
                  fullWidth
                  value={formData.project_role}
                  onChange={(e) => setFormData({ ...formData, project_role: e.target.value })}
                  size="small"
                  placeholder="Contoh: Senior Full-Stack Programmer / Lead Software Architect"
                  helperText="Peran teknis Anda pada pengembangan proyek ini"
                />

                <TextField
                  label="Deskripsi Proyek (Studi Kasus Detail)"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  size="small"
                  placeholder="Jelaskan latar belakang, tantangan teknis, solusi rekayasa, dan dampak sistem ini..."
                  helperText="Teks deskripsi yang ditampilkan pada kartu dan modal detail proyek publik"
                />
              </Box>
            </Paper>

            {/* CARD 2: Multi-Screenshot Galeri & Arsitektur */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CollectionsOutlinedIcon color="primary" sx={{ fontSize: 22 }} />
                    <Typography variant="subtitle1" fontWeight={800}>
                      Galeri Screenshot &amp; Arsitektur
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Tangkapan layar resolusi tinggi untuk studi kasus mendalam pada modal proyek publik
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<CollectionsOutlinedIcon fontSize="small" />}
                    onClick={() => onOpenMediaSelector('gallery')}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}
                  >
                    Pilih dari Galeri
                  </Button>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    disabled={uploadingGallery}
                    startIcon={<CloudUploadIcon fontSize="small" />}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}
                  >
                    {uploadingGallery ? 'Mengunggah...' : '+ Unggah Gambar'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleUploadGalleryFile}
                    />
                  </Button>
                </Box>
              </Box>

              {/* Manual URL & Caption Input */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  placeholder="URL Screenshot (/storage/... atau https://...)"
                  size="small"
                  fullWidth
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  sx={{ '.MuiInputBase-input': { fontSize: '0.82rem' } }}
                />
                <TextField
                  placeholder="Keterangan singkat"
                  size="small"
                  value={newGalleryCaption}
                  onChange={(e) => setNewGalleryCaption(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 200 }, '.MuiInputBase-input': { fontSize: '0.82rem' } }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleAddGalleryItem()}
                  disabled={!newGalleryUrl.trim()}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', px: 2.5, whiteSpace: 'nowrap' }}
                >
                  Tambah
                </Button>
              </Box>

              {/* Gallery Items Grid */}
              {formData.gallery && formData.gallery.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  {formData.gallery.map((gItem, gIdx) => {
                    const gUrl = typeof gItem === 'string' ? gItem : gItem.url;
                    const gCaption = typeof gItem === 'object' ? gItem.caption : '';
                    return (
                      <Box
                        key={gIdx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 2,
                          bgcolor: (th) => (th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'),
                        }}
                      >
                        <Box
                          component="img"
                          src={gUrl}
                          alt="thumb"
                          sx={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 1.5, border: 1, borderColor: 'divider' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 700 }} noWrap>
                            {gCaption || `Screenshot #${gIdx + 1}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block" fontFamily="monospace">
                            {gUrl}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveGalleryItem(gIdx)}
                          title="Hapus screenshot"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Belum ada screenshot tambahan. Anda dapat memilih dari galeri atau mengunggah berkas baru.
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* CARD 3: Tautan Proyek & Repositori */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LinkIcon color="primary" sx={{ fontSize: 22 }} />
                <Typography variant="subtitle1" fontWeight={800}>
                  Tautan Eksternal &amp; Repositori
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Tautan Proyek / Demo Live"
                  fullWidth
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  size="small"
                  placeholder="https://..."
                  helperText="Tautan publik aktif untuk tombol KUNJUNGI WEBSITE"
                />
                <TextField
                  label="Tautan GitHub / Source Code"
                  fullWidth
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  size="small"
                  placeholder="https://github.com/..."
                  helperText="Tautan repositori untuk tombol LIHAT SOURCE CODE"
                />
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* RIGHT COLUMN: Visibility, Main Image, Tech Stack, Metrics, Highlights */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* CARD 4: Status Publikasi & Urutan */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <TuneIcon color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={800}>
                  Status &amp; Visibilitas
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1.2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                    Status Publikasi
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        color="success"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ fontWeight: 700, color: formData.is_published ? 'success.main' : 'text.secondary' }}>
                        {formData.is_published ? 'PUBLISHED' : 'DRAFT'}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 1.2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                    Proyek Unggulan
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ fontWeight: 700, color: formData.is_featured ? 'primary.main' : 'text.secondary' }}>
                        {formData.is_featured ? 'FEATURED' : 'REGULER'}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </Box>

                <TextField
                  label="Nomor Urut Tampil (Order Index)"
                  type="number"
                  fullWidth
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value, 10) || 0 })}
                  size="small"
                  helperText="Otomatis menggeser (+1) proyek lain jika nomor urut sama."
                />
              </Box>
            </Paper>

            {/* CARD 5: Gambar Sampul Utama */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <ImageOutlinedIcon color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={800}>
                  Gambar Sampul Utama
                </Typography>
              </Box>

              {/* Dropzone Container */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: selectedFile ? 'primary.main' : 'divider',
                  bgcolor: (th) => (th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.02)'),
                  textAlign: 'center',
                  mb: 1.5,
                }}
              >
                {previewUrl ? (
                  <Box sx={{ mb: 1.5 }}>
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="Preview"
                      sx={{
                        maxHeight: 140,
                        maxWidth: '100%',
                        borderRadius: 1.5,
                        objectFit: 'contain',
                        border: 1,
                        borderColor: 'divider',
                      }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                      {selectedFile ? `File baru: ${selectedFile.name}` : 'Gambar saat ini'}
                    </Typography>
                  </Box>
                ) : (
                  <ImageOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                )}

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="editor-portfolio-upload-input"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="editor-portfolio-upload-input">
                    <Button
                      variant="outlined"
                      component="span"
                      size="small"
                      startIcon={<CloudUploadIcon fontSize="small" />}
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    >
                      {previewUrl ? 'Ganti File' : 'Unggah Berkas'}
                    </Button>
                  </label>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<CollectionsOutlinedIcon fontSize="small" />}
                    onClick={() => onOpenMediaSelector('cover')}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    Galeri Server
                  </Button>
                </Box>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, fontSize: '0.68rem' }}>
                  Kompresi otomatis WebP 80% &bull; Maks. 10MB
                </Typography>
              </Box>

              <TextField
                label="URL Gambar Manual (Opsional)"
                fullWidth
                value={formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                }}
                size="small"
                placeholder="https://..."
                helperText="Bisa diisi URL eksternal jika tidak mengunggah berkas"
              />
            </Paper>

            {/* CARD 6: Tech Stack & Arsenal */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <LayersIcon color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={800}>
                  Tech Stack &amp; Frameworks
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  placeholder="Ketik teknologi (Laravel, React...)"
                  size="small"
                  fullWidth
                  value={newTechInput}
                  onChange={(e) => setNewTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTechTag();
                    }
                  }}
                  sx={{ '.MuiInputBase-input': { fontSize: '0.8rem' } }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddTechTag}
                  disabled={!newTechInput.trim()}
                  sx={{ fontWeight: 700 }}
                >
                  +
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, minHeight: 38, p: 1, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                {formData.tech_stack && formData.tech_stack.length > 0 ? (
                  formData.tech_stack.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onDelete={() => handleRemoveTechTag(tag)}
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', alignSelf: 'center' }}>
                    Belum ada tech stack disematkan.
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* CARD 7: Metrik & Dampak Kunci */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <BarChartIcon color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={800}>
                  Metrik &amp; Dampak Kunci
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  placeholder="Contoh: 10K+ Transaksi Bulanan"
                  size="small"
                  fullWidth
                  value={newMetricInput}
                  onChange={(e) => setNewMetricInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMetric();
                    }
                  }}
                  sx={{ '.MuiInputBase-input': { fontSize: '0.8rem' } }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddMetric}
                  disabled={!newMetricInput.trim()}
                  sx={{ fontWeight: 700 }}
                >
                  +
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {formData.metrics && formData.metrics.length > 0 ? (
                  formData.metrics.map((metric, mIdx) => (
                    <Box
                      key={mIdx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.2,
                        py: 0.6,
                        borderRadius: 1.5,
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: (th) => (th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF'),
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {metric}
                      </Typography>
                      <IconButton size="small" onClick={() => handleRemoveMetric(mIdx)} sx={{ p: 0.2 }}>
                        <ClearIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 0.5 }}>
                    Belum ada metrik kunci.
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* CARD 8: Sorotan Keunggulan (Highlights) */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <StarOutlineIcon color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={800}>
                  Sorotan Keunggulan (Highlights)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  placeholder="Contoh: HIGH AVAILABILITY"
                  size="small"
                  fullWidth
                  value={newHighlightInput}
                  onChange={(e) => setNewHighlightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHighlight();
                    }
                  }}
                  sx={{ '.MuiInputBase-input': { fontSize: '0.8rem' } }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddHighlight}
                  disabled={!newHighlightInput.trim()}
                  sx={{ fontWeight: 700 }}
                >
                  +
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, minHeight: 38, p: 1, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                {formData.highlights && formData.highlights.length > 0 ? (
                  formData.highlights.map((hl, hIdx) => (
                    <Chip
                      key={hIdx}
                      label={hl}
                      size="small"
                      variant="outlined"
                      onDelete={() => handleRemoveHighlight(hIdx)}
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', alignSelf: 'center' }}>
                    Belum ada sorotan.
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Sticky Bottom Bar */}
      <Paper
        elevation={3}
        sx={{
          position: 'sticky',
          bottom: 16,
          zIndex: 10,
          p: 2,
          mt: 4,
          borderRadius: 2.5,
          border: 1,
          borderColor: 'divider',
          bgcolor: (th) =>
            th.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Button onClick={onCancel} color="inherit" size="small" sx={{ fontWeight: 600 }}>
          Batal &amp; Kembali ke Daftar
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={onPreview}
            sx={{ fontWeight: 700 }}
          >
            Pratinjau Publik
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={loading || uploadingImage}
            startIcon={loading || uploadingImage ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{ fontWeight: 700, px: 3 }}
          >
            {loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Terbitkan Portofolio'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
