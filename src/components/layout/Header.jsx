import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_LABELS, STAFF_ROLES } from '../../constants'
import { errorMessage } from '../../api/axiosClient'
export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function signOut() {
    setBusy(true); setError('')
    try { await logout(); navigate('/login') } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  return <header><a className="skip" href="#main">Đến nội dung</a><div className="nav"><Link className="brand" to="/">ROOM / STAY</Link><nav aria-label="Điều hướng chính"><NavLink to="/" end>Tìm phòng</NavLink>{user?.role === 'CUSTOMER' && <NavLink to="/bookings">Đặt phòng của tôi</NavLink>}{STAFF_ROLES.includes(user?.role) && <NavLink to="/reception">Lễ tân</NavLink>}{user?.role === 'ADMIN' && <NavLink to="/admin/rooms">Quản lý phòng</NavLink>}</nav><div className="account">{user ? <><span>{user.name} · {ROLE_LABELS[user.role]}</span><button onClick={signOut} disabled={busy}>Đăng xuất</button></> : <Link className="button" to="/login">Đăng nhập</Link>}</div></div>{error && <p role="alert">{error}</p>}</header>
}
