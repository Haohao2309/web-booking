import { createApiClient } from './createApiClient'

const axiosClient = createApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  onUnauthorized: () => window.dispatchEvent(new Event('auth:expired')),
});
export function errorMessage(error) {
  if (error.response?.status === 401) return 'Phiên hết hạn hoặc thông tin đăng nhập không đúng.'
  if (error.response?.status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
  if (error.response?.status === 409) return error.response.data?.message || 'Email đã được đăng ký. Vui lòng dùng email khác.'
  return error.response ? (error.response.data?.message || 'Yêu cầu thất bại. Vui lòng thử lại.') : 'Không kết nối được API. Kiểm tra backend và cấu hình kết nối.'
}

export default axiosClient;
