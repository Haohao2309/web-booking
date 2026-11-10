import { Link } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
export default function LoginPage() {
  return <section className="auth-shell" aria-labelledby="login-title">
    <div className="auth-visual"><div className="auth-visual-orb auth-visual-orb-one" /><div className="auth-visual-orb auth-visual-orb-two" /><div className="auth-visual-content"><p className="auth-logo">ROOM / STAY</p><p className="eyebrow auth-eyebrow">YOUR NEXT STAY STARTS HERE</p><h1>Đặt một nơi<br />để nhớ.</h1><p className="auth-visual-copy">Tìm kiếm những căn phòng phù hợp, đặt lịch nhanh chóng và quản lý chuyến đi của bạn ở một nơi.</p><div className="auth-trust"><span className="auth-trust-icon">✓</span><span><strong>Đặt phòng an tâm</strong><br />Thông tin của bạn luôn được bảo mật.</span></div></div></div>
    <div className="auth-card panel"><div className="auth-card-heading"><p className="eyebrow">CHÀO MỪNG TRỞ LẠI</p><h2 id="login-title">Đăng nhập</h2><p>Đăng nhập để tiếp tục hành trình của bạn.</p></div><LoginForm /><div className="auth-divider"><span>hoặc</span></div><p className="auth-register">Chưa có tài khoản? <Link to="/register">Đăng ký khách hàng</Link></p></div>
  </section>
}
