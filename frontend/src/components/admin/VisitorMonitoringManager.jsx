import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Divider,
} from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ComputerIcon from '@mui/icons-material/Computer';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TabletIcon from '@mui/icons-material/Tablet';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DevicesIcon from '@mui/icons-material/Devices';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TodayIcon from '@mui/icons-material/Today';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { analyticsService } from '../../services/api';

export default function VisitorMonitoringManager({ showToast }) {
  // State: Summary Stats
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // State: Visitors Table
  const [visitors, setVisitors] = useState([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(15);
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // State: Detail Modal
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [copiedIp, setCopiedIp] = useState(false);

  // State: Clear Logs Dialog
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearDays, setClearDays] = useState(30);
  const [clearing, setClearing] = useState(false);

  // Fetch Analytics Summary
  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await analyticsService.getSummary();
      if (res && res.data) {
        setSummary(res.data);
      }
    } catch {
      // Non-blocking error handled gracefully
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch Visitors Logs
  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        per_page: perPage,
        search: search.trim() || undefined,
        device: deviceFilter !== 'all' ? deviceFilter : undefined,
        date_range: dateRange !== 'all' ? dateRange : undefined,
      };
      const res = await analyticsService.getVisitors(params);
      if (res && res.data) {
        setVisitors(res.data.data || []);
        setTotalVisitors(res.data.total || 0);
      }
    } catch {
      showToast?.('Gagal memuat log pengunjung.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, deviceFilter, dateRange, showToast]);

  // Initial Load
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  // Handle Delete Single Visitor Log
  const handleDeleteVisitor = async (id) => {
    if (!window.confirm('Hapus log kunjungan ini?')) return;
    try {
      await analyticsService.deleteVisitor(id);
      showToast?.('Log kunjungan berhasil dihapus.', 'success');
      fetchVisitors();
      fetchSummary();
    } catch {
      showToast?.('Gagal menghapus log kunjungan.', 'error');
    }
  };

  // Handle Clear Logs Bulk
  const handleClearLogs = async () => {
    try {
      setClearing(true);
      const res = await analyticsService.clearVisitors(clearDays);
      showToast?.(res.message || 'Log kunjungan berhasil dibersihkan.', 'success');
      setClearDialogOpen(false);
      fetchVisitors();
      fetchSummary();
    } catch {
      showToast?.('Gagal membersihkan log kunjungan.', 'error');
    } finally {
      setClearing(false);
    }
  };

  // Copy IP to Clipboard
  const handleCopyIp = (ip) => {
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
    showToast?.(`IP ${ip} disalin ke papan klip.`, 'info');
  };

  // Format Date and Time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  // Render Device Icon
  const getDeviceIcon = (deviceType) => {
    const d = (deviceType || '').toLowerCase();
    if (d === 'mobile') return <SmartphoneIcon fontSize="small" sx={{ color: 'info.main' }} />;
    if (d === 'tablet') return <TabletIcon fontSize="small" sx={{ color: 'warning.main' }} />;
    return <ComputerIcon fontSize="small" sx={{ color: 'primary.main' }} />;
  };

  // Calculate Mobile/Desktop Ratio
  const totalDeviceVisits = (summary?.devices?.desktop || 0) + (summary?.devices?.mobile || 0) + (summary?.devices?.tablet || 0);
  const desktopPercent = totalDeviceVisits ? Math.round(((summary?.devices?.desktop || 0) / totalDeviceVisits) * 100) : 0;
  const mobilePercent = totalDeviceVisits ? Math.round(((summary?.devices?.mobile || 0) / totalDeviceVisits) * 100) : 0;
  const tabletPercent = totalDeviceVisits ? Math.round(((summary?.devices?.tablet || 0) / totalDeviceVisits) * 100) : 0;

  // Max visits in trend for scaling
  const maxTrendVisits = summary?.trend?.length
    ? Math.max(...summary.trend.map((t) => t.visits || 0), 1)
    : 1;

  return (
    <Box sx={{ maxWidth: '100%' }}>
      {/* Header Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: (th) =>
                  th.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.08)',
                color: 'primary.main',
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QueryStatsIcon />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Monitoring Pengunjung &amp; IP
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Pantau log kunjungan real-time, alamat IP, perangkat klien, peramban, dan sistem operasi pengunjung situs.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchSummary();
              fetchVisitors();
            }}
            disabled={loading || summaryLoading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Muat Ulang
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteSweepIcon />}
            onClick={() => setClearDialogOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Bersihkan Log
          </Button>
        </Box>
      </Box>

      {/* KPI Stat Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                Total Kunjungan
              </Typography>
              <LanguageIcon fontSize="small" color="primary" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}>
              {summary ? (summary.total_visits || 0).toLocaleString('id-ID') : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Akumulasi semua halaman
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                Total IP Unik
              </Typography>
              <FingerprintIcon fontSize="small" sx={{ color: 'secondary.main' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}>
              {summary ? (summary.total_unique_ips || 0).toLocaleString('id-ID') : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pengunjung unik terdeteksi
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                Kunjungan Hari Ini
              </Typography>
              <TodayIcon fontSize="small" sx={{ color: 'success.main' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em', color: 'success.main' }}>
              {summary ? (summary.today_visits || 0).toLocaleString('id-ID') : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lalu lintas 24 jam terakhir
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                IP Unik Hari Ini
              </Typography>
              <PublicIcon fontSize="small" sx={{ color: 'info.main' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em', color: 'info.main' }}>
              {summary ? (summary.today_unique_ips || 0).toLocaleString('id-ID') : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Klien berbeda hari ini
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Analytics & Breakdown Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Trend Kunjungan 7 Hari */}
        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Tren Kunjungan 7 Hari
                  </Typography>
                </Box>
                <Chip label="7 Hari" size="small" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
              </Box>

              {summary?.trend && summary.trend.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                  {summary.trend.map((item) => {
                    const ratio = Math.max((item.visits / maxTrendVisits) * 100, 4);
                    return (
                      <Box key={item.date} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="caption" sx={{ minWidth: 54, fontWeight: 600, color: 'text.secondary' }}>
                          {item.label}
                        </Typography>
                        <Box sx={{ flexGrow: 1, height: 16, bgcolor: 'action.hover', borderRadius: 1.5, overflow: 'hidden' }}>
                          <Box
                            sx={{
                              height: '100%',
                              width: `${ratio}%`,
                              bgcolor: 'primary.main',
                              borderRadius: 1.5,
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ minWidth: 32, textAlign: 'right', fontWeight: 700 }}>
                          {item.visits}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Belum ada rekaman tren kunjungan.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Breakdown Perangkat & Browser */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DevicesIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Distribusi Perangkat &amp; Browser
                </Typography>
              </Box>

              {/* Device Progress Bars */}
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <ComputerIcon fontSize="small" sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" fontWeight={600}>Desktop</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700}>
                    {summary?.devices?.desktop || 0} ({desktopPercent}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={desktopPercent}
                  sx={{ height: 6, borderRadius: 1, mb: 1.5, bgcolor: 'action.hover' }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <SmartphoneIcon fontSize="small" sx={{ fontSize: 16, color: 'info.main' }} />
                    <Typography variant="caption" fontWeight={600}>Mobile</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700}>
                    {summary?.devices?.mobile || 0} ({mobilePercent}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={mobilePercent}
                  color="info"
                  sx={{ height: 6, borderRadius: 1, mb: 1.5, bgcolor: 'action.hover' }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <TabletIcon fontSize="small" sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="caption" fontWeight={600}>Tablet</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700}>
                    {summary?.devices?.tablet || 0} ({tabletPercent}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={tabletPercent}
                  color="warning"
                  sx={{ height: 6, borderRadius: 1, bgcolor: 'action.hover' }}
                />
              </Box>

              <Divider sx={{ my: 1.5 }} />

              {/* Top Browsers Chips */}
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1 }}>
                Peramban Populer
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {summary?.browsers && summary.browsers.length > 0 ? (
                  summary.browsers.map((b) => (
                    <Chip
                      key={b.browser}
                      label={`${b.browser}: ${b.count}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Belum ada data peramban.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Pages */}
        <Grid item xs={12} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PublicIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Halaman Populer
                </Typography>
              </Box>

              {summary?.top_pages && summary.top_pages.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {summary.top_pages.map((p) => (
                    <Box
                      key={p.page}
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: (th) =>
                          th.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 140,
                        }}
                      >
                        {p.page}
                      </Typography>
                      <Chip
                        label={`${p.count} klik`}
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Belum ada riwayat halaman.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visitor Logs Data Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          {/* Table Toolbar: Filters on Left, Search & Actions on Right */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2,
              mb: 2.5,
            }}
          >
            {/* Filters on Left */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="device-filter-label">Perangkat</InputLabel>
                <Select
                  labelId="device-filter-label"
                  value={deviceFilter}
                  label="Perangkat"
                  onChange={(e) => {
                    setDeviceFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Semua Perangkat</MenuItem>
                  <MenuItem value="desktop">Desktop</MenuItem>
                  <MenuItem value="mobile">Mobile</MenuItem>
                  <MenuItem value="tablet">Tablet</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="date-range-label">Rentang Waktu</InputLabel>
                <Select
                  labelId="date-range-label"
                  value={dateRange}
                  label="Rentang Waktu"
                  onChange={(e) => {
                    setDateRange(e.target.value);
                    setPage(0);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Semua Waktu</MenuItem>
                  <MenuItem value="today">Hari Ini</MenuItem>
                  <MenuItem value="yesterday">Kemarin</MenuItem>
                  <MenuItem value="7days">7 Hari Terakhir</MenuItem>
                  <MenuItem value="30days">30 Hari Terakhir</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Search on Right */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Cari IP, Halaman, Browser, OS..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
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
                sx={{ width: { xs: '100%', sm: 280 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          </Box>

          {/* Table Container */}
          <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Table size="medium">
              <TableHead sx={{ bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>WAKTU KUNJUNGAN</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>ALAMAT IP</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>HALAMAN</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>PERANGKAT &amp; OS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>PERAMBAN (BROWSER)</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>RUJUKAN (REFERER)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', width: 100 }}>AKSI</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                        Memuat data log pengunjung...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : visitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <InfoOutlinedIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        Tidak ada catatan log pengunjung yang cocok.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  visitors.map((visit) => (
                    <TableRow
                      key={visit.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      {/* Timestamp */}
                      <TableCell sx={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.82rem' }}>
                          {formatDateTime(visit.created_at)}
                        </Typography>
                      </TableCell>

                      {/* IP Address */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Chip
                            label={visit.ip_address || 'Tidak Terdeteksi'}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderColor: 'divider',
                            }}
                          />
                          {visit.ip_address && (
                            <Tooltip title="Salin IP">
                              <IconButton
                                size="small"
                                onClick={() => handleCopyIp(visit.ip_address)}
                                sx={{ p: 0.4 }}
                              >
                                <ContentCopyIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      {/* Page */}
                      <TableCell>
                        <Chip
                          label={visit.page || '/'}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>

                      {/* Device & OS */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          {getDeviceIcon(visit.device_type)}
                          <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                            {visit.platform || visit.device_type || 'Desktop'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Browser */}
                      <TableCell sx={{ fontSize: '0.82rem' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                          {visit.browser || 'Lainnya'}
                        </Typography>
                      </TableCell>

                      {/* Referer */}
                      <TableCell sx={{ fontSize: '0.82rem', maxWidth: 160 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: '0.82rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {visit.referer || 'Langsung (Direct)'}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Lihat Rincian Lengkap">
                            <IconButton
                              size="small"
                              onClick={() => setSelectedVisit(visit)}
                              sx={{
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1.5,
                                p: 0.6,
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Hapus Log">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteVisitor(visit.id)}
                              sx={{
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1.5,
                                p: 0.6,
                              }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Pagination */}
          <TablePagination
            component="div"
            count={totalVisitors}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={perPage}
            onRowsPerPageChange={(e) => {
              setPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 15, 25, 50, 100]}
            labelRowsPerPage="Baris per halaman:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={Boolean(selectedVisit)}
        onClose={() => setSelectedVisit(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Rincian Kunjungan #{selectedVisit?.id}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {selectedVisit && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  ALAMAT IP KLIEN
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="body1" fontFamily="monospace" fontWeight={700}>
                    {selectedVisit.ip_address || 'Tidak Terdeteksi'}
                  </Typography>
                  {selectedVisit.ip_address && (
                    <Button
                      size="small"
                      startIcon={copiedIp ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                      onClick={() => handleCopyIp(selectedVisit.ip_address)}
                      sx={{ textTransform: 'none', py: 0.2 }}
                    >
                      {copiedIp ? 'Tersalin' : 'Salin IP'}
                    </Button>
                  )}
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    HALAMAN DIAKSES
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" fontWeight={600} sx={{ mt: 0.5 }}>
                    {selectedVisit.page}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    WAKTU KUNJUNGAN
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {formatDateTime(selectedVisit.created_at)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    PERANGKAT &amp; OS
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {selectedVisit.platform || selectedVisit.device_type}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    PERAMBAN (BROWSER)
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {selectedVisit.browser}
                  </Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  RUJUKAN (REFERER)
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-all' }}>
                  {selectedVisit.referer || 'Langsung (Direct Navigation)'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  USER AGENT LENGKAP
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mt: 0.5,
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedVisit.user_agent || '-'}
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setSelectedVisit(null)}
            variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Logs Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Bersihkan Log Pengunjung
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pilih kriteria rentang pembersihan log pengunjung untuk mengoptimalkan penyimpanan database:
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="clear-range-label">Opsi Pembersihan</InputLabel>
            <Select
              labelId="clear-range-label"
              value={clearDays}
              label="Opsi Pembersihan"
              onChange={(e) => setClearDays(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value={30}>Hapus log lebih dari 30 hari (Direkomendasikan)</MenuItem>
              <MenuItem value={60}>Hapus log lebih dari 60 hari</MenuItem>
              <MenuItem value={90}>Hapus log lebih dari 90 hari</MenuItem>
              <MenuItem value={0}>Hapus semua riwayat log pengunjung</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setClearDialogOpen(false)}
            disabled={clearing}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Batal
          </Button>
          <Button
            onClick={handleClearLogs}
            variant="contained"
            color="error"
            disabled={clearing}
            startIcon={clearing ? <CircularProgress size={16} /> : <DeleteSweepIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {clearing ? 'Membersihkan...' : 'Bersihkan Sekarang'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
