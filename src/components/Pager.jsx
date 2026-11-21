// Server pagination controls: page is 0-based like the API, shown to people as page + 1.
export default function Pager({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null
  return <nav className="pager" aria-label="Phân trang">
    <button type="button" className="secondary" disabled={page <= 0} onClick={() => onChange(page - 1)}>← Trước</button>
    <span>Trang {page + 1} / {totalPages}</span>
    <button type="button" className="secondary" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>Sau →</button>
  </nav>
}
