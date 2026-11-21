import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountApi } from '../../../api/accountApi'
import { errorMessage } from '../../../api/axiosClient'
import { useAuth } from '../../../hooks/useAuth'
import { useResource } from '../../../hooks/useResource'
import ResourceState from '../../../components/ResourceState'
import { ROLE_LABELS } from '../../../constants'
import { validateNewPassword } from '../../../utils/validators'

const PHONE = /^\+?[0-9]{8,15}$/

function ProfileForm({ profile, onSaved }) {
  const [fullName, setFullName] = useState(profile.fullName || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setError(''); setMessage('')
    const name = fullName.trim()
    const number = phone.trim()
    if (!name) { setError('Nhập họ và tên.'); return }
    if (number && !PHONE.test(number)) { setError('Số điện thoại gồm 8–15 chữ số, có thể bắt đầu bằng +.'); return }
    setBusy(true)
    // An empty phone field means "remove my phone number": the API clears it on null.
    try { onSaved(await accountApi.update({ fullName: name, phone: number || null })); setMessage('Đã lưu thông tin.') }
    catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  return <form className="panel account-card" onSubmit={submit}>
    <h2>Thông tin cá nhân</h2>
    <label>Họ và tên *<input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength="150" required autoComplete="name" /></label>
    <label>Email<input value={profile.email} disabled /></label>
    <p className="hint">Email dùng để đăng nhập, chưa đổi được tại đây.</p>
    <label>Số điện thoại<input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="0901234567" autoComplete="tel" /></label>
    <p className="hint">Để trống để xóa số điện thoại.</p>
    <p className="account-meta"><span className="badge">{ROLE_LABELS[profile.role] || profile.role}</span><span className="badge">{profile.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}</span></p>
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="notice" role="status">{message}</p>}
    <button disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
  </form>
}

function PasswordForm({ onChanged }) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const field = (key) => ({ value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) })
  async function submit(event) {
    event.preventDefault()
    setError('')
    const issue = validateNewPassword(form.newPassword, form.confirmNewPassword)
    if (issue) { setError(issue); return }
    setBusy(true)
    try { await accountApi.changePassword(form); onChanged() } catch (e) { setError(errorMessage(e)); setBusy(false) }
  }
  return <form className="panel account-card" onSubmit={submit}>
    <h2>Đổi mật khẩu</h2>
    <label>Mật khẩu hiện tại *<input type="password" {...field('oldPassword')} required autoComplete="current-password" /></label>
    <label>Mật khẩu mới *<input type="password" {...field('newPassword')} minLength="8" maxLength="72" required autoComplete="new-password" /></label>
    <label>Nhập lại mật khẩu mới *<input type="password" {...field('confirmNewPassword')} minLength="8" maxLength="72" required autoComplete="new-password" /></label>
    <p className="hint">Sau khi đổi, mọi phiên đăng nhập (kể cả phiên này) sẽ kết thúc và bạn cần đăng nhập lại.</p>
    {error && <p className="error" role="alert">{error}</p>}
    <button disabled={busy}>{busy ? 'Đang đổi…' : 'Đổi mật khẩu'}</button>
  </form>
}

export default function AccountPage() {
  const { updateUser, endSession } = useAuth()
  const navigate = useNavigate()
  const loader = useCallback((signal) => accountApi.me(signal), [])
  const resource = useResource(loader)
  // The backend has already ended the session. Drop it locally only once this page has unmounted:
  // clearing it earlier lets the /account guard redirect to /login first, losing the message.
  const signedOut = useRef(false)
  useEffect(() => () => { if (signedOut.current) endSession() }, [endSession])
  function passwordChanged() {
    signedOut.current = true
    navigate('/login', { replace: true, state: { message: 'Đổi mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.' } })
  }
  return <section className="page">
    <h1 className="page-title">Tài khoản của tôi</h1>
    <p className="page-lead">Cập nhật thông tin liên hệ và mật khẩu đăng nhập.</p>
    <ResourceState {...resource} />
    {resource.data && <div className="account-grid">
      <ProfileForm key={resource.data.id} profile={resource.data} onSaved={updateUser} />
      <PasswordForm onChanged={passwordChanged} />
    </div>}
  </section>
}
