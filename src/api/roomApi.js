import api from './axiosClient'
export const roomApi = {
  list: (params, signal) => api.get('/rooms', { params, signal }),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.patch(`/rooms/${encodeURIComponent(id)}`, data),
}
