import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
  Avatar,
  Chip,
  Switch,
  FormControlLabel,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Link,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VerifiedIcon from '@mui/icons-material/Verified';
import { adminService } from '../../services/api';

export default function CertificationManager({ certifications = [], onRefresh, showToast }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Dialog Form states
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [badgeFile, setBadgeFile] = useState(null);
  const [badgePreview, setBadgePreview] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    issuer: '',
    issue_date: '',
    expiration_date: '',
    credential_id: '',
    credential_url: '',
    badge_image: '',
    order_index: 0,
    is_active: true,
  });

  // Delete Confirmation Dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Sync items from prop or fetch if empty
  useEffect(() => {
    if (certifications && certifications.length > 0) {
      setItems(certifications);
    } else {
      fetchItems();
    }
  }, [certifications]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCertifications();
      setItems(res?.data || []);
    } catch (err) {
      console.error('Failed to load certifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setBadgeFile(null);
    setBadgePreview('');
    setFormData({
      id: null,
      title: '',
      issuer: '',
      issue_date: '',
      expiration_date: 'Lifetime',
      credential_id: '',
      credential_url: '',
      badge_image: '',
      order_index: items.length + 1,
      is_active: true,
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setBadgeFile(null);
    setBadgePreview(item.badge_image || '');
    setFormData({
      id: item.id,
      title: item.title || '',
      issuer: item.issuer || '',
      issue_date: item.issue_date || '',
      expiration_date: item.expiration_date || '',
      credential_id: item.credential_id || '',
      credential_url: item.credential_url || '',
      badge_image: item.badge_image || '',
      order_index: item.order_index ?? 0,
      is_active: !!item.is_active,
    });
    setOpenDialog(true);
  };

  const handleBadgeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBadgeFile(file);
      setBadgePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.issuer.trim()) {
      showToast('Nama sertifikasi dan penerbit wajib diisi', 'warning');
      return;
    }

    setLoading(true);
    try {
      let finalBadge = formData.badge_image;
      if (badgeFile) {
        try {
          const uploadRes = await adminService.uploadImage(badgeFile);
          if (uploadRes?.url) finalBadge = uploadRes.url;
        } catch (uploadErr) {
          console.warn('Badge upload fallback:', uploadErr);
        }
      }

      const payload = {
        ...formData,
        badge_image: finalBadge,
      };

      if (isEditing) {
        await adminService.updateCertification(formData.id, payload);
        showToast('Sertifikasi berhasil diperbarui!', 'success');
      } else {
        await adminService.createCertification(payload);
        showToast('Sertifikasi berhasil ditambahkan!', 'success');
      }

      setOpenDialog(false);
      if (onRefresh) onRefresh();
      fetchItems();
    } catch (err) {
      console.error('Save certification error:', err);
      showToast(err.response?.data?.message || 'Gagal menyimpan sertifikasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await adminService.toggleCertificationActive(item.id);
      showToast(`Status sertifikasi ${item.title} berhasil diubah!`, 'success');
      if (onRefresh) onRefresh();
      fetchItems();
    } catch (err) {
      console.error('Toggle certification error:', err);
      showToast('Gagal mengubah status sertifikasi', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await adminService.deleteCertification(deleteTarget.id);
      showToast('Sertifikasi berhasil dihapus permanen!', 'success');
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      if (onRefresh) onRefresh();
      fetchItems();
    } catch (err) {
      console.error('Delete certification error:', err);
      showToast('Gagal menghapus sertifikasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.issuer || '').toLowerCase().includes(q) ||
      (item.credential_id || '').toLowerCase().includes(q)
    );
  });

  const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ py: 1 }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        {/* Header Title & Action */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <WorkspacePremiumIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight="800">
                Manajemen Sertifikasi &amp; Lisensi ({items.length})
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Kredensial keahlian resmi, sertifikat profesional, dan lisensi industri terverifikasi.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ fontWeight: 700, textTransform: 'none', px: 2.5, whiteSpace: 'nowrap' }}
          >
            Tambah Sertifikasi
          </Button>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 2.5, maxWidth: { xs: '100%', sm: 380 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Cari sertifikasi, penerbit, ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Content View: Desktop Table vs Mobile Cards */}
        {filteredItems.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'Tidak ada sertifikasi yang cocok dengan pencarian.' : 'Belum ada data sertifikasi terdaftar.'}
            </Typography>
          </Box>
        ) : isMobile ? (
          // Mobile Adaptive Cards
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedItems.map((item) => (
              <Card key={item.id} elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={item.badge_image}
                        variant="rounded"
                        sx={{ width: 44, height: 44, p: 0.5, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}
                      >
                        <VerifiedIcon sx={{ color: 'primary.main' }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.issuer}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      size="small"
                      label={item.is_active ? 'Aktif' : 'Nonaktif'}
                      color={item.is_active ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {item.issue_date && (
                      <Chip size="small" label={`Diterbitkan: ${item.issue_date}`} sx={{ fontSize: '0.72rem' }} />
                    )}
                    {item.expiration_date && (
                      <Chip size="small" label={`Kedaluwarsa: ${item.expiration_date}`} sx={{ fontSize: '0.72rem' }} />
                    )}
                    {item.credential_id && (
                      <Chip size="small" label={`ID: ${item.credential_id}`} variant="outlined" sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }} />
                    )}
                  </Box>

                  {item.credential_url && (
                    <Box sx={{ mb: 1.5 }}>
                      <Link
                        href={item.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}
                      >
                        Verifikasi Kredensial <OpenInNewIcon sx={{ fontSize: 13 }} />
                      </Link>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={!!item.is_active}
                          onChange={() => handleToggleActive(item)}
                        />
                      }
                      label={<Typography variant="caption" fontWeight={600}>Tampilkan</Typography>}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(item)}
                        sx={{
                          p: 0.7,
                          borderRadius: 1.5,
                          color: (th) => th.palette.mode === 'dark' ? '#A5B4FC' : '#4338CA',
                          bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.16)' : 'rgba(67, 56, 202, 0.08)',
                          border: 1,
                          borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(67, 56, 202, 0.25)',
                        }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeleteTarget(item);
                          setOpenDeleteDialog(true);
                        }}
                        sx={{
                          p: 0.7,
                          borderRadius: 1.5,
                          color: (th) => th.palette.mode === 'dark' ? '#FCA5A5' : '#DC2626',
                          bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(220, 38, 38, 0.08)',
                          border: 1,
                          borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.25)',
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          // Desktop Table
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, width: 60 }}>Badge</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Nama Sertifikasi</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Penerbit Resmi</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: 140 }}>Masa Berlaku</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: 150 }}>Kredensial ID</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, width: 110 }}>Visibilitas</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, width: 100 }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Avatar
                        src={item.badge_image}
                        variant="rounded"
                        sx={{ width: 38, height: 38, p: 0.4, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}
                      >
                        <VerifiedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>
                        {item.title}
                      </Typography>
                      {item.credential_url && (
                        <Link
                          href={item.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          sx={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 0.4, fontWeight: 600 }}
                        >
                          Tautan Verifikasi <OpenInNewIcon sx={{ fontSize: 11 }} />
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.issuer}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block" fontWeight={600}>
                        {item.issue_date || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        s/d {item.expiration_date || 'Lifetime'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: 'action.hover', px: 0.8, py: 0.3, borderRadius: 1 }}>
                        {item.credential_id || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={item.is_active ? 'Publik' : 'Disembunyikan'}
                        color={item.is_active ? 'success' : 'default'}
                        variant={item.is_active ? 'filled' : 'outlined'}
                        onClick={() => handleToggleActive(item)}
                        sx={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.8 }}>
                        <Tooltip title="Edit Sertifikasi">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(item)}
                            sx={{
                              p: 0.7,
                              borderRadius: 1.5,
                              color: (th) => th.palette.mode === 'dark' ? '#A5B4FC' : '#4338CA',
                              bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.16)' : 'rgba(67, 56, 202, 0.08)',
                              border: 1,
                              borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(67, 56, 202, 0.25)',
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus Sertifikasi">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDeleteTarget(item);
                              setOpenDeleteDialog(true);
                            }}
                            sx={{
                              p: 0.7,
                              borderRadius: 1.5,
                              color: (th) => th.palette.mode === 'dark' ? '#FCA5A5' : '#DC2626',
                              bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(220, 38, 38, 0.08)',
                              border: 1,
                              borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.25)',
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Table Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
          sx={{ borderTop: 1, borderColor: 'divider', mt: 1 }}
        />
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {isEditing ? 'Edit Sertifikasi / Lisensi' : 'Tambah Sertifikasi Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* Badge Preview & Upload */}
              <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={badgePreview || formData.badge_image} variant="rounded" sx={{ width: 56, height: 56, p: 0.5, border: 2, borderColor: 'primary.main' }}>
                  <VerifiedIcon />
                </Avatar>
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    id="cert-badge-file"
                    style={{ display: 'none' }}
                    onChange={handleBadgeChange}
                  />
                  <label htmlFor="cert-badge-file">
                    <Button
                      component="span"
                      size="small"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Unggah Logo / Badge
                    </Button>
                  </label>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Maks 10MB (SVG, PNG, JPG, WebP)
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nama Sertifikasi"
                  fullWidth
                  required
                  size="small"
                  placeholder="e.g. Laravel Certified Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Penerbit / Organisasi"
                  fullWidth
                  required
                  size="small"
                  placeholder="e.g. Laravel LLC, Meta, Google"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tahun / Tanggal Diterbitkan"
                  fullWidth
                  size="small"
                  placeholder="e.g. 2023 atau Mei 2023"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Masa Berlaku / Kedaluwarsa"
                  fullWidth
                  size="small"
                  placeholder="e.g. Lifetime atau 2026"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Credential ID"
                  fullWidth
                  size="small"
                  placeholder="e.g. LARA-CERT-8849"
                  value={formData.credential_id}
                  onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="URL Verifikasi / Tautan Bukti"
                  fullWidth
                  size="small"
                  placeholder="https://..."
                  value={formData.credential_url}
                  onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="URL Gambar Badge (Fallback)"
                  fullWidth
                  size="small"
                  placeholder="https://..."
                  value={formData.badge_image}
                  onChange={(e) => {
                    setFormData({ ...formData, badge_image: e.target.value });
                    setBadgePreview(e.target.value);
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Urutan Tampilan"
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value, 10) || 0 })}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label={<Typography variant="body2" fontWeight={700}>Tampilkan di Halaman Publik</Typography>}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Batal
            </Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ fontWeight: 700 }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : isEditing ? 'Simpan Perubahan' : 'Tambah Sertifikasi'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
          Hapus Sertifikasi Permanen?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Apakah Anda yakin ingin menghapus sertifikasi <strong>{deleteTarget?.title}</strong> dari penerbit <strong>{deleteTarget?.issuer}</strong>? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading} sx={{ fontWeight: 700 }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Ya, Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
