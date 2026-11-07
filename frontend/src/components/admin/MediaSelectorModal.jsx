import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { adminService } from '../../services/api';
import { getStorageUrl } from '../../utils';

export default function MediaSelectorModal({ open, onClose, onSelect, showToast }) {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'size_desc' | 'size_asc' | 'name_asc' | 'name_desc'
  const [deletingFile, setDeletingFile] = useState(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await adminService.getMedia();
      setMediaList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load media assets:', err);
      if (showToast) showToast('Gagal memuat daftar pustaka media', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
      setSearch('');
      setSortBy('newest');
    }
  }, [open]);

  const filteredMedia = useMemo(() => {
    let result = [...mediaList];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => (m.filename || '').toLowerCase().includes(q));
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

  const handleUploadFromModal = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast?.('Ukuran file maksimal 10MB.', 'warning');
      return;
    }

    setUploading(true);
    try {
      const res = await adminService.uploadMedia(file);
      showToast?.('Berkas media berhasil diunggah!', 'success');
      await fetchMedia();
      if (res?.url) {
        onSelect(res.url);
        onClose();
      }
    } catch (err) {
      console.error('Upload in modal failed:', err);
      showToast?.('Gagal mengunggah berkas media.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (filename, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Hapus berkas "${filename}" permanen dari storage server?`)) return;

    setDeletingFile(filename);
    try {
      await adminService.deleteMedia(filename);
      setMediaList((prev) => prev.filter((m) => m.filename !== filename));
      if (showToast) showToast('Berkas media berhasil dihapus', 'success');
    } catch {
      if (showToast) showToast('Gagal menghapus berkas media', 'error');
    } finally {
      setDeletingFile(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (th) => (th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.02)'),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <PermMediaIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              Pustaka Media Server
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pilih gambar yang sudah ada atau unggah langsung
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${mediaList.length} Berkas`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
          />
          <IconButton size="small" onClick={fetchMedia} disabled={loading} title="Segarkan">
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose} title="Tutup">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Modal Content with Generous Spacing */}
      <DialogContent sx={{ px: { xs: 2, sm: 3.5 }, pt: 3.5, pb: 2.5 }}>
        {/* Search, Sort & Upload Action Toolbar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: 'center',
            mb: 2.5,
            mt: 1,
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Cari nama berkas gambar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '0.82rem' } }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 170 }, flexShrink: 0 }}>
            <InputLabel id="media-modal-sort-label">Urutan</InputLabel>
            <Select
              labelId="media-modal-sort-label"
              value={sortBy}
              label="Urutan"
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

          <Button
            component="label"
            variant="outlined"
            size="small"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon fontSize="small" />}
            sx={{
              whiteSpace: 'nowrap',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.78rem',
              px: 2,
              height: 40,
              width: { xs: '100%', sm: 'auto' },
              flexShrink: 0,
            }}
          >
            {uploading ? 'Mengunggah...' : '+ Unggah Baru'}
            <input
              type="file"
              hidden
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={handleUploadFromModal}
            />
          </Button>
        </Box>

        {/* Counter Info */}
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Menampilkan <strong>{filteredMedia.length}</strong> dari {mediaList.length} media server
          </Typography>
          {search && (
            <Button size="small" color="inherit" onClick={() => setSearch('')} sx={{ fontSize: '0.7rem', p: 0 }}>
              Reset Pencarian
            </Button>
          )}
        </Box>

        {/* Media Grid / Empty State */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 8, gap: 1.5 }}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Memuat berkas media dari server...
            </Typography>
          </Box>
        ) : filteredMedia.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, border: '1.5px dashed', borderColor: 'divider', borderRadius: 2 }}>
            <PermMediaIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="subtitle2" fontWeight={700}>
              {search ? 'Tidak ada berkas yang cocok dengan pencarian' : 'Belum ada berkas media di server'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {search
                ? `Kata kunci "${search}" tidak ditemukan. Coba reset pencarian.`
                : 'Klik tombol "+ Unggah Baru" di atas untuk menambahkan gambar.'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5} sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
            {filteredMedia.map((item) => {
              const isWebp = item.filename?.toLowerCase().endsWith('.webp');
              return (
                <Grid item xs={6} sm={4} md={3} key={item.filename}>
                  <Card
                    elevation={0}
                    onClick={() => {
                      onSelect(item.url);
                      onClose();
                    }}
                    sx={{
                      border: 1.5,
                      borderColor: 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: (th) => th.shadows[3],
                        transform: 'translateY(-2px)',
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <Box sx={{ position: 'relative', height: 110, bgcolor: 'action.hover' }}>
                      <CardMedia
                        component="img"
                        image={getStorageUrl(item.url)}
                        alt={item.filename}
                        sx={{
                          height: '100%',
                          width: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.target.src = '/favicon.svg';
                        }}
                      />
                      {isWebp && (
                        <Chip
                          label="WEBP"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            height: 18,
                            bgcolor: 'success.main',
                            color: '#fff',
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ p: 1, pb: 0.5, flex: 1 }}>
                      <Tooltip title={item.filename} arrow>
                        <Typography
                          variant="caption"
                          noWrap
                          display="block"
                          sx={{ fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.3 }}
                        >
                          {item.filename}
                        </Typography>
                      </Tooltip>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                          {item.size_kb} KB
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {item.modified_at?.split(' ')[0]}
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 0.8, pt: 0, justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(item.url);
                          onClose();
                        }}
                        sx={{
                          fontSize: '0.68rem',
                          py: 0.2,
                          px: 1,
                          fontWeight: 700,
                          textTransform: 'none',
                        }}
                      >
                        Pilih
                      </Button>
                      <Tooltip title="Hapus Berkas">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deletingFile === item.filename}
                          onClick={(e) => handleDelete(item.filename, e)}
                        >
                          {deletingFile === item.filename ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>

      {/* Modal Actions */}
      <DialogActions sx={{ px: 3, py: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
        <Button onClick={onClose} color="inherit" size="small" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
}
