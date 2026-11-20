import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
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
  return <header><a className="skip" href="#main">Đến nội dung</a><div className="nav"><Link className="brand" to="/">stayly</Link><nav aria-label="Điều hướng chính"><NavLink to="/">Phòng</NavLink><a href="#experiences">Trải nghiệm</a><a href="#help">Trợ giúp</a>{user && <NavLink to="/bookings">Đặt phòng</NavLink>}</nav><div className="account">{user ? <><span>{user.email}</span><button onClick={signOut} disabled={busy}>Đăng xuất</button></> : <Link className="button header-login" to="/login">Đăng nhập</Link>}<Link className="button header-list" to={user?.role === 'ADMIN' ? '/admin/rooms' : '/register'}>Đăng chỗ ở</Link></div></div>{error && <p role="alert">{error}</p>}</header>
}
