import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { AdminLogin, AdminLayout } from '../components/admin';
import { authService } from '../services';
import { useAuth } from '../hooks';

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: 'dark',
});

export const useColorMode = () => useContext(ColorModeContext);

export default function AdminPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  // Default theme mode: stored in localStorage or 'dark'
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('infobay_admin_theme_mode') || 'dark';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('infobay_admin_theme_mode', nextMode);
          return nextMode;
        });
      },
      mode,
    }),
    [mode]
  );

  // Modern, clean, enterprise-grade theme (High Visibility Dark & Light Mode)
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode: Clean Modern High-Contrast Slate
                primary: {
                  main: '#4338CA', // Indigo 700 (High contrast WCAG AAA 7.2:1 against white)
                  light: '#6366F1',
                  dark: '#312E81',
                  contrastText: '#FFFFFF',
                },
                secondary: {
                  main: '#0369A1', // Sky 700
                  light: '#0284C7',
                  dark: '#075985',
                  contrastText: '#FFFFFF',
                },
                background: {
                  default: '#F1F5F9', // Crisp Slate 100
                  paper: '#FFFFFF',   // Pure White
                },
                text: {
                  primary: '#0F172A',   // Slate 900 (Ultra clear text)
                  secondary: '#334155', // Slate 700 (High contrast legible text)
                },
                divider: '#CBD5E1', // Slate 300 (Visible structural lines)
                action: {
                  active: '#0F172A',
                  hover: 'rgba(15, 23, 42, 0.05)',
                  selected: 'rgba(67, 56, 202, 0.12)',
                },
              }
            : {
                // Dark mode: Deep Tech Slate with High-Visibility Accents
                primary: {
                  main: '#818CF8', // Indigo 400 (Vivid & crisp on dark)
                  light: '#A5B4FC',
                  dark: '#4F46E5',
                  contrastText: '#0B0F19',
                },
                secondary: {
                  main: '#38BDF8', // Cyan / Sky 400
                  light: '#7DD3FC',
                  dark: '#0284C7',
                  contrastText: '#0B0F19',
                },
                background: {
                  default: '#0B101B', // Deep Space Navy
                  paper: '#151D2F',   // Distinct Elevated Surface
                },
                text: {
                  primary: '#F8FAFC',   // Slate 50 (Pure High-Contrast White)
                  secondary: '#CBD5E1', // Slate 300 (Ultra clear secondary text)
                },
                divider: '#2A364F', // Distinct crisp divider line
                action: {
                  active: '#F8FAFC',
                  hover: 'rgba(255, 255, 255, 0.07)',
                  selected: 'rgba(129, 140, 248, 0.18)',
                },
              }),
        },
        typography: {
          fontFamily: [
            'Plus Jakarta Sans',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'sans-serif',
          ].join(','),
          h5: {
            fontWeight: 800,
            letterSpacing: '-0.02em',
          },
          h6: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
          },
          subtitle1: {
            fontWeight: 700,
          },
          subtitle2: {
            fontWeight: 600,
          },
          button: {
            textTransform: 'none',
            fontWeight: 700,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                border: mode === 'dark' ? '1px solid #2A364F' : '1px solid #CBD5E1',
                boxShadow:
                  mode === 'dark'
                    ? '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
                    : '0 2px 12px -2px rgba(15, 23, 42, 0.08)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                padding: '8px 18px',
                fontWeight: 700,
                boxShadow: 'none',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
              containedPrimary: {
                backgroundColor: mode === 'dark' ? '#818CF8' : '#4338CA',
                color: mode === 'dark' ? '#0A0E17' : '#FFFFFF',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? '#9BA3FB' : '#3730A3',
                },
              },
              outlined: {
                borderWidth: '1.5px',
                borderColor: mode === 'dark' ? '#3B4863' : '#94A3B8',
                color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                '&:hover': {
                  borderWidth: '1.5px',
                  borderColor: mode === 'dark' ? '#818CF8' : '#4338CA',
                  backgroundColor: mode === 'dark' ? 'rgba(129, 140, 248, 0.12)' : 'rgba(67, 56, 202, 0.06)',
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                transition: 'all 0.15s ease-in-out',
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                backgroundColor: mode === 'dark' ? '#0F1626' : '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#334155' : '#CBD5E1',
                  borderWidth: '1.5px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#64748B' : '#64748B',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#818CF8' : '#4338CA',
                  borderWidth: '2px',
                },
                '& input': {
                  color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                  fontWeight: 500,
                  '&::placeholder': {
                    color: mode === 'dark' ? '#94A3B8' : '#64748B',
                    opacity: 1,
                  },
                },
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                color: mode === 'dark' ? '#CBD5E1' : '#334155',
                fontWeight: 600,
                '&.Mui-focused': {
                  color: mode === 'dark' ? '#818CF8' : '#4338CA',
                },
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: mode === 'dark' ? '1px solid #232F48' : '1px solid #E2E8F0',
                color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
              },
              head: {
                backgroundColor: mode === 'dark' ? '#182236' : '#F1F5F9',
                color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                fontWeight: 700,
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
              },
              outlined: {
                borderColor: mode === 'dark' ? '#3B4863' : '#CBD5E1',
                color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                borderWidth: '1.5px',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                borderRadius: 14,
                border: mode === 'dark' ? '1px solid #2A364F' : '1px solid #CBD5E1',
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                backgroundColor: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                color: mode === 'dark' ? '#0F172A' : '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.75rem',
                borderRadius: 6,
                padding: '6px 10px',
              },
              arrow: {
                color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
              },
            },
          },
        },
      }),
    [mode]
  );

  const [sessionExpiredMsg, setSessionExpiredMsg] = useState('');

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());

    const handleAuthExpired = (e) => {
      console.warn('Session expired signal received:', e.detail?.message);
      setIsAuthenticated(false);
      setSessionExpiredMsg(e.detail?.message || 'Sesi login Anda telah berakhir. Silakan login kembali.');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setSessionExpiredMsg('');
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setSessionExpiredMsg('');
  };

  const handleBackToPublic = () => {
    navigate('/');
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {!isAuthenticated ? (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onBackToPublic={handleBackToPublic}
            themeMode={mode}
            toggleThemeMode={colorMode.toggleColorMode}
            sessionExpiredMsg={sessionExpiredMsg}
          />
        ) : (
          <AdminLayout
            onLogout={handleLogout}
            onNavigatePublic={handleBackToPublic}
            themeMode={mode}
            toggleThemeMode={colorMode.toggleColorMode}
          />
        )}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
