import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60s for AI workflows
});

// Response interceptor for clean error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// 1. AI Analysis
export const analyzeIncident = (payload, isFormData = false) => {
  if (isFormData) {
    return api.post('/investigations/analyze', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  const formData = new FormData();
  if (payload.text) formData.append('text', payload.text);
  if (payload.email_content) formData.append('email_content', payload.email_content);
  if (payload.source_type) formData.append('source_type', payload.source_type);
  return api.post('/investigations/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const reanalyzeInvestigation = (id) => {
  return api.post(`/investigations/${id}/reanalyze`);
};

// 2. Investigations
export const getInvestigations = (params = {}) => {
  return api.get('/investigations', { params });
};

export const getInvestigation = (id) => {
  return api.get(`/investigations/${id}`);
};

export const createInvestigation = (data) => {
  return api.post('/investigations', data);
};

export const updateInvestigation = (id, data) => {
  return api.put(`/investigations/${id}`, data);
};

export const deleteInvestigation = (id) => {
  return api.delete(`/investigations/${id}`);
};

// 3. CAPA Management
export const getAllCapaActions = (params = {}) => {
  return api.get('/capa', { params });
};

export const updateCapaAction = (id, data) => {
  return api.put(`/capa/${id}`, null, { params: data });
};

export const createCapaAction = (data) => {
  return api.post('/capa', null, { params: data });
};

export const deleteCapaAction = (id) => {
  return api.delete(`/capa/${id}`);
};

// 4. Dashboard Stats
export const getDashboardStats = () => {
  return api.get('/dashboard/stats');
};

// 5. Settings & Health
export const getSettings = () => {
  return api.get('/settings');
};

export const updateSettings = (formData) => {
  return api.post('/settings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const testGroqKey = (apiKey = '') => {
  const fd = new FormData();
  if (apiKey) fd.append('groq_api_key', apiKey);
  return api.post('/settings/test-groq', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const seedDemoData = () => {
  return api.post('/seed-demo');
};

export default api;
