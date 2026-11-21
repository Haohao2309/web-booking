import { STAFF_ROLES } from './index.js'

// Menu entries and who may see them. `ready: false` marks a planned feature: the link opens an
// "Đang phát triển" page instead of a 404, so the menu shows the roadmap without faking a feature.
// Roles here only shape the UI; the backend still checks every permission.
//   roles: undefined → everyone, 'SIGNED_IN' → any logged-in account, array → those roles only.
const SIGNED_IN = 'SIGNED_IN'

export const MAIN_MENU = [
  { to: '/', label: 'Phòng', end: true, ready: true },
  { to: '/services', label: 'Dịch vụ', ready: false, description: 'Xem dịch vụ đi kèm của từng khách sạn (ăn sáng, đưa đón…) và thêm vào đơn đặt phòng.' },
  { to: '/suggestions', label: 'Điểm đến gần', ready: false, description: 'Gợi ý địa điểm ăn uống, tham quan quanh khách sạn.' },
  { to: '/bookings', label: 'Đặt phòng của tôi', roles: ['CUSTOMER'], ready: true },
  { to: '/reception', label: 'Lễ tân', roles: STAFF_ROLES, ready: true },
]

export const ADMIN_MENU = [
  { to: '/admin/rooms', label: 'Phòng', roles: ['ADMIN'], ready: true },
  { to: '/admin/hotels', label: 'Khách sạn', roles: ['ADMIN'], ready: false, description: 'Tạo và sửa khách sạn: địa chỉ, giờ nhận/trả phòng, múi giờ và chính sách hủy.' },
  { to: '/admin/room-types', label: 'Loại phòng & giá', roles: ['ADMIN'], ready: false, description: 'Quản lý loại phòng, sức chứa và giá cơ bản dùng để tính tiền đơn đặt phòng.' },
  { to: '/admin/accounts', label: 'Tài khoản & phân quyền', roles: ['ADMIN'], ready: false, description: 'Tìm tài khoản, khóa/mở khóa và gán vai trò.' },
  { to: '/admin/partners', label: 'Đối tác', roles: ['ADMIN'], ready: false, description: 'Quản lý đối tác và liên kết đối tác với phòng.' },
  { to: '/admin/payment-reviews', label: 'Đối soát thanh toán', roles: ['ADMIN'], ready: false, description: 'Xem khoản tiền đến muộn hoặc trùng và quyết định hoàn tiền.' },
]

export const ACCOUNT_MENU = [
  { to: '/account', label: 'Tài khoản của tôi', roles: SIGNED_IN, ready: false, description: 'Sửa họ tên, số điện thoại và đổi mật khẩu.' },
]

export function canSee(item, role) {
  if (!item.roles) return true
  if (item.roles === SIGNED_IN) return Boolean(role)
  return item.roles.includes(role)
}

export function menuFor(role) {
  const visible = (items) => items.filter((item) => canSee(item, role))
  return { main: visible(MAIN_MENU), admin: visible(ADMIN_MENU), account: visible(ACCOUNT_MENU) }
}

/**
 * Planned entries with how their route is guarded:
 * access 'public' → no guard, 'signed-in' → PrivateRoute without roles, array → PrivateRoute roles.
 */
export function plannedRoutes() {
  return [...MAIN_MENU, ...ADMIN_MENU, ...ACCOUNT_MENU]
    .filter((item) => !item.ready)
    .map((item) => ({ ...item, access: item.roles === SIGNED_IN ? 'signed-in' : item.roles || 'public' }))
}
