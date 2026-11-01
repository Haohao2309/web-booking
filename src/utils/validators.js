import { today } from './formatDate.js'
export function validateStay(checkIn, checkOut, guests) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return 'Vui lòng chọn ngày nhận và trả phòng.'
  for (const value of [checkIn, checkOut]) {
    const parsed = new Date(`${value}T00:00:00Z`)
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return 'Ngày lưu trú không hợp lệ.'
  }
  if (checkIn < today()) return 'Ngày nhận phòng không được nằm trong quá khứ.'
  if (checkOut <= checkIn) return 'Ngày trả phòng phải sau ngày nhận phòng.'
  if (!Number.isInteger(Number(guests)) || Number(guests) < 1) return 'Số khách phải là số nguyên dương.'
  return ''
}
