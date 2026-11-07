import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import { adminService } from '../../services/api';
import { getStorageUrl } from '../../utils';

export default function MediaSelectorModal({ open, onClose, onSelect, showToast }) {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
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
    }
  }, [open]);

  const filteredMedia = mediaList.filter((m) =>
    m.filename.toLowerCase().includes(search.toLowerCase())
  );

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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PermMediaIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight={800}>
            Pustaka Media Server
          </Typography>
          <Chip label={`${mediaList.length} Berkas`} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <IconButton size="small" onClick={fetchMedia} disabled={loading} title="Segarkan">
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose} title="Tutup">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 2 }}>
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
            }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.82rem' } }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, gap: 1.5 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Memuat berkas media...
            </Typography>
          </Box>
        ) : filteredMedia.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {search ? 'Tidak ada berkas yang cocok dengan pencarian.' : 'Belum ada berkas media di server.'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5} sx={{ maxHeight: 420, overflowY: 'auto', p: 0.5 }}>
            {filteredMedia.map((item) => (
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
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <CardMedia
                    component="img"
                    image={getStorageUrl(item.url)}
                    alt={item.filename}
                    sx={{
                      height: 110,
                      objectFit: 'cover',
                      bgcolor: 'action.hover',
                    }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&auto=format&fit=crop&q=80';
                    }}
                  />
                  <CardContent sx={{ p: 1, flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.2,
                      }}
                      title={item.filename}
                    >
                      {item.filename}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mt: 0.3 }}>
                      {item.size_kb} KB • {item.modified_at?.slice(0, 10)}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 0.8, pt: 0, justifyContent: 'space-between' }} onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        onSelect(item.url);
                        onClose();
                      }}
                      sx={{ fontSize: '0.68rem', py: 0.2, px: 1, minWidth: 0, fontWeight: 700 }}
                    >
                      Pilih
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => handleDelete(item.filename, e)}
                      disabled={deletingFile === item.filename}
                      sx={{ p: 0.4 }}
                      title="Hapus berkas"
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit" size="small" sx={{ fontWeight: 600 }}>
          Batal
        </Button>
      </DialogActions>
    </Dialog>
  );
}
