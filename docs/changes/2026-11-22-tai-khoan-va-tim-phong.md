# Giao diện tài khoản của tôi và tìm phòng (catalog công khai)

## 1. Thông tin

- Ngày: 22/11/2026
- Loại: chức năng mới
- Repository và nhánh: web-booking, `feature/customer-account-catalog` tách từ `main` (`bf84709`)
- Trạng thái: đã commit local, chưa push
- Phụ thuộc: backend api-booking nhánh `feature/customer-profile` (contract mục 8) và `feature/customer-catalog` (contract mục 9). Phải merge backend trước; khi chưa có, các trang mới báo "Không tìm thấy API".
- Thiết kế tham khảo: WBO `01 · Trang chủ`, `02 · Tìm kiếm`, `03 · Danh sách kết quả`, `04 · Chi tiết`, `10 · Tài khoản`.

## 2. Kết quả đã thực hiện

| Trang | Đường dẫn | API |
| --- | --- | --- |
| Tìm phòng (lọc + kết quả, theo WBO 02–03) | `/rooms?checkIn&checkOut&guests&minPrice&maxPrice&sort&page` | `GET /api/v1/rooms` |
| Chi tiết phòng (theo WBO 04) | `/rooms/:id` | `GET /api/v1/rooms/{id}`, `GET /api/v1/services?hotelId`, `GET /api/v1/suggestions?hotelId` |
| Dịch vụ | `/services` | `GET /api/v1/services` |
| Điểm đến gần | `/suggestions` | `GET /api/v1/suggestions` |
| Tài khoản của tôi | `/account` (cần đăng nhập) | `GET/PATCH /api/v1/users/me`, `PUT /api/v1/users/me/password` |

- **Tiêu chí tìm kiếm nằm trên URL**: tải lại hoặc chia sẻ link vẫn giữ kết quả. Ngày và số khách được chuyển sang trang chi tiết.
- **Lọc, đếm, phân trang ở server**; giao diện không tự lọc trên trang đã tải.
- **Đủ trạng thái** đang tải / rỗng / lỗi (có nút thử lại) theo mẫu WBO 03.
- **Giá ở trang kết quả và chi tiết là tạm tính** (giá/đêm × số đêm), ghi rõ server tính lại khi đặt.
- **Nút "Đặt phòng" đang tắt (sắp có)** vì API đặt phòng chưa merge.
- **Trang chủ:**
  - Form chuyển sang `/rooms` với ngày và số khách.
  - Danh sách "Những nơi nghỉ được yêu thích" đọc `GET /api/v1/rooms`.
  - Bỏ ô "Địa điểm" vì backend chưa có API tìm theo địa điểm.
  - Bỏ nút đặt phòng gọi API cũ `/api/bookings` (không tồn tại); thay bằng "Xem chi tiết".
- **Tài khoản của tôi:**
  - Sửa họ tên và số điện thoại; để trống số điện thoại thì xóa số. Email chỉ đọc.
  - Đổi mật khẩu. Thành công thì chuyển về đăng nhập kèm thông báo, vì backend đã đăng xuất mọi phiên.
  - Tên trên header cập nhật ngay sau khi lưu.
- **Menu:** "Trang chủ", "Tìm phòng", "Dịch vụ", "Điểm đến gần", "Tài khoản của tôi" bỏ nhãn "Sắp có".

## 3. File đã thêm/sửa

