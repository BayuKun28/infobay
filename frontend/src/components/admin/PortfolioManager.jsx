import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import CategoryIcon from '@mui/icons-material/Category';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LayersIcon from '@mui/icons-material/Layers';
import { adminService, categoryService } from '../../services/api';
import { getStorageUrl } from '../../utils';
import CategoryManagerModal from './CategoryManagerModal';

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

  // Dynamic Categories state
  const [categories, setCategories] = useState([]);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

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
    order_index: 1,
    tech_stack: [],
  });
  const [newTechInput, setNewTechInput] = useState('');

  // Local file upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete Dialog state
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch dynamic categories from DB
  const loadCategories = useCallback(async () => {
    try {
      const data = await categoryService.getCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Combined category list for filters (DB categories + any categories currently in portfolios)
  const allCategoryNames = useMemo(() => {
    const names = new Set(categories.map((c) => c.name));
    portfolios.forEach((p) => {
      if (p.category) names.add(p.category);
    });
    return Array.from(names);
  }, [categories, portfolios]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: portfolios.length };
    allCategoryNames.forEach((cat) => {
      counts[cat] = portfolios.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [portfolios, allCategoryNames]);

  // Filter & sort logic (sorted primarily by order_index asc, then id asc)
  const filteredList = useMemo(() => {
    const list = portfolios.filter((item) => {
      const matchSearch =
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'ALL' || item.category === filterCat;
      return matchSearch && matchCat;
    });

    return list.sort((a, b) => {
      const orderA = a.order_index ?? a.id ?? 0;
      const orderB = b.order_index ?? b.id ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.id ?? 0) - (b.id ?? 0);
    });
  }, [portfolios, search, filterCat]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const paginatedList = useMemo(() => {
    return filteredList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredList, page, rowsPerPage]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setNewTechInput('');
    const defaultCat = categories[0]?.name || 'Web Development';
    const nextOrder = portfolios.length > 0
      ? Math.max(...portfolios.map((p) => p.order_index ?? 0)) + 1
      : 1;

    setFormData({
      title: '',
      category: defaultCat,
      image: '',
      link: '#',
      description: '',
      order_index: nextOrder,
      tech_stack: [],
    });
    setOpenForm(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setSelectedFile(null);
    setPreviewUrl(item.image || '');
    setNewTechInput('');

    const parsedTech = Array.isArray(item.tech_stack)
      ? item.tech_stack.map((t) => (typeof t === 'object' && t !== null ? t.name || t.tag || '' : String(t))).filter(Boolean)
      : typeof item.tech_stack === 'string'
      ? item.tech_stack.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    setFormData({
      title: item.title || '',
      category: item.category || 'Web Development',
      image: item.image || '',
      link: item.link || '#',
      description: item.description || '',
      order_index: item.order_index ?? 1,
      tech_stack: parsedTech,
    });
    setOpenForm(true);
  };

  const handleAddTechTag = () => {
    const trimmed = newTechInput.trim().replace(/^#/, '');
    if (trimmed && !formData.tech_stack.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        tech_stack: [...prev.tech_stack, trimmed],
      }));
      setNewTechInput('');
    }
  };

  const handleRemoveTechTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((t) => t !== tagToRemove),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Ukuran file maksimal 10MB', 'error');
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
        order_index: parseInt(formData.order_index, 10) || 0,
        image: finalImageUrl,
        tech_stack: formData.tech_stack || [],
      };

      if (isEditing) {
        await adminService.updatePortfolio(currentId, payload);
        showToast('Portofolio berhasil diperbarui', 'success');
      } else {
        await adminService.createPortfolio(payload);
        showToast('Portofolio baru berhasil ditambahkan', 'success');
      }
      setOpenForm(false);
      if (onRefresh) onRefresh();
      loadCategories();
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
      if (onRefresh) onRefresh();
      loadCategories();
    } catch (err) {
      console.error('Delete portfolio error:', err);
      showToast(err.response?.data?.message || 'Gagal menghapus portofolio', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick Reorder: swap order with adjacent item in full sorted list
  const handleMoveOrder = async (item, direction) => {
    const sorted = [...portfolios].sort((a, b) => {
      const orderA = a.order_index ?? a.id ?? 0;
      const orderB = b.order_index ?? b.id ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.id ?? 0) - (b.id ?? 0);
    });

    const currentIndex = sorted.findIndex((p) => p.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetItem = sorted[targetIndex];
    let currentOrder = item.order_index ?? currentIndex + 1;
    let targetOrder = targetItem.order_index ?? targetIndex + 1;

    if (currentOrder === targetOrder) {
      targetOrder = currentOrder + direction;
    }

    setLoading(true);
    try {
      await adminService.reorderPortfolios([
        { id: item.id, order_index: targetOrder },
        { id: targetItem.id, order_index: currentOrder },
      ]);
      showToast('Urutan portofolio berhasil diperbarui', 'success');
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Reorder error:', err);
      showToast('Gagal mengubah urutan portofolio', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    if (onRefresh) await onRefresh();
    await loadCategories();
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
                bgcolor: filterCat === 'ALL' ? 'primary.main' : 'action.selected',
                color: filterCat === 'ALL' ? (th) => th.palette.mode === 'dark' ? '#0A0E17' : '#FFFFFF' : 'text.primary',
                border: 1,
                borderColor: filterCat === 'ALL' ? 'primary.main' : 'divider',
                '&:hover': {
                  bgcolor: filterCat === 'ALL' ? 'primary.dark' : 'action.hover',
                  borderColor: 'primary.main',
                  color: 'text.primary',
                },
              }}
            />
            {allCategoryNames.map((cat) => (
              <Chip
                key={cat}
                label={`${cat} (${categoryCounts[cat] || 0})`}
                size="small"
                onClick={() => setFilterCat(cat)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  bgcolor: filterCat === cat ? 'primary.main' : 'transparent',
                  color: filterCat === cat ? (th) => th.palette.mode === 'dark' ? '#0A0E17' : '#FFFFFF' : 'text.primary',
                  border: 1,
                  borderColor: filterCat === cat ? 'primary.main' : 'divider',
                  '&:hover': {
                    bgcolor: filterCat === cat ? 'primary.dark' : 'action.hover',
                    borderColor: 'primary.main',
                    color: 'text.primary',
                  },
                }}
              />
            ))}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CategoryIcon sx={{ fontSize: 16 }} />}
              onClick={() => setOpenCategoryModal(true)}
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'text.primary' },
              }}
            >
              Kelola Kategori
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={handleRefreshAll}
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
              <Box sx={{ display: 'flex', p: 1.5, gap: 1.5 }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Chip
                        label={`#${item.order_index ?? item.id}`}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: 'action.selected',
                          fontFamily: 'monospace',
                        }}
                        title="Urutan Tampil"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        ID:{item.id}
                      </Typography>
                    </Box>
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
                  {Array.isArray(item.tech_stack) && item.tech_stack.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, mt: 0.6 }}>
                      {item.tech_stack.slice(0, 3).map((tech, tIdx) => {
                        const name = typeof tech === 'object' ? tech.name || tech.tag || '' : String(tech);
                        return (
                          <Chip
                            key={tIdx}
                            label={`#${name}`}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)',
                              color: (th) => th.palette.mode === 'dark' ? '#C7D2FE' : '#3730A3',
                            }}
                          />
                        );
                      })}
                      {item.tech_stack.length > 3 && (
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', alignSelf: 'center' }}>
                          +{item.tech_stack.length - 3}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>

              <Box sx={{ px: 2, py: 1.2, bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Reorder controls in mobile card */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveOrder(item, -1)}
                    disabled={loading}
                    sx={{ p: 0.3, border: 1, borderColor: 'divider' }}
                    title="Pindah Naik"
                  >
                    <ArrowDropUpIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveOrder(item, 1)}
                    disabled={loading}
                    sx={{ p: 0.3, border: 1, borderColor: 'divider' }}
                    title="Pindah Turun"
                  >
                    <ArrowDropDownIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                    Urutan: {item.order_index ?? '-'}
                  </Typography>
                </Box>

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
                Tidak ada portofolio yang cocok dengan filter atau pencarian.
              </Typography>
            </Paper>
          )}

          {/* Mobile Pagination Control */}
          {filteredList.length > rowsPerPage && (
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                size="small"
                variant="outlined"
                disabled={page === 0}
                onClick={() => setPage((prev) => prev - 1)}
                sx={{ fontWeight: 700, fontSize: '0.75rem', px: 1.8 }}
              >
                Sebelumnya
              </Button>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Halaman {page + 1} dari {Math.ceil(filteredList.length / rowsPerPage)}
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
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', width: 95 }}>
                    Urutan
                  </TableCell>
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
                    {/* Urutan & Quick Reorder */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                        <Chip
                          label={item.order_index ?? '-'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            minWidth: 28,
                            bgcolor: 'action.selected',
                            fontFamily: 'monospace',
                          }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveOrder(item, -1)}
                            disabled={loading || (page === 0 && index === 0)}
                            sx={{ p: 0.1 }}
                            title="Pindah Naik"
                          >
                            <ArrowDropUpIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveOrder(item, 1)}
                            disabled={loading || ((page + 1) * rowsPerPage >= filteredList.length && index === paginatedList.length - 1)}
                            sx={{ p: 0.1 }}
                            title="Pindah Turun"
                          >
                            <ArrowDropDownIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </TableCell>

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
                      {Array.isArray(item.tech_stack) && item.tech_stack.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {item.tech_stack.slice(0, 3).map((tech, tIdx) => {
                            const name = typeof tech === 'object' ? tech.name || tech.tag || '' : String(tech);
                            return (
                              <Chip
                                key={tIdx}
                                label={`#${name}`}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.62rem',
                                  fontWeight: 700,
                                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)',
                                  color: (th) => th.palette.mode === 'dark' ? '#C7D2FE' : '#3730A3',
                                }}
                              />
                            );
                          })}
                          {item.tech_stack.length > 3 && (
                            <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'text.secondary', alignSelf: 'center' }}>
                              +{item.tech_stack.length - 3}
                            </Typography>
                          )}
                        </Box>
                      )}
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
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tidak ada portofolio yang cocok dengan filter atau pencarian.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

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

            {/* Order Index Input */}
            <TextField
              label="Urutan Tampil (Order Index)"
              type="number"
              fullWidth
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value, 10) || 0 })}
              size="small"
              helperText="Angka lebih kecil tampil lebih dulu (contoh: 1, 2, 3...)"
            />

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
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    {selectedFile ? `File baru: ${selectedFile.name}` : 'Gambar saat ini'}
                  </Typography>
                </Box>
              ) : (
                <ImageOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              )}

              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="admin-portfolio-upload-input"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="admin-portfolio-upload-input">
                <Button
                  variant="outlined"
                  component="span"
                  size="small"
                  startIcon={<CloudUploadIcon />}
                  sx={{ fontWeight: 600, fontSize: '0.78rem' }}
                >
                  {previewUrl ? 'Ganti File Gambar' : 'Pilih Berkas Gambar'}
                </Button>
              </label>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.8, fontSize: '0.7rem' }}>
                Format didukung: JPG, PNG, WEBP, GIF, SVG (Maks. 10MB)
              </Typography>
            </Box>

            <TextField
              label="URL Gambar Manual (Opsional jika tidak upload berkas)"
              fullWidth
              value={formData.image}
              onChange={(e) => {
                setFormData({ ...formData, image: e.target.value });
                if (!selectedFile) setPreviewUrl(e.target.value);
              }}
              size="small"
              placeholder="https://..."
              helperText="Bisa diisi URL gambar eksternal atau biarkan kosong jika mengunggah file di atas."
            />

            <TextField
              label="Tautan Proyek / Demo"
              fullWidth
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              size="small"
              placeholder="https://..."
            />

            {/* Tech Stack & Frameworks Input */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <LayersIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                TECH STACK & FRAMEWORKS
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  placeholder="Ketik teknologi (contoh: Laravel, React, Tailwind) lalu tekan Enter"
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
                  helperText="Tekan Enter atau klik Tambah untuk menyematkan tag teknologi pada portofolio ini"
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddTechTag}
                  disabled={!newTechInput.trim()}
                  sx={{ height: 40, minWidth: 85, fontWeight: 700 }}
                >
                  Tambah
                </Button>
              </Box>

              {/* Chips Display */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.8,
                  minHeight: 38,
                  p: 1.2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
                }}
              >
                {formData.tech_stack && formData.tech_stack.length > 0 ? (
                  formData.tech_stack.map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      onDelete={() => handleRemoveTechTag(tag)}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)',
                        color: (th) => th.palette.mode === 'dark' ? '#C7D2FE' : '#3730A3',
                        border: 1,
                        borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(67, 56, 202, 0.25)',
                        '& .MuiChip-deleteIcon': {
                          color: (th) => th.palette.mode === 'dark' ? '#A5B4FC' : '#4338CA',
                          '&:hover': { color: 'error.main' },
                        },
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', alignSelf: 'center', px: 0.5 }}>
                    Belum ada tech stack disematkan. Ketik di atas dan tekan Tambah atau Enter.
                  </Typography>
                )}
              </Box>
            </Box>

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

      {/* Dedicated Category Manager Modal */}
      <CategoryManagerModal
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
        categories={categories}
        onCategoriesChange={loadCategories}
        showToast={showToast}
      />
    </Box>
  );
}
