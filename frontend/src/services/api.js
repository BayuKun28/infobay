import axios from 'axios';
import { defaultProfileData } from '../data/profileData';
import { API_BASE_URL } from '../constants';

// Determine intelligent baseURL: in browser environments, relative '/api/v1'
// ensures requests go through Vite dev proxy (or reverse proxy) seamlessly regardless
// of accessing via localhost, LAN IP (192.168.x.x), Tailscale, or public domain.
export const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    // If no envUrl, or if envUrl is relative, or if envUrl targets localhost / 127.0.0.1
    if (
      !envUrl ||
      envUrl.startsWith('/') ||
      envUrl.includes('localhost') ||
      envUrl.includes('127.0.0.1')
    ) {
      return '/api/v1';
    }
    return envUrl;
  }
  return envUrl || API_BASE_URL || '/api/v1';
};

export const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor to attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('infobay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthorized and dispatch session expiration event
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('infobay_token');
        localStorage.removeItem('infobay_user');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('auth:expired', {
              detail: {
                message:
                  error.response?.data?.message ||
                  'Sesi login Anda telah berakhir. Silakan login kembali.',
              },
            })
          );
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  async login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.data?.token) {
      localStorage.setItem('infobay_token', res.data.data.token);
      localStorage.setItem('infobay_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API warning:', e.message);
    } finally {
      localStorage.removeItem('infobay_token');
      localStorage.removeItem('infobay_user');
    }
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data?.data;
  },

  async updateProfile(payload) {
    const res = await apiClient.put('/auth/profile', payload);
    if (res.data?.data) {
      const currentUser = authService.getCurrentUser() || {};
      const updatedUser = { ...currentUser, ...res.data.data };
      localStorage.setItem('infobay_user', JSON.stringify(updatedUser));
    }
    return res.data;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('infobay_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('infobay_token');
  },
};

// Utility to normalize tech stack data into a clean array of strings
export function normalizeTechStack(raw) {
  if (!raw) return [];
  let items = raw;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch {
      items = items.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item) return '';
      if (typeof item === 'string') return item.trim();
      if (typeof item === 'object') {
        return item.name || item.title || item.label || item.tag || '';
      }
      return String(item).trim();
    })
    .filter(Boolean);
}

// Public Services
export async function getPublicProfile() {
  try {
    const [bioRes, portRes, servRes, skillRes, eduRes, expRes, testRes, certRes] = await Promise.allSettled([
      apiClient.get('/biodata'),
      apiClient.get('/portfolios'),
      apiClient.get('/services'),
      apiClient.get('/skills'),
      apiClient.get('/educations'),
      apiClient.get('/experiences'),
      apiClient.get('/testimonials'),
      apiClient.get('/certifications'),
    ]);

    const isLive = bioRes.status === 'fulfilled' || portRes.status === 'fulfilled';
    const bioData = bioRes.status === 'fulfilled' && bioRes.value.data?.data ? { ...bioRes.value.data.data } : { ...defaultProfileData.biodata };

    let dynamicTechStack = normalizeTechStack(defaultProfileData.techStack);
    if (bioData?.tech_stack) {
      const normalized = normalizeTechStack(bioData.tech_stack);
      if (normalized.length > 0) {
        dynamicTechStack = normalized;
        bioData.tech_stack = normalized;
      }
    }

    return {
      biodata: bioData,
      portfolios: portRes.status === 'fulfilled' && portRes.value.data?.data ? portRes.value.data.data : defaultProfileData.portfolios,
      services: servRes.status === 'fulfilled' && servRes.value.data?.data ? servRes.value.data.data : defaultProfileData.services,
      skills: skillRes.status === 'fulfilled' && skillRes.value.data?.data ? skillRes.value.data.data : defaultProfileData.skills,
      education: eduRes.status === 'fulfilled' && eduRes.value.data?.data ? eduRes.value.data.data : defaultProfileData.education,
      experience: expRes.status === 'fulfilled' && expRes.value.data?.data ? expRes.value.data.data : defaultProfileData.experience,
      testimonials: testRes.status === 'fulfilled' && testRes.value.data?.data ? testRes.value.data.data : (defaultProfileData.testimonials || []),
      certifications: certRes.status === 'fulfilled' && certRes.value.data?.data ? certRes.value.data.data : (defaultProfileData.certifications || []),
      techStack: dynamicTechStack,
      isLiveApi: isLive,
    };
  } catch (err) {
    console.warn('API error, falling back to local seed:', err.message);
    return {
      ...defaultProfileData,
      isLiveApi: false,
    };
  }
}

export async function getPublicTestimonials() {
  const res = await apiClient.get('/testimonials');
  return res.data?.data || [];
}

export async function getPublicCertifications() {
  const res = await apiClient.get('/certifications');
  return res.data?.data || [];
}

// Message Services (Public & Admin)
export const messageService = {
  // Public contact submission
  async submitMessage(payload) {
    const res = await apiClient.post('/messages', payload);
    return res.data;
  },

  // Admin Inbox Management
  async getMessages(params = {}) {
    const res = await apiClient.get('/admin/messages', { params });
    return res.data;
  },

  async getMessage(id) {
    const res = await apiClient.get(`/admin/messages/${id}`);
    return res.data;
  },

  async toggleRead(id, isRead = null) {
    const payload = isRead !== null ? { is_read: isRead } : {};
    const res = await apiClient.put(`/admin/messages/${id}/read`, payload);
    return res.data;
  },

  async deleteMessage(id) {
    const res = await apiClient.delete(`/admin/messages/${id}`);
    return res.data;
  },
};

