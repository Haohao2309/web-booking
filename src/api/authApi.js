import api from './axiosClient'
export const authApi = {
  me: async () => (await api.get('/auth/me')).data,
  login: async (data) => (await api.post('/auth/login', data)).data,
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyResetCode: (data) => api.post('/auth/verify-reset-code', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}
