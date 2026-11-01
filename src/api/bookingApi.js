import api from './axiosClient'
export const bookingApi = {
  list: (staff, signal) => api.get(staff ? '/bookings' : '/bookings/me', { signal }),
  get: (id, signal) => api.get(`/bookings/${encodeURIComponent(id)}`, { signal }),
  create: (data) => api.post('/bookings', data),
  transition: (id, action) => api.post(`/bookings/${encodeURIComponent(id)}/${action}`),
}
