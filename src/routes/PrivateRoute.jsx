import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
export default function PrivateRoute({ roles }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <p role="status">Đang xác minh phiên…</p>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/forbidden" replace />
  return <Outlet />
}
