import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReplyIcon from '@mui/icons-material/Reply';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LanguageIcon from '@mui/icons-material/Language';
import DevicesIcon from '@mui/icons-material/Devices';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WifiOffIcon from '@mui/icons-material/WifiOff';

import { messageService } from '../../services/api';

export default function MessageManager({ showToast, onUnreadCountChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Stable references for callbacks to prevent infinite re-fetching loops
  const onUnreadCountChangeRef = useRef(onUnreadCountChange);
  const showToastRef = useRef(showToast);

  useEffect(() => {
    onUnreadCountChangeRef.current = onUnreadCountChange;
    showToastRef.current = showToast;
  });

  // Data states
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'auth' | 'network' | 'server'
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unread', 'read'
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal Detail states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Delete Confirm states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Messages from API with strictly isolated state dependencies & retry support
  const fetchMessages = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setRetrying(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setErrorType(null);

    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
      };

      if (statusFilter === 'unread') params.status = 'unread';
      if (statusFilter === 'read') params.status = 'read';
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await messageService.getMessages(params);
      if (res && res.status === 'success') {
        setMessages(Array.isArray(res.data) ? res.data : []);
        const total = res.meta?.total ?? res.total_count ?? (res.data?.length || 0);
        const unread = res.meta?.unread_count ?? res.unread_count ?? 0;
        setTotalCount(total);
        setUnreadCount(unread);
        if (onUnreadCountChangeRef.current) {
          onUnreadCountChangeRef.current(unread);
        }
        setRetryAttempt(0);
      } else {
        throw new Error(res?.message || 'Format respon API tidak valid');
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      const isAuthError = err.response?.status === 401;
      const isNetworkError = err.code === 'ERR_NETWORK' || !err.response;

      if (isAuthError) {
        setErrorType('auth');
        setError('Sesi login telah berakhir atau token tidak valid.');
        if (showToastRef.current) {
          showToastRef.current('Sesi login telah berakhir. Silakan login kembali.', 'warning');
        }
        // Auto trigger re-login redirect signal
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('auth:expired', {
              detail: { message: 'Sesi login telah berakhir. Silakan login kembali.' },
            })
          );
        }
      } else if (isNetworkError) {
        setErrorType('network');
        setError('Tidak dapat terhubung ke server API backend. Periksa koneksi jaringan Anda atau pastikan server aktif.');
        if (showToastRef.current) {
          showToastRef.current('Koneksi ke backend API terputus. Pastikan server aktif.', 'error');
        }

        // Automatic transient retry once if initial attempt
        if (!isRetry && retryAttempt < 1) {
          setRetryAttempt((prev) => prev + 1);
          setTimeout(() => {
            fetchMessages(true);
          }, 1500);
        }
      } else {
        setErrorType('server');
        const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat daftar pesan masuk.';
        setError(errorMsg);
        if (showToastRef.current) {
          showToastRef.current(errorMsg, 'error');
        }
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [page, rowsPerPage, statusFilter, searchQuery, retryAttempt]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle Mark as Read / Toggle
  const handleToggleRead = async (message, e) => {
    if (e) e.stopPropagation();
    try {
      const newStatus = !message.is_read;
      const res = await messageService.toggleRead(message.id, newStatus);
      if (res && res.status === 'success') {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, is_read: newStatus } : m))
        );
        if (selectedMessage && selectedMessage.id === message.id) {
          setSelectedMessage((prev) => ({ ...prev, is_read: newStatus }));
        }
        const updatedUnread = res.unread_count ?? (newStatus ? unreadCount - 1 : unreadCount + 1);
        const safeUnread = Math.max(0, updatedUnread);
        setUnreadCount(safeUnread);
        if (onUnreadCountChangeRef.current) onUnreadCountChangeRef.current(safeUnread);
        if (showToastRef.current) {
          showToastRef.current(newStatus ? 'Pesan ditandai sudah dibaca' : 'Pesan ditandai belum dibaca', 'info');
        }
      }
    } catch (err) {
      console.error('Failed to toggle read state:', err);
      if (showToastRef.current) showToastRef.current('Gagal memperbarui status pesan', 'error');
    }
  };

  // Open Detail View & auto mark as read if unread
  const handleOpenDetail = (message) => {
    setSelectedMessage(message);
    setDetailOpen(true);
    if (!message.is_read) {
      handleToggleRead(message);
    }
  };

  // Delete message execution
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await messageService.deleteMessage(deleteTarget.id);
      if (res && res.status === 'success') {
        if (showToastRef.current) showToastRef.current('Pesan berhasil dihapus permanen', 'success');
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
        if (detailOpen && selectedMessage?.id === deleteTarget.id) {
          setDetailOpen(false);
          setSelectedMessage(null);
        }
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
      if (showToastRef.current) showToastRef.current('Gagal menghapus pesan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
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
              Pesan Masuk (Inbox)
            </Typography>
            {unreadCount > 0 ? (
              <Chip
                label={`${unreadCount} Belum Dibaca`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.12)',
                  color: (th) => th.palette.mode === 'dark' ? '#F87171' : '#B91C1C',
                  border: '1px solid',
                  borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(220, 38, 38, 0.3)',
                }}
              />
            ) : (
              <Chip
                label="Semua Terbaca"
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
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
            Daftar pesan kontak langsung dari pengunjung situs portofolio publik infobay.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={() => fetchMessages()}
            disabled={loading}
            sx={{ flex: { xs: 1, sm: 'none' }, fontWeight: 700, fontSize: '0.8rem' }}
          >
            Segarkan
          </Button>
        </Box>
      </Box>

      {/* Filter Tabs & Search Bar */}
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
          {/* Status Tabs */}
          <Tabs
            value={statusFilter}
            onChange={(e, val) => {
              setStatusFilter(val);
              setPage(0);
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
            <Tab value="all" label={`Semua (${totalCount})`} />
            <Tab
              value="unread"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Belum Dibaca</span>
                  {unreadCount > 0 && (
                    <Box
                      component="span"
                      sx={{
                        px: 0.8,
                        py: 0.1,
                        borderRadius: 1,
                        bgcolor: 'error.main',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                      }}
                    >
                      {unreadCount}
                    </Box>
                  )}
                </Box>
              }
            />
            <Tab value="read" label="Sudah Dibaca" />
          </Tabs>

          {/* Search Box */}
          <TextField
            size="small"
            placeholder="Cari pengirim, email, subjek, atau isi pesan..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
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

      {/* Main Content: Table on Desktop, Cards on Mobile */}
      <Paper elevation={0} sx={{ borderRadius: 2.5, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6, gap: 2 }}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Memuat pesan masuk...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ py: 6, px: 3, display: 'flex', justifyContent: 'center' }}>
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                maxWidth: 560,
                p: 3.5,
                border: 2,
                borderColor: errorType === 'auth' ? 'warning.main' : 'error.main',
                borderRadius: 2,
                bgcolor: (th) =>
                  th.palette.mode === 'dark'
                    ? errorType === 'auth'
                      ? 'rgba(245, 158, 11, 0.08)'
                      : 'rgba(239, 68, 68, 0.08)'
                    : errorType === 'auth'
                    ? 'rgba(254, 243, 199, 0.8)'
                    : 'rgba(254, 242, 242, 0.9)',
                textAlign: 'left',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    bgcolor: errorType === 'auth' ? '#FFDE59' : '#FF8080',
                    border: '2px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '2px 2px 0px #000',
                    flexShrink: 0,
                  }}
                >
                  {errorType === 'auth' ? (
                    <WarningAmberIcon sx={{ color: '#000', fontSize: 26 }} />
                  ) : errorType === 'network' ? (
                    <WifiOffIcon sx={{ color: '#000', fontSize: 24 }} />
                  ) : (
                    <ErrorOutlineIcon sx={{ color: '#000', fontSize: 26 }} />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary', mb: 0.5 }}>
                    {errorType === 'auth'
                      ? 'Autentikasi Diperlukan'
                      : errorType === 'network'
                      ? 'Kendala Koneksi Jaringan'
                      : 'Gagal Memuat Pesan Masuk'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, fontWeight: 500 }}>
                    {error}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {errorType === 'auth' ? (
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(
                              new CustomEvent('auth:expired', { detail: { message: error } })
                            );
                          }
                        }}
                        sx={{
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          border: '2px solid black',
                          borderRadius: 0,
                          boxShadow: '2px 2px 0px #000',
                          bgcolor: '#FFDE59',
                          color: '#000',
                          '&:hover': { bgcolor: '#FACC15' },
                        }}
                      >
                        Login Ulang Sekarang
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={() => fetchMessages(true)}
                        disabled={loading || retrying}
                        startIcon={
                          retrying ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <RefreshIcon fontSize="small" />
                          )
                        }
                        sx={{
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          border: '2px solid black',
                          borderRadius: 0,
                          boxShadow: '2px 2px 0px #000',
                          bgcolor: '#FFDE59',
                          color: '#000',
                          '&:hover': { bgcolor: '#FACC15' },
                        }}
                      >
                        {retrying ? 'Mencoba Menghubungkan...' : 'Coba Muat Ulang'}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <MailOutlineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              Tidak Ada Pesan Masuk
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 400, mx: 'auto', mt: 0.5 }}>
              {searchQuery
                ? `Tidak ditemukan pesan yang cocok dengan kata kunci "${searchQuery}".`
                : statusFilter === 'unread'
                ? 'Seluruh pesan masuk telah dibaca.'
                : 'Belum ada pesan yang dikirimkan oleh pengunjung situs portofolio.'}
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
                      <TableCell sx={{ width: 45, px: 1, textAlign: 'center' }}>•</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', width: 220 }}>Pengirim</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Subjek &amp; Pesan</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', width: 170 }}>Waktu Diterima</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem', width: 150 }}>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {messages.map((item) => {
                      const isUnread = !item.is_read;
                      return (
                        <TableRow
                          key={item.id}
                          hover
                          onClick={() => handleOpenDetail(item)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: isUnread
                              ? theme.palette.mode === 'dark'
                                ? 'rgba(129, 140, 248, 0.08)'
                                : 'rgba(67, 56, 202, 0.04)'
                              : 'transparent',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          {/* Unread Status Indicator */}
                          <TableCell sx={{ px: 1, textAlign: 'center' }}>
                            {isUnread ? (
                              <Tooltip title="Pesan Baru (Belum Dibaca)">
                                <FiberManualRecordIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                              </Tooltip>
                            ) : (
                              <FiberManualRecordIcon sx={{ fontSize: 11, color: 'text.disabled', opacity: 0.4 }} />
                            )}
                          </TableCell>

                          {/* Sender Info */}
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isUnread ? 800 : 600,
                                color: 'text.primary',
                                lineHeight: 1.2,
                              }}
                            >
                              {item.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: '0.74rem', display: 'block', mt: 0.2 }}
                            >
                              {item.email}
                            </Typography>
                          </TableCell>

                          {/* Subject & Preview */}
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isUnread ? 800 : 600,
                                color: 'text.primary',
                                mb: 0.3,
                              }}
                            >
                              {item.subject || '(Tanpa Subjek)'}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: '0.78rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {item.message}
                            </Typography>
                          </TableCell>

                          {/* Date */}
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <ScheduleIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                              <span>{formatDate(item.created_at)}</span>
                            </Box>
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title={isUnread ? 'Tandai Sudah Dibaca' : 'Tandai Belum Dibaca'}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleToggleRead(item, e)}
                                  sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1.5,
                                    p: 0.6,
                                  }}
                                >
                                  {isUnread ? (
                                    <MarkEmailReadIcon fontSize="small" color="primary" />
                                  ) : (
                                    <MarkEmailUnreadIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                  )}
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Balas via Email (mailto)">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject || 'Balasan Pesan Portofolio')}`}
                                  sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1.5,
                                    p: 0.6,
                                    color: 'text.primary',
                                  }}
                                >
                                  <ReplyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Hapus Pesan">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setDeleteTarget(item);
                                    setDeleteDialogOpen(true);
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
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Mobile Adaptive Card View */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5, p: 1.5 }}>
              {messages.map((item) => {
                const isUnread = !item.is_read;
                return (
                  <Card
                    key={item.id}
                    elevation={0}
                    onClick={() => handleOpenDetail(item)}
                    sx={{
                      cursor: 'pointer',
                      border: 1.5,
                      borderColor: isUnread ? 'primary.main' : 'divider',
                      bgcolor: isUnread
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(129, 140, 248, 0.08)'
                          : 'rgba(67, 56, 202, 0.04)'
                        : 'background.paper',
                      p: 1.8,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isUnread && <FiberManualRecordIcon sx={{ fontSize: 12, color: 'primary.main' }} />}
                        <Typography variant="subtitle2" fontWeight={isUnread ? 800 : 700}>
                          {item.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={isUnread ? 'Baru' : 'Dibaca'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: isUnread
                            ? theme.palette.mode === 'dark' ? 'rgba(239,68,68,0.2)' : 'rgba(220,38,38,0.1)'
                            : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                          color: isUnread ? 'error.main' : 'text.secondary',
                        }}
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {item.email} • {formatDate(item.created_at)}
                    </Typography>

                    <Typography variant="body2" fontWeight={isUnread ? 700 : 600} sx={{ mb: 0.5, color: 'text.primary' }}>
                      {item.subject || '(Tanpa Subjek)'}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1.5,
                        fontSize: '0.78rem',
                      }}
                    >
                      {item.message}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {/* Mobile Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon fontSize="small" />}
                        onClick={() => handleOpenDetail(item)}
                        sx={{ fontSize: '0.75rem', py: 0.5, px: 1.5, fontWeight: 700 }}
                      >
                        Buka
                      </Button>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          component="a"
                          href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject || 'Balasan Pesan')}`}
                          startIcon={<ReplyIcon fontSize="small" />}
                          sx={{ fontSize: '0.75rem', py: 0.5, px: 1.2, fontWeight: 700 }}
                        >
                          Balas
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setDeleteTarget(item);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5 }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>

            {/* Pagination Controls */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Baris per halaman:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
              sx={{
                borderTop: 1,
                borderColor: 'divider',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                },
              }}
            />
          </>
        )}
      </Paper>

      {/* Modal Dialog: Detail Pesan Lengkap */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MailOutlineIcon color="primary" />
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.15rem' }}>
              Detail Pesan Kontak
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setDetailOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ py: 2.5 }}>
          {selectedMessage && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Sender & Meta Cards */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                      Nama Pengirim
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                      <PersonOutlineIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight={800}>
                        {selectedMessage.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                      Alamat Email
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                      <AlternateEmailIcon fontSize="small" color="primary" />
                      <Typography
                        component="a"
                        href={`mailto:${selectedMessage.email}`}
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {selectedMessage.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                      Waktu Diterima
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                      <ScheduleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {formatDate(selectedMessage.created_at)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                      Status Keterbacaan
                    </Typography>
                    <Box sx={{ mt: 0.3 }}>
                      <Chip
                        label={selectedMessage.is_read ? 'Sudah Dibaca' : 'Belum Dibaca'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          bgcolor: selectedMessage.is_read
                            ? theme.palette.mode === 'dark' ? 'rgba(52,211,153,0.15)' : 'rgba(5,150,105,0.12)'
                            : theme.palette.mode === 'dark' ? 'rgba(239,68,68,0.2)' : 'rgba(220,38,38,0.12)',
                          color: selectedMessage.is_read ? (theme.palette.mode === 'dark' ? '#34D399' : '#065F46') : 'error.main',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Subject */}
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                  Subjek Pesan
                </Typography>
                <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ fontSize: '1.05rem' }}>
                  {selectedMessage.subject || '(Pengirim tidak menyertakan subjek)'}
                </Typography>
              </Box>

              {/* Message Content */}
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em', display: 'block', mb: 0.8 }}>
                  Isi Pesan Lengkap
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: (th) => th.palette.mode === 'dark' ? '#0F1626' : '#FFFFFF',
                    border: 1.5,
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.7,
                      fontSize: '0.9rem',
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  >
                    {selectedMessage.message}
                  </Typography>
                </Paper>
              </Box>

              {/* Security Audit Meta (IP & User Agent) */}
              {(selectedMessage.ip_address || selectedMessage.user_agent) && (
                <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.68rem', textTransform: 'uppercase', display: 'block', mb: 0.6 }}>
                    Informasi Audit Jaringan
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    {selectedMessage.ip_address && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <LanguageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          IP Pengirim: {selectedMessage.ip_address}
                        </Typography>
                      </Box>
                    )}
                    {selectedMessage.user_agent && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <DevicesIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>
                          Browser: {selectedMessage.user_agent}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 2.5, py: 1.8, justifyContent: 'space-between' }}>
          <Button
            color="error"
            startIcon={<DeleteOutlineIcon fontSize="small" />}
            onClick={() => {
              setDeleteTarget(selectedMessage);
              setDeleteDialogOpen(true);
            }}
            sx={{ fontWeight: 700, fontSize: '0.8rem' }}
          >
            Hapus Pesan
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={(e) => handleToggleRead(selectedMessage, e)}
              sx={{ fontWeight: 700, fontSize: '0.8rem' }}
            >
              {selectedMessage?.is_read ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}
            </Button>
            <Button
              variant="contained"
              startIcon={<ReplyIcon fontSize="small" />}
              component="a"
              href={`mailto:${selectedMessage?.email}?subject=Re: ${encodeURIComponent(selectedMessage?.subject || 'Balasan Pesan')}`}
              sx={{ fontWeight: 700, fontSize: '0.8rem' }}
            >
              Balas via Email
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Modal Dialog: Konfirmasi Hapus Pesan */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Konfirmasi Hapus Pesan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            Apakah Anda yakin ingin menghapus pesan dari <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading} sx={{ fontWeight: 700 }}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleExecuteDelete}
            disabled={actionLoading}
            sx={{ fontWeight: 700 }}
          >
            {actionLoading ? 'Menghapus...' : 'Ya, Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
