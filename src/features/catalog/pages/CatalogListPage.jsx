import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { catalogApi } from '../../../api/catalogApi'
import { useResource } from '../../../hooks/useResource'
import ResourceState from '../../../components/ResourceState'
import Pager from '../../../components/Pager'
import { formatMoney } from '../../../utils/formatDate'

const PAGE_SIZE = 12

// One page for both public lists; they share paging and the optional ?hotelId= filter.
const KINDS = {
  services: {
    title: 'Dịch vụ',
    lead: 'Dịch vụ đi kèm của khách sạn. Có thể thêm vào đơn khi đặt phòng.',
    empty: 'Chưa có dịch vụ nào đang mở bán.',
    load: catalogApi.services,
    sort: 'name,asc',
    render: (s) => <article className="panel catalog-card" key={s.id}>
      {s.imageUrl ? <img src={s.imageUrl} alt={s.name} /> : <div className="photo-placeholder" aria-hidden="true">Dịch vụ</div>}
      <h3>{s.name}</h3>
      {s.description && <p>{s.description}</p>}
      <strong>{formatMoney(s.unitPrice)} / {s.unit}</strong>
    </article>,
  },
  suggestions: {
    title: 'Điểm đến gần',
    lead: 'Địa điểm ăn uống, tham quan quanh khách sạn.',
    empty: 'Chưa có địa điểm gợi ý nào.',
    load: catalogApi.suggestions,
    sort: 'category,asc',
    render: (s) => <article className="panel catalog-card" key={s.id}>
      {s.imageUrl ? <img src={s.imageUrl} alt={s.name} /> : <div className="photo-placeholder" aria-hidden="true">Địa điểm</div>}
      <span className="badge">{s.category}</span>
      <h3>{s.name}</h3>
      {s.description && <p>{s.description}</p>}
      {s.address && <p className="hint">{s.address}</p>}
    </article>,
  },
}

export default function CatalogListPage({ kind }) {
  const config = KINDS[kind]
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const page = Math.max(0, Number.parseInt(params.get('page') || '0', 10) || 0)
  const hotelId = params.get('hotelId') || undefined
  const loader = useCallback((signal) => config.load({ page, size: PAGE_SIZE, sort: config.sort, hotelId }, signal), [config, page, hotelId])
  const resource = useResource(loader)
  const go = (next) => navigate(`?${new URLSearchParams({ ...(hotelId ? { hotelId } : {}), page: String(next) })}`)
  return <section className="page">
    <h1 className="page-title">{config.title}</h1>
    <p className="page-lead">{config.lead}</p>
    <ResourceState {...resource} />
    {resource.data?.items.length === 0 && <p className="notice">{config.empty}</p>}
    <div className="catalog-grid">{resource.data?.items.map(config.render)}</div>
    {resource.data && <Pager page={resource.data.page} totalPages={resource.data.totalPages} onChange={go} />}
  </section>
}
