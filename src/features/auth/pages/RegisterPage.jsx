import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../../../api/authApi'
import { errorMessage } from '../../../api/axiosClient'
export default function RegisterPage() {
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm()
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  async function submit({ email, password }) {
    setMessage('')
    try { await authApi.register({ email: email.trim(), password }); setDone(true) } catch (e) { setMessage(errorMessage(e)) }
  }
  return <section className="auth panel"><p className="eyebrow">BẮT ĐẦU HÀNH TRÌNH</p><h1>Đăng ký khách hàng</h1>{done ? <p role="status">Đăng ký thành công. <Link to="/login">Đăng nhập ngay</Link></p> : <form onSubmit={handleSubmit(submit)}><label>Email<input type="email" autoComplete="email" placeholder="you@example.com" {...register('email', { required: 'Nhập email.' })} /></label><label>Mật khẩu<input type="password" autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" {...register('password', { required: 'Nhập mật khẩu.', minLength: { value: 8, message: 'Mật khẩu tối thiểu 8 ký tự.' } })} /></label><label>Nhập lại mật khẩu<input type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu" {...register('confirm', { required: 'Nhập lại mật khẩu.', validate: (v) => v === getValues('password') || 'Mật khẩu không khớp.' })} /></label>{Object.entries(errors).map(([k, v]) => <p role="alert" key={k}>{v.message}</p>)}{message && <p role="alert" className="error">{message}</p>}<button disabled={isSubmitting}>{isSubmitting ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}</button></form>}<p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p></section>
}
