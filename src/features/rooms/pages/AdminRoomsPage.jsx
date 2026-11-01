import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { roomApi } from '../../../api/roomApi'
import { errorMessage } from '../../../api/axiosClient'
import { useResource } from '../../../hooks/useResource'
import ResourceState from '../../../components/ResourceState'
import { formatMoney } from '../../../utils/formatDate'
const loadRooms = (signal) => roomApi.list({ includeInactive: true }, signal)
const defaults = { name: '', number: '', type: '', description: '', capacity: 1, pricePerNight: 0, active: true }
export default function AdminRoomsPage() {
  const resource = useResource(loadRooms)
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: defaults })
  function edit(room) { setEditing(room.id); reset({ ...defaults, ...room }); setMessage('') }
  function clear() { setEditing(null); reset(defaults) }
  async function submit(values) {
    setMessage('')
    const { name, number, type, description, capacity, pricePerNight, active } = values
    const data = { name: name.trim(), number: number.trim(), type: type.trim(), description: description.trim(), capacity, pricePerNight, active }
    try { if (editing !== null) await roomApi.update(editing, data); else await roomApi.create(data); clear(); resource.reload(); setMessage('Đã lưu phòng.') } catch (e) { setMessage(errorMessage(e)) }
  }
  return <><p className="eyebrow">QUẢN TRỊ</p><h1>Quản lý phòng</h1><div className="admin-layout"><section><ResourceState {...resource} /><div className="stack">{resource.data?.items?.map((room) => <article className="panel" key={room.id}><span className="badge">{room.active ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}</span><h3>{room.number} · {room.name}</h3><p>{room.capacity} khách · {formatMoney(room.pricePerNight)} / đêm</p><button disabled={isSubmitting} onClick={() => edit(room)}>Chỉnh sửa</button></article>)}</div>{resource.data?.items?.length === 0 && <p>Chưa có phòng. Thêm phòng đầu tiên.</p>}</section><form className="panel" onSubmit={handleSubmit(submit)}><h2>{editing !== null ? 'Chỉnh sửa phòng' : 'Thêm phòng'}</h2>{[['name', 'Tên phòng'], ['number', 'Số phòng'], ['type', 'Loại phòng']].map(([key, label]) => <label key={key}>{label}<input {...register(key, { required: `${label} là bắt buộc.`, validate: (v) => !!v.trim() || `${label} là bắt buộc.` })} /></label>)}<label>Mô tả<textarea {...register('description')} /></label><label>Sức chứa<input type="number" min="1" step="1" {...register('capacity', { valueAsNumber: true, required: 'Nhập sức chứa.', min: { value: 1, message: 'Sức chứa tối thiểu 1.' }, validate: (v) => Number.isInteger(v) || 'Sức chứa phải là số nguyên.' })} /></label><label>Giá mỗi đêm (VND)<input type="number" min="0" step="1000" {...register('pricePerNight', { valueAsNumber: true, required: 'Nhập giá phòng.', min: { value: 0, message: 'Giá không được âm.' }, validate: (v) => Number.isFinite(v) || 'Giá không hợp lệ.' })} /></label><label className="checkbox"><input type="checkbox" {...register('active')} />Đang kinh doanh</label>{Object.entries(errors).map(([k, v]) => <p role="alert" key={k}>{v.message}</p>)}<div className="toolbar"><button disabled={isSubmitting}>Lưu phòng</button>{editing !== null && <button disabled={isSubmitting} type="button" className="secondary" onClick={clear}>Bỏ chỉnh sửa</button>}</div>{message && <p role="status">{message}</p>}</form></div></>
}
