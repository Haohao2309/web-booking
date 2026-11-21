import { useEffect } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import MainLayout from '../components/layout/MainLayout'
import ComingSoon from '../components/ComingSoon'
import PrivateRoute from './PrivateRoute'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import RoomListPage from '../features/rooms/pages/RoomListPage'
import AdminRoomsPage from '../features/rooms/pages/AdminRoomsPage'
import BookingListPage from '../features/booking/pages/BookingListPage'
import BookingDetailPage from '../features/booking/pages/BookingDetailPage'
import { STAFF_ROLES } from '../constants'
import { plannedRoutes } from '../constants/navigation'

// Planned menu entries get a route guarded like the finished feature will be.
function plannedRoute(item) {
  const page = <Route key={item.to} path={item.to.slice(1)} element={<ComingSoon item={item} />} />
  if (item.access === 'public') return page
  return <Route key={item.to} element={<PrivateRoute roles={item.access === 'signed-in' ? undefined : item.access} />}>{page}</Route>
}

export default function AppRoutes() {
  const { initialize, ready } = useAuth()
  useEffect(() => { initialize() }, [initialize])
  if (!ready) return <main role="status">Đang khởi tạo phiên…</main>
  return <Routes>
    <Route element={<MainLayout />}>
      <Route index element={<RoomListPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<PrivateRoute roles={['CUSTOMER']} />}><Route path="bookings" element={<BookingListPage />} /></Route>
      <Route element={<PrivateRoute />}><Route path="bookings/:id" element={<BookingDetailPage />} /></Route>
      <Route element={<PrivateRoute roles={STAFF_ROLES} />}><Route path="reception" element={<BookingListPage staff />} /></Route>
      <Route element={<PrivateRoute roles={['ADMIN']} />}><Route path="admin/rooms" element={<AdminRoomsPage />} /></Route>
      {plannedRoutes().map(plannedRoute)}
      <Route path="forbidden" element={<section><h1>403 · Không đủ quyền</h1><Link to="/">Về trang chủ</Link></section>} />
      <Route path="*" element={<section><h1>404 · Không tìm thấy trang</h1><Link to="/">Về trang chủ</Link></section>} />
    </Route>
  </Routes>
}
