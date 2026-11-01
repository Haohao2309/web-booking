import { useCallback, useState } from 'react'
import { bookingApi } from '../../../api/bookingApi'
import { useResource } from '../../../hooks/useResource'
import ResourceState from '../../../components/ResourceState'
import BookingCard from '../components/BookingCard'
import { STATUS_LABELS } from '../../../constants'
export default function BookingListPage({ staff = false }) {
  const loader = useCallback((signal) => bookingApi.list(staff, signal), [staff])
  const resource = useResource(loader)
  const [status, setStatus] = useState('')
  const items = resource.data?.items?.filter((b) => !status || b.status === status)
  return <><p className="eyebrow">{staff ? 'VẬN HÀNH LƯU TRÚ' : 'CHUYẾN ĐI CỦA BẠN'}</p><h1>{staff ? 'Quầy lễ tân' : 'Đặt phòng của tôi'}</h1><div className="toolbar"><label>Trạng thái<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Tất cả</option>{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label><button onClick={resource.reload}>Làm mới</button></div><ResourceState {...resource} /><div className="grid">{items?.map((booking) => <BookingCard key={booking.id} booking={booking} />)}</div>{items?.length === 0 && <p className="notice">Chưa có đặt phòng phù hợp.</p>}</>
}
