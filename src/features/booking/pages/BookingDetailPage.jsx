import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bookingApi } from '../../../api/bookingApi'
import { errorMessage } from '../../../api/axiosClient'
import { useResource } from '../../../hooks/useResource'
import { useAuth } from '../../../hooks/useAuth'
import ResourceState from '../../../components/ResourceState'
import { STAFF_ROLES, STATUS_LABELS } from '../../../constants'
import { formatDate, formatMoney } from '../../../utils/formatDate'
export default function BookingDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const staff = STAFF_ROLES.includes(user.role)
  const loader = useCallback((signal) => bookingApi.get(id, signal), [id])
  const resource = useResource(loader)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const booking = resource.data
  async function action(value) {
    if (value === 'cancel' && !window.confirm('Bạn muốn hủy đặt phòng này?')) return
    setBusy(true); setMessage('')
    try { await bookingApi.transition(id, value); resource.reload(); setMessage('Cập nhật thành công.') } catch (e) { setMessage(errorMessage(e)); resource.reload() } finally { setBusy(false) }
  }
  return <><Link to={staff ? '/reception' : '/bookings'}>← Danh sách đặt phòng</Link><h1>Chi tiết đặt phòng</h1><ResourceState {...resource} />{booking && <article className="panel detail"><span className="badge">{STATUS_LABELS[booking.status]}</span><h2>{booking.room?.name || `Đặt phòng #${booking.id}`}</h2><p>Mã đặt phòng: {booking.id}</p><p>Nhận phòng: {formatDate(booking.checkIn)}</p><p>Trả phòng: {formatDate(booking.checkOut)}</p><p>Số khách: {booking.guests}</p>{staff && <p>Khách hàng: {booking.customer?.name} · {booking.customer?.email}</p>}<h3>Tổng tiền: {formatMoney(booking.totalPrice)}</h3><div className="toolbar">{staff && booking.status === 'PENDING' && <button disabled={busy} onClick={() => action('confirm')}>Xác nhận</button>}{staff && booking.status === 'CONFIRMED' && <button disabled={busy} onClick={() => action('check-in')}>Nhận phòng</button>}{staff && booking.status === 'CHECKED_IN' && <button disabled={busy} onClick={() => action('check-out')}>Trả phòng</button>}{['PENDING', 'CONFIRMED'].includes(booking.status) && <button className="secondary" disabled={busy} onClick={() => action('cancel')}>Hủy đặt phòng</button>}</div></article>}{message && <p role="status" className="notice">{message}</p>}</>
}
