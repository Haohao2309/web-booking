import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { roomApi } from '../../../api/roomApi'
import { bookingApi } from '../../../api/bookingApi'
import { errorMessage } from '../../../api/axiosClient'
import { useAuth } from '../../../hooks/useAuth'
import { useResource } from '../../../hooks/useResource'
import ResourceState from '../../../components/ResourceState'
import { validateStay } from '../../../utils/validators'
import { formatMoney, today } from '../../../utils/formatDate'
export default function RoomListPage() {
  const [filters, setFilters] = useState(null)
  const loader = useCallback((signal) => roomApi.list(filters || {}, signal), [filters])
  const resource = useResource(loader)
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)
  const navigate = useNavigate()
  function search(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const issue = validateStay(data.checkIn, data.checkOut, data.guests)
    setError(issue)
    if (!issue) setFilters({ ...data, guests: Number(data.guests) })
  }
  async function book(room) {
    if (!filters) { setError('Chọn ngày lưu trú và bấm Tìm phòng trống trước khi đặt.'); return }
    setBusy(room.id); setError('')
    try { const booking = await bookingApi.create({ roomId: room.id, ...filters }); navigate(`/bookings/${encodeURIComponent(booking.id)}`) }
    catch (e) { setError(errorMessage(e)); resource.reload() } finally { setBusy(null) }
  }
  return <><section className="hero"><p className="eyebrow">MỘT CHUYẾN ĐI, MỘT CHỐN NGHỈ</p><h1>Tìm căn phòng<br />cho kỳ nghỉ của bạn.</h1><p>Chọn ngày lưu trú để kiểm tra phòng trống và đặt phòng.</p></section><form className="search panel" onSubmit={search} onChange={() => setFilters(null)}><label>Nhận phòng<input name="checkIn" type="date" min={today()} required /></label><label>Trả phòng<input name="checkOut" type="date" min={today()} required /></label><label>Số khách<input name="guests" type="number" min="1" step="1" defaultValue="1" required /></label><button>Tìm phòng trống</button></form>{error && <p className="notice error" role="alert">{error}</p>}<div className="section-heading"><h2>{filters ? 'Phòng phù hợp với kỳ nghỉ' : 'Khám phá phòng'}</h2><span>Giá theo đêm · VND</span></div><ResourceState {...resource} /><div className="grid">{resource.data?.items?.map((room) => <article className="panel room" key={room.id}><div className="room-art" aria-hidden="true">ROOM {room.number || room.id}</div><div className="room-body"><p className="eyebrow">{room.type}</p><h3>{room.name}</h3><p>{room.description}</p><p>Tối đa {room.capacity} khách</p><strong>{formatMoney(room.pricePerNight)} / đêm</strong>{!user ? <Link className="button" to="/login">Đăng nhập để đặt</Link> : user.role === 'CUSTOMER' ? <button disabled={busy !== null || !filters || room.available === false} onClick={() => book(room)}>{busy === room.id ? 'Đang đặt…' : 'Đặt phòng'}</button> : <p>Đăng nhập tài khoản khách để đặt phòng.</p>}</div></article>)}</div>{resource.data?.items?.length === 0 && <p className="notice">Không có phòng phù hợp.</p>}</>
}
