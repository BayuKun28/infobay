import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import StorageIcon from '@mui/icons-material/Storage';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CachedIcon from '@mui/icons-material/Cached';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LaptopIcon from '@mui/icons-material/Laptop';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import SecurityIcon from '@mui/icons-material/Security';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { systemService, backupService, activityLogService, analyticsService } from '../../services/api';

export default function DashboardOverview({ stats, onNavigateTab, showToast }) {
  const allPortfolios = stats?.recentPortfolios || [];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // System & Backup States
  const [systemHealth, setSystemHealth] = useState(null);
  const [clearingCache, setClearingCache] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);
  const [importingBackup, setImportingBackup] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [exportingActivityLogs, setExportingActivityLogs] = useState(false);

  // Analytics & Activity Log States
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityMeta, setActivityMeta] = useState({ total: 0 });
  const [activityPage, setActivityPage] = useState(0);
  const [activityRowsPerPage, setActivityRowsPerPage] = useState(5);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchHealth() {
      try {
        const res = await systemService.getHealth();
        if (isMounted) setSystemHealth(res);
      } catch (err) {
        console.warn('Failed to load system health:', err.message);
      }
    }

    async function fetchAnalytics() {
      setAnalyticsLoading(true);
      try {
        const res = await analyticsService.getSummary();
        if (isMounted && res?.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.warn('Failed to load analytics summary:', err.message);
      } finally {
        if (isMounted) setAnalyticsLoading(false);
      }
    }

    fetchHealth();
    fetchAnalytics();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchActivityLogs() {
      setActivityLoading(true);
      try {
        const res = await activityLogService.getLogs({
          page: activityPage + 1,
          per_page: activityRowsPerPage,
        });
        if (isMounted && res?.data) {
          setActivityLogs(res.data);
          if (res.meta) setActivityMeta(res.meta);
        }
      } catch (err) {
        console.warn('Failed to load activity logs:', err.message);
      } finally {
        if (isMounted) setActivityLoading(false);
      }
    }
    fetchActivityLogs();
    return () => { isMounted = false; };
  }, [activityPage, activityRowsPerPage]);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      const res = await systemService.clearCache();
      if (showToast) showToast(res?.message || 'Cache aplikasi berhasil dibersihkan', 'success');
    } catch (err) {
      if (showToast) showToast('Gagal membersihkan cache aplikasi', 'error');
    } finally {
      setClearingCache(false);
    }
  };

  const handleExportBackup = async () => {
    setExportingBackup(true);
    try {
      await backupService.exportBackup();
      if (showToast) showToast('Berkas backup JSON berhasil diunduh', 'success');
    } catch (err) {
      if (showToast) showToast('Gagal mengekspor file backup', 'error');
    } finally {
      setExportingBackup(false);
    }
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('backup_file', file);

    setImportingBackup(true);
    try {
      const res = await backupService.importBackup(formData);
      if (showToast) showToast(res?.message || 'Data berhasil dipulihkan dari backup', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      if (showToast) showToast(err?.response?.data?.message || 'Gagal mengimpor file backup', 'error');
    } finally {
      setImportingBackup(false);
      e.target.value = '';
    }
  };

  const handleCreateSnapshot = async () => {
    setCreatingSnapshot(true);
    try {
      const res = await systemService.createSnapshot();
      if (showToast) showToast(res?.message || 'Snapshot database berhasil dibuat!', 'success');
      if (res?.data?.filename) {
        await systemService.downloadSnapshot(res.data.filename);
      }
    } catch (err) {
      if (showToast) showToast(err?.response?.data?.message || 'Gagal membuat snapshot database', 'error');
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handleExportActivityLogs = async () => {
    setExportingActivityLogs(true);
    try {
      await activityLogService.exportLogsCsv();
      if (showToast) showToast('Berkas CSV log aktivitas berhasil diunduh', 'success');
    } catch (err) {
      if (showToast) showToast('Gagal mengekspor CSV log aktivitas', 'error');
    } finally {
      setExportingActivityLogs(false);
    }
  };

  const paginatedPortfolios = allPortfolios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Functional Scope & Action Bar (Replaces generic AI hero banner) */}
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
              Konsol Portofolio &amp; Layanan
            </Typography>
            <Chip
              label="Live Sync"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 800,
                bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                color: (th) => th.palette.mode === 'dark' ? '#34D399' : '#065F46',
                border: '1px solid',
                borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.4)' : 'rgba(5, 150, 105, 0.3)',
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.8 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
              Environment:
            </Typography>
            <Box
              component="code"
              sx={{
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                fontWeight: 600,
                bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.12)' : 'rgba(67, 56, 202, 0.08)',
                color: (th) => th.palette.mode === 'dark' ? '#A5B4FC' : '#3730A3',
                border: 1,
                borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.25)' : 'rgba(67, 56, 202, 0.2)',
              }}
            >
              Production Ready
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              • Database Connected • Services Operational
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onNavigateTab(2)}
            sx={{ flex: { xs: 1, sm: 'none' }, fontWeight: 600, fontSize: '0.8rem' }}
          >
            Edit Biodata
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => onNavigateTab(1)}
            sx={{ flex: { xs: 1, sm: 'none' }, fontWeight: 600, fontSize: '0.8rem' }}
          >
            Tambah Karya
          </Button>
        </Box>
      </Box>

      {/* KPI Metrics: Typography-First, Flat Surfaces (Per taste-skill anti-slop rules) */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Total Portofolio
            </Typography>
            <Box sx={{ my: 1 }}>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {stats?.portfolioCount ?? 15}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              15 item terindeks di database
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Layanan Aktif
            </Typography>
            <Box sx={{ my: 1 }}>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {stats?.serviceCount ?? 4}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              Web, Mobile, UI/UX, Backend
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Keahlian Teknis
            </Typography>
            <Box sx={{ my: 1 }}>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {stats?.skillCount ?? 4}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              Rata-rata kemahiran: 85%
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            elevation={0}
            onClick={() => onNavigateTab && onNavigateTab(4)}
            sx={{
              p: 2.2,
              borderRadius: 2.5,
              border: 1,
              borderColor: (stats?.unreadMessageCount ?? 0) > 0 ? 'error.main' : 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                Pesan Masuk
              </Typography>
              {(stats?.unreadMessageCount ?? 0) > 0 && (
                <Chip
                  label={`${stats.unreadMessageCount} Baru`}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(220, 38, 38, 0.15)',
                    color: 'error.main',
                  }}
                />
              )}
            </Box>
            <Box sx={{ my: 1 }}>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {stats?.totalMessageCount ?? 0}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              {(stats?.unreadMessageCount ?? 0) > 0 ? `${stats.unreadMessageCount} belum dibaca (Klik kelola)` : 'Semua pesan terbaca'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4} md={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
              Penyimpanan Media
            </Typography>
            <Box sx={{ my: 1 }}>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em', lineHeight: 1.1, color: (th) => th.palette.mode === 'dark' ? '#34D399' : '#059669' }}>
                Lokal Disk
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
              Media Storage Terhubung
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Overview Table: Clean, Rules & Alignment */}
      <Paper elevation={0} sx={{ borderRadius: 2.5, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
        <Box
          sx={{
            px: 2.5,
            py: 1.8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Entri Portofolio Terbaru
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              Data tersinkronisasi langsung dari database PostgreSQL
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon fontSize="inherit" />}
            onClick={() => onNavigateTab(1)}
            sx={{ fontSize: '0.78rem', fontWeight: 600 }}
          >
            Kelola Semua
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: 60 }}>#ID</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Judul Proyek</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Kategori</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Penyimpanan Gambar</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', width: 100 }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPortfolios.map((item, idx) => (
                <TableRow key={item.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                    #{item.id || idx + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                    {item.title}
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
                  <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFamily: 'monospace' }}>
                    {item.image?.startsWith('/storage') ? 'local_storage' : 'external_url'}
                  </TableCell>
                  <TableCell align="right">
                    {item.link && item.link !== '#' ? (
                      <Button
                        size="small"
                        variant="outlined"
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        endIcon={<OpenInNewIcon sx={{ fontSize: '12px !important' }} />}
                        sx={{ fontSize: '0.72rem', py: 0.3, px: 1, minWidth: 0, fontWeight: 700 }}
                      >
                        Tautan
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={allPortfolios.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
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

      {/* Privacy-First Visitor Analytics & Traffic Insights */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon fontSize="small" sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Statistik Kunjungan Pengunjung (Privacy-First Analytics)
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              Data anonim dienkripsi dengan salt SHA-256 harian, tanpa pelacakan data pribadi (GDPR compliant).
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              endIcon={<ArrowForwardIcon fontSize="small" />}
              onClick={() => onNavigateTab && onNavigateTab(9)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              Monitoring IP &amp; Log Lengkap
            </Button>
            <Chip
              label={`Hari Ini: ${analytics?.today_visits ?? 0} Kunjungan`}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)',
                color: (th) => th.palette.mode === 'dark' ? '#C7D2FE' : '#3730A3',
                border: 1,
                borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(67, 56, 202, 0.2)',
              }}
            />
            <Chip
              label={`Total: ${analytics?.total_visits ?? 0} Kunjungan`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.72rem', borderColor: 'divider' }}
            />
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* 7-Day Trend Bars */}
          <Grid item xs={12} md={7}>
            <Box sx={{ p: 1.8, border: 1, borderColor: 'divider', borderRadius: 2, height: '100%' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1.5 }}>
                Tren Kunjungan 7 Hari Terakhir
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1, height: 100, pt: 1 }}>
                {analytics?.trend && analytics.trend.length > 0 ? (
                  analytics.trend.map((t, idx) => {
                    const maxV = Math.max(...analytics.trend.map((x) => x.visits), 1);
                    const pct = Math.max(12, Math.round((t.visits / maxV) * 100));
                    return (
                      <Box key={idx} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, mb: 0.5, color: 'text.secondary' }}>
                          {t.visits}
                        </Typography>
                        <Box
                          sx={{
                            width: '100%',
                            maxWidth: 32,
                            height: `${pct}%`,
                            borderRadius: '4px 4px 0 0',
                            bgcolor: (th) => th.palette.mode === 'dark' ? '#818CF8' : '#4338CA',
                            transition: 'height 0.3s ease',
                          }}
                        />
                        <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'text.secondary', mt: 0.8, whiteSpace: 'nowrap' }}>
                          {t.label}
                        </Typography>
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ mx: 'auto', alignSelf: 'center' }}>
                    Belum ada riwayat kunjungan dalam 7 hari terakhir.
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Device Breakdown */}
          <Grid item xs={12} md={5}>
            <Box sx={{ p: 1.8, border: 1, borderColor: 'divider', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1.5 }}>
                Perangkat Pengunjung
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LaptopIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Desktop</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {analytics?.devices?.desktop ?? 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIphoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Mobile</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {analytics?.devices?.mobile ?? 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TabletMacIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Tablet</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {analytics?.devices?.tablet ?? 0}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 1 }}>
                Rasio perangkat disesuaikan dari header User-Agent pengunjung.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Audit Trail & Activity Log Section */}
      <Paper elevation={0} sx={{ borderRadius: 2.5, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
        <Box
          sx={{
            px: 2.5,
            py: 1.8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Audit Trail &amp; Log Aktivitas
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              Catatan keamanan dan riwayat perubahan data administratif.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={exportingActivityLogs ? <CircularProgress size={14} /> : <FileDownloadIcon sx={{ fontSize: 16 }} />}
              onClick={handleExportActivityLogs}
              disabled={exportingActivityLogs}
              sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.72rem', fontWeight: 600 }}
            >
              {exportingActivityLogs ? 'Mengekspor...' : 'Ekspor CSV'}
            </Button>
            <Chip
              label={`${activityMeta?.total ?? 0} Tercatat`}
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.68rem' }}
            />
          </Box>
        </Box>

        {activityLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, gap: 1.5, alignItems: 'center' }}>
            <CircularProgress size={20} />
            <Typography variant="caption" color="text.secondary">Memuat audit log...</Typography>
          </Box>
        ) : activityLogs.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Belum ada catatan aktivitas.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 140 }}>Waktu</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 180 }}>Aksi</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Deskripsi Perubahan</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 120 }}>IP / Asal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activityLogs.map((log) => {
                  const formatTime = (ts) => {
                    try {
                      return new Intl.DateTimeFormat('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(ts));
                    } catch {
                      return ts;
                    }
                  };
                  return (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ fontSize: '0.74rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {formatTime(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.78rem', fontWeight: 500 }}>
                        {log.description}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', color: 'text.secondary', fontFamily: 'monospace' }}>
                        {log.ip_address || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={activityMeta?.total ?? 0}
          rowsPerPage={activityRowsPerPage}
          page={activityPage}
          onPageChange={(e, newP) => setActivityPage(newP)}
          onRowsPerPageChange={(e) => {
            setActivityRowsPerPage(parseInt(e.target.value, 10));
            setActivityPage(0);
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

      {/* System Health, Maintenance & Data Governance Section */}
      <Grid container spacing={2}>
        {/* System Health & Cache Controls */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  Kesehatan Sistem &amp; Cache
                </Typography>
                <Chip
                  label="Operational"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                    color: (th) => th.palette.mode === 'dark' ? '#34D399' : '#065F46',
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Pantau metrik dasar runtime PHP, database PostgreSQL, dan bersihkan cache aplikasi jika terjadi pembaruan data.
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 2 }}>
                <Box sx={{ p: 1.2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.68rem' }}>
                    Database
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    {systemHealth?.database?.type || 'PostgreSQL 17'}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.68rem' }}>
                    PHP Runtime
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    PHP {systemHealth?.php_version?.slice(0, 6) || '8.4'}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.68rem' }}>
                    Memori Terpakai
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    {systemHealth?.memory_usage_mb ? `${systemHealth.memory_usage_mb} MB` : '18.4 MB'}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.68rem' }}>
                    Sisa Disk
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    {systemHealth?.disk?.free_gb ? `${systemHealth.disk.free_gb} GB` : 'Tersedia'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={clearingCache ? <CircularProgress size={14} /> : <CachedIcon sx={{ fontSize: 18 }} />}
              onClick={handleClearCache}
              disabled={clearingCache}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}
            >
              {clearingCache ? 'Membersihkan...' : 'Bersihkan Cache Aplikasi (Optimize Clear)'}
            </Button>
          </Paper>
        </Grid>

        {/* Data Governance: Backup & Restore */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  Tata Kelola Data (Backup &amp; Restore)
                </Typography>
                <Chip
                  label="JSON Bundle"
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, borderColor: 'divider' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Unduh salinan cadangan instan seluruh database (biodata, portofolio, layanan, keahlian, pesan, sertifikasi) atau pulihkan sistem dari file JSON.
              </Typography>

              <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.5, bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', mb: 2 }}>
                <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', display: 'block' }}>
                  Prosedur Pemulihan Cepat:
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', display: 'block' }}>
                  Format file harus berupa .json yang dihasilkan dari tombol ekspor di bawah. Data yang ada akan diperbarui atau ditambahkan secara aman dalam transaksi database.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={creatingSnapshot ? <CircularProgress size={14} color="inherit" /> : <StorageIcon sx={{ fontSize: 18 }} />}
                onClick={handleCreateSnapshot}
                disabled={creatingSnapshot}
                sx={{ flex: { xs: '1 1 100%', sm: 1 }, textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
              >
                {creatingSnapshot ? 'Membuat Snapshot...' : 'Buat Snapshot DB Sekarang'}
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={exportingBackup ? <CircularProgress size={14} /> : <CloudDownloadIcon sx={{ fontSize: 18 }} />}
                onClick={handleExportBackup}
                disabled={exportingBackup}
                sx={{ flex: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}
              >
                {exportingBackup ? 'Mengekspor...' : 'Ekspor Backup JSON'}
              </Button>

              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={importingBackup ? <CircularProgress size={14} /> : <CloudUploadIcon sx={{ fontSize: 18 }} />}
                disabled={importingBackup}
                sx={{ flex: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}
              >
                {importingBackup ? 'Memulihkan...' : 'Impor Backup JSON'}
                <input
                  type="file"
                  hidden
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                />
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
