import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useAuth } from '../../hooks/useAuth'
export default function MainLayout() {
  const { sessionError } = useAuth()
  return <><Header /><main id="main">{sessionError && <p className="notice" role="status">{sessionError}</p>}<Outlet /></main><Footer /></>
}
