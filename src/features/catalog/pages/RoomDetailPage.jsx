import { useCallback, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { catalogApi } from '../../../api/catalogApi'
import { useResource } from '../../../hooks/useResource'
import ResourceState from '../../../components/ResourceState'
import { formatMoney, today } from '../../../utils/formatDate'
import { validateStay } from '../../../utils/validators'
import { nightsBetween, readSearch, searchQuery } from '../../../utils/stay'

function Gallery({ room }) {
  const [main, ...rest] = room.images || []
  return <div className="gallery">
    {main ? <img className="gallery-main" src={main} alt={`Ảnh ${room.name}`} /> : <div className="gallery-main photo-placeholder">Ảnh phòng</div>}
    <div className="gallery-side">
      {[0, 1].map((i) => rest[i]
        ? <img key={i} src={rest[i]} alt={`Ảnh ${room.name} ${i + 2}`} />
        : <div key={i} className="photo-placeholder">Ảnh phòng</div>)}
    </div>
  </div>
}

// Shows a few entries of a hotel list with a link to the full, paginated page.
function HotelList({ title, hotelId, load, to, render }) {
  const loader = useCallback((signal) => load({ hotelId, size: 6 }, signal), [hotelId, load])
  const resource = useResource(loader)
  if (resource.data && resource.data.items.length === 0) return null
  return <section className="panel detail-section">
    <div className="section-heading"><h2>{title}</h2>{resource.data?.totalItems > 6 && <Link to={`${to}?hotelId=${hotelId}`}>Xem tất cả →</Link>}</div>
    <ResourceState {...resource} />
    <div className="mini-grid">{resource.data?.items.map(render)}</div>
  </section>
}

function StayCard({ room, criteria }) {
  const [stay, setStay] = useState({ checkIn: criteria.checkIn || '', checkOut: criteria.checkOut || '', guests: criteria.guests || '1' })
  const nights = nightsBetween(stay.checkIn, stay.checkOut)
  const issue = stay.checkIn || stay.checkOut ? validateStay(stay.checkIn, stay.checkOut, stay.guests) : 'Chọn ngày nhận và trả phòng.'
  const overCapacity = Number(stay.guests) > room.capacity
  const field = (key) => ({ value: stay[key], onChange: (e) => setStay({ ...stay, [key]: e.target.value }) })
  return <aside className="panel stay-card">
    <h2>Chọn ngày lưu trú</h2>
    <label>Ngày nhận<input type="date" min={today()} {...field('checkIn')} /></label>
    <label>Ngày trả<input type="date" min={stay.checkIn || today()} {...field('checkOut')} /></label>
    <label>Số khách<input type="number" min="1" max="100" {...field('guests')} /></label>
    {stay.checkIn && stay.checkOut && issue && <p className="error" role="alert">{issue}</p>}
    {overCapacity && <p className="error" role="alert">Vượt sức chứa {room.capacity} khách của phòng này.</p>}
    {nights > 0 && !issue && <p className="price-line"><span>{nights} đêm × {formatMoney(room.price)}</span><strong>{formatMoney(room.price * nights)}</strong></p>}
    <button type="button" disabled title="Chức năng đặt phòng đang phát triển">Đặt phòng (sắp có)</button>
    {nights > 0 && !issue && <Link className="link-small" to={`/rooms${searchQuery({ checkIn: stay.checkIn, checkOut: stay.checkOut, guests: stay.guests, hotelId: room.hotelId })}`}>Xem phòng còn trống cho ngày này →</Link>}
    <p className="hint">Tạm tính theo giá hiện tại, chưa thu tiền. Server kiểm tra lại phòng trống và giá khi đặt.</p>
  </aside>
}

export default function RoomDetailPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const criteria = readSearch(params)
  const loader = useCallback((signal) => catalogApi.room(id, signal), [id])
  const resource = useResource(loader)
  const room = resource.data
  return <section className="page">
    <p className="breadcrumb"><Link to="/">Trang chủ</Link> → <Link to={`/rooms${searchQuery(criteria)}`}>Tìm phòng</Link> → <span>Chi tiết</span></p>
    <ResourceState {...resource} />
    {room && <>
      <h1 className="page-title">{room.name}</h1>
      <p className="page-lead">{room.type} · Tối đa {room.capacity} khách · {formatMoney(room.price)} / đêm</p>
      <Gallery room={room} />
      <div className="detail-layout">
        <div className="stack">
          <section className="panel detail-section">
            <h2>Tiện ích</h2>
            {room.amenities?.length
              ? <ul className="amenities">{room.amenities.map((a) => <li key={a.id}>✓ {a.name}</li>)}</ul>
              : <p className="hint">Khách sạn chưa cập nhật tiện ích cho loại phòng này.</p>}
          </section>
          {room.hotelId && <HotelList title="Dịch vụ kèm theo" hotelId={room.hotelId} load={catalogApi.services} to="/services"
            render={(s) => <article key={s.id} className="mini-card"><strong>{s.name}</strong><span>{formatMoney(s.unitPrice)} / {s.unit}</span></article>} />}
          {room.hotelId && <HotelList title="Điểm đến gần khách sạn" hotelId={room.hotelId} load={catalogApi.suggestions} to="/suggestions"
            render={(s) => <article key={s.id} className="mini-card"><strong>{s.name}</strong><span>{s.category}{s.address ? ` · ${s.address}` : ''}</span></article>} />}
        </div>
        <StayCard room={room} criteria={criteria} />
      </div>
    </>}
  </section>
}
