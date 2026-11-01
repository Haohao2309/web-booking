import { Link } from 'react-router-dom'
import { STATUS_LABELS } from '../../../constants'
import { formatDate, formatMoney } from '../../../utils/formatDate'
export default function BookingCard({ booking }) { return <article className="panel"><span className="badge">{STATUS_LABELS[booking.status] || booking.status}</span><h3>{booking.room?.name || `Đặt phòng #${booking.id}`}</h3><p>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</p><p>{booking.guests} khách · {formatMoney(booking.totalPrice)}</p><Link to={`/bookings/${encodeURIComponent(booking.id)}`}>Xem chi tiết →</Link></article> }
