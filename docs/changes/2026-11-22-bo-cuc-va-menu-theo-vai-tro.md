# Sửa bố cục trang và menu theo vai trò

## 1. Thông tin

- Ngày: 22/11/2026
- Loại: sửa lỗi giao diện + mở rộng menu
- Repository và nhánh: web-booking, `fix/forgot-password-and-home`
- Trạng thái: đã thực hiện local, chưa push
- Công việc liên quan: `docs/changes/2026-11-21-sua-quen-mat-khau-va-trang-chu.md` (cùng nhánh)

## 2. Kết quả đã thực hiện

- **Trang không rộng hết màn hình:**
  - Tái hiện: ở 1440px trang rộng 1497px, có thanh cuộn ngang. Ở 1920px logo cách lề trái 312px nhưng nội dung chỉ cách 72px.
  - Nguyên nhân: `footer` nằm ngoài `<main>` nhưng có `margin: 0 -72px`; header giới hạn 1440px và căn giữa, trong khi nội dung trải hết chiều ngang.
  - Sửa: header, nội dung, banner và footer dùng chung biến lề `--gutter` (72px trên màn lớn, 24px tablet, 16px mobile; nội dung rộng tối đa 1296px). Bỏ margin âm của footer. Ô tìm kiếm chia đúng 4 cột thay vì 5. Trên mobile, ô tìm kiếm và danh sách phòng xếp 1 cột.
- **Nút "Đăng chỗ ở" dẫn sai:** hệ thống không có chức năng đăng chỗ ở, nút lại dẫn tới trang đăng ký khách hàng. Đã thay bằng 2 nút "Đăng nhập" và "Đăng ký" cho khách chưa đăng nhập.
- **Menu không theo vai trò:** trước đây mọi tài khoản đều thấy "Đặt phòng", trong khi route này chỉ cho khách hàng nên lễ tân/admin bấm vào bị báo không đủ quyền. Hai link "Trải nghiệm" và "Trợ giúp" trỏ tới các mục không tồn tại trên trang.
- **Menu mới**, khai báo tập trung trong `src/constants/navigation.js`:

| Vai trò | Menu chính | Nhóm "Quản trị" | Menu tài khoản |
| --- | --- | --- | --- |
| Chưa đăng nhập | Phòng, Dịch vụ*, Điểm đến gần* | – | Đăng nhập, Đăng ký |
| Khách hàng | + Đặt phòng của tôi | – | Tên · vai trò → Tài khoản của tôi*, Đăng xuất |
| Lễ tân | + Lễ tân | – | như trên |
| Quản trị viên | + Lễ tân | Phòng, Khách sạn*, Loại phòng & giá*, Tài khoản & phân quyền*, Đối tác*, Đối soát thanh toán* | như trên |

  Mục có dấu * chưa có màn hình: hiện nhãn "Sắp có" và mở trang "Đang phát triển" (không gọi API), route được bảo vệ đúng quyền như chức năng thật sẽ có. Danh sách lấy từ thiết kế API backend (`docs/SEQUENCE-CUSTOMER-API.md`, `docs/SEQUENCE-API-USAGE.md`).

## 3. File đã thêm/sửa/xóa/đổi tên

| Repository | Đường dẫn file | Loại thay đổi | Vai trò, nội dung đã đổi và lý do |
| --- | --- | --- | --- |
| web-booking | src/constants/navigation.js | Thêm | Cấu hình menu: đường dẫn, nhãn, vai trò, `ready`, mô tả; `menuFor(role)`, `plannedRoutes()` |
| web-booking | src/components/ComingSoon.jsx | Thêm | Trang "Đang phát triển" cho mục chưa có màn hình |
| web-booking | src/components/layout/Header.jsx | Sửa | Menu dựng từ cấu hình; dropdown "Quản trị" và tài khoản dùng `<details>`; bỏ "Đăng chỗ ở", "Trải nghiệm", "Trợ giúp" |
| web-booking | src/routes/AppRoutes.jsx | Sửa | Thêm route cho mục "Sắp có"; xuống dòng cho dễ đọc, route cũ giữ nguyên |
| web-booking | src/index.css | Sửa | Biến `--gutter`, bỏ margin âm footer, ô tìm kiếm 4 cột, style dropdown và nhãn "Sắp có", responsive ≤1200/850/540px |
| web-booking | tests/navigation.test.js | Thêm | 4 test: menu theo vai trò, phân quyền route "Sắp có", đường dẫn không trùng, mục chưa làm có mô tả |

## 4. Ảnh hưởng API, dữ liệu và cấu hình

- Không gọi API mới, không đổi contract, env hay dependency.
- Backend `main` chưa có API cho các mục "Sắp có"; phần backend tương ứng đang ở bản triển khai đầy đủ chưa merge.

## 5. Kiểm tra đã thực hiện

| Lệnh hoặc kịch bản | Môi trường | Kết quả thực tế | Bằng chứng/ghi chú |
| --- | --- | --- | --- |
| `npm test` | Local Node | Đạt | 17 test, 4 test mới |
| `npm run lint`, `npm run build`, `git diff --check` | Local | Đạt | |
| Đo bố cục trang chủ | Vite dev, 1920/1440/1024/375px | Đạt | `scrollWidth` bằng chiều rộng màn hình; logo, nội dung, nút cùng lề; menu 1 hàng ở 1024px |
| Menu quản trị viên, mở "Khách sạn" | Vite dev | Đạt | Mở trang "Đang phát triển", dropdown tự đóng |
| Phân quyền route "Sắp có" | Vite dev | Đạt | Chưa đăng nhập vào `/admin/hotels` → `/login`; khách hàng → `/forbidden` |

- Backend local đang tắt khi kiểm tra, nên trạng thái đăng nhập được giả lập bằng cách gán user vào store; chưa xem với phiên đăng nhập thật.

## 6. Cách chạy hoặc xác minh lại

1. `npm run dev`, mở `/` ở nhiều độ rộng: không có thanh cuộn ngang, logo thẳng hàng nội dung.
2. Đăng nhập bằng từng vai trò, kiểm tra menu khớp bảng ở mục 2.
3. Mở một mục "Sắp có" bằng URL với vai trò không được phép: phải bị chuyển về `/login` hoặc `/forbidden`.

## 7. Giới hạn và việc còn lại

- Các mục "Sắp có" mới có chỗ trên menu, chưa có màn hình. Khi làm xong một màn hình: đổi `ready: true` trong `navigation.js` và khai báo route thật trong `AppRoutes.jsx`.
- RECEPTIONIST thấy "Lễ tân" nhưng backend v1 hiện chưa cấp quyền cho vai trò này.

## 8. Triển khai, rollback và liên kết

- Thứ tự: cùng PR với nhánh `fix/forgot-password-and-home`.
- Rollback: revert commit này.
- Kết quả sau triển khai: Chưa triển khai.
