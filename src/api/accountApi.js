import api from './axiosClient'

// Backend contract: docs/API-CONTRACT.md section 8 (api-booking). The client unwraps HTTP,
// so each call returns the envelope; `.data` is the payload.
export const accountApi = {
  me: async (signal) => (await api.get('/v1/users/me', { signal })).data,
  update: async (data) => (await api.patch('/v1/users/me', data)).data,
  changePassword: (data) => api.put('/v1/users/me/password', data),
}
