import { create } from 'zustand'
import { authApi } from '../api/authApi'
import { ROLE_LABELS } from '../constants'
function validUser(user) {
  if (!user?.id || !Object.hasOwn(ROLE_LABELS, user.role)) throw new Error('Tài khoản hoặc vai trò API không hợp lệ.')
  return user
}
let initialization
export const useAuthStore = create((set) => ({
  user: null, ready: false, sessionError: '',
  initialize: () => {
    if (!initialization) initialization = authApi.me().then((user) => set({ user: validUser(user), sessionError: '' }))
      .catch((error) => set({ user: null, sessionError: error.response?.status === 401 ? '' : 'Không xác minh được phiên với backend.' }))
      .finally(() => set({ ready: true }))
    return initialization
  },
  login: async (data) => { const user = validUser(await authApi.login(data)); set({ user, sessionError: '' }); return user },
  logout: async () => { await authApi.logout(); set({ user: null }) },
  // After a profile edit: keep the header in sync with what the server saved.
  updateUser: (user) => set({ user: validUser(user) }),
  // After a password change the backend has already ended every session; drop it locally too.
  endSession: () => set({ user: null }),
}))
window.addEventListener('auth:expired', () => useAuthStore.setState({ user: null }))
