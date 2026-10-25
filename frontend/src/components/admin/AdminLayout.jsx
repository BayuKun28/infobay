import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PublicIcon from '@mui/icons-material/Public';
import DnsIcon from '@mui/icons-material/Dns';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

import DashboardOverview from './DashboardOverview';
import PortfolioManager from './PortfolioManager';
import BiodataManager from './BiodataManager';
import ServicesSkillsManager from './ServicesSkillsManager';
import ExperienceEducationManager from './ExperienceEducationManager';
import MessageManager from './MessageManager';
import TestimonialManager from './TestimonialManager';
import CertificationManager from './CertificationManager';
import AdminProfileModal from './AdminProfileModal';
import { getPublicProfile, authService, messageService } from '../../services/api';

const DRAWER_WIDTH = 250;

export default function AdminLayout({
  onLogout,
  onNavigatePublic,
  themeMode,
  toggleThemeMode,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Data states
  const [data, setData] = useState({
    biodata: null,
    portfolios: [],
    services: [],
    skills: [],
    education: [],
    experience: [],
    testimonials: [],
    certifications: [],
    techStack: [],
  });
  const [loading, setLoading] = useState(true);
  const [messageStats, setMessageStats] = useState({ total: 0, unread: 0 });

  // Toast state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  // User menu anchor
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // Admin Profile Modal state
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    return authService.getCurrentUser() || { name: 'Bayu Prastyo (Admin)', email: 'admin@baydev.my.id' };
  });

  const userInitials = (adminUser?.name || 'Admin')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handleUnreadCountChange = useCallback((unread) => {
    setMessageStats((prev) => {
      if (prev.unread === unread) return prev;
      return { ...prev, unread };
    });
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [result, messagesRes] = await Promise.allSettled([
        getPublicProfile(),
        messageService.getMessages({ per_page: 1 }),
      ]);

      if (result.status === 'fulfilled') {
        setData(result.value);
      }
      if (messagesRes.status === 'fulfilled' && messagesRes.value?.status === 'success') {
        const total = messagesRes.value.meta?.total ?? messagesRes.value.total_count ?? 0;
        const unread = messagesRes.value.meta?.unread_count ?? messagesRes.value.unread_count ?? 0;
        setMessageStats({ total, unread });
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Gagal memuat data dari server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const menuItems = [
    { text: 'Overview', desc: 'Metrik & Ringkasan', icon: <DashboardIcon sx={{ fontSize: 20 }} />, tab: 0 },
    { text: 'Portofolio', desc: '15+ Proyek & Kategori', icon: <FolderSpecialIcon sx={{ fontSize: 20 }} />, tab: 1 },
    { text: 'Profil & Bio', desc: 'Biodata & Hero Customizer', icon: <PersonIcon sx={{ fontSize: 20 }} />, tab: 2 },
    { text: 'Layanan & Skill', desc: 'Kapabilitas & Arsenal', icon: <BuildIcon sx={{ fontSize: 20 }} />, tab: 3 },
    { text: 'Pengalaman & Edu', desc: 'Karier & Pendidikan', icon: <SchoolIcon sx={{ fontSize: 20 }} />, tab: 5 },
    { text: 'Testimoni Klien', desc: 'Ulasan & Rating Bintang', icon: <FormatQuoteIcon sx={{ fontSize: 20 }} />, tab: 6 },
    { text: 'Sertifikasi', desc: 'Lisensi & Kredensial', icon: <WorkspacePremiumIcon sx={{ fontSize: 20 }} />, tab: 7 },
    {
      text: 'Pesan Masuk',
      desc: messageStats.unread > 0 ? `${messageStats.unread} Belum Dibaca` : 'Kotak Masuk Kontak',
      icon: (
        <Badge
          badgeContent={messageStats.unread}
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.65rem',
              height: 16,
              minWidth: 16,
              padding: '0 4px',
              fontWeight: 800,
            },
          }}
        >
          <MailOutlineIcon sx={{ fontSize: 20 }} />
        </Badge>
      ),
      tab: 4,
    },
  ];

  // Professional, Enterprise-grade Sidebar
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Sidebar Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              infobay
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Management Console
            </Typography>
          </Box>
        </Box>

        {/* Close Button on Mobile Drawer */}
        {isMobile && (
          <IconButton size="small" onClick={handleDrawerToggle}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Navigation Links */}
      <Box sx={{ px: 1.5, py: 2, flex: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ px: 1.5, pb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}
        >
          Menu Navigasi
        </Typography>

        <List disablePadding>
          {menuItems.map((item) => {
            const isSelected = currentTab === item.tab;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    setCurrentTab(item.tab);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    transition: 'all 0.15s ease',
                    bgcolor: isSelected
                      ? themeMode === 'dark'
                        ? 'rgba(99, 102, 241, 0.15)'
                        : 'rgba(79, 70, 229, 0.08)'
                      : 'transparent',
                    color: isSelected ? 'primary.main' : 'text.primary',
                    borderLeft: isSelected ? '3px solid' : '3px solid transparent',
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: isSelected ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    secondary={item.desc}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.7rem',
                      color: isSelected ? 'primary.main' : 'text.secondary',
                      sx: { opacity: isSelected ? 0.8 : 0.6 },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* System Operational Status Widget */}
      <Box sx={{ px: 2, py: 1.8, mx: 1.5, mb: 2, bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15, 23, 42, 0.03)', borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={800} display="block" sx={{ mb: 1, fontSize: '0.68rem', letterSpacing: '0.05em' }}>
          STATUS OPERASIONAL SISTEM
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Backend API</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: themeMode === 'dark' ? '#34D399' : '#059669', fontWeight: 800, fontSize: '0.75rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: themeMode === 'dark' ? '#34D399' : '#059669', display: 'inline-block' }} />
              Connected
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Database</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: themeMode === 'dark' ? '#34D399' : '#059669', fontWeight: 800, fontSize: '0.75rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: themeMode === 'dark' ? '#34D399' : '#059669', display: 'inline-block' }} />
              Active
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Domain Layanan</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: 'monospace', fontSize: '0.72rem' }}>info.baydev.my.id</Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Sidebar Footer Controls */}
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <ListItemButton
          onClick={onNavigatePublic}
          sx={{
            borderRadius: 2,
            py: 0.8,
            px: 1.5,
            color: 'text.primary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 30, color: 'text.secondary' }}>
            <PublicIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary="Buka Portofolio Publik"
            primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 2,
            py: 0.8,
            px: 1.5,
            color: 'error.main',
            '&:hover': { bgcolor: 'error.main', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } },
          }}
        >
          <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>
            <ExitToAppIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary="Keluar (Logout)"
            primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, minHeight: '60px !important' }}>
          {/* Left: Mobile Hamburger & Current Page Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              aria-label="Buka Menu Sidebar"
              sx={{
                display: { md: 'none' },
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 0.8,
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>

            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                {menuItems[currentTab]?.text}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {menuItems[currentTab]?.desc}
              </Typography>
            </Box>
          </Box>

          {/* Right Controls: Theme Mode, Public Shortcut, Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Dark / Light Mode Switcher */}
            <Tooltip title={themeMode === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}>
              <IconButton
                onClick={toggleThemeMode}
                color="inherit"
                sx={{
                  border: 1.5,
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 0.8,
                  bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: themeMode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)',
                  },
                }}
              >
                {themeMode === 'dark' ? (
                  <LightModeIcon sx={{ color: '#FDB813', fontSize: 20 }} />
                ) : (
                  <DarkModeIcon sx={{ color: '#4338CA', fontSize: 20 }} />
                )}
              </IconButton>
            </Tooltip>

            {/* Pesan Masuk Shortcut */}
            <Tooltip title={messageStats.unread > 0 ? `${messageStats.unread} Pesan Baru Belum Dibaca` : 'Pesan Masuk (Inbox)'}>
              <IconButton
                onClick={() => setCurrentTab(4)}
                sx={{
                  border: 1.5,
                  borderColor: currentTab === 4 ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: 0.8,
                  bgcolor: currentTab === 4
                    ? (themeMode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)')
                    : (themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)'),
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: themeMode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)',
                  },
                }}
              >
                <Badge
                  badgeContent={messageStats.unread}
                  color="error"
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.62rem',
                      height: 16,
                      minWidth: 16,
                      padding: '0 3px',
                      fontWeight: 800,
                    },
                  }}
                >
                  <MailOutlineIcon sx={{ fontSize: 20, color: currentTab === 4 ? 'primary.main' : 'text.primary' }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Pengalaman & Edu Shortcut */}
            <Tooltip title="Kelola Pengalaman & Pendidikan">
              <IconButton
                onClick={() => setCurrentTab(5)}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  border: 1.5,
                  borderColor: currentTab === 5 ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: 0.8,
                  bgcolor: currentTab === 5
                    ? (themeMode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)')
                    : (themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)'),
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: themeMode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)',
                  },
                }}
              >
                <SchoolIcon sx={{ fontSize: 20, color: currentTab === 5 ? 'primary.main' : 'text.primary' }} />
              </IconButton>
            </Tooltip>

            {/* Public Shortcut on Desktop */}
            <Tooltip title="Buka Halaman Portofolio Publik">
              <IconButton
                onClick={onNavigatePublic}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  border: 1.5,
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 0.8,
                  color: 'text.primary',
                  bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: themeMode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.08)',
                  },
                }}
              >
                <PublicIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* User Avatar Menu */}
            <Tooltip title="Akun Administrator">
              <IconButton
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                size="small"
                sx={{
                  ml: 0.5,
                  p: 0.3,
                  border: 1,
                  borderColor: 'primary.main',
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {userInitials || 'BP'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
              PaperProps={{
                sx: {
                  width: 230,
                  mt: 1,
                  borderRadius: 2.5,
                  p: 0.5,
                  border: 1,
                  borderColor: 'divider',
                },
              }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important', py: 1 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                    {adminUser?.name || 'Bayu Prastyo'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {adminUser?.email || 'admin@baydev.my.id'}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => {
                  setUserMenuAnchor(null);
                  setOpenProfileModal(true);
                }}
                sx={{ py: 0.8, fontSize: '0.85rem', fontWeight: 600 }}
              >
                <ListItemIcon>
                  <AdminPanelSettingsIcon fontSize="small" color="primary" />
                </ListItemIcon>
                Edit Profil &amp; Password
              </MenuItem>
              <MenuItem onClick={onNavigatePublic} sx={{ py: 0.8, fontSize: '0.85rem' }}>
                <ListItemIcon>
                  <PublicIcon fontSize="small" />
                </ListItemIcon>
                Situs Portofolio
              </MenuItem>
              <MenuItem onClick={toggleThemeMode} sx={{ py: 0.8, fontSize: '0.85rem' }}>
                <ListItemIcon>
                  {themeMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </ListItemIcon>
                {themeMode === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={onLogout} sx={{ color: 'error.main', py: 0.8, fontSize: '0.85rem', fontWeight: 600 }}>
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                Keluar (Logout)
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer Container */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer (Accessible via Burger Button only) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Workspace (No Bottom Nav on Mobile) */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 3.5 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 7.5, sm: 8 },
          mb: 4,
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {currentTab === 0 && (
          <DashboardOverview
            stats={{
              portfolioCount: data.portfolios?.length || 15,
              serviceCount: data.services?.length || 4,
              skillCount: data.skills?.length || 4,
              testimonialCount: data.testimonials?.length || 3,
              certificationCount: data.certifications?.length || 3,
              totalMessageCount: messageStats.total,
              unreadMessageCount: messageStats.unread,
              recentPortfolios: data.portfolios || [],
            }}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 1 && (
          <PortfolioManager
            portfolios={data.portfolios || []}
            onRefresh={loadAllData}
            showToast={showToast}
          />
        )}

        {currentTab === 2 && (
          <BiodataManager
            biodata={data.biodata}
            onRefresh={loadAllData}
            showToast={showToast}
            onOpenProfileModal={() => setOpenProfileModal(true)}
          />
        )}

        {currentTab === 3 && (
          <ServicesSkillsManager
            services={data.services || []}
            skills={data.skills || []}
            techStack={data.techStack || []}
            biodata={data.biodata}
            onRefresh={loadAllData}
            showToast={showToast}
          />
        )}

        {currentTab === 4 && (
          <MessageManager
            showToast={showToast}
            onUnreadCountChange={handleUnreadCountChange}
          />
        )}

        {currentTab === 5 && (
          <ExperienceEducationManager
            educations={data.education || []}
            experiences={data.experience || []}
            onRefresh={loadAllData}
            showToast={showToast}
          />
        )}

        {currentTab === 6 && (
          <TestimonialManager
            testimonials={data.testimonials || []}
            onRefresh={loadAllData}
            showToast={showToast}
          />
        )}

        {currentTab === 7 && (
          <CertificationManager
            certifications={data.certifications || []}
            onRefresh={loadAllData}
            showToast={showToast}
          />
        )}
      </Box>

      {/* Admin Profile & Password Modal */}
      <AdminProfileModal
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        showToast={showToast}
        onUserUpdated={(updatedUser) => setAdminUser(updatedUser)}
      />

      {/* Toast Notification Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
