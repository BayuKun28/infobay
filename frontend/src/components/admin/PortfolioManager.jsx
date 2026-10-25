import React, { useState, useMemo, useEffect } from 'react';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import { adminService } from '../../services/api';
import { getStorageUrl } from '../../utils';

const CATEGORIES = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Backend System'];

export default function PortfolioManager({
  portfolios = [],
  onRefresh,
  showToast,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Form Dialog state
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    image: '',
    link: '#',
    description: '',
  });

  // Local file upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete Dialog state
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: portfolios.length };
    CATEGORIES.forEach((cat) => {
      counts[cat] = portfolios.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [portfolios]);

  // Filter logic
  const filteredList = useMemo(() => {
    return portfolios.filter((item) => {
      const matchSearch =
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'ALL' || item.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [portfolios, search, filterCat]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(0);
  }, [search, filterCat]);

  // Paginated list
  const paginatedList = useMemo(() => {
    return filteredList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredList, page, rowsPerPage]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData({
      title: '',
      category: 'Web Development',
      image: '',
      link: '#',
      description: '',
    });
    setOpenForm(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setSelectedFile(null);
    setPreviewUrl(item.image || '');
    setFormData({
      title: item.title || '',
      category: item.category || 'Web Development',
      image: item.image || '',
      link: item.link || '#',
      description: item.description || '',
    });
    setOpenForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Ukuran file terlalu besar (maksimal 10MB)', 'error');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showToast('Judul portofolio wajib diisi', 'error');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = formData.image;

      if (selectedFile) {
        setUploadingImage(true);
        try {
          const uploadRes = await adminService.uploadImage(selectedFile);
          if (uploadRes?.url) {
            finalImageUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          showToast('Gagal mengunggah file gambar ke server', 'error');
          setLoading(false);
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const payload = {
        ...formData,
        image: finalImageUrl,
      };

      if (isEditing) {
        await adminService.updatePortfolio(currentId, payload);
        showToast('Portofolio berhasil diperbarui', 'success');
      } else {
        await adminService.createPortfolio(payload);
        showToast('Portofolio baru berhasil ditambahkan', 'success');
      }
      setOpenForm(false);
      onRefresh();
    } catch (err) {
      console.error('Save portfolio error:', err);
      showToast(err.response?.data?.message || 'Gagal menyimpan portofolio', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDelete = (item) => {
    setDeleteTarget(item);
    setOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await adminService.deletePortfolio(deleteTarget.id);
      showToast(`Portofolio "${deleteTarget.title}" berhasil dihapus`, 'success');
      setOpenDelete(false);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      console.error('Delete portfolio error:', err);
      showToast(err.response?.data?.message || 'Gagal menghapus portofolio', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Search, Category Segmented Control & Action Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between' }}>
          {/* Search Input */}
          <Box sx={{ display: 'flex', gap: 1.5, flex: 1, maxWidth: { lg: 360 } }}>
            <TextField
              size="small"
              placeholder="Cari karya portofolio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>

          {/* Category Filter Pills (Functional & High Contrast) */}
          <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', py: 0.2 }}>
            <Chip
              label={`Semua (${categoryCounts.ALL || 0})`}
              size="small"
              onClick={() => setFilterCat('ALL')}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                bgcolor: filterCat === 'ALL'
                  ? (th) => th.palette.mode === 'dark' ? '#818CF8' : '#4338CA'
                  : 'transparent',
                color: filterCat === 'ALL'
                  ? (th) => th.palette.mode === 'dark' ? '#0A0E17' : '#FFFFFF'
                  : 'text.secondary',
                border: '1.5px solid',
                borderColor: filterCat === 'ALL' ? 'transparent' : 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'text.primary',
                },
              }}
            />
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                label={`${cat} (${categoryCounts[cat] || 0})`}
                size="small"
                onClick={() => setFilterCat(cat)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  bgcolor: filterCat === cat
                    ? (th) => th.palette.mode === 'dark' ? '#818CF8' : '#4338CA'
                    : 'transparent',
                  color: filterCat === cat
                    ? (th) => th.palette.mode === 'dark' ? '#0A0E17' : '#FFFFFF'
                    : 'text.secondary',
                  border: '1.5px solid',
                  borderColor: filterCat === cat ? 'transparent' : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'text.primary',
                  },
                }}
              />
            ))}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={onRefresh}
              sx={{ fontWeight: 600, fontSize: '0.78rem' }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={handleOpenCreate}
              sx={{ fontWeight: 600, fontSize: '0.78rem' }}
            >
              Tambah Portofolio
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Content: Mobile Cards or Desktop Table */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {paginatedList.map((item, index) => (
            <Card
              key={item.id || index}
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                <Box
                  component="img"
                  src={getStorageUrl(item.image)}
                  alt={item.title}
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80';
                  }}
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 2,
                    objectFit: 'cover',
                    border: 1,
                    borderColor: 'divider',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                      #{item.id || index + 1}
                    </Typography>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: '0.88rem' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.72rem', mt: 0.3 }}>
                    {item.description || 'Tidak ada deskripsi'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ px: 2, py: 1.2, bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 600 }}>
                  {item.image?.startsWith('/storage') ? 'local_storage' : 'external'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.8 }}>
                  {item.link && item.link !== '#' && (
                    <IconButton
                      size="small"
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        p: 0.7,
                        borderRadius: 1.5,
                        color: 'text.secondary',
                        bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
                        border: 1,
                        borderColor: 'divider',
                        '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                      }}
                    >
                      <OpenInNewIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
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
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: (th) => th.palette.mode === 'dark' ? '#0A0E17' : '#FFFFFF',
                      },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDelete(item)}
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
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}

          {filteredList.length === 0 && (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Tidak ada data portofolio yang cocok dengan pencarian.
              </Typography>
            </Paper>
          )}

          {/* Mobile Pagination Control */}
          {filteredList.length > rowsPerPage && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 2.5,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Button
                size="small"
                variant="outlined"
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                sx={{ fontWeight: 700, fontSize: '0.75rem', px: 1.8 }}
              >
                Sebelumnya
              </Button>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredList.length)} dari {filteredList.length}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                disabled={(page + 1) * rowsPerPage >= filteredList.length}
                onClick={() => setPage((prev) => prev + 1)}
                sx={{ fontWeight: 700, fontSize: '0.75rem', px: 1.8 }}
              >
                Berikutnya
              </Button>
            </Paper>
          )}
        </Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2.5, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: 60 }}>#ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: 80 }}>Media</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Judul &amp; Deskripsi</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: 160 }}>Kategori</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: 140 }}>Penyimpanan</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', width: 120 }}>
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedList.map((item, index) => (
                  <TableRow key={item.id || index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      #{item.id || index + 1}
                    </TableCell>
                    <TableCell>
                      <Box
                        component="img"
                        src={getStorageUrl(item.image)}
                        alt={item.title}
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80';
                        }}
                        sx={{
                          width: 56,
                          height: 40,
                          objectFit: 'cover',
                          borderRadius: 1.5,
                          border: 1,
                          borderColor: 'divider',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>
                        {item.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.72rem',
                        }}
                      >
                        {item.description || 'Tidak ada deskripsi'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.category}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                          color: 'text.primary',
                          border: 1,
                          borderColor: 'divider',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 600 }}>
                        {item.image?.startsWith('/storage') ? 'local_disk' : 'remote_url'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8 }}>
                        {item.link && item.link !== '#' && (
                          <Tooltip title="Buka Tautan">
                            <IconButton
                              size="small"
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              sx={{
                                p: 0.7,
                                borderRadius: 1.5,
                                color: 'text.secondary',
                                bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
                                border: 1,
                                borderColor: 'divider',
                                '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                              }}
                            >
                              <OpenInNewIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit Portofolio">
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
                              '&:hover': {
                                bgcolor: 'primary.main',
                                color: (th) => th.palette.mode === 'dark' ? '#0A0E17' : '#FFFFFF',
                              },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus Portofolio">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDelete(item)}
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
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tidak ada portofolio yang cocok dengan filter atau pencarian.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Desktop Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[6, 12, 24, { label: 'Semua', value: filteredList.length }]}
            component="div"
            count={filteredList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Item per halaman:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
            sx={{
              borderTop: 1,
              borderColor: 'divider',
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'text.secondary',
              },
            }}
          />
        </Paper>
      )}

      {/* Form Dialog: Create & Edit with Direct Image Upload */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.05rem', pb: 1 }}>
            {isEditing ? 'Perbarui Portofolio' : 'Tambah Portofolio Baru'}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Judul Proyek"
              fullWidth
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              size="small"
            />

            <TextField
              select
              label="Kategori"
              fullWidth
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              size="small"
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            {/* Direct Image Upload Dropzone */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                border: '2px dashed',
                borderColor: selectedFile ? 'primary.main' : 'divider',
                bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.03)',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.08)' : 'rgba(67, 56, 202, 0.05)',
                },
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
                  {selectedFile && (
                    <Typography variant="caption" display="block" color="success.main" fontWeight={700} sx={{ mt: 0.8, fontSize: '0.75rem' }}>
                      ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB) siap diunggah
                    </Typography>
                  )}
                </Box>
              ) : (
                <ImageOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 0.5 }} />
              )}

              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                id="portfolio-file-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="portfolio-file-upload">
                <Button
                  component="span"
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<CloudUploadIcon sx={{ fontSize: 18 }} />}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', mt: 0.5 }}
                >
                  Pilih Berkas Gambar
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, fontSize: '0.72rem', fontWeight: 500 }}>
                Format: PNG, JPG, WEBP (Maks 10MB). Tersimpan lokal di storage.
              </Typography>
            </Box>

            <TextField
              label="URL Gambar Cadangan (Opsional)"
              fullWidth
              value={formData.image}
              onChange={(e) => {
                setFormData({ ...formData, image: e.target.value });
                if (!selectedFile) setPreviewUrl(e.target.value);
              }}
              size="small"
              helperText="Path lokal (/storage/portfolios/...) atau URL eksternal"
            />

            <TextField
              label="Tautan Proyek / Demo"
              fullWidth
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              size="small"
              placeholder="https://..."
            />

            <TextField
              label="Deskripsi Proyek"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              size="small"
            />
          </DialogContent>
          <DialogActions sx={{ px: 2.5, py: 1.5 }}>
            <Button onClick={() => setOpenForm(false)} disabled={loading} color="inherit" size="small">
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              size="small"
              sx={{ fontWeight: 600, px: 2.5 }}
            >
              {loading || uploadingImage ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                'Simpan Data'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} PaperProps={{ sx: { borderRadius: 2.5 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Hapus Portofolio</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            Apakah Anda yakin ingin menghapus <strong>"{deleteTarget?.title}"</strong>? Data akan dihapus permanen dari PostgreSQL.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={() => setOpenDelete(false)} disabled={loading} color="inherit" size="small">
            Batal
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
            size="small"
            sx={{ fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
