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
  Rating,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StarIcon from '@mui/icons-material/Star';
import { adminService } from '../../services/api';

export default function TestimonialManager({ testimonials = [], onRefresh, showToast }) {
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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    client_name: '',
    client_title: '',
    company: '',
    avatar: '',
    content: '',
    rating: 5,
    order_index: 0,
    is_active: true,
  });

  // Delete Confirmation Dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Sync items from prop or fetch if empty
  useEffect(() => {
    if (testimonials && testimonials.length > 0) {
      setItems(testimonials);
    } else {
      fetchItems();
    }
  }, [testimonials]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTestimonials();
      setItems(res?.data || []);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview('');
    setFormData({
      id: null,
      client_name: '',
      client_title: '',
      company: '',
      avatar: '',
      content: '',
      rating: 5,
      order_index: items.length + 1,
      is_active: true,
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setAvatarFile(null);
    setAvatarPreview(item.avatar || '');
    setFormData({
      id: item.id,
      client_name: item.client_name || '',
      client_title: item.client_title || '',
      company: item.company || '',
      avatar: item.avatar || '',
      content: item.content || '',
      rating: item.rating ?? 5,
      order_index: item.order_index ?? 0,
      is_active: !!item.is_active,
    });
    setOpenDialog(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.client_name.trim() || !formData.content.trim()) {
      showToast('Nama klien dan isi testimoni wajib diisi', 'warning');
      return;
    }

    setLoading(true);
    try {
      let finalAvatar = formData.avatar;
      if (avatarFile) {
        try {
          const uploadRes = await adminService.uploadImage(avatarFile);
          if (uploadRes?.url) finalAvatar = uploadRes.url;
        } catch (uploadErr) {
          console.warn('Avatar upload fallback:', uploadErr);
        }
      }

      const payload = {
        ...formData,
        avatar: finalAvatar,
      };

      if (isEditing) {
        await adminService.updateTestimonial(formData.id, payload);
        showToast('Testimoni berhasil diperbarui!', 'success');
      } else {
        await adminService.createTestimonial(payload);
        showToast('Testimoni berhasil ditambahkan!', 'success');
      }

      setOpenDialog(false);
      if (onRefresh) onRefresh();
      fetchItems();
    } catch (err) {
      console.error('Save testimonial error:', err);
      showToast(err.response?.data?.message || 'Gagal menyimpan testimoni', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await adminService.toggleTestimonialActive(item.id);
      showToast(`Status testimoni ${item.client_name} berhasil diubah!`, 'success');
      if (onRefresh) onRefresh();
      fetchItems();
    } catch (err) {
      console.error('Toggle testimonial error:', err);
      showToast('Gagal mengubah status testimoni', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await adminService.deleteTestimonial(deleteTarget.id);
      showToast('Testimoni berhasil dihapus permanen!', 'success');
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      if (onRefresh) onRefresh();
      fetchItems();
    } catch (err) {
      console.error('Delete testimonial error:', err);
      showToast('Gagal menghapus testimoni', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.client_name || '').toLowerCase().includes(q) ||
      (item.company || '').toLowerCase().includes(q) ||
      (item.client_title || '').toLowerCase().includes(q) ||
      (item.content || '').toLowerCase().includes(q)
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
              <FormatQuoteIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight="800">
                Manajemen Testimoni Klien ({items.length})
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Ulasan, rekomendasi profesional, dan rating kepuasan dari klien atau mitra proyek.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ fontWeight: 700, textTransform: 'none', px: 2.5, whiteSpace: 'nowrap' }}
          >
            Tambah Testimoni
          </Button>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 2.5, maxWidth: { xs: '100%', sm: 380 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Cari nama klien, instansi, atau ulasan..."
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
              {searchQuery ? 'Tidak ada testimoni yang cocok dengan pencarian.' : 'Belum ada data testimoni klien.'}
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
                      <Avatar src={item.avatar} alt={item.client_name} sx={{ width: 44, height: 44, border: 1, borderColor: 'divider' }}>
                        {item.client_name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {item.client_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.client_title ? `${item.client_title} • ` : ''}{item.company}
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

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Rating value={item.rating || 5} readOnly size="small" emptyIcon={<StarIcon fontSize="inherit" />} />
                    <Typography variant="caption" fontWeight={700} sx={{ ml: 0.5 }}>
                      ({item.rating || 5}/5)
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', mb: 2, fontStyle: 'italic' }}>
                    "{item.content}"
                  </Typography>

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
                  <TableCell sx={{ fontWeight: 800, width: 60 }}>Klien</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Profil &amp; Instansi</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Ulasan / Testimoni</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, width: 130 }}>Rating</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, width: 110 }}>Visibilitas</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, width: 100 }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Avatar src={item.avatar} alt={item.client_name} sx={{ width: 38, height: 38, border: 1, borderColor: 'divider' }}>
                        {item.client_name?.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>
                        {item.client_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.client_title ? `${item.client_title} • ` : ''}{item.company || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        "{item.content}"
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Rating value={item.rating || 5} readOnly size="small" emptyIcon={<StarIcon fontSize="inherit" />} />
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
                        <Tooltip title="Edit Testimoni">
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
                        <Tooltip title="Hapus Testimoni">
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
            {isEditing ? 'Edit Testimoni Klien' : 'Tambah Testimoni Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* Avatar Preview & Upload */}
              <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={avatarPreview || formData.avatar} sx={{ width: 60, height: 60, border: 2, borderColor: 'primary.main' }}>
                  {formData.client_name?.charAt(0)}
                </Avatar>
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    id="testimonial-avatar-file"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="testimonial-avatar-file">
                    <Button
                      component="span"
                      size="small"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Unggah Foto Avatar
                    </Button>
                  </label>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Maks 10MB (JPG, PNG, WebP)
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nama Klien"
                  fullWidth
                  required
                  size="small"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Posisi / Jabatan"
                  fullWidth
                  size="small"
                  placeholder="e.g. Project Director, IT Manager"
                  value={formData.client_title}
                  onChange={(e) => setFormData({ ...formData, client_title: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Perusahaan / Instansi"
                  fullWidth
                  size="small"
                  placeholder="e.g. PT Global Intermedia"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="URL Avatar (Opsional)"
                  fullWidth
                  size="small"
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={(e) => {
                    setFormData({ ...formData, avatar: e.target.value });
                    setAvatarPreview(e.target.value);
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" fontWeight={700}>
                    Rating Kepuasan (1-5 Bintang)
                  </Typography>
                  <Rating
                    value={formData.rating}
                    onChange={(e, val) => setFormData({ ...formData, rating: val || 5 })}
                    size="medium"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label={<Typography variant="body2" fontWeight={700}>Tampilkan di Halaman Publik</Typography>}
                  sx={{ mt: 1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Isi Testimoni / Ulasan Klien"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  size="small"
                  placeholder="Tuliskan ulasan atau testimoni positif dari klien mengenai performa dan hasil kerja..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Batal
            </Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ fontWeight: 700 }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : isEditing ? 'Simpan Perubahan' : 'Tambah Testimoni'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
          Hapus Testimoni Permanen?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Apakah Anda yakin ingin menghapus testimoni dari <strong>{deleteTarget?.client_name}</strong>? Tindakan ini tidak dapat dibatalkan.
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
