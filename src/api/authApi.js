import api from './axiosClient'
export const authApi = {
  me: async () => (await api.get('/auth/me')).data,
  login: async (data) => (await api.post('/auth/login', data)).data,
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
}
