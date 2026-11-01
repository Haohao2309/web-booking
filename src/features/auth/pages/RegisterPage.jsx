import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../../../api/authApi'
import { errorMessage } from '../../../api/axiosClient'
export default function RegisterPage() {
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm()
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  async function submit({ name, email, password }) {
    setMessage('')
    try { await authApi.register({ name: name.trim(), email: email.trim(), password }); setDone(true) } catch (e) { setMessage(errorMessage(e)) }
  }
  return <section className="auth panel"><h1>Đăng ký khách hàng</h1>{done ? <p role="status">Đăng ký thành công. <Link to="/login">Đăng nhập</Link></p> : <form onSubmit={handleSubmit(submit)}><label>Họ tên<input autoComplete="name" {...register('name', { required: 'Nhập họ tên.', validate: (v) => !!v.trim() || 'Nhập họ tên.' })} /></label><label>Email<input type="email" autoComplete="email" {...register('email', { required: 'Nhập email.' })} /></label><label>Mật khẩu<input type="password" autoComplete="new-password" {...register('password', { required: 'Nhập mật khẩu.', minLength: { value: 8, message: 'Mật khẩu tối thiểu 8 ký tự.' } })} /></label><label>Nhập lại mật khẩu<input type="password" autoComplete="new-password" {...register('confirm', { validate: (v) => v === getValues('password') || 'Mật khẩu không khớp.' })} /></label>{Object.entries(errors).map(([k, v]) => <p role="alert" key={k}>{v.message}</p>)}{message && <p role="alert">{message}</p>}<button disabled={isSubmitting}>Tạo tài khoản</button></form>}<p><Link to="/login">Quay lại đăng nhập</Link></p></section>
}
