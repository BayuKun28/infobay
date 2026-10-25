/**
 * Application Constants
 * All URLs and configuration defaults centralized here.
 */

export const API_BASE_URL =
  typeof window !== 'undefined' &&
  (!import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_URL.startsWith('/') ||
    import.meta.env.VITE_API_URL.includes('localhost') ||
    import.meta.env.VITE_API_URL.includes('127.0.0.1'))
    ? '/api/v1'
    : import.meta.env.VITE_API_URL || '/api/v1';
export const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_URL || '/storage';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'infobay';

export const PAGINATION_LIMITS = {
  PORTFOLIO: 6,
  TESTIMONIALS: 3,
  CERTIFICATIONS: 3,
  ADMIN_TABLE: 10,
};

export const NEO_COLORS = {
  YELLOW: '#FFDE59',
  MINT: '#98D8AA',
  PINK: '#FF8080',
  CYAN: '#54BAB9',
  LILAC: '#D8B4F8',
  CREAM: '#FFFDF0',
  DARK: '#121212',
};

export const DEFAULT_AVATAR =
  'https://baydev.my.id/assets/backend/images/about/1757684148.png';
export const DEFAULT_FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
