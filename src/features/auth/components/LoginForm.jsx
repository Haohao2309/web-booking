import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { errorMessage } from '../../../api/axiosClient'
export default function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  async function submit(data) {
    setError('')
    try {
      const user = await login(data)
      const from = location.state?.from
      navigate(from?.startsWith('/') && !from.startsWith('//') ? from : user.role === 'CUSTOMER' ? '/' : '/reception', { replace: true })
    } catch (e) { setError(errorMessage(e)) }
  }
  return <form onSubmit={handleSubmit(submit)}><label>Email<input type="email" autoComplete="email" {...register('email', { required: 'Nhập email.' })} /></label><label>Mật khẩu<input type="password" autoComplete="current-password" {...register('password', { required: 'Nhập mật khẩu.' })} /></label>{Object.entries(errors).map(([key, value]) => <p role="alert" key={key}>{value.message}</p>)}{error && <p role="alert" className="error">{error}</p>}<button disabled={isSubmitting}>{isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}</button></form>
}
