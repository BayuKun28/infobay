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
import VisibilityIcon from '@mui/icons-material/Visibility';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import { adminService, categoryService } from '../../services/api';
import { getStorageUrl } from '../../utils';
import CategoryManagerModal from './CategoryManagerModal';
import MediaSelectorModal from './MediaSelectorModal';
import PortfolioEditorScreen from './PortfolioEditorScreen';

export default function PortfolioManager({
  portfolios = [],
  onRefresh,
  showToast,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'DRAFT'
  const [loading, setLoading] = useState(false);

  // Dynamic Categories state
  const [categories, setCategories] = useState([]);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  // Live Preview Modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Media Selector Modal state
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [mediaSelectorTarget, setMediaSelectorTarget] = useState('cover'); // 'cover' | 'gallery'

  // View Mode: 'list' (Table) vs 'editor' (Full-Page Screen)
  const [viewMode, setViewMode] = useState('list');

  // Form state
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
    is_published: true,
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
      const isItemPublished = item.is_published === undefined || Boolean(item.is_published);
      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'PUBLISHED' && isItemPublished) ||
        (filterStatus === 'DRAFT' && !isItemPublished);
      return matchSearch && matchCat && matchStatus;
    });

    return list.sort((a, b) => {
      const orderA = a.order_index ?? a.id ?? 0;
      const orderB = b.order_index ?? b.id ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.id ?? 0) - (b.id ?? 0);
    });
  }, [portfolios, search, filterCat, filterStatus]);

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
      is_published: true,
      description: '',
      order_index: nextOrder,
      tech_stack: [],
      metrics: [],
      highlights: ['PRODUCTION READY', 'SECURE ARCHITECTURE', 'RESPONSIVE DESIGN'],
    });
    setNewGalleryUrl('');
    setNewGalleryCaption('');
    setOpenForm(true);
    setViewMode('editor');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
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
      is_published: item.is_published !== undefined ? Boolean(item.is_published) : true,
      description: item.description || '',
      order_index: item.order_index ?? 1,
      tech_stack: parsedTech,
      metrics: parsedMetrics,
      highlights: parsedHighlights,
    });
    setOpenForm(true);
    setViewMode('editor');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
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
        is_published: Boolean(formData.is_published),
      };

      if (isEditing) {
        await adminService.updatePortfolio(currentId, payload);
        showToast('Portofolio berhasil diperbarui', 'success');
      } else {
        await adminService.createPortfolio(payload);
        showToast('Portofolio baru berhasil ditambahkan', 'success');
      }
      setOpenForm(false);
      setViewMode('list');
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

  // Quick Reorder: atomic move-order via backend endpoint
  const handleMoveOrder = async (item, direction) => {
    setLoading(true);
    try {
      const dir = direction < 0 ? 'up' : 'down';
      await adminService.movePortfolioOrder(item.id, dir);
      showToast('Urutan portofolio berhasil disesuaikan', 'success');
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
      {viewMode === 'editor' ? (
        <PortfolioEditorScreen
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={() => setViewMode('list')}
          loading={loading}
          uploadingImage={uploadingImage}
          allCategoryNames={allCategoryNames}
          setOpenCategoryModal={setOpenCategoryModal}
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          handleFileChange={handleFileChange}
          newTechInput={newTechInput}
          setNewTechInput={setNewTechInput}
          handleAddTechTag={handleAddTechTag}
          handleRemoveTechTag={handleRemoveTechTag}
          newMetricInput={newMetricInput}
          setNewMetricInput={setNewMetricInput}
          handleAddMetric={handleAddMetric}
          handleRemoveMetric={handleRemoveMetric}
          newHighlightInput={newHighlightInput}
          setNewHighlightInput={setNewHighlightInput}
          handleAddHighlight={handleAddHighlight}
          handleRemoveHighlight={handleRemoveHighlight}
          newGalleryUrl={newGalleryUrl}
          setNewGalleryUrl={setNewGalleryUrl}
          newGalleryCaption={newGalleryCaption}
          setNewGalleryCaption={setNewGalleryCaption}
          handleAddGalleryItem={handleAddGalleryItem}
          handleRemoveGalleryItem={handleRemoveGalleryItem}
          handleUploadGalleryFile={handleUploadGalleryFile}
          uploadingGallery={uploadingGallery}
          onOpenMediaSelector={(target) => {
            setMediaSelectorTarget(target);
            setMediaSelectorOpen(true);
          }}
          onPreview={() => {
            setPreviewData({
              ...formData,
              image: previewUrl || formData.image,
            });
            setPreviewModalOpen(true);
          }}
        />
      ) : (
        <>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
            <FormControl size="small" sx={{ width: { xs: '100%', sm: 180 } }}>
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

            <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
              <InputLabel id="portfolio-status-filter-label" sx={{ fontSize: '0.82rem' }}>
                Filter Status
              </InputLabel>
              <Select
                labelId="portfolio-status-filter-label"
                id="portfolio-status-filter"
                value={filterStatus}
                label="Filter Status"
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
                sx={{ fontSize: '0.82rem', borderRadius: 2 }}
              >
                <MenuItem value="ALL" sx={{ fontSize: '0.82rem' }}>
                  Semua Status ({portfolios.length})
                </MenuItem>
                <MenuItem value="PUBLISHED" sx={{ fontSize: '0.82rem' }}>
                  Dipublikasikan ({portfolios.filter((p) => p.is_published === undefined || Boolean(p.is_published)).length})
                </MenuItem>
                <MenuItem value="DRAFT" sx={{ fontSize: '0.82rem' }}>
                  Draf / Tersembunyi ({portfolios.filter((p) => p.is_published !== undefined && !Boolean(p.is_published)).length})
                </MenuItem>
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
                width: { xs: '100%', sm: 'auto' },
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
                      {item.is_published !== undefined && !Boolean(item.is_published) ? (
                        <Chip
                          label="Draf"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            border: 1,
                            borderColor: 'divider',
                          }}
                          title="Tersimpan sebagai draf (tidak tampil di publik)"
                        />
                      ) : null}
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
                  <IconButton
                    size="small"
                    onClick={() => {
                      setPreviewData(item);
                      setPreviewModalOpen(true);
                    }}
                    sx={{
                      p: 0.7,
                      borderRadius: 1.5,
                      color: 'text.secondary',
                      bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
                      border: 1,
                      borderColor: 'divider',
                      '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                    }}
                    title="Pratinjau Publik"
                  >
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                  </IconButton>
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
                        {item.is_published !== undefined && !Boolean(item.is_published) ? (
                          <Chip
                            label="DRAF"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              bgcolor: 'action.hover',
                              color: 'text.secondary',
                              border: 1,
                              borderColor: 'divider',
                            }}
                            title="Tersimpan sebagai draf (tidak tampil di publik)"
                          />
                        ) : null}
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
                        <Tooltip title="Pratinjau Publik">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setPreviewData(item);
                              setPreviewModalOpen(true);
                            }}
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
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
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

        </>
      )}

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

      {/* Live Preview Modal (Simulasi Tampilan Publik Neubrutalism) */}
      <Dialog
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            border: '3px solid #000',
            boxShadow: '6px 6px 0px #000',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#FFDE59',
            color: '#000',
            borderBottom: '3px solid #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Pratinjau Publik
            </Typography>
            {previewData?.is_published !== undefined && !Boolean(previewData.is_published) && (
              <Chip
                label="DRAF (TERSEMBUNYI)"
                size="small"
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  borderRadius: 0,
                  border: '1px solid #000',
                }}
              />
            )}
          </Box>
          <IconButton size="small" onClick={() => setPreviewModalOpen(false)} sx={{ color: '#000' }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: '#FFFBEA' }}>
          {previewData && (
            <Box
              sx={{
                bgcolor: '#FFFFFF',
                border: '3px solid #000',
                boxShadow: '4px 4px 0px #000',
                p: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Media Preview */}
              <Box
                component="img"
                src={previewData.image ? getStorageUrl(previewData.image) : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80'}
                alt={previewData.title || 'Preview'}
                sx={{
                  width: '100%',
                  maxHeight: 260,
                  objectFit: 'cover',
                  border: '2px solid #000',
                  bgcolor: '#F3F4F6',
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80';
                }}
              />

              {/* Badges & Meta */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={previewData.category || 'General'}
                  sx={{
                    bgcolor: '#FFDE59',
                    color: '#000',
                    fontWeight: 900,
                    borderRadius: 0,
                    border: '2px solid #000',
                    fontSize: '0.72rem',
                    boxShadow: '2px 2px 0px #000',
                  }}
                />
                {previewData.project_role && (
                  <Chip
                    label={previewData.project_role}
                    sx={{
                      bgcolor: '#000',
                      color: '#FFF',
                      fontWeight: 800,
                      borderRadius: 0,
                      border: '2px solid #000',
                      fontSize: '0.72rem',
                    }}
                  />
                )}
                {previewData.project_year && (
                  <Chip
                    label={previewData.project_year}
                    variant="outlined"
                    sx={{
                      fontWeight: 800,
                      borderRadius: 0,
                      border: '2px solid #000',
                      fontSize: '0.72rem',
                    }}
                  />
                )}
              </Box>

              {/* Title & Client */}
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-0.02em', mb: 0.5 }}>
                  {previewData.title || '(Judul Portofolio)'}
                </Typography>
                {previewData.client_name && (
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#4B5563' }}>
                    Klien / Mitra: {previewData.client_name}
                  </Typography>
                )}
              </Box>

              {/* Description */}
              <Typography variant="body2" sx={{ color: '#1F2937', lineHeight: 1.6 }}>
                {previewData.description || 'Belum ada ringkasan deskripsi proyek.'}
              </Typography>

              {/* Tech Stack */}
              {Array.isArray(previewData.tech_stack) && previewData.tech_stack.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, pt: 1, borderTop: '2px dashed #000' }}>
                  {previewData.tech_stack.map((tech, idx) => {
                    const name = typeof tech === 'object' ? tech.name || tech.tag || '' : String(tech);
                    return (
                      <Chip
                        key={idx}
                        label={`#${name}`}
                        size="small"
                        sx={{
                          bgcolor: '#E0E7FF',
                          color: '#312E81',
                          fontWeight: 800,
                          borderRadius: 0,
                          border: '1.5px solid #000',
                          fontSize: '0.68rem',
                        }}
                      />
                    );
                  })}
                </Box>
              )}

              {/* Metrics */}
              {Array.isArray(previewData.metrics) && previewData.metrics.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {previewData.metrics.map((metric, mIdx) => (
                    <Box
                      key={mIdx}
                      sx={{
                        p: 1,
                        px: 1.5,
                        border: '2px solid #000',
                        bgcolor: '#FEF9C3',
                        boxShadow: '2px 2px 0px #000',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#854D0E' }}>
                        {metric}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Highlights */}
              {Array.isArray(previewData.highlights) && previewData.highlights.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {previewData.highlights.map((hl, hIdx) => (
                    <Chip
                      key={hIdx}
                      label={hl}
                      size="small"
                      sx={{
                        bgcolor: '#DCFCE7',
                        color: '#14532D',
                        fontWeight: 800,
                        borderRadius: 0,
                        border: '1.5px solid #000',
                        fontSize: '0.65rem',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#FFFBEA', borderTop: '3px solid #000' }}>
          <Button
            onClick={() => setPreviewModalOpen(false)}
            sx={{
              fontWeight: 800,
              textTransform: 'uppercase',
              border: '2px solid #000',
              borderRadius: 0,
              boxShadow: '2px 2px 0px #000',
              bgcolor: '#FFDE59',
              color: '#000',
              px: 2.5,
              '&:hover': { bgcolor: '#FACC15' },
            }}
          >
            Tutup Pratinjau
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Selector & Asset Explorer Dialog */}
      <MediaSelectorModal
        open={mediaSelectorOpen}
        onClose={() => setMediaSelectorOpen(false)}
        onSelect={(selectedUrl) => {
          if (mediaSelectorTarget === 'cover') {
            setFormData((prev) => ({ ...prev, image: selectedUrl }));
            setPreviewUrl(selectedUrl);
            setSelectedFile(null);
            showToast?.('Gambar sampul portofolio diperbarui dari galeri media', 'success');
          } else {
            setNewGalleryUrl(selectedUrl);
            showToast?.('URL gambar dimasukkan ke form tangkapan layar galeri', 'info');
          }
        }}
        showToast={showToast}
      />
    </Box>
  );
}
