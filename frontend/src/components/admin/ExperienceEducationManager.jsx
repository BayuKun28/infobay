import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BriefcaseIcon from '@mui/icons-material/WorkOutline';
import SchoolIcon from '@mui/icons-material/School';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import CloseIcon from '@mui/icons-material/Close';

import { adminService } from '../../services/api';

export default function ExperienceEducationManager({
  educations = [],
  experiences = [],
  onRefresh,
  showToast,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentTab, setCurrentTab] = useState(0); // 0: Experience, 1: Education
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [expPage, setExpPage] = useState(0);
  const [expRowsPerPage, setExpRowsPerPage] = useState(5);

  const [eduPage, setEduPage] = useState(0);
  const [eduRowsPerPage, setEduRowsPerPage] = useState(5);

  // Experience Modal state
  const [expDialog, setExpDialog] = useState(false);
  const [isEditingExp, setIsEditingExp] = useState(false);
  const [expForm, setExpForm] = useState({
    id: null,
    title: '',
    period: '',
    role: '',
    badge: '',
    description: '',
  });

  // Education Modal state
  const [eduDialog, setEduDialog] = useState(false);
  const [isEditingEdu, setIsEditingEdu] = useState(false);
  const [eduForm, setEduForm] = useState({
    id: null,
    title: '',
    period: '',
    field: '',
    badge: '',
    description: '',
  });

  // Delete Confirm Modal state
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null, title: '' });

  // Filtered lists
  const filteredExperiences = experiences.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.role && item.role.toLowerCase().includes(q)) ||
      (item.period && item.period.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  const paginatedExperiences = filteredExperiences.slice(
    expPage * expRowsPerPage,
    expPage * expRowsPerPage + expRowsPerPage
  );

  const filteredEducations = educations.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.field && item.field.toLowerCase().includes(q)) ||
      (item.period && item.period.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  const paginatedEducations = filteredEducations.slice(
    eduPage * eduRowsPerPage,
    eduPage * eduRowsPerPage + eduRowsPerPage
  );

  // Experience Handlers
  const handleOpenAddExp = () => {
    setIsEditingExp(false);
    setExpForm({ id: null, title: '', period: '', role: '', badge: '', description: '' });
    setExpDialog(true);
  };

  const handleOpenEditExp = (item) => {
    setIsEditingExp(true);
    setExpForm({
      id: item.id,
      title: item.title || '',
      period: item.period || '',
      role: item.role || '',
      badge: item.badge || '',
      description: item.description || '',
    });
    setExpDialog(true);
  };

  const handleSaveExp = async (e) => {
    e.preventDefault();
    if (!expForm.title.trim() || !expForm.period.trim()) {
      showToast('Perusahaan dan periode waktu wajib diisi', 'error');
      return;
    }
    setLoading(true);
    try {
      if (isEditingExp) {
        await adminService.updateExperience(expForm.id, expForm);
        showToast('Pengalaman kerja berhasil diperbarui', 'success');
      } else {
        await adminService.createExperience(expForm);
        showToast('Pengalaman kerja baru berhasil ditambahkan', 'success');
      }
      setExpDialog(false);
      onRefresh();
    } catch (err) {
      console.error('Save experience failed:', err);
      showToast(err.response?.data?.message || 'Gagal menyimpan data pengalaman kerja', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Education Handlers
  const handleOpenAddEdu = () => {
    setIsEditingEdu(false);
    setEduForm({ id: null, title: '', period: '', field: '', badge: '', description: '' });
    setEduDialog(true);
  };

  const handleOpenEditEdu = (item) => {
    setIsEditingEdu(true);
    setEduForm({
      id: item.id,
      title: item.title || '',
      period: item.period || '',
      field: item.field || '',
      badge: item.badge || '',
      description: item.description || '',
    });
    setEduDialog(true);
  };

  const handleSaveEdu = async (e) => {
    e.preventDefault();
    if (!eduForm.title.trim() || !eduForm.period.trim()) {
      showToast('Institusi/sekolah dan periode waktu wajib diisi', 'error');
      return;
    }
    setLoading(true);
    try {
      if (isEditingEdu) {
        await adminService.updateEducation(eduForm.id, eduForm);
        showToast('Riwayat pendidikan berhasil diperbarui', 'success');
      } else {
        await adminService.createEducation(eduForm);
        showToast('Riwayat pendidikan baru berhasil ditambahkan', 'success');
      }
      setEduDialog(false);
      onRefresh();
    } catch (err) {
      console.error('Save education failed:', err);
      showToast(err.response?.data?.message || 'Gagal menyimpan data pendidikan', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTarget.id || !deleteTarget.type) return;
    setLoading(true);
    try {
      if (deleteTarget.type === 'experience') {
        await adminService.deleteExperience(deleteTarget.id);
        showToast('Pengalaman kerja berhasil dihapus', 'success');
      } else if (deleteTarget.type === 'education') {
        await adminService.deleteEducation(deleteTarget.id);
        showToast('Riwayat pendidikan berhasil dihapus', 'success');
      }
      setDeleteDialog(false);
      setDeleteTarget({ type: null, id: null, title: '' });
      onRefresh();
    } catch (err) {
      console.error('Delete failed:', err);
      showToast(err.response?.data?.message || 'Gagal menghapus data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header & Functional Action Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em', fontSize: '1.25rem' }}>
              Pengalaman Kerja &amp; Riwayat Pendidikan
            </Typography>
            <Chip
              label={`${experiences.length} Pengalaman • ${educations.length} Pendidikan`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 800,
                bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.1)',
                color: 'primary.main',
                border: '1px solid',
                borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(67, 56, 202, 0.25)',
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
            Kelola rekam jejak profesional dan pendidikan yang ditampilkan pada bagian About portofolio publik.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
          {currentTab === 0 ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              onClick={handleOpenAddExp}
              sx={{ flex: { xs: 1, sm: 'none' }, fontWeight: 700, fontSize: '0.8rem' }}
            >
              Tambah Pengalaman
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              onClick={handleOpenAddEdu}
              sx={{ flex: { xs: 1, sm: 'none' }, fontWeight: 700, fontSize: '0.8rem' }}
            >
              Tambah Pendidikan
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs & Search Box */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(e, val) => {
              setCurrentTab(val);
              setSearchQuery('');
            }}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 38,
              '& .MuiTab-root': {
                minHeight: 38,
                py: 0.5,
                px: 2,
                fontSize: '0.82rem',
                fontWeight: 700,
                textTransform: 'none',
              },
            }}
          >
            <Tab
              icon={<BriefcaseIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={`Pengalaman Kerja (${experiences.length})`}
            />
            <Tab
              icon={<SchoolIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={`Riwayat Pendidikan (${educations.length})`}
            />
          </Tabs>

          <TextField
            size="small"
            placeholder={currentTab === 0 ? 'Cari perusahaan, posisi, atau periode...' : 'Cari sekolah, jurusan, atau periode...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontSize: '0.82rem',
                width: { xs: '100%', md: 320 },
              },
            }}
          />
        </Box>
      </Paper>

      {/* Content for Tab 0: Experience */}
      {currentTab === 0 && (
        <Paper elevation={0} sx={{ borderRadius: 2.5, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
          {filteredExperiences.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <BriefcaseIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
              <Typography variant="subtitle1" fontWeight={700}>
                Belum Ada Data Pengalaman Kerja
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Klik tombol "Tambah Pengalaman" untuk mendaftarkan instansi atau perusahaan tempat Anda bekerja.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Desktop Table View */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer>
                  <Table size="medium">
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell sx={{ width: 60, fontWeight: 700 }}>#ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Perusahaan / Organisasi</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 180 }}>Posisi / Peran</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 150 }}>Periode</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Deskripsi / Tanggung Jawab</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, width: 120 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedExperiences.map((item, idx) => (
                        <TableRow key={item.id || idx} hover>
                          <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                            #{item.id || idx + 1}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BusinessIcon fontSize="small" sx={{ color: 'primary.main', opacity: 0.8 }} />
                              <Typography variant="body2" fontWeight={800} color="text.primary">
                                {item.title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.role || 'Web Programmer'}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                                color: (th) => th.palette.mode === 'dark' ? '#38BDF8' : '#0284C7',
                                border: '1px solid',
                                borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.25)',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                              <ScheduleIcon sx={{ fontSize: 13, opacity: 0.7 }} />
                              <span>{item.period}</span>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            {item.description || '—'}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="Edit Pengalaman">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditExp(item)}
                                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 0.6 }}
                                >
                                  <EditIcon fontSize="small" color="primary" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Hapus Pengalaman">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setDeleteTarget({ type: 'experience', id: item.id, title: item.title });
                                    setDeleteDialog(true);
                                  }}
                                  sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1.5,
                                    p: 0.6,
                                    color: 'error.main',
                                    '&:hover': { bgcolor: 'error.main', color: 'white' },
                                  }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Card List View */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5, p: 1.5 }}>
                {paginatedExperiences.map((item) => (
                  <Card key={item.id} elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                          {item.period}
                        </Typography>
                      </Box>
                      <Chip
                        label={item.role || 'Web Programmer'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Box>

                    {item.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 1, mb: 1.5 }}>
                        {item.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => handleOpenEditExp(item)}
                        sx={{ fontSize: '0.75rem', py: 0.5, fontWeight: 700 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        onClick={() => {
                          setDeleteTarget({ type: 'experience', id: item.id, title: item.title });
                          setDeleteDialog(true);
                        }}
                        sx={{ fontSize: '0.75rem', py: 0.5, fontWeight: 700 }}
                      >
                        Hapus
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>

              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={filteredExperiences.length}
                rowsPerPage={expRowsPerPage}
                page={expPage}
                onPageChange={(e, newPage) => setExpPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setExpRowsPerPage(parseInt(e.target.value, 10));
                  setExpPage(0);
                }}
                labelRowsPerPage="Baris per halaman:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
                sx={{ borderTop: 1, borderColor: 'divider' }}
              />
            </>
          )}
        </Paper>
      )}

      {/* Content for Tab 1: Education */}
      {currentTab === 1 && (
        <Paper elevation={0} sx={{ borderRadius: 2.5, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
          {filteredEducations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <SchoolIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
              <Typography variant="subtitle1" fontWeight={700}>
                Belum Ada Data Riwayat Pendidikan
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Klik tombol "Tambah Pendidikan" untuk mendaftarkan institusi formal atau informal Anda.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Desktop Table View */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer>
                  <Table size="medium">
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell sx={{ width: 60, fontWeight: 700 }}>#ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Institusi / Sekolah</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 200 }}>Jurusan / Bidang</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 150 }}>Periode</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Deskripsi / Catatan</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, width: 120 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedEducations.map((item, idx) => (
                        <TableRow key={item.id || idx} hover>
                          <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                            #{item.id || idx + 1}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SchoolIcon fontSize="small" sx={{ color: 'primary.main', opacity: 0.8 }} />
                              <Typography variant="body2" fontWeight={800} color="text.primary">
                                {item.title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.field || 'Teknik Komputer & Jaringan'}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(5, 150, 105, 0.1)',
                                color: (th) => th.palette.mode === 'dark' ? '#34D399' : '#059669',
                                border: '1px solid',
                                borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(5, 150, 105, 0.25)',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                              <ScheduleIcon sx={{ fontSize: 13, opacity: 0.7 }} />
                              <span>{item.period}</span>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            {item.description || '—'}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="Edit Pendidikan">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditEdu(item)}
                                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 0.6 }}
                                >
                                  <EditIcon fontSize="small" color="primary" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Hapus Pendidikan">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setDeleteTarget({ type: 'education', id: item.id, title: item.title });
                                    setDeleteDialog(true);
                                  }}
                                  sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1.5,
                                    p: 0.6,
                                    color: 'error.main',
                                    '&:hover': { bgcolor: 'error.main', color: 'white' },
                                  }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Card List View */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5, p: 1.5 }}>
                {paginatedEducations.map((item) => (
                  <Card key={item.id} elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                          {item.period}
                        </Typography>
                      </Box>
                      <Chip
                        label={item.field || 'Pendidikan'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Box>

                    {item.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 1, mb: 1.5 }}>
                        {item.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => handleOpenEditEdu(item)}
                        sx={{ fontSize: '0.75rem', py: 0.5, fontWeight: 700 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        onClick={() => {
                          setDeleteTarget({ type: 'education', id: item.id, title: item.title });
                          setDeleteDialog(true);
                        }}
                        sx={{ fontSize: '0.75rem', py: 0.5, fontWeight: 700 }}
                      >
                        Hapus
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>

              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={filteredEducations.length}
                rowsPerPage={eduRowsPerPage}
                page={eduPage}
                onPageChange={(e, newPage) => setEduPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setEduRowsPerPage(parseInt(e.target.value, 10));
                  setEduPage(0);
                }}
                labelRowsPerPage="Baris per halaman:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
                sx={{ borderTop: 1, borderColor: 'divider' }}
              />
            </>
          )}
        </Paper>
      )}

      {/* Modal Dialog: Form Tambah / Edit Pengalaman */}
      <Dialog
        open={expDialog}
        onClose={() => setExpDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <form onSubmit={handleSaveExp}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {isEditingExp ? 'Edit Pengalaman Kerja' : 'Tambah Pengalaman Kerja'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
            <TextField
              label="Nama Perusahaan / Organisasi"
              required
              fullWidth
              value={expForm.title}
              onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
              placeholder="e.g. PT Global Intermedia Nusantara"
            />
            <TextField
              label="Periode Waktu"
              required
              fullWidth
              value={expForm.period}
              onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
              placeholder="e.g. 2019 — 2026 atau 2024 — Sekarang"
            />
            <TextField
              label="Posisi / Jabatan"
              fullWidth
              value={expForm.role}
              onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
              placeholder="e.g. Senior Web Programmer"
            />
            <TextField
              label="Deskripsi & Tanggung Jawab"
              multiline
              rows={3}
              fullWidth
              value={expForm.description}
              onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
              placeholder="Jelaskan peran, teknologi yang digunakan, atau kontribusi utama..."
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setExpDialog(false)} disabled={loading} sx={{ fontWeight: 700 }}>
              Batal
            </Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ fontWeight: 700 }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Simpan Pengalaman'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Dialog: Form Tambah / Edit Pendidikan */}
      <Dialog
        open={eduDialog}
        onClose={() => setEduDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <form onSubmit={handleSaveEdu}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {isEditingEdu ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '10px !important' }}>
            <TextField
              label="Nama Institusi / Sekolah"
              required
              fullWidth
              value={eduForm.title}
              onChange={(e) => setEduForm({ ...eduForm, title: e.target.value })}
              placeholder="e.g. SMKN 02 Karanganyar"
            />
            <TextField
              label="Periode Waktu"
              required
              fullWidth
              value={eduForm.period}
              onChange={(e) => setEduForm({ ...eduForm, period: e.target.value })}
              placeholder="e.g. 2016 — 2019"
            />
            <TextField
              label="Jurusan / Konsentrasi Studi"
              fullWidth
              value={eduForm.field}
              onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })}
              placeholder="e.g. Teknik Komputer & Jaringan"
            />
            <TextField
              label="Deskripsi / Catatan Tambahan"
              multiline
              rows={3}
              fullWidth
              value={eduForm.description}
              onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })}
              placeholder="Keterangan tambahan atau prestasi selama masa studi..."
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEduDialog(false)} disabled={loading} sx={{ fontWeight: 700 }}>
              Batal
            </Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ fontWeight: 700 }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Simpan Pendidikan'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Dialog: Konfirmasi Hapus */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Apakah Anda yakin ingin menghapus <strong>"{deleteTarget.title}"</strong>? Tindakan ini akan menghapus data dari database secara permanen.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog(false)} disabled={loading} sx={{ fontWeight: 700 }}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={loading}
            sx={{ fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Ya, Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
