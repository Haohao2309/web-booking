// Turns an Axios error into a message for the user. Kept free of browser globals so it is testable.
export function errorMessage(error) {
  const response = error?.response
  if (!response) return 'Không kết nối được API. Kiểm tra backend và cấu hình kết nối.'
  const body = response.data && typeof response.data === 'object' ? response.data : {}
  const code = body.data?.code
  if (response.status === 401) return 'Phiên hết hạn hoặc thông tin đăng nhập không đúng.'
  if (response.status === 403) {
    if (code === 'ACCOUNT_LOCKED') return body.message || 'Tài khoản đã bị khóa.'
    return 'Bạn không có quyền thực hiện thao tác này hoặc phiên đã thay đổi. Hãy tải lại trang và thử lại.'
  }
  if (response.status === 404) return body.message || 'Không tìm thấy dữ liệu.'
  if (response.status === 409) return body.message || 'Dữ liệu đã tồn tại hoặc vừa thay đổi. Vui lòng thử lại.'
  return body.message || 'Yêu cầu thất bại. Vui lòng thử lại.'
}

export function errorCode(error) {
  return error?.response?.data?.data?.code
}
