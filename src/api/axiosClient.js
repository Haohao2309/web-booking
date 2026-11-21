import { createApiClient } from './createApiClient'

const axiosClient = createApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  onUnauthorized: () => window.dispatchEvent(new Event('auth:expired')),
});

export { errorMessage, errorCode } from './errorMessage'

export default axiosClient;
