import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini? Tindakan ini tidak dapat dibatalkan.',
  confirmText = 'Hapus Permanen',
  cancelText = 'Batal',
  confirmColor = 'error',
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          boxShadow: (th) =>
            th.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.6)' : '0 8px 32px rgba(0,0,0,0.1)',
          p: 1,
          maxWidth: 440,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: (th) =>
                confirmColor === 'error'
                  ? (th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)')
                  : (th.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)'),
              color: confirmColor === 'error' ? 'error.main' : 'warning.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 1,
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            <WarningAmberOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 1.5 }}>
        <DialogContentText sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.88rem', lineHeight: 1.6 }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={confirmColor}
          size="small"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
          }}
        >
          {loading ? 'Memproses...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
