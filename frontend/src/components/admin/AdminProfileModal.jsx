import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockResetIcon from '@mui/icons-material/LockReset';
import { authService } from '../../services/api';

export default function AdminProfileModal({ open, onClose, showToast, onUserUpdated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      const currentUser = authService.getCurrentUser() || {};
      setName(currentUser.name || 'Bayu Prastyo (Admin)');
      setEmail(currentUser.email || 'admin@baydev.my.id');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Nama dan email administrator wajib diisi.');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setErrorMsg('Password saat ini wajib diisi untuk mengonfirmasi perubahan password.');
        return;
      }
      if (newPassword.length < 8) {
        setErrorMsg('Password baru minimal harus 8 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Konfirmasi password baru tidak cocok.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
      };

      if (newPassword) {
        payload.current_password = currentPassword;
        payload.password = newPassword;
        payload.password_confirmation = confirmPassword;
      }

      const res = await authService.updateProfile(payload);
      showToast('Profil akun dan kredensial administrator berhasil diperbarui!', 'success');
      if (onUserUpdated && res?.data) {
        onUserUpdated(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Update profile error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.current_password?.[0] ||
        'Gagal memperbarui profil administrator.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: (th) => (th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.16)' : 'rgba(67, 56, 202, 0.1)'),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AdminPanelSettingsIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                Pengaturan Profil &amp; Keamanan Admin
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Kelola nama akun, email login, dan kata sandi akses
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {errorMsg && (
            <Alert severity="error" sx={{ borderRadius: 2, fontWeight: 600 }}>
              {errorMsg}
            </Alert>
          )}

          {/* User Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} color="text.primary">
              Informasi Akun
            </Typography>

            <TextField
              label="Nama Administrator"
              fullWidth
              required
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bayu Prastyo"
            />

            <TextField
              label="Email Administrator (Username Login)"
              type="email"
              fullWidth
              required
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@baydev.my.id"
              helperText="Email ini digunakan untuk masuk ke panel administrator"
            />
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Password Change Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockResetIcon color="primary" sx={{ fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                Ganti Kata Sandi (Opsional)
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Kosongkan bagian ini jika Anda tidak ingin mengubah kata sandi akses login.
            </Typography>

            <TextField
              label="Kata Sandi Saat Ini (Current Password)"
              type={showCurrentPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Kata Sandi Baru"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              helperText="Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Konfirmasi Kata Sandi Baru"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit" size="small">
            Batal
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            size="small"
            sx={{ fontWeight: 700, px: 3 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Simpan Perubahan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
