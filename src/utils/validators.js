import { today } from './formatDate.js'
// Same limits as the backend: 8–72 characters and at most 72 UTF-8 bytes (BCrypt limit).
export function validateNewPassword(password, confirm) {
  if (typeof password !== 'string' || password.length < 8) return 'Mật khẩu mới phải có ít nhất 8 ký tự.'
  if (password.length > 72 || new TextEncoder().encode(password).length > 72) return 'Mật khẩu mới quá dài (tối đa 72 byte; chữ có dấu tính nhiều byte hơn).'
  if (password !== confirm) return 'Mật khẩu xác nhận không khớp.'
  return ''
}
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
