import api from './axiosClient'

// Public catalog, no login needed. Backend contract: docs/API-CONTRACT.md section 9 (api-booking).
// Lists return the page object {items, page, size, totalItems, totalPages}.
export const catalogApi = {
  searchRooms: async (params, signal) => (await api.get('/v1/rooms', { params, signal })).data,
  room: async (id, signal) => (await api.get(`/v1/rooms/${encodeURIComponent(id)}`, { signal })).data,
  services: async (params, signal) => (await api.get('/v1/services', { params, signal })).data,
  suggestions: async (params, signal) => (await api.get('/v1/suggestions', { params, signal })).data,
}