// Admin CRUD Services
export const adminService = {
  // Messages / Inbox
  getMessages: messageService.getMessages,
  getMessage: messageService.getMessage,
  toggleMessageRead: messageService.toggleRead,
  deleteMessage: messageService.deleteMessage,

  // Admin Account Profile & Password
  async updateProfile(payload) {
    return await authService.updateProfile(payload);
  },

  // Media Upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Biodata
  async updateBiodata(payload) {
    const res = await apiClient.put('/admin/biodata', payload);
    return res.data;
  },

  // Portfolios
  async getPortfolios() {
    const res = await apiClient.get('/portfolios');
    return res.data?.data || [];
  },

  async createPortfolio(payload) {
    const res = await apiClient.post('/admin/portfolios', payload);
    return res.data;
  },

  async updatePortfolio(id, payload) {
    const res = await apiClient.put(`/admin/portfolios/${id}`, payload);
    return res.data;
  },

  async deletePortfolio(id) {
    const res = await apiClient.delete(`/admin/portfolios/${id}`);
    return res.data;
  },

  // Services
  async getServices() {
    const res = await apiClient.get('/services');
    return res.data?.data || [];
  },

  async createService(payload) {
    const res = await apiClient.post('/admin/services', payload);
    return res.data;
  },

  async updateService(id, payload) {
    const res = await apiClient.put(`/admin/services/${id}`, payload);
    return res.data;
  },

  async deleteService(id) {
    const res = await apiClient.delete(`/admin/services/${id}`);
    return res.data;
  },

  // Skills
  async getSkills() {
    const res = await apiClient.get('/skills');
    return res.data?.data || [];
  },

  async createSkill(payload) {
    const res = await apiClient.post('/admin/skills', payload);
    return res.data;
  },

  async updateSkill(id, payload) {
    const res = await apiClient.put(`/admin/skills/${id}`, payload);
    return res.data;
  },

  async deleteSkill(id) {
    const res = await apiClient.delete(`/admin/skills/${id}`);
    return res.data;
  },

  // Educations
  async getEducations() {
    const res = await apiClient.get('/educations');
    return res.data?.data || [];
  },

  async createEducation(payload) {
    const res = await apiClient.post('/admin/educations', payload);
    return res.data;
  },

  async updateEducation(id, payload) {
    const res = await apiClient.put(`/admin/educations/${id}`, payload);
    return res.data;
  },

  async deleteEducation(id) {
    const res = await apiClient.delete(`/admin/educations/${id}`);
    return res.data;
  },

  // Experiences
  async getExperiences() {
    const res = await apiClient.get('/experiences');
    return res.data?.data || [];
  },

  async createExperience(payload) {
    const res = await apiClient.post('/admin/experiences', payload);
    return res.data;
  },

  async updateExperience(id, payload) {
    const res = await apiClient.put(`/admin/experiences/${id}`, payload);
    return res.data;
  },

  async deleteExperience(id) {
    const res = await apiClient.delete(`/admin/experiences/${id}`);
    return res.data;
  },

  // CV / Resume Management
  async uploadCv(file) {
    const formData = new FormData();
    formData.append('cv_file', file);
    const res = await apiClient.post('/admin/biodata/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Testimonials Management
  async getTestimonials(params = {}) {
    const res = await apiClient.get('/admin/testimonials', { params });
    return res.data;
  },

  async createTestimonial(payload) {
    let headers = {};
    if (payload instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    const res = await apiClient.post('/admin/testimonials', payload, { headers });
    return res.data;
  },

  async updateTestimonial(id, payload) {
    let headers = {};
    if (payload instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
      if (!payload.has('_method')) payload.append('_method', 'PUT');
      const res = await apiClient.post(`/admin/testimonials/${id}`, payload, { headers });
      return res.data;
    }
    const res = await apiClient.put(`/admin/testimonials/${id}`, payload);
    return res.data;
  },

  async toggleTestimonialActive(id) {
    const res = await apiClient.put(`/admin/testimonials/${id}/toggle-active`);
    return res.data;
  },

  async deleteTestimonial(id) {
    const res = await apiClient.delete(`/admin/testimonials/${id}`);
    return res.data;
  },

  // Certifications Management
  async getCertifications(params = {}) {
    const res = await apiClient.get('/admin/certifications', { params });
    return res.data;
  },

  async createCertification(payload) {
    let headers = {};
    if (payload instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    const res = await apiClient.post('/admin/certifications', payload, { headers });
    return res.data;
  },

  async updateCertification(id, payload) {
    let headers = {};
    if (payload instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
      if (!payload.has('_method')) payload.append('_method', 'PUT');
      const res = await apiClient.post(`/admin/certifications/${id}`, payload, { headers });
      return res.data;
    }
    const res = await apiClient.put(`/admin/certifications/${id}`, payload);
    return res.data;
  },

  async toggleCertificationActive(id) {
    const res = await apiClient.put(`/admin/certifications/${id}/toggle-active`);
    return res.data;
  },

  async deleteCertification(id) {
    const res = await apiClient.delete(`/admin/certifications/${id}`);
    return res.data;
  },
};
