import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import { categoryService } from '../../services/api';

export default function CategoryManagerModal({
  open,
  onClose,
  categories = [],
  onCategoriesChange,
  showToast,
}) {
  const [newCatName, setNewCatName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Add new category
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSubmitting(true);
    try {
      await categoryService.createCategory({ name: newCatName.trim() });
      setNewCatName('');
      if (showToast) showToast('Kategori baru berhasil ditambahkan ke database!', 'success');
      if (onCategoriesChange) await onCategoriesChange();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambahkan kategori.';
      if (showToast) showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Start inline edit
  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  // Save inline edit
  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;

    setSubmitting(true);
    try {
      await categoryService.updateCategory(id, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
      if (showToast) showToast('Nama kategori berhasil diperbarui!', 'success');
      if (onCategoriesChange) await onCategoriesChange();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui kategori.';
      if (showToast) showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    setSubmitting(true);
    try {
      await categoryService.deleteCategory(id);
      setDeleteConfirmId(null);
      if (showToast) showToast('Kategori berhasil dihapus.', 'success');
      if (onCategoriesChange) await onCategoriesChange();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus kategori.';
      if (showToast) showToast(msg, 'error');
    } finally {
      setSubmitting(false);
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
          border: '2px solid black',
          boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 800,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid black',
          bgcolor: '#FFFDF0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon sx={{ color: 'text.primary' }} />
          <span>Kelola Kategori Portofolio (Dinamis Database)</span>
        </Box>
        <Chip
          label={`${categories.length} Kategori`}
          size="small"
          sx={{ fontWeight: 800, border: '1.5px solid black', bgcolor: '#FFE600' }}
        />
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Form Input Kategori Baru */}
        <Paper
          component="form"
          onSubmit={handleAdd}
          elevation={0}
          sx={{
            p: 2,
            border: '2px solid black',
            bgcolor: '#F8FAFC',
            boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <TextField
            label="Nama Kategori Baru"
            placeholder="Contoh: Cloud Architecture, Machine Learning..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            fullWidth
            size="small"
            disabled={submitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                '& fieldset': { borderColor: 'black', borderWidth: '1.5px' },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !newCatName.trim()}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{
              bgcolor: '#FFE600',
              color: 'black',
              fontWeight: 800,
              border: '2px solid black',
              boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
              whiteSpace: 'nowrap',
              px: 3,
              '&:hover': {
                bgcolor: '#FFD700',
                boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
              },
            }}
          >
            Tambah Kategori
          </Button>
        </Paper>

        {/* Tabel Kategori */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: '2px solid black',
            boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
            maxHeight: 340,
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#F1F5F9', fontWeight: 800, borderBottom: '2px solid black' } }}>
                <TableCell width={60} align="center">#</TableCell>
                <TableCell>Nama Kategori</TableCell>
                <TableCell>Slug Sistem</TableCell>
                <TableCell align="center">Portofolio Terkait</TableCell>
                <TableCell width={120} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Belum ada kategori portofolio di database.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat, idx) => {
                  const isEditingThis = editingId === cat.id;
                  const inUse = (cat.portfolios_count || 0) > 0;

                  return (
                    <TableRow key={cat.id} hover sx={{ '& td': { borderColor: 'divider' } }}>
                      <TableCell align="center" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        {isEditingThis ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              size="small"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              autoFocus
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: 'white',
                                  fontSize: '0.85rem',
                                },
                              }}
                            />
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleSaveEdit(cat.id)}
                              disabled={submitting || !editName.trim()}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="inherit"
                              onClick={() => setEditingId(null)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {cat.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'text.secondary' }}>
                        {cat.slug}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${cat.portfolios_count || 0} Karya`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            bgcolor: inUse ? '#E0F2FE' : '#F1F5F9',
                            color: inUse ? '#0369A1' : 'text.secondary',
                            border: '1px solid black',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {deleteConfirmId === cat.id ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Button
                              size="small"
                              color="error"
                              variant="contained"
                              sx={{ minWidth: 45, px: 1, py: 0.2, fontSize: '0.7rem', fontWeight: 800 }}
                              onClick={() => handleDelete(cat.id)}
                              disabled={submitting}
                            >
                              Ya
                            </Button>
                            <Button
                              size="small"
                              color="inherit"
                              sx={{ minWidth: 45, px: 1, py: 0.2, fontSize: '0.7rem' }}
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Batal
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Ubah Nama Kategori">
                              <IconButton
                                size="small"
                                onClick={() => startEdit(cat)}
                                disabled={submitting || isEditingThis}
                                sx={{ border: '1px solid #ccc' }}
                              >
                                <EditIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={
                                inUse
                                  ? `Tidak dapat dihapus: sedang digunakan ${cat.portfolios_count} karya.`
                                  : 'Hapus Kategori'
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteConfirmId(cat.id)}
                                  disabled={submitting || inUse}
                                  sx={{ border: '1px solid #ffcdd2' }}
                                >
                                  <DeleteIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '2px solid black', bgcolor: '#F8FAFC' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: 'black',
            fontWeight: 800,
            borderColor: 'black',
            boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
            '&:hover': {
              borderColor: 'black',
              bgcolor: '#e2e8f0',
            },
          }}
        >
          Selesai &amp; Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
}
