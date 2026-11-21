import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_LABELS } from '../../constants'
import { menuFor } from '../../constants/navigation'
import { errorMessage } from '../../api/axiosClient'

function MenuLink({ item }) {
  return <NavLink to={item.to} end={item.end}>
    {item.label}{!item.ready && <span className="soon">Sắp có</span>}
  </NavLink>
}

// <details> gives a keyboard-accessible dropdown without extra state; close it after a choice.
function MenuGroup({ label, items }) {
  if (!items.length) return null
  return <details className="nav-group" onClick={(e) => { if (e.target.closest('a')) e.currentTarget.removeAttribute('open') }}>
    <summary>{label}</summary>
    <div className="nav-group-items">{items.map((item) => <MenuLink key={item.to} item={item} />)}</div>
  </details>
}

// The system has no host sign-up, so guests get "Đăng nhập" and a customer "Đăng ký" instead of
// "Đăng chỗ ở". Which entries appear for which role is defined in constants/navigation.js.
export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function signOut() {
    setBusy(true); setError('')
    try { await logout(); navigate('/login') } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  const menu = menuFor(user?.role)
  return <header>
    <a className="skip" href="#main">Đến nội dung</a>
    <div className="nav">
      <Link className="brand" to="/">stayly</Link>
      <nav aria-label="Điều hướng chính">
        {menu.main.map((item) => <MenuLink key={item.to} item={item} />)}
        <MenuGroup label="Quản trị" items={menu.admin} />
      </nav>
      <div className="account">
        {user
          ? <>
            <MenuGroup label={`${user.name || user.email} · ${ROLE_LABELS[user.role]}`} items={menu.account} />
            <button className="header-login" onClick={signOut} disabled={busy}>Đăng xuất</button>
          </>
          : <><Link className="button header-login" to="/login">Đăng nhập</Link><Link className="button header-list" to="/register">Đăng ký</Link></>}
      </div>
    </div>
    {error && <p role="alert">{error}</p>}
  </header>
}
