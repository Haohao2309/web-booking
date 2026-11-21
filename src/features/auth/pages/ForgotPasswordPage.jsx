import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../../api/authApi'
import { errorCode, errorMessage } from '../../../api/axiosClient'
import { validateNewPassword } from '../../../utils/validators'

// The backend issues at most one new code per 60 seconds and always answers forgot-password
// with the same message, whether or not the email is registered.
const RESEND_SECONDS = 60
const SENT_MESSAGE = 'Nếu email đã đăng ký, mã xác nhận 6 số sẽ được gửi trong ít phút. Mã có hiệu lực 10 phút.'
const STEP_HINTS = {
  1: 'Nhập email đã đăng ký để nhận mã xác nhận 6 số.',
  2: 'Nhập mã 6 số trong email. Chỉ mã mới nhất còn hiệu lực.',
  3: 'Tạo mật khẩu mới cho tài khoản của bạn.',
}
const SUBMIT_LABELS = { 1: 'Gửi mã xác nhận', 2: 'Xác nhận mã', 3: 'Đổi mật khẩu' }

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [resendAt, setResendAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  const waitSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000))
  useEffect(() => {
    if (resendAt <= Date.now()) return undefined
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [resendAt])

  async function sendCode() {
    await authApi.forgotPassword({ email: email.trim() })
    const at = Date.now()
    setNow(at)
    setResendAt(at + RESEND_SECONDS * 1000)
    setCode('')
    setMessage(SENT_MESSAGE)
  }

  // A code that expired, was used, or was locked cannot be retried: go back and ask for a new one.
  function codeRejected() {
    setCode('')
    setStep(2)
    setError('Mã xác nhận không đúng, đã hết hạn hoặc đã bị khóa. Kiểm tra lại hoặc bấm "Gửi lại mã".')
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (step === 3) {
      const issue = validateNewPassword(password, confirm)
      if (issue) { setError(issue); return }
    }
    setBusy(true)
    try {
      if (step === 1) {
        await sendCode()
        setStep(2)
      } else if (step === 2) {
        await authApi.verifyResetCode({ email: email.trim(), code })
        setMessage('')
        setStep(3)
      } else {
        await authApi.resetPassword({ email: email.trim(), code, newPassword: password, confirmPassword: confirm })
        navigate('/login', { replace: true, state: { message: 'Đổi mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.' } })
      }
    } catch (e) {
      if (step > 1 && errorCode(e) === 'INVALID_RESET_CODE') codeRejected()
      else setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setError('')
    setBusy(true)
    try { await sendCode() } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }

  function changeEmail() {
    setStep(1); setCode(''); setMessage(''); setError('')
  }

  return <section className="auth panel auth-reset">
    <p className="eyebrow">KHÔI PHỤC TÀI KHOẢN · BƯỚC {step}/3</p>
    <h1>Quên mật khẩu</h1>
    <p>{STEP_HINTS[step]}</p>
    {message && <p className="notice" role="status">{message}</p>}
    <form onSubmit={submit}>
      {step === 1 && <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></label>}
      {step === 2 && <>
        <label>Mã xác nhận<input inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} required autoComplete="one-time-code" /></label>
        <button type="button" className="secondary" disabled={busy || waitSeconds > 0} onClick={resend}>{waitSeconds > 0 ? `Gửi lại mã sau ${waitSeconds} giây` : 'Gửi lại mã'}</button>
        <button type="button" className="secondary" disabled={busy} onClick={changeEmail}>Đổi email</button>
      </>}
      {step === 3 && <>
        <label>Mật khẩu mới<input type="password" minLength="8" maxLength="72" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" /></label>
        <label>Xác nhận mật khẩu<input type="password" minLength="8" maxLength="72" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" /></label>
      </>}
      {error && <p className="error" role="alert">{error}</p>}
      <button disabled={busy}>{busy ? 'Đang xử lý…' : SUBMIT_LABELS[step]}</button>
    </form>
    <p><Link to="/login">Quay lại đăng nhập</Link></p>
  </section>
}
