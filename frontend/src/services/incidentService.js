import api from './api';

export const incidentService = {
  // Incidents
  async createIncident(data) {
    const response = await api.post('/api/incidents', data);
    return response.data;
  },

  async getMyIncidents() {
    const response = await api.get('/api/incidents/my');
    return response.data;
  },

  async getAssignedIncidents() {
    const response = await api.get('/api/incidents/assigned');
    return response.data;
  },

  async getAllIncidents() {
    const response = await api.get('/api/incidents');
    return response.data;
  },

  async getIncidentById(id) {
    const response = await api.get(`/api/incidents/${id}`);
    return response.data;
  },

  async updateStatus(id, status, note = '') {
    const response = await api.put(`/api/incidents/${id}/status`, {
      status,
      note,
    });
    return response.data;
  },

  async assignIncident(id, technicianId) {
    const response = await api.put(`/api/incidents/${id}/assign/${technicianId}`);
    return response.data;
  },

  // Notes & History (Sections 20 & 21)
  async addComment(id, content) {
    const response = await api.post(`/api/incidents/${id}/comments`, { content });
    return response.data;
  },

  async getComments(id) {
    const response = await api.get(`/api/incidents/${id}/comments`);
    return response.data;
  },

  async getHistory(id) {
    const response = await api.get(`/api/incidents/${id}/history`);
    return response.data;
  },

  async getDashboardStats() {
    const response = await api.get('/api/incidents/stats');
    return response.data;
  },

  // Profile (Section 22)
  async getProfile() {
    const response = await api.get('/api/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/api/profile', data);
    return response.data;
  },

  async changePassword(data) {
    const response = await api.put('/api/profile/password', data);
    return response.data;
  },

  // Admin Management (Section 10.3)
  async getAllUsers() {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  async getTechnicians() {
    const response = await api.get('/api/admin/technicians');
    return response.data;
  },

  async enableUser(id) {
    const response = await api.put(`/api/admin/users/${id}/enable`);
    return response.data;
  },

  async disableUser(id) {
    const response = await api.put(`/api/admin/users/${id}/disable`);
    return response.data;
  },

  async getAdminStatistics() {
    const response = await api.get('/api/admin/statistics');
    return response.data;
  },
};

export default incidentService;
