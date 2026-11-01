import axios from 'axios'

export function createApiClient({ baseURL, onUnauthorized = () => {} }) {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use(async (config) => {
    if (!['get', 'head', 'options'].includes(config.method?.toLowerCase() || 'get')) {
      // Fetch a fresh token for the current session, including after login/logout.
      // Reading JSON also works when the API and frontend have different origins.
      const csrf = await client.get('/auth/csrf', { signal: config.signal })
      if (csrf.headerName !== 'X-CSRF-TOKEN' || typeof csrf.token !== 'string' || !csrf.token) {
        throw new Error('Backend trả về CSRF token không hợp lệ.')
      }
      config.headers.set(csrf.headerName, csrf.token)
    }
    return config
  })

  client.interceptors.response.use((response) => response.data, (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) onUnauthorized()
    return Promise.reject(error)
  })
  return client
}
