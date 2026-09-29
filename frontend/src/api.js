import axios from 'axios';

// Use production backend URL if configured in environment, otherwise default to relative /api
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

export const api = {
  getHealth: async () => {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },
  
  getIncidents: async (status = '', severity = '') => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (severity && severity !== 'All') params.append('severity', severity);
    const res = await axios.get(`${API_BASE}/incidents?${params.toString()}`);
    return res.data;
  },

  getIncidentById: async (id) => {
    const res = await axios.get(`${API_BASE}/incidents/${id}`);
    return res.data;
  },

  createIncident: async (payload) => {
    const res = await axios.post(`${API_BASE}/incidents`, payload);
    return res.data;
  },

  reanalyzeIncident: async (id, memoryEnabled = true) => {
    const res = await axios.post(`${API_BASE}/incidents/${id}/analyze?memory_enabled=${memoryEnabled}`);
    return res.data;
  },

  resolveIncident: async (id, payload) => {
    const res = await axios.post(`${API_BASE}/incidents/${id}/resolve`, payload);
    return res.data;
  },

  searchMemory: async (query) => {
    const res = await axios.post(`${API_BASE}/memory/search`, { query });
    return res.data;
  },

  getMemoryActivity: async () => {
    const res = await axios.get(`${API_BASE}/memory/activity`);
    return res.data;
  },

  getAnalytics: async () => {
    const res = await axios.get(`${API_BASE}/analytics`);
    return res.data;
  },

  runDemo: async (scenario = "Suspicious authentication activity") => {
    const res = await axios.post(`${API_BASE}/demo/run`, { scenario });
    return res.data;
  }
};
