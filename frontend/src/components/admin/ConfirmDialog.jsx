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
} from '@mui/material';
import { AlertTriangle } from 'lucide-react';

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
          border: '3px solid black',
          boxShadow: '6px 6px 0px 0px #000000',
          borderRadius: 0,
          p: 1,
          maxWidth: 440,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              bgcolor: confirmColor === 'error' ? '#FF8080' : '#FFDE59',
              border: '2px solid black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px #000',
            }}
          >
            <AlertTriangle size={20} color="#000" strokeWidth={2.5} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 1.5 }}>
        <DialogContentText sx={{ fontWeight: 600, color: 'text.primary' }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            border: '2px solid black',
            borderRadius: 0,
            color: 'text.primary',
            boxShadow: '2px 2px 0px #000',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={confirmColor}
          sx={{
            fontWeight: 900,
            textTransform: 'uppercase',
            border: '2px solid black',
            borderRadius: 0,
            boxShadow: '2px 2px 0px #000',
          }}
        >
          {loading ? 'MEMPROSES...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
