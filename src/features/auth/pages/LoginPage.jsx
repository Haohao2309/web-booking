import { Link } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
export default function LoginPage() { return <section className="auth panel"><p className="eyebrow">CHÀO MỪNG TRỞ LẠI</p><h1>Đăng nhập</h1><LoginForm /><p>Chưa có tài khoản? <Link to="/register">Đăng ký khách hàng</Link></p></section> }
