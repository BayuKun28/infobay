import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StorageIcon from '@mui/icons-material/Storage';
import { adminService } from '../../services/api';
import { getStorageUrl } from '../../utils';

export default function MediaManager({ showToast }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'size_desc' | 'size_asc' | 'name_asc' | 'name_desc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Preview Dialog state
  const [previewItem, setPreviewItem] = useState(null);

  // Delete Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load media from server
  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getMedia();
      setMediaList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load media:', err);
      showToast?.('Gagal memuat pustaka media dari server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Handle single file upload
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast?.('Ukuran file maksimal 10MB.', 'warning');
      return;
    }

    setUploading(true);
    try {
      const res = await adminService.uploadMedia(file);
      showToast?.(res.message || 'Berkas media berhasil diunggah dan dikompresi ke WebP!', 'success');
      await loadMedia();
    } catch (err) {
      console.error('Upload failed:', err);
      showToast?.('Gagal mengunggah berkas media.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Handle delete media
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteMedia(deleteTarget.filename);
      showToast?.(`Berkas '${deleteTarget.filename}' berhasil dihapus.`, 'success');
      setDeleteTarget(null);
      await loadMedia();
    } catch (err) {
      console.error('Delete media error:', err);
      showToast?.('Gagal menghapus berkas media.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = (url) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard?.writeText(fullUrl);
    showToast?.('Tautan media disalin ke clipboard!', 'success');
  };

  // Filter & sort
  const filteredAndSortedMedia = useMemo(() => {
    let result = [...mediaList];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        (item.filename || '').toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (a.modified_at || '').localeCompare(b.modified_at || '');
        case 'size_desc':
          return (b.size_kb || 0) - (a.size_kb || 0);
        case 'size_asc':
          return (a.size_kb || 0) - (b.size_kb || 0);
        case 'name_asc':
          return (a.filename || '').localeCompare(b.filename || '');
        case 'name_desc':
          return (b.filename || '').localeCompare(a.filename || '');
        case 'newest':
        default:
          return (b.modified_at || '').localeCompare(a.modified_at || '');
      }
    });

    return result;
  }, [mediaList, search, sortBy]);

  // Total size estimation
  const totalSizeKb = useMemo(() => {
    return mediaList.reduce((acc, curr) => acc + (curr.size_kb || 0), 0);
  }, [mediaList]);

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1.5, sm: 2.5, md: 3 } }}>
      {/* Header Bar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 2.5,
          border: 1,
          borderColor: 'divider',
          bgcolor: (th) => (th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.02)'),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                }}
              >
                <PermMediaOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
                  Pustaka Media Server
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kelola seluruh aset gambar portofolio, screenshot arsitektur, dan logo server.
                </Typography>
              </Box>
            </Box>

            {/* Quick stats pills */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
              <Chip
                icon={<StorageIcon sx={{ fontSize: 16 }} />}
                label={`${mediaList.length} Berkas Tersimpan`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Estimasi Ukuran: ${(totalSizeKb / 1024).toFixed(2)} MB`}
                size="small"
                variant="outlined"
                color="info"
              />
              <Chip
                icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                label="Pipeline WebP 80% Aktif"
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadMedia}
              disabled={loading}
              size="small"
              sx={{ fontWeight: 600 }}
            >
              Segarkan
            </Button>
            <Button
              component="label"
              variant="contained"
              startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
              disabled={uploading}
              size="small"
              sx={{ fontWeight: 700 }}
            >
              {uploading ? 'Mengunggah & Mengompresi...' : '+ Unggah Media Baru'}
              <input
                type="file"
                hidden
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={handleUpload}
              />
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Filter, Search & View Controls */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
          }}
        >
          {/* Search Bar */}
          <TextField
            size="small"
            placeholder="Cari nama berkas media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: { xs: '100%', sm: 280 } }}
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

          {/* Sort By & View Mode */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="media-sort-label">Urutkan Berkas</InputLabel>
              <Select
                labelId="media-sort-label"
                value={sortBy}
                label="Urutkan Berkas"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ fontSize: '0.82rem' }}
              >
                <MenuItem value="newest">Terbaru Diunggah</MenuItem>
                <MenuItem value="oldest">Terlama Diunggah</MenuItem>
                <MenuItem value="size_desc">Ukuran Terbesar</MenuItem>
                <MenuItem value="size_asc">Ukuran Terkecil</MenuItem>
                <MenuItem value="name_asc">Nama File (A &rarr; Z)</MenuItem>
                <MenuItem value="name_desc">Nama File (Z &rarr; A)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, display: 'flex' }}>
              <Tooltip title="Tampilan Kartu Grid">
                <IconButton
                  size="small"
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                >
                  <GridViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Tampilan Tabel Rinci">
                <IconButton
                  size="small"
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                >
                  <ViewListIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Status text */}
        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Menampilkan <strong>{filteredAndSortedMedia.length}</strong> dari total {mediaList.length} berkas media
          </Typography>
          {search && (
            <Button size="small" color="inherit" onClick={() => setSearch('')} sx={{ fontSize: '0.72rem', p: 0 }}>
              Reset Pencarian
            </Button>
          )}
        </Box>
      </Paper>

      {/* Media Grid / List Content */}
      {loading ? (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Memuat pustaka media dari server...
          </Typography>
        </Box>
      ) : filteredAndSortedMedia.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            borderRadius: 2.5,
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <PermMediaOutlinedIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 1.5 }} />
          <Typography variant="subtitle1" fontWeight={700}>
            {search ? 'Tidak ada berkas yang cocok dengan pencarian' : 'Belum ada media tersimpan'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 450, mx: 'auto' }}>
            {search
              ? `Tidak ditemukan berkas dengan kata kunci "${search}". Coba gunakan nama file lain.`
              : 'Unggah file gambar baru di atas untuk mulai membangun pustaka media Anda.'}
          </Typography>
          {search && (
            <Button variant="outlined" size="small" onClick={() => setSearch('')} sx={{ mt: 2 }}>
              Tampilkan Semua Media
            </Button>
          )}
        </Paper>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2.5,
          }}
        >
          {filteredAndSortedMedia.map((item, idx) => {
            const isWebp = item.filename?.toLowerCase().endsWith('.webp');
            return (
              <Card
                key={idx}
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: (th) => th.shadows[4],
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* Thumbnail */}
                <Box
                  sx={{
                    position: 'relative',
                    bgcolor: (th) => (th.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'),
                    aspectRatio: '16/10',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                  onClick={() => setPreviewItem(item)}
                >
                  <CardMedia
                    component="img"
                    image={item.url}
                    alt={item.filename}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                    onError={(e) => {
                      e.target.src = '/favicon.svg';
                    }}
                  />
                  {/* Badge Tag */}
                  <Chip
                    label={isWebp ? 'WEBP 80%' : item.filename.split('.').pop()?.toUpperCase()}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 20,
                      bgcolor: isWebp ? 'success.main' : 'primary.main',
                      color: '#fff',
                    }}
                  />
                </Box>

                {/* Content */}
                <CardContent sx={{ p: 1.5, pb: 1, flex: 1 }}>
                  <Tooltip title={item.filename} arrow>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{ fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                      onClick={() => setPreviewItem(item)}
                    >
                      {item.filename}
                    </Typography>
                  </Tooltip>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.8 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {item.size_kb} KB
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.modified_at?.split(' ')[0]}
                    </Typography>
                  </Box>
                </CardContent>

                {/* Card Actions */}
                <CardActions sx={{ p: 1, pt: 0, justifyContent: 'space-between', borderTop: 1, borderColor: 'divider' }}>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                    onClick={() => handleCopyUrl(item.url)}
                    sx={{ fontSize: '0.72rem', textTransform: 'none', fontWeight: 600 }}
                  >
                    Salin URL
                  </Button>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Pratinjau Penuh">
                      <IconButton size="small" onClick={() => setPreviewItem(item)}>
                        <VisibilityIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus Permanen">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      ) : (
        /* TABLE LIST VIEW */
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: (th) => (th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)') }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 80 }}>Pratinjau</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nama Berkas</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 120 }}>Ukuran</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 160 }}>Waktu Unggah</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 140, textAlign: 'right' }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedMedia.map((item, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Box
                      component="img"
                      src={item.url}
                      alt={item.filename}
                      sx={{
                        width: 48,
                        height: 36,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                        cursor: 'pointer',
                      }}
                      onClick={() => setPreviewItem(item)}
                      onError={(e) => { e.target.src = '/favicon.svg'; }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                      onClick={() => setPreviewItem(item)}
                    >
                      {item.filename}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                      {item.url}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${item.size_kb} KB`} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {item.modified_at}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Salin URL">
                      <IconButton size="small" onClick={() => handleCopyUrl(item.url)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Pratinjau">
                      <IconButton size="small" onClick={() => setPreviewItem(item)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Full Resolution Preview Modal */}
      <Dialog
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ maxWidth: '80%' }}>
            {previewItem?.filename}
          </Typography>
          <IconButton size="small" onClick={() => setPreviewItem(null)}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, textAlign: 'center', bgcolor: (th) => th.palette.mode === 'dark' ? '#0B0F19' : '#F1F5F9' }}>
          {previewItem && (
            <Box>
              <Box
                component="img"
                src={previewItem.url}
                alt={previewItem.filename}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 480,
                  borderRadius: 1.5,
                  objectFit: 'contain',
                  border: 1,
                  borderColor: 'divider',
                }}
              />
              <Paper elevation={0} sx={{ mt: 2, p: 2, textAlign: 'left', borderRadius: 1.5, border: 1, borderColor: 'divider' }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  <strong>Path Server:</strong> storage/app/public/portfolios/{previewItem.filename}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  <strong>URL Publik:</strong> {previewItem.url}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  <strong>Ukuran:</strong> {previewItem.size_kb} KB &bull; <strong>Diperbarui:</strong> {previewItem.modified_at}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            startIcon={<ContentCopyIcon />}
            size="small"
            onClick={() => previewItem && handleCopyUrl(previewItem.url)}
          >
            Salin URL Berkas
          </Button>
          <Button
            component="a"
            href={previewItem?.url}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
            size="small"
          >
            Buka di Tab Baru
          </Button>
          <Button variant="contained" size="small" onClick={() => setPreviewItem(null)}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Konfirmasi Hapus Media</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Apakah Anda yakin ingin menghapus berkas media berikut dari server?
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main', fontFamily: 'monospace' }}>
            {deleteTarget?.filename}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Tindakan ini bersifat permanen. Gambar yang sedang dipakai pada portofolio mungkin tidak dapat dimuat jika dihapus.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} color="inherit" size="small">
            Batal
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            size="small"
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus Berkas'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
