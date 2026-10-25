import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
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
  Slider,
  CircularProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LayersIcon from '@mui/icons-material/Layers';
import SaveIcon from '@mui/icons-material/Save';
import { adminService, normalizeTechStack } from '../../services/api';

export default function ServicesSkillsManager({
  services = [],
  skills = [],
  techStack = [],
  biodata = null,
  onRefresh,
  showToast,
}) {
  const [loading, setLoading] = useState(false);

  // Tech Stack Tags state
  const [techTags, setTechTags] = useState(() => {
    if (biodata?.tech_stack) {
      const parsed = normalizeTechStack(biodata.tech_stack);
      if (parsed.length > 0) return parsed;
    }
    if (techStack && techStack.length > 0) {
      const parsed = normalizeTechStack(techStack);
      if (parsed.length > 0) return parsed;
    }
    return ['ReactJS', 'Vite', 'Tailwind CSS', 'Material-UI', 'Laravel 13', 'PHP 8.4', 'PostgreSQL 17', 'Docker', 'REST API', 'Sanctum', 'Git', 'Ubuntu Linux'];
  });
  const [newTagInput, setNewTagInput] = useState('');

  // Sync tech tags when biodata or techStack prop changes
  useEffect(() => {
    if (biodata?.tech_stack) {
      const parsed = normalizeTechStack(biodata.tech_stack);
      if (parsed.length > 0) {
        setTechTags(parsed);
        return;
      }
    }
    if (techStack && techStack.length > 0) {
      const parsed = normalizeTechStack(techStack);
      if (parsed.length > 0) {
        setTechTags(parsed);
      }
    }
  }, [biodata, techStack]);

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (
      trimmed &&
      !techTags.some(
        (t) => (typeof t === 'object' && t !== null ? t.name : t).toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setTechTags([...techTags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const targetName =
      typeof tagToRemove === 'object' && tagToRemove !== null
        ? tagToRemove.name || tagToRemove.title || ''
        : String(tagToRemove);
    setTechTags(
      techTags.filter((t) => {
        const currentName = typeof t === 'object' && t !== null ? t.name || t.title || '' : String(t);
        return currentName !== targetName;
      })
    );
  };

  const handleSaveTechStack = async () => {
    setLoading(true);
    try {
      const cleanTags = normalizeTechStack(techTags);
      await adminService.updateBiodata({ tech_stack: cleanTags });
      showToast('Tech stack & tools arsenal berhasil diperbarui', 'success');
      onRefresh();
    } catch (err) {
      console.error('Failed to update tech stack:', err);
      showToast(err.response?.data?.message || 'Gagal menyimpan tech stack', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Pagination states
  const [servicePage, setServicePage] = useState(0);
  const [serviceRowsPerPage, setServiceRowsPerPage] = useState(5);

  const [skillPage, setSkillPage] = useState(0);
  const [skillRowsPerPage, setSkillRowsPerPage] = useState(5);

  const paginatedServices = services.slice(
    servicePage * serviceRowsPerPage,
    servicePage * serviceRowsPerPage + serviceRowsPerPage
  );

  const paginatedSkills = skills.slice(
    skillPage * skillRowsPerPage,
    skillPage * skillRowsPerPage + skillRowsPerPage
  );

  // Service Dialog
  const [serviceDialog, setServiceDialog] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [serviceForm, setServiceForm] = useState({ id: null, title: '', description: '', icon: '' });

  // Skill Dialog
  const [skillDialog, setSkillDialog] = useState(false);
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [skillForm, setSkillForm] = useState({ id: null, name: '', percentage: 80 });

  // Delete Dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null, title: '' });

  // Service Handlers
  const handleOpenAddService = () => {
    setIsEditingService(false);
    setServiceForm({ id: null, title: '', description: '', icon: '' });
    setServiceDialog(true);
  };

  const handleOpenEditService = (item) => {
    setIsEditingService(true);
    setServiceForm({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      icon: item.icon || '',
    });
    setServiceDialog(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditingService) {
        await adminService.updateService(serviceForm.id, serviceForm);
        showToast('Layanan berhasil diperbarui', 'success');
      } else {
        await adminService.createService(serviceForm);
        showToast('Layanan baru berhasil ditambahkan', 'success');
      }
      setServiceDialog(false);
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan layanan', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Skill Handlers
  const handleOpenAddSkill = () => {
    setIsEditingSkill(false);
    setSkillForm({ id: null, name: '', percentage: 80 });
    setSkillDialog(true);
  };

  const handleOpenEditSkill = (item) => {
    setIsEditingSkill(true);
    setSkillForm({
      id: item.id,
      name: item.name || '',
      percentage: item.percentage || 80,
    });
    setSkillDialog(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditingSkill) {
        await adminService.updateSkill(skillForm.id, skillForm);
        showToast('Keahlian berhasil diperbarui', 'success');
      } else {
        await adminService.createSkill(skillForm);
        showToast('Keahlian baru berhasil ditambahkan', 'success');
      }
      setSkillDialog(false);
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan keahlian', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      if (deleteTarget.type === 'service') {
        await adminService.deleteService(deleteTarget.id);
        showToast(`Layanan "${deleteTarget.title}" berhasil dihapus`, 'success');
      } else {
        await adminService.deleteSkill(deleteTarget.id);
        showToast(`Keahlian "${deleteTarget.title}" berhasil dihapus`, 'success');
      }
      setDeleteDialog(false);
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus item', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      <Grid container spacing={3}>
        {/* Services Manager */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="800">
                Layanan &amp; Solusi ({services.length})
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenAddService}
                sx={{ fontWeight: 700 }}
              >
                Tambah Layanan
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Judul Layanan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Deskripsi</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 90 }}>
                      Aksi
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedServices.map((item, idx) => (
                    <TableRow key={item.id || idx} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{item.title}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                        {item.description || '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.8 }}>
                          <Tooltip title="Edit Layanan">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditService(item)}
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
                          <Tooltip title="Hapus Layanan">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDeleteTarget({ type: 'service', id: item.id, title: item.title });
                                setDeleteDialog(true);
                              }}
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
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={services.length}
              rowsPerPage={serviceRowsPerPage}
              page={servicePage}
              onPageChange={(e, newPage) => setServicePage(newPage)}
              onRowsPerPageChange={(e) => {
                setServiceRowsPerPage(parseInt(e.target.value, 10));
                setServicePage(0);
              }}
              labelRowsPerPage="Baris:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
              sx={{
                borderTop: 1,
                borderColor: 'divider',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                },
              }}
            />
          </Paper>
        </Grid>

        {/* Skills Manager */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="800">
                Keahlian &amp; Skills ({skills.length})
              </Typography>
              <Button
                variant="contained"
                size="small"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={handleOpenAddSkill}
                sx={{ fontWeight: 700 }}
              >
                Tambah Keahlian
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Nama Keahlian</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Kemahiran (%)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 90 }}>
                      Aksi
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSkills.map((item, idx) => (
                    <TableRow key={item.id || idx} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{item.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: '100%',
                              bgcolor: (th) => th.palette.mode === 'dark' ? '#232F48' : '#E2E8F0',
                              height: 10,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: 1,
                              borderColor: 'divider',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${item.percentage}%`,
                                bgcolor: (th) => th.palette.mode === 'dark' ? '#818CF8' : '#4338CA',
                                height: '100%',
                                borderRadius: 1.5,
                              }}
                            />
                          </Box>
                          <Typography variant="caption" fontWeight="800" sx={{ minWidth: 36, color: 'text.primary', fontSize: '0.78rem' }}>
                            {item.percentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.8 }}>
                          <Tooltip title="Edit Keahlian">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditSkill(item)}
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
                          <Tooltip title="Hapus Keahlian">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDeleteTarget({ type: 'skill', id: item.id, title: item.name });
                                setDeleteDialog(true);
                              }}
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
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={skills.length}
              rowsPerPage={skillRowsPerPage}
              page={skillPage}
              onPageChange={(e, newPage) => setSkillPage(newPage)}
              onRowsPerPageChange={(e) => {
                setSkillRowsPerPage(parseInt(e.target.value, 10));
                setSkillPage(0);
              }}
              labelRowsPerPage="Baris:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
              sx={{
                borderTop: 1,
                borderColor: 'divider',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Tech Stack & Tools Arsenal Manager */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LayersIcon color="primary" sx={{ fontSize: 22 }} />
              <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.1rem' }}>
                Tech Stack &amp; Tools Arsenal
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Daftar teknologi, bahasa, dan framework yang ditampilkan sebagai tag interaktif di halaman publik (Skills section).
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon fontSize="small" />}
            onClick={handleSaveTechStack}
            disabled={loading}
            sx={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Simpan Perubahan'}
          </Button>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Input Add Tag */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, maxWidth: 500 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Tambah tag baru (e.g. Next.js, Redis, GraphQL, Docker)..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button
            variant="outlined"
            onClick={handleAddTag}
            disabled={!newTagInput.trim()}
            sx={{ fontWeight: 700, px: 2.5, whiteSpace: 'nowrap' }}
          >
            Tambah
          </Button>
        </Box>

        {/* Tags Grid / Cloud */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {techTags.map((tag, idx) => {
            const label =
              typeof tag === 'object' && tag !== null
                ? tag.name || tag.title || tag.label || ''
                : String(tag || '');
            if (!label) return null;

            return (
              <Chip
                key={`${label}-${idx}`}
                label={`#${label}`}
                onDelete={() => handleRemoveTag(tag)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  py: 0.5,
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)',
                  color: (th) => th.palette.mode === 'dark' ? '#C7D2FE' : '#3730A3',
                  border: 1,
                  borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(67, 56, 202, 0.25)',
                  '& .MuiChip-deleteIcon': {
                    color: (th) => th.palette.mode === 'dark' ? '#A5B4FC' : '#4338CA',
                    '&:hover': {
                      color: 'error.main',
                    },
                  },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* Service Modal */}
      <Dialog open={serviceDialog} onClose={() => setServiceDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <form onSubmit={handleSaveService}>
          <DialogTitle sx={{ fontWeight: '800' }}>
            {isEditingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Judul Layanan"
              fullWidth
              required
              value={serviceForm.title}
              onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
              size="small"
            />
            <TextField
              label="URL Ikon / Gambar"
              fullWidth
              value={serviceForm.icon}
              onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
              size="small"
            />
            <TextField
              label="Deskripsi Layanan"
              fullWidth
              multiline
              rows={3}
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              size="small"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setServiceDialog(false)} color="inherit">
              Batal
            </Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ fontWeight: 700 }}>
              Simpan
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Skill Modal */}
      <Dialog open={skillDialog} onClose={() => setSkillDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <form onSubmit={handleSaveSkill}>
          <DialogTitle sx={{ fontWeight: '800' }}>
            {isEditingSkill ? 'Edit Keahlian' : 'Tambah Keahlian Baru'}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nama Keahlian / Teknologi"
              fullWidth
              required
              value={skillForm.name}
              onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
              size="small"
            />
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                Tingkat Kemahiran: {skillForm.percentage}%
              </Typography>
              <Slider
                value={skillForm.percentage}
                onChange={(e, val) => setSkillForm({ ...skillForm, percentage: val })}
                valueLabelDisplay="auto"
                step={5}
                min={10}
                max={100}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSkillDialog(false)} color="inherit">
              Batal
            </Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ fontWeight: 700 }}>
              Simpan
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: '800' }}>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Apakah Anda yakin ingin menghapus {deleteTarget.type === 'service' ? 'layanan' : 'keahlian'}{' '}
            <strong>{deleteTarget.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={loading} sx={{ fontWeight: 700 }}>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
