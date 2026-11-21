# Sửa trang chủ và luồng quên mật khẩu theo backend mới

## 1. Thông tin

- Ngày: 21/11/2026
- Loại: sửa lỗi
- Repository và nhánh: web-booking, `fix/forgot-password-and-home` tách từ `origin/main` (`d0ceb65`)
- Trạng thái: đã thực hiện local, chưa push
- Issue/PR: Chưa tạo
- Công việc phụ thuộc: backend api-booking `main` đã có quên mật khẩu (`82c541d`, contract mục 7 trong `docs/API-CONTRACT.md` của backend)

## 2. Kết quả đã thực hiện

- Mục đích: FE chạy được với backend mới sau khi merge chức năng quên mật khẩu.
- Lỗi 1, trang chủ trắng:
  - Tái hiện: mở `/`. Console báo `Uncaught TypeError: roomApi.locations is not a function`, không có gì hiển thị.
  - Nguyên nhân: `RoomListPage` gọi `roomApi.locations()`, nhưng `roomApi` không có hàm này và backend cũng không có API địa điểm.
  - Sửa: bỏ phần lọc theo địa điểm. Chỉ hiện địa điểm của phòng khi dữ liệu có field `location`.
- Lỗi 2, bước "Đổi mật khẩu" luôn thất bại:
  - Tái hiện: gửi `{email, code, newPassword}`. Backend trả 400 `VALIDATION_ERROR` với `fieldErrors.confirmPassword`.
  - Nguyên nhân: FE không gửi `confirmPassword`, trong khi backend bắt buộc field này.
  - Sửa: gửi kèm `confirmPassword`.
- Sửa thêm trong luồng quên mật khẩu:
  - Nút "Gửi lại mã" khóa 60 giây, khớp với thời gian chờ của backend. Thông báo không còn khẳng định đã gửi mã hay mã cũ đã mất hiệu lực khi backend chưa phát mã mới.
  - Backend trả `INVALID_RESET_CODE` (mã sai, hết hạn hoặc bị khóa sau 5 lần) ở bước 3 thì quay về bước 2 để nhập lại hoặc gửi lại mã. Có thêm nút "Đổi email".
  - Kiểm tra mật khẩu mới trước khi gửi: 8–72 ký tự, tối đa 72 byte UTF-8, xác nhận phải khớp.
  - Trang đăng nhập hiện thông báo "Đổi mật khẩu thành công" được truyền qua `location.state`.
- Thông báo lỗi chung (`errorMessage`):
  - 403 `ACCOUNT_LOCKED` hiện "Tài khoản đã bị khóa" thay vì "Bạn không có quyền".
  - 404 không còn mặc định "Email không tồn tại", vì backend mới không trả câu đó.
  - 409 mặc định dùng câu chung thay vì luôn nói email đã đăng ký.
  - `errorMessage` chuyển sang `src/api/errorMessage.js` để kiểm thử được; `axiosClient` export lại nên các chỗ import cũ vẫn dùng được.

## 3. File đã thêm/sửa/xóa/đổi tên

| Repository | Đường dẫn file | Loại thay đổi | Vai trò, nội dung đã đổi và lý do |
| --- | --- | --- | --- |
| web-booking | src/features/rooms/pages/RoomListPage.jsx | Sửa | Bỏ gọi `roomApi.locations` và phần lọc theo địa điểm |
| web-booking | src/features/auth/pages/ForgotPasswordPage.jsx | Sửa | Gửi `confirmPassword`, khóa gửi lại 60 giây, quay về bước 2 khi mã không còn hợp lệ, kiểm tra mật khẩu, nút đổi email |
| web-booking | src/features/auth/pages/LoginPage.jsx | Sửa | Hiện thông báo truyền qua `location.state.message` |
| web-booking | src/api/errorMessage.js | Thêm | `errorMessage` và `errorCode` thuần, không phụ thuộc trình duyệt |
| web-booking | src/api/axiosClient.js | Sửa | Export lại `errorMessage`, `errorCode` từ file mới |
| web-booking | src/utils/validators.js | Sửa | Thêm `validateNewPassword` |
| web-booking | tests/errorMessage.test.js | Thêm | 5 test cho thông báo lỗi |
| web-booking | tests/validators.test.js | Sửa | Test giới hạn mật khẩu mới, gồm trường hợp chữ có dấu vượt 72 byte |

## 4. Ảnh hưởng API, dữ liệu và cấu hình

- API: không đổi contract. Vẫn dùng `/api/auth/*`; body reset-password khớp contract backend mục 7.
- Dữ liệu, env, dependency: không đổi.
- Không ảnh hưởng: `/api/rooms`, `/api/bookings` vẫn chưa có trên backend `main`, nên danh sách phòng hiện "Không tìm thấy API". Đây là phần nối API v1 riêng, không thuộc lần sửa này.

## 5. Kiểm tra đã thực hiện

| Lệnh hoặc kịch bản | Môi trường | Kết quả thực tế | Bằng chứng/ghi chú |
| --- | --- | --- | --- |
| `npm test` | Local Node | Đạt | 13 test, 6 test mới |
| `npm run lint` | Local | Đạt | Không có cảnh báo |
| `npm run build` | Local Vite | Đạt | |
| `git diff --check` | Local | Đạt | |
| Mở `/` | Vite dev + backend local cổng 8080 | Đạt | Trang hiển thị, không còn TypeError; danh sách phòng báo không tìm thấy API như dự kiến |
| Quên mật khẩu bước 1 → 2, nhập sai mã | Vite dev + backend local | Đạt | Sang bước 2, đếm ngược gửi lại, mã sai hiện thông báo rõ |

- Chưa thực hiện: bước 3 với mã thật, vì backend local đang tắt mail (`MAIL_ENABLED=false`) nên không lấy được mã. Body gửi lên đã đối chiếu với `ResetPasswordRequest` của backend; backend có test riêng cho luồng đầy đủ.

## 6. Cách chạy hoặc xác minh lại

1. Chạy backend `main` có cấu hình SMTP (`MAIL_ENABLED=true`).
2. `npm run dev`, mở `/forgot-password`, nhập email đã đăng ký.
3. Nhập mã nhận trong email, đặt mật khẩu mới.
4. Mong đợi: chuyển về trang đăng nhập với thông báo thành công; đăng nhập được bằng mật khẩu mới.
5. Kịch bản lỗi: nhập sai mã 5 lần thì mã bị khóa; bấm "Gửi lại mã" sau khi hết đếm ngược để nhận mã mới.

## 7. Giới hạn và việc còn lại

- Danh sách phòng, đặt phòng và lễ tân vẫn gọi API cũ (`/api/rooms`, `/api/bookings`, `/bookings/me`, check-in/check-out) chưa có trên backend `main`. Cần nối sang `/api/v1` khi các nhánh backend khách hàng và quản lý được merge.
- `STATUS_LABELS` vẫn có `CHECKED_IN`/`CHECKED_OUT`; backend có `EXPIRED`/`COMPLETED`.
- `RegisterPage` chưa gửi `fullName`, nên tài khoản mới không có họ tên.

## 8. Triển khai, rollback và liên kết

- Thứ tự: merge sau backend `main` `82c541d`.
- Rollback: revert commit trên nhánh này.
- Kết quả sau triển khai: Chưa triển khai.
