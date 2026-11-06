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
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  Alert,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
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

  // Pagination & Search states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (cat) =>
        (cat.name && cat.name.toLowerCase().includes(q)) ||
        (cat.slug && cat.slug.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const paginatedCategories = React.useMemo(() => {
    return filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCategories, page, rowsPerPage]);

  // Add new category
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSubmitting(true);
    try {
      await categoryService.createCategory({ name: newCatName.trim() });
      setNewCatName('');
      if (showToast) showToast('Kategori baru berhasil ditambahkan!', 'success');
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
          borderRadius: 3,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          border: 1,
          borderColor: 'divider',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: (th) =>
                  th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.16)' : 'rgba(67, 56, 202, 0.08)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CategoryIcon />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.2 }}>
                  Kelola Kategori Portofolio
                </Typography>
                <Chip
                  label={`${categories.length} Kategori`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    height: 22,
                    bgcolor: 'action.selected',
                    color: 'primary.main',
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Tambah, ubah nama, dan kelola kategori portofolio dinamis langsung di database
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Dialog Body */}
      <DialogContent dividers sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Form Tambah Kategori Baru */}
        <Paper
          component="form"
          onSubmit={handleAdd}
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: 1,
            borderColor: 'divider',
            bgcolor: (th) =>
              th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.02)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <TextField
            label="Nama Kategori Baru"
            placeholder="Contoh: AI & Automation, Cloud DevOps, Full-Stack Web..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            fullWidth
            size="small"
            disabled={submitting}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting || !newCatName.trim()}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{
              fontWeight: 700,
              fontSize: '0.82rem',
              whiteSpace: 'nowrap',
              px: 3,
              height: 40,
              borderRadius: 2,
            }}
          >
            Tambah Kategori
          </Button>
        </Paper>

        {/* Search Bar & Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 1.5,
            gap: 1.5,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Daftar Kategori ({filteredCategories.length})
          </Typography>
          <TextField
            size="small"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { height: 34, fontSize: '0.8rem', borderRadius: 2 },
            }}
            sx={{ width: { xs: '100%', sm: 220 } }}
          />
        </Box>

        {/* Tabel Daftar Kategori */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2.5,
            border: 1,
            borderColor: 'divider',
            maxHeight: 340,
            overflow: 'auto',
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    bgcolor: (th) =>
                      th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    borderColor: 'divider',
                  },
                }}
              >
                <TableCell width={50} align="center">#</TableCell>
                <TableCell>Nama Kategori</TableCell>
                <TableCell>Slug Sistem</TableCell>
                <TableCell align="center" width={140}>Karya Terkait</TableCell>
                <TableCell width={130} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {searchQuery ? 'Tidak ada kategori yang cocok dengan pencarian.' : 'Belum ada data kategori di database.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((cat, idx) => {
                  const isEditingThis = editingId === cat.id;
                  const inUse = (cat.portfolios_count || 0) > 0;

                  return (
                    <TableRow
                      key={cat.id}
                      hover
                      sx={{
                        '& td': { borderColor: 'divider' },
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell align="center" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>

                      {/* Nama Kategori / Inline Edit */}
                      <TableCell>
                        {isEditingThis ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              size="small"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              autoFocus
                              sx={{
                                maxWidth: 260,
                                '& .MuiOutlinedInput-input': {
                                  py: 0.7,
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                },
                              }}
                            />
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleSaveEdit(cat.id)}
                              disabled={submitting || !editName.trim()}
                              title="Simpan Perubahan"
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="inherit"
                              onClick={() => setEditingId(null)}
                              title="Batal"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                            {cat.name}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Slug */}
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                        {cat.slug}
                      </TableCell>

                      {/* Portofolio Terkait */}
                      <TableCell align="center">
                        <Chip
                          label={`${cat.portfolios_count || 0} Karya`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            bgcolor: (th) =>
                              inUse
                                ? th.palette.mode === 'dark'
                                  ? 'rgba(56, 189, 248, 0.16)'
                                  : 'rgba(3, 105, 161, 0.08)'
                                : 'action.selected',
                            color: (th) =>
                              inUse
                                ? th.palette.mode === 'dark'
                                  ? '#7DD3FC'
                                  : '#0369A1'
                                : 'text.secondary',
                            border: 1,
                            borderColor: (th) =>
                              inUse
                                ? th.palette.mode === 'dark'
                                  ? 'rgba(56, 189, 248, 0.3)'
                                  : 'rgba(3, 105, 161, 0.2)'
                                : 'divider',
                          }}
                        />
                      </TableCell>

                      {/* Aksi */}
                      <TableCell align="center">
                        {deleteConfirmId === cat.id ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Button
                              size="small"
                              color="error"
                              variant="contained"
                              sx={{ minWidth: 42, px: 1, py: 0.2, fontSize: '0.7rem', fontWeight: 700 }}
                              onClick={() => handleDelete(cat.id)}
                              disabled={submitting}
                            >
                              Ya
                            </Button>
                            <Button
                              size="small"
                              color="inherit"
                              sx={{ minWidth: 42, px: 1, py: 0.2, fontSize: '0.7rem' }}
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
                                sx={{
                                  color: (th) => (th.palette.mode === 'dark' ? '#A5B4FC' : '#4338CA'),
                                  bgcolor: (th) =>
                                    th.palette.mode === 'dark'
                                      ? 'rgba(129, 140, 248, 0.12)'
                                      : 'rgba(67, 56, 202, 0.06)',
                                  '&:hover': {
                                    bgcolor: 'primary.main',
                                    color: (th) =>
                                      th.palette.mode === 'dark' ? '#0A0E17' : '#FFFFFF',
                                  },
                                }}
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={
                                inUse
                                  ? `Tidak dapat dihapus: sedang digunakan ${cat.portfolios_count} karya portofolio.`
                                  : 'Hapus Kategori'
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteConfirmId(cat.id)}
                                  disabled={submitting || inUse}
                                  sx={{
                                    color: (th) => (th.palette.mode === 'dark' ? '#FCA5A5' : '#DC2626'),
                                    bgcolor: (th) =>
                                      th.palette.mode === 'dark'
                                        ? 'rgba(239, 68, 68, 0.12)'
                                        : 'rgba(220, 38, 38, 0.06)',
                                    '&:hover': {
                                      bgcolor: 'error.main',
                                      color: '#FFFFFF',
                                    },
                                    '&.Mui-disabled': {
                                      opacity: 0.4,
                                    },
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 16 }} />
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

        {/* Table Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCategories.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
            },
          }}
        />

        {/* Info Note Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', px: 0.5 }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ fontSize: '0.73rem', lineHeight: 1.4 }}>
            Kategori yang masih memiliki karya aktif diproteksi dari penghapusan demi menjaga integritas data.
          </Typography>
        </Box>
      </DialogContent>

      {/* Dialog Footer Actions */}
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.82rem',
            px: 3,
            borderRadius: 2,
          }}
        >
          Selesai &amp; Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
}