| Repository | Đường dẫn file | Loại thay đổi | Vai trò, nội dung đã đổi và lý do |
| --- | --- | --- | --- |
| web-booking | src/api/accountApi.js, src/api/catalogApi.js | Thêm | Gọi API v1 tài khoản và catalog |
| web-booking | src/utils/stay.js | Thêm | Số đêm theo `[checkIn, checkOut)`, đọc/ghi tiêu chí tìm trên URL |
| web-booking | src/components/Pager.jsx | Thêm | Phân trang server (page từ 0) |
| web-booking | src/features/account/pages/AccountPage.jsx | Thêm | Trang tài khoản |
| web-booking | src/features/catalog/pages/SearchRoomsPage.jsx | Thêm | Tìm phòng |
| web-booking | src/features/catalog/pages/RoomDetailPage.jsx | Thêm | Chi tiết phòng |
| web-booking | src/features/catalog/pages/CatalogListPage.jsx | Thêm | Trang dịch vụ và điểm đến (dùng chung) |
| web-booking | src/features/rooms/pages/RoomListPage.jsx | Sửa | Trang chủ dùng API v1, form chuyển sang `/rooms` |
| web-booking | src/store/index.js | Sửa | Thêm `updateUser`, `endSession` |
| web-booking | src/constants/navigation.js | Sửa | Mục đã có màn hình chuyển `ready: true`; thêm "Tìm phòng" |
| web-booking | src/routes/AppRoutes.jsx | Sửa | Route `/rooms`, `/rooms/:id`, `/services`, `/suggestions`, `/account` |
| web-booking | src/index.css | Sửa | Style các trang mới theo WBO; ô tìm kiếm trang chủ về 4 cột; responsive |
| web-booking | tests/stay.test.js | Thêm | 3 test |
| web-booking | tests/navigation.test.js | Sửa | Theo menu mới |

## 4. Ảnh hưởng API, dữ liệu và cấu hình

- Gọi API `/api/v1/...` qua proxy Vite `/api` hiện có. Không có env hay dependency mới.
- `/api/auth/*` cũ giữ nguyên cho đăng nhập/đăng ký.

## 5. Kiểm tra đã thực hiện

| Lệnh hoặc kịch bản | Môi trường | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| `npm test` | Local Node | Đạt | 20 test |
| `npm run lint`, `npm run build`, `git diff --check` | Local | Đạt | |
| Luồng thật trên trình duyệt | Vite dev + backend 2 nhánh trên chạy H2 với dữ liệu mẫu tạm (không đụng database thật) | Đạt | Xem bên dưới |

Kịch bản đã chạy trên trình duyệt:
- Trang chủ tải phòng từ API; form ngày + 3 khách chuyển sang `/rooms`. Kết quả bỏ loại phòng 2 khách, hiện giá 2 đêm tạm tính.
- Giá tối đa 1.000 ₫ hiện trạng thái "Không có phòng phù hợp".
- Chi tiết phòng có tiện ích, dịch vụ kèm theo, điểm đến gần và giá theo ngày.
- Trang dịch vụ và điểm đến hiện đúng danh sách.
- Tài khoản:
  - Số điện thoại sai định dạng báo lỗi; lưu thành công thì tên trên header đổi ngay.
  - Mật khẩu cũ sai hiện "Mật khẩu cũ không đúng".
  - Đổi thành công thì về trang đăng nhập có thông báo và phiên cũ trả 401.
- Đo bố cục ở 1440px, 1024px, 375px: không cuộn ngang.

Chưa kiểm tra: backend chạy PostgreSQL thật; số lượng dữ liệu lớn.

## 6. Cách chạy hoặc xác minh lại

1. Chạy backend có hai nhánh `feature/customer-profile` + `feature/customer-catalog`, và nạp khách sạn, loại phòng, phòng, dịch vụ, gợi ý.
2. `npm run dev`, mở `/`, `/rooms`, `/rooms/{id}`, `/services`, `/suggestions`; đăng nhập rồi mở `/account`.

## 7. Giới hạn và việc còn lại

- Thiết kế WBO 03 hiển thị theo **loại phòng** ("3 loại phòng phù hợp · còn bán N phòng"). API hiện trả theo **phòng**, nên danh sách là từng phòng. Cần chốt có làm API tìm theo loại phòng không.
- Lọc theo tiện ích (Wi-Fi, ban công) và theo loại phòng trong WBO chưa có vì API chưa hỗ trợ / chưa có danh sách loại phòng công khai.
- Danh sách phòng không có ảnh (API chỉ trả ảnh ở chi tiết) nên dùng khung ảnh tạm.
- Nút đặt phòng chờ nhánh booking.
- WBO đăng ký có số điện thoại; API đăng ký chưa nhận field này.

## 8. Triển khai, rollback và liên kết

- Thứ tự: merge backend `feature/customer-profile` → `feature/customer-catalog` → FE nhánh này.
- Rollback: revert nhánh FE; backend giữ nguyên được.
