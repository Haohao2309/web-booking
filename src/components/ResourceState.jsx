export default function ResourceState({ loading, error, reload }) {
  if (loading) return <p role="status">Đang tải dữ liệu…</p>
  if (error) return <div role="alert" className="notice error">{error} <button onClick={reload}>Thử lại</button></div>
  return null
}
