import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { roomApi } from '../../../api/roomApi'
import { catalogApi } from '../../../api/catalogApi'
import { useResource } from '../../../hooks/useResource'
import ResourceState from '../../../components/ResourceState'
import { validateStay } from '../../../utils/validators'
import { formatMoney, today } from '../../../utils/formatDate'
import { searchQuery } from '../../../utils/stay'

// Home: the search form hands the stay over to /rooms; the featured list reads the public catalog
// (GET /api/v1/rooms). Booking starts from the room detail page.
export default function RoomListPage() {
  const [locations, setLocations] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const loader = useCallback((signal) => catalogApi.searchRooms({ page: 0, size: 8, sort: 'price,asc' }, signal), [])
  const resource = useResource(loader)
  // The backend has no /locations API yet: on failure the list stays empty and the section is hidden.
  useEffect(() => { roomApi.locations().then(data => setLocations(data.items || [])).catch(() => setLocations([])) }, [])
  function search(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const issue = validateStay(data.checkIn, data.checkOut, data.guests)
    setError(issue)
    if (!issue) navigate(`/rooms${searchQuery(data)}`)
  }
  return <>
    <section className="hero"><p className="eyebrow">TÌM NƠI LƯU TRÚ TIẾP THEO</p><h1>Đặt nơi nghỉ như ở nhà.</h1><p>Tìm kiếm chỗ nghỉ độc đáo, so sánh lựa chọn và đặt phòng an tâm.</p></section>
    <form className="search panel" onSubmit={search}>
      <label>Nhận phòng<input name="checkIn" type="date" min={today()} required /></label>
      <label>Trả phòng<input name="checkOut" type="date" min={today()} required /></label>
      <label>Số khách<input name="guests" type="number" min="1" defaultValue="1" required /></label>
      <button>Tìm phòng trống</button>
    </form>
    {error && <p className="notice error" role="alert">{error}</p>}
    {locations.length > 0 && <section className="home-section"><div className="section-heading"><div><h2>Địa điểm phổ biến</h2><p>Khám phá những nơi nghỉ được yêu thích hiện nay.</p></div></div><div className="destination-grid">{locations.map(location => <Link className="destination-card" key={location.id} to="/rooms"><span className="destination-image" /><strong>{location.name}</strong><small>{location.description || 'Khám phá và nghỉ ngơi'}</small></Link>)}</div></section>}
    <section className="home-section">
      <div className="section-heading"><div><h2>Những nơi nghỉ được yêu thích</h2><p>Những lựa chọn nổi bật cho chuyến đi tiếp theo.</p></div><Link to="/rooms">Xem tất cả phòng →</Link></div>
      <ResourceState {...resource} />
      <div className="grid">{resource.data?.items?.map(room => <article className="panel room" key={room.id}>
        <div className="room-art" aria-hidden="true">ẢNH</div>
        <div className="room-body">
          <p className="eyebrow">{room.type}</p>
          <h3>{room.name}</h3>
          <p>Tối đa {room.capacity} khách</p>
          <strong>{formatMoney(room.price)} / đêm</strong>
          <Link className="button" to={`/rooms/${room.id}`}>Xem chi tiết</Link>
        </div>
      </article>)}</div>
      {resource.data?.items?.length === 0 && <p className="notice">Chưa có phòng nào đang mở bán.</p>}
    </section>
  </>
}
