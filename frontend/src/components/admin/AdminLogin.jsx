import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ShieldIcon from '@mui/icons-material/Shield';
import { authService } from '../../services/api';

export default function AdminLogin({
  onLoginSuccess,
  onBackToPublic,
  themeMode,
  toggleThemeMode,
  sessionExpiredMsg,
}) {
  const theme = useTheme();
  const [email, setEmail] = useState('admin@baydev.my.id');
  const [password, setPassword] = useState('AdminBaydev2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      onLoginSuccess();
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Login gagal. Silakan periksa kredensial Anda.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Top action bar: Theme Switcher & Back */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 1,
        }}
      >
        <Tooltip title={themeMode === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}>
          <IconButton
            onClick={toggleThemeMode}
            color="inherit"
            sx={{
              bgcolor: 'background.paper',
              border: 1.5,
              borderColor: 'divider',
              p: 1,
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)',
              },
            }}
          >
            {themeMode === 'dark' ? <LightModeIcon sx={{ color: '#FDB813', fontSize: 20 }} /> : <DarkModeIcon sx={{ color: '#4338CA', fontSize: 20 }} />}
          </IconButton>
        </Tooltip>
      </Box>

      <Container maxWidth="xs" sx={{ p: 0 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              py: 3.5,
              px: 3,
              textAlign: 'center',
              borderBottom: 1,
              borderColor: 'divider',
              background:
                themeMode === 'dark'
                  ? 'linear-gradient(180deg, rgba(99,102,241,0.15) 0%, rgba(17,24,39,0) 100%)'
                  : 'linear-gradient(180deg, rgba(79,70,229,0.08) 0%, rgba(255,255,255,0) 100%)',
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                mx: 'auto',
                mb: 1.5,
                width: 52,
                height: 52,
                boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)',
              }}
            >
              <ShieldIcon />
            </Avatar>
            <Typography variant="h5" fontWeight="800">
              INFOBAY ADMIN
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Enterprise Portfolio &amp; CMS Panel
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            {sessionExpiredMsg && (
              <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2, fontWeight: 600 }}>
                {sessionExpiredMsg}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                label="Email Administrator"
                variant="outlined"
                fullWidth
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                autoComplete="email"
                disabled={loading}
                size="medium"
              />

              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                autoComplete="current-password"
                disabled={loading}
                size="medium"
              />

              {/* Default Credential helper */}
              <Box
                sx={{
                  mt: 2,
                  mb: 2.5,
                  p: 1.8,
                  bgcolor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(67, 56, 202, 0.05)',
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: (th) => th.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.25)' : 'rgba(67, 56, 202, 0.2)',
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block" fontWeight="800">
                  Kredensial Akses Administrator (PostgreSQL 17):
                </Typography>
                <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', mt: 0.5, color: (th) => th.palette.mode === 'dark' ? '#C7D2FE' : '#312E81', fontWeight: 600 }}>
                  <strong>Email:</strong> admin@baydev.my.id
                </Typography>
                <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', color: (th) => th.palette.mode === 'dark' ? '#C7D2FE' : '#312E81', fontWeight: 600 }}>
                  <strong>Password:</strong> AdminBaydev2026!
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.4,
                  fontWeight: '700',
                  fontSize: '1rem',
                  borderRadius: 2.5,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Masuk ke Dashboard'}
              </Button>
            </form>

            <Divider sx={{ my: 2.5 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBackToPublic}
                size="small"
                sx={{ color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'text.primary' } }}
              >
                Kembali ke Situs Portofolio
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
