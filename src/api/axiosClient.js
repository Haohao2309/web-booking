import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use((response) => response.data, (error) => {
  if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) window.dispatchEvent(new Event('auth:expired'))
  return Promise.reject(error)
})
export function errorMessage(error) {
  if (error.response?.status === 401) return 'Phiên hết hạn hoặc thông tin đăng nhập không đúng.'
  if (error.response?.status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
  if (error.response?.status === 409) return 'Phòng hoặc đặt phòng đã thay đổi. Vui lòng tải lại.'
  return error.response ? (error.response.data?.message || 'Yêu cầu thất bại. Vui lòng thử lại.') : 'Không kết nối được API. Kiểm tra backend và cấu hình kết nối.'
}

export default axiosClient;
