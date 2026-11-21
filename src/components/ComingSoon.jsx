import { Link } from 'react-router-dom'

// Shown for menu entries whose screen is not built yet; nothing here calls the API.
export default function ComingSoon({ item }) {
  return <section className="panel coming-soon">
    <p className="eyebrow">ĐANG PHÁT TRIỂN</p>
    <h1>{item.label}</h1>
    <p>{item.description}</p>
    <p className="notice">Chức năng này đã có trong kế hoạch nhưng chưa có màn hình. Khi hoàn thành sẽ dùng được ngay tại đây.</p>
    <Link className="button" to="/">Về trang chủ</Link>
  </section>
}
