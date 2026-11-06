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
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
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
    client_name: '',
    project_year: '',
    category: 'Web Development',
    image: '',
    gallery: [],
    link: '#',
    github_url: '',
    project_role: '',
    is_featured: false,
    description: '',
    order_index: 1,
    tech_stack: [],
    metrics: [],
    highlights: [],
  });
  const [newTechInput, setNewTechInput] = useState('');
  const [newMetricInput, setNewMetricInput] = useState('');
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);

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
    setNewMetricInput('');
    const defaultCat = categories[0]?.name || 'Web Development';
    const nextOrder = portfolios.length > 0
      ? Math.max(...portfolios.map((p) => p.order_index ?? 0)) + 1
      : 1;

    setFormData({
      title: '',
      client_name: '',
      project_year: new Date().getFullYear().toString(),
      category: defaultCat,
      image: '',
      gallery: [],
      link: '#',
      github_url: '',
      project_role: '',
      is_featured: false,
      description: '',
      order_index: nextOrder,
      tech_stack: [],
      metrics: [],
      highlights: ['PRODUCTION READY', 'SECURE ARCHITECTURE', 'RESPONSIVE DESIGN'],
    });
    setNewGalleryUrl('');
    setNewGalleryCaption('');
    setOpenForm(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setSelectedFile(null);
    setPreviewUrl(item.image || '');
    setNewTechInput('');
    setNewMetricInput('');
    setNewHighlightInput('');
    setNewGalleryUrl('');
    setNewGalleryCaption('');

    const parsedGallery = Array.isArray(item.gallery)
      ? item.gallery
      : typeof item.gallery === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(item.gallery);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

    const parsedTech = Array.isArray(item.tech_stack)
      ? item.tech_stack.map((t) => (typeof t === 'object' && t !== null ? t.name || t.tag || '' : String(t))).filter(Boolean)
      : typeof item.tech_stack === 'string'
      ? item.tech_stack.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedMetrics = Array.isArray(item.metrics)
      ? item.metrics.map(String).filter(Boolean)
      : typeof item.metrics === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(item.metrics);
            return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
          } catch {
            return item.metrics.split('\n').map((s) => s.trim()).filter(Boolean);
          }
        })()
      : [];

    const parsedHighlights = Array.isArray(item.highlights)
      ? item.highlights.map(String).filter(Boolean)
      : typeof item.highlights === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(item.highlights);
            return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
          } catch {
            return item.highlights.split(',').map((s) => s.trim()).filter(Boolean);
          }
        })()
      : ['PRODUCTION READY', 'SECURE ARCHITECTURE', 'RESPONSIVE DESIGN'];

    setFormData({
      title: item.title || '',
      client_name: item.client_name || '',
      project_year: item.project_year || '',
      category: item.category || 'Web Development',
      image: item.image || '',
      gallery: parsedGallery,
      link: item.link || '#',
      github_url: item.github_url || '',
      project_role: item.project_role || '',
      is_featured: Boolean(item.is_featured ?? item.featured ?? false),
      description: item.description || '',
      order_index: item.order_index ?? 1,
      tech_stack: parsedTech,
      metrics: parsedMetrics,
      highlights: parsedHighlights,
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

  const handleAddMetric = () => {
    const trimmed = newMetricInput.trim();
    if (trimmed && !formData.metrics.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        metrics: [...prev.metrics, trimmed],
      }));
      setNewMetricInput('');
    }
  };

  const handleRemoveMetric = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleAddHighlight = () => {
    const trimmed = newHighlightInput.trim();
    if (trimmed && !formData.highlights.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        highlights: [...prev.highlights, trimmed],
      }));
      setNewHighlightInput('');
    }
  };

  const handleRemoveHighlight = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleAddGalleryItem = (url, caption = '') => {
    const targetUrl = url || newGalleryUrl.trim();
    if (targetUrl) {
      setFormData((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), { url: targetUrl, caption: caption || newGalleryCaption.trim() }],
      }));
      setNewGalleryUrl('');
      setNewGalleryCaption('');
    }
  };

  const handleRemoveGalleryItem = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleUploadGalleryFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('Ukuran file maksimal 10MB', 'error');
      return;
    }
    setUploadingGallery(true);
    try {
      const res = await adminService.uploadImage(file);
      if (res?.url) {
        handleAddGalleryItem(res.url, file.name.replace(/\.[^/.]+$/, ''));
        showToast('Screenshot berhasil ditambahkan ke galeri', 'success');
      }
    } catch (err) {
      console.error('Upload gallery screenshot failed:', err);
      showToast('Gagal mengunggah screenshot galeri', 'error');
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
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
        metrics: formData.metrics || [],
        highlights: formData.highlights || [],
        project_role: formData.project_role || '',
        github_url: formData.github_url || '',
        is_featured: Boolean(formData.is_featured),
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
      {/* Standardized Table Toolbar: Filter Combobox Left, Search & Actions Right */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', lg: 'center' },
            justifyContent: 'space-between',
          }}
        >
          {/* LEFT: Filter Combobox & Category Manager */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="portfolio-category-filter-label" sx={{ fontSize: '0.82rem' }}>
                Filter Kategori
              </InputLabel>
              <Select
                labelId="portfolio-category-filter-label"
                id="portfolio-category-filter"
                value={filterCat}
                label="Filter Kategori"
                onChange={(e) => {
                  setFilterCat(e.target.value);
                  setPage(0);
                }}
                sx={{ fontSize: '0.82rem', borderRadius: 2 }}
              >
                <MenuItem value="ALL" sx={{ fontSize: '0.82rem' }}>
                  Semua Kategori ({categoryCounts.ALL || 0})
                </MenuItem>
                {allCategoryNames.map((cat) => (
                  <MenuItem key={cat} value={cat} sx={{ fontSize: '0.82rem' }}>
                    {cat} ({categoryCounts[cat] || 0})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenCategoryModal(true)}
              sx={{
                fontWeight: 600,
                fontSize: '0.78rem',
                borderColor: 'divider',
                color: 'text.secondary',
                height: 40,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'text.primary', color: 'text.primary' },
              }}
            >
              Kelola Kategori
            </Button>
          </Box>

          {/* RIGHT: Search Input & Primary Actions */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              flexWrap: 'wrap',
              justifyContent: { xs: 'stretch', lg: 'flex-end' },
            }}
          >
            <TextField
              size="small"
              placeholder="Cari karya portofolio..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              sx={{ width: { xs: '100%', sm: 260 }, '& .MuiOutlinedInput-root': { fontSize: '0.82rem' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearch(''); setPage(0); }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={handleOpenCreate}
              sx={{ fontWeight: 600, fontSize: '0.78rem', height: 40, whiteSpace: 'nowrap' }}
            >
              Tambah Portofolio
            </Button>

            <Tooltip title="Muat ulang data">
              <IconButton
                size="small"
                onClick={handleRefreshAll}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: 40,
                  width: 40,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                }}
              >
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
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
                      {(item.is_featured ?? item.featured) && (
                        <Chip
                          label="Featured"
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 18,
                            fontSize: '0.62rem',
                            fontWeight: 600,
                            color: 'text.secondary',
                            borderColor: 'divider',
                          }}
                          title="Proyek Unggulan"
                        />
                      )}
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
                  {item.project_role && (
                    <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 700, fontSize: '0.68rem', mt: -0.2 }}>
                      {item.project_role}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.72rem', mt: 0.3 }}>
                    {item.description || 'Tidak ada deskripsi'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, mt: 0.6 }}>
                    {Array.isArray(item.tech_stack) && item.tech_stack.slice(0, 3).map((tech, tIdx) => {
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
                    {Array.isArray(item.metrics) && item.metrics.length > 0 && (
                      <Chip
                        label={`${item.metrics.length} Metrik`}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 16,
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          color: 'text.secondary',
                          borderColor: 'divider',
                        }}
                      />
                    )}
                  </Box>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>
                          {item.title}
                        </Typography>
                        {(item.is_featured ?? item.featured) && (
                          <Chip
                            label="FEATURED"
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              color: 'text.secondary',
                              borderColor: 'divider',
                            }}
                          />
                        )}
                      </Box>
                      {item.project_role && (
                        <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 700, fontSize: '0.7rem' }}>
                          {item.project_role}
                        </Typography>
                      )}
                      {(item.client_name || item.project_year) && (
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.68rem', fontWeight: 500 }}>
                          {item.client_name ? `Klien: ${item.client_name}` : ''} {item.project_year ? `• ${item.project_year}` : ''}
                        </Typography>
                      )}
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
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {Array.isArray(item.tech_stack) && item.tech_stack.length > 0 &&
                          item.tech_stack.slice(0, 3).map((tech, tIdx) => {
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
                        {Array.isArray(item.metrics) && item.metrics.length > 0 && (
                          <Chip
                            label={`${item.metrics.length} Metrik`}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              color: 'text.secondary',
                              borderColor: 'divider',
                            }}
                          />
                        )}
                      </Box>
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
        maxWidth="md"
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

            {/* Client Name & Project Year */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
              <TextField
                label="Nama Klien / Lembaga Mitra"
                fullWidth
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                size="small"
                placeholder="Contoh: PT Jamkrida Jatim, Diskominfo"
                helperText="Nama klien atau lembaga pemilik sistem (opsional)"
              />
              <TextField
                label="Tahun Rilis"
                fullWidth
                value={formData.project_year}
                onChange={(e) => setFormData({ ...formData, project_year: e.target.value })}
                size="small"
                placeholder="Contoh: 2024"
                helperText="Tahun pengerjaan / rilis sistem"
              />
            </Box>

            {/* Project Role & Featured Toggle in 2-column Box */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
              <TextField
                label="Peran Proyek (Project Role)"
                fullWidth
                value={formData.project_role}
                onChange={(e) => setFormData({ ...formData, project_role: e.target.value })}
                size="small"
                placeholder="Contoh: Senior Web Programmer / Lead Architect"
                helperText="Peran pada proyek ini (default: Senior Software Engineer)"
              />

              <Box
                sx={{
                  p: 1,
                  px: 1.5,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
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
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                      Proyek Unggulan (Featured)
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              </Box>
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

            {/* Multi-Screenshot Gallery Section (Studi Kasus Detail) */}
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    Galeri Screenshot &amp; Arsitektur
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tangkapan layar tambahan untuk studi kasus detail pada modal portofolio publik.
                  </Typography>
                </Box>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  disabled={uploadingGallery}
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

              {/* Input manual URL / Caption */}
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
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
                  sx={{ width: { xs: '100%', sm: 180 }, '.MuiInputBase-input': { fontSize: '0.82rem' } }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleAddGalleryItem()}
                  disabled={!newGalleryUrl.trim()}
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', px: 2, whiteSpace: 'nowrap' }}
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
                          p: 1,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1.5,
                          bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                        }}
                      >
                        <Box
                          component="img"
                          src={gUrl}
                          alt="thumb"
                          sx={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 1, border: 1, borderColor: 'divider' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 600 }} noWrap>
                            {gCaption || `Screenshot #${gIdx + 1}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
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
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', textAlign: 'center', py: 1 }}>
                  Belum ada screenshot tambahan.
                </Typography>
              )}
            </Box>

            {/* Links: Demo Link & GitHub Source Code in 2-column Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Tautan Proyek / Demo"
                fullWidth
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                size="small"
                placeholder="https://..."
                helperText="Tautan website live / tombol KUNJUNGI WEBSITE"
              />

              <TextField
                label="Tautan GitHub / Source Code"
                fullWidth
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                size="small"
                placeholder="https://github.com/..."
                helperText="Tautan repositori / tombol LIHAT SOURCE CODE"
              />
            </Box>

            {/* Tech Stack & Frameworks Input */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tech Stack &amp; Frameworks
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

            {/* Matrix Informasi & Metrik Kunci Input */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Dampak &amp; Metrik Kunci (Matrix Informasi)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  placeholder="Ketik capaian/metrik (contoh: Rp 100M+ Plafon Kredit Terkelola / 10K+ Transaksi Bulanan)"
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
                  helperText="Tekan Enter atau klik Tambah untuk menyematkan kartu matriks metrik ke modal proyek publik"
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddMetric}
                  disabled={!newMetricInput.trim()}
                  sx={{ height: 40, minWidth: 85, fontWeight: 700 }}
                >
                  Tambah
                </Button>
              </Box>

              {/* Metrics List Display */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.8,
                  minHeight: 38,
                  p: 1.2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
                }}
              >
                {formData.metrics && formData.metrics.length > 0 ? (
                  formData.metrics.map((metric, mIdx) => (
                    <Box
                      key={mIdx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.5,
                        py: 0.8,
                        borderRadius: 1.5,
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`METRIC #${mIdx + 1}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            bgcolor: '#FEF08A',
                            color: '#854D0E',
                            border: 1,
                            borderColor: '#EAB308',
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          {metric}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveMetric(mIdx)}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' }, p: 0.4 }}
                        title="Hapus Metrik"
                      >
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', alignSelf: 'center', px: 0.5 }}>
                    Belum ada matriks metrik disematkan. Ketik di atas dan tekan Tambah atau Enter.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Highlights Badges (Sorotan Keunggulan Proyek) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sorotan Keunggulan (Highlights Badges)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  placeholder="Contoh: HIGH AVAILABILITY / OJK COMPLIANT / ENTERPRISE READY"
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
                  helperText="Badge sorotan khusus yang akan tampil di bagian bawah modal proyek publik"
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddHighlight}
                  disabled={!newHighlightInput.trim()}
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
                  minHeight: 38,
                  p: 1.2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
                }}
              >
                {formData.highlights && formData.highlights.length > 0 ? (
                  formData.highlights.map((hl, hIdx) => (
                    <Chip
                      key={hIdx}
                      label={hl}
                      size="small"
                      variant="outlined"
                      onDelete={() => handleRemoveHighlight(hIdx)}
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        borderColor: 'divider',
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', alignSelf: 'center', px: 0.5 }}>
                    Belum ada badge sorotan. Ketik di atas dan tekan Tambah atau Enter.
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
