import { useCallback, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { catalogApi } from '../../../api/catalogApi'
import { useResource } from '../../../hooks/useResource'
import Pager from '../../../components/Pager'
import { formatMoney, today } from '../../../utils/formatDate'
import { validateStay } from '../../../utils/validators'
import { nightsBetween, readSearch, searchQuery, stayQuery } from '../../../utils/stay'

const SORTS = [
  { value: 'price,asc', label: 'Giá tăng dần' },
  { value: 'price,desc', label: 'Giá giảm dần' },
  { value: 'name,asc', label: 'Tên A → Z' },
]
const PAGE_SIZE = 10

function pageOf(criteria) {
  return Math.max(0, Number.parseInt(criteria.page || '0', 10) || 0)
}

function sortOf(criteria) {
  return SORTS.some((s) => s.value === criteria.sort) ? criteria.sort : 'price,asc'
}

// Filters live in the URL, so results can be reloaded or shared. Filtering, counting and paging
// all happen on the server (GET /api/v1/rooms); this page never filters the current page itself.
export default function SearchRoomsPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [formError, setFormError] = useState('')
  const criteria = readSearch(params)
  const sort = sortOf(criteria)
  const nights = nightsBetween(criteria.checkIn, criteria.checkOut)
  // The query string is the only input of the request, so it is the only dependency.
  const key = params.toString()
  const loader = useCallback((signal) => {
    const query = readSearch(new URLSearchParams(key))
    return catalogApi.searchRooms({ ...query, sort: sortOf(query), page: pageOf(query), size: PAGE_SIZE }, signal)
  }, [key])
  const resource = useResource(loader)
  const result = resource.data

  function apply(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    // Dates are optional (browse the catalog) but must be valid together when given.
    let issue = data.checkIn || data.checkOut ? validateStay(data.checkIn, data.checkOut, data.guests || 1) : ''
    if (!issue && data.minPrice && data.maxPrice && Number(data.minPrice) > Number(data.maxPrice)) issue = 'Giá từ phải nhỏ hơn hoặc bằng giá đến.'
    setFormError(issue)
    if (!issue) navigate(`/rooms${searchQuery({ ...data, page: undefined })}`)
  }
  const go = (changes) => navigate(`/rooms${searchQuery({ ...criteria, ...changes })}`)

  const summary = [
    criteria.checkIn && criteria.checkOut ? `${criteria.checkIn} → ${criteria.checkOut} · ${nights} đêm` : 'Chưa chọn ngày',
    criteria.guests ? `${criteria.guests} khách` : null,
  ].filter(Boolean).join(' · ')

  return <section className="page">
    <h1 className="page-title">Tìm phòng{result ? ` / ${result.totalItems} phòng phù hợp` : ''}</h1>
    <p className="page-lead">{summary}. Phòng trống được kiểm tra cho toàn bộ kỳ lưu trú; giá và tồn được kiểm tra lại khi đặt.</p>
    <div className="results-layout">
      <form key={key} className="panel filter-card" onSubmit={apply}>
        <h2>Lọc kết quả</h2>
        <label>Ngày nhận<input name="checkIn" type="date" min={today()} defaultValue={criteria.checkIn} /></label>
        <label>Ngày trả<input name="checkOut" type="date" min={today()} defaultValue={criteria.checkOut} /></label>
        <label>Số khách<input name="guests" type="number" min="1" max="100" defaultValue={criteria.guests} placeholder="Bất kỳ" /></label>
        <div className="filter-row">
          <label>Giá từ<input name="minPrice" type="number" min="0" step="1000" defaultValue={criteria.minPrice} /></label>
          <label>đến<input name="maxPrice" type="number" min="0" step="1000" defaultValue={criteria.maxPrice} /></label>
        </div>
        <label>Sắp xếp<select name="sort" defaultValue={sort}>{SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
        {formError && <p className="error" role="alert">{formError}</p>}
        <button>Áp dụng</button>
        <Link className="button secondary" to="/rooms">Đặt lại tiêu chí</Link>
      </form>
      <div>
        {resource.loading && <div className="panel state-card" role="status"><h3>Đang kiểm tra phòng</h3><span className="skeleton" /><span className="skeleton short" /><p>Không hiển thị kết quả cũ như kết quả mới.</p></div>}
        {resource.error && <div className="panel state-card" role="alert"><h3>Chưa tải được</h3><p>{resource.error} Tiêu chí của bạn vẫn được giữ.</p><button type="button" className="secondary" onClick={resource.reload}>Thử tìm lại</button></div>}
        {result && result.items.length === 0 && <div className="panel state-card"><h3>Không có phòng phù hợp</h3><p>Không còn phòng trống cho toàn bộ kỳ lưu trú hoặc bộ lọc đã chọn.</p><Link className="button secondary" to="/rooms">Đổi ngày / bỏ bớt bộ lọc</Link></div>}
        {result && result.items.length > 0 && <>
          <p className="results-count">Hiển thị {result.items.length} / {result.totalItems} phòng</p>
          <div className="result-list">{result.items.map((room) => <article className="panel result-card" key={room.id}>
            <div className="photo-placeholder" aria-hidden="true">Ảnh phòng</div>
            <div className="result-body">
              <h3>{room.name}</h3>
              <p>{room.type} · Tối đa {room.capacity} khách</p>
            </div>
            <div className="result-price">
              <strong>{formatMoney(room.price)}</strong>
              <span>mỗi đêm</span>
              {nights > 0 && <span className="result-total">{formatMoney(room.price * nights)} / {nights} đêm (tạm tính)</span>}
              <Link className="button" to={`/rooms/${room.id}${stayQuery(criteria)}`}>Xem chi tiết →</Link>
            </div>
          </article>)}</div>
          <Pager page={result.page} totalPages={result.totalPages} onChange={(next) => go({ page: next })} />
        </>}
      </div>
    </div>
  </section>
}
