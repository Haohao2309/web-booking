# Room / Stay — React frontend

Frontend (View) cho dự án cho thuê phòng: CUSTOMER, RECEPTIONIST, ADMIN. Backend REST riêng giữ nghiệp vụ và dữ liệu. Đây là frontend tích hợp API, không phải bản demo có database hoặc backend kèm theo.

## Chạy local

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Sửa `VITE_API_BASE_URL` cho đúng backend rồi khởi động lại Vite. Biến VITE_* công khai trong bundle, không đặt secret vào đây. Nếu không cấu hình, request tới `/api` cùng origin; Vite hiện không cấu hình proxy. Backend không chạy sẽ hiện lỗi kết nối, không tạo dữ liệu giả.

```powershell
npm run lint
npm test
npm run build
```

Khi host SPA, rewrite URL ứng dụng về index.html, nhưng không rewrite các request API.

## Đánh giá project ban đầu và thay đổi

| Phát hiện | Vì sao cần sửa/thêm | Đã thực hiện |
| --- | --- | --- |
| App chỉ hiện Setup thành công; các file nghiệp vụ trống | Chưa có luồng người dùng thực tế | Router, layout responsive tiếng Việt và màn hình 3 vai trò |
| main.jsx có danh sách chuỗi không liên quan | Làm nhiễu entry point | Xóa đoạn chuỗi, giữ React StrictMode |
| Không có đăng nhập, đăng ký, phiên | Không thể nhận diện tài khoản | Form validation, `/auth/me`, đăng xuất, trạng thái phiên |
| Không có phân quyền route | Người dùng vào nhầm trang quản trị | PrivateRoute, menu theo role, trang 403/404 |
| Axios chỉ có token localStorage, thiếu timeout/lỗi | Lỗi khó hiểu, token dễ bị script đọc | Cookie phiên HttpOnly theo hợp đồng đề xuất, timeout, lỗi 401/403/409 và kết nối |
| Chưa có xem phòng/đặt phòng | Khách không thể thực hiện nghiệp vụ chính | Tìm theo ngày/số khách, đặt phòng, danh sách, chi tiết, hủy |
| Chưa có luồng lễ tân | Không quản lý được trạng thái lưu trú | Danh sách/lọc trạng thái, xác nhận, check-in, check-out |
| Chưa có quản lý phòng | Admin không cấu hình được nguồn phòng | Thêm, sửa, ngừng kinh doanh; tránh xóa mất lịch sử |
| Thiếu loading/error/empty | Người dùng không biết hệ thống đang làm gì | Loading, thử lại, danh sách rỗng, chặn gửi khi đang xử lý |
| Không có tài liệu tích hợp hoặc test | Hai project dễ lệch hợp đồng | Tài liệu API dưới đây, kiểm thử ngày và số khách |

## Quyền giao diện

- Công khai: xem/tìm phòng, đăng nhập, đăng ký khách.
- CUSTOMER: tạo đặt phòng, xem đơn của mình, hủy PENDING/CONFIRMED.
- RECEPTIONIST: xem các đơn, xác nhận, check-in, check-out, hủy trước check-in.
- ADMIN: quyền lễ tân và thêm/sửa/ngừng kinh doanh phòng.
- Frontend không cho chọn role khi đăng ký. Backend phải luôn tạo CUSTOMER ở endpoint công khai.

## Hợp đồng REST đề xuất — phải đối chiếu backend thực tế

Hiện workspace không có backend/OpenAPI. Các endpoint, tên field và cookie dưới đây là quy ước triển khai mới, chưa được xác minh với server của bạn. Nếu backend hiện dùng JWT Bearer hoặc cấu trúc `{ data: ... }`, cần sửa adapter `src/api` và store cho phù hợp trước khi tích hợp; không bật song song hai kiểu phiên một cách ngầm định.

Base URL ví dụ: `http://localhost:8080/api`. Response JSON trực tiếp, không bọc thêm `data`. Danh sách trả `{ "items": [...] }`; phiên bản hiện tại yêu cầu danh sách đầy đủ, chưa hỗ trợ phân trang server. ID là string hoặc số dương. Ngày lưu trú `YYYY-MM-DD`, giá VND dạng number.

| Method | Path | Request / Response |
| --- | --- | --- |
| GET | /auth/me | User; 401 khi chưa đăng nhập |
| POST | /auth/login | `{email,password}` → User + Set-Cookie phiên |
| POST | /auth/register | `{name,email,password}` → 201; không tự đăng nhập |
| POST | /auth/logout | Vô hiệu phiên server và xóa cookie → 204 |
| GET | /rooms | Query tùy chọn checkIn, checkOut, guests; admin thêm includeInactive=true → `{items: Room[]}` |
| POST | /rooms | Dữ liệu Room có thể chỉnh sửa → Room; ADMIN |
| PATCH | /rooms/:id | Dữ liệu Room có thể chỉnh sửa → Room; ADMIN |
| POST | /bookings | `{roomId,checkIn,checkOut,guests}` → Booking có id; CUSTOMER |
| GET | /bookings/me | `{items: Booking[]}` chỉ của tài khoản hiện tại |
| GET | /bookings | `{items: Booking[]}`; ADMIN/RECEPTIONIST |
| GET | /bookings/:id | Booking; chủ đơn hoặc nhân viên |
| POST | /bookings/:id/confirm | PENDING → CONFIRMED; nhân viên |
| POST | /bookings/:id/check-in | CONFIRMED → CHECKED_IN; nhân viên |
| POST | /bookings/:id/check-out | CHECKED_IN → CHECKED_OUT; nhân viên |
| POST | /bookings/:id/cancel | PENDING/CONFIRMED → CANCELLED; chủ đơn hoặc nhân viên |

User: `{id,name,email,role}` với role chính xác `ADMIN`, `CUSTOMER`, `RECEPTIONIST`.

Room: `{id,number,name,type,description,capacity,pricePerNight,active,available}`. Khi tìm theo khoảng ngày, API chỉ trả các phòng trống phù hợp; `available` có thể dùng để vô hiệu nút đặt. Không tin field availability trên client khi tạo đơn.

Booking: `{id,room:{id,name},customer:{id,name,email},checkIn,checkOut,guests,totalPrice,status}`. Các action có thể trả Booking hoặc 204 vì UI tải lại chi tiết sau cập nhật.

Lỗi: HTTP 400/422 validation, 401 chưa đăng nhập, 403 thiếu quyền, 404 không có, 409 xung đột; JSON `{message: "Thông báo phù hợp cho người dùng"}`. Không trả stack trace.

## Backend bắt buộc để hệ thống hoạt động đúng

1. Xác thực và phân quyền trên từng endpoint; giới hạn truy vấn theo chủ đơn. Sửa role trong trình duyệt không được tạo quyền backend.
2. Cookie phiên HttpOnly, Secure khi HTTPS, SameSite phù hợp triển khai; CORS cho đúng origin frontend và credentials, không dùng wildcard. Axios gửi cookie và X-XSRF-TOKEN theo cookie XSRF-TOKEN. Backend phải cấp token CSRF đọc được ở origin frontend và xác minh các request thay đổi dữ liệu, kể cả login/logout; cấu hình khác domain cần thiết kế lại cách cấp token.
3. Kiểm tra ngày, sức chứa, giá và trạng thái trên server; tự tính tổng tiền, không nhận tổng tiền client gửi.
4. Kiểm tra trùng lịch trong transaction/lock hoặc ràng buộc DB. Trả 409 khi hai người đặt cùng phòng. Nên bổ sung idempotency khi hợp đồng server hỗ trợ để chống lặp request do retry/mất mạng.
5. Quy định rõ thời gian check-in/out, thời hạn giữ phòng, chính sách hủy, múi giờ cơ sở và các chuyển trạng thái hợp lệ. Không cho ngừng kinh doanh phòng phá các đơn đã xác nhận.
6. Mã hóa mật khẩu, kiểm soát đăng nhập thử sai, vô hiệu phiên khi logout, audit log cho thao tác nhân viên.

## Phần còn cần yêu cầu nghiệp vụ/backend

Chưa triển khai thanh toán/hoàn tiền, hóa đơn, quản lý tài khoản nhân viên, báo cáo doanh thu, quên mật khẩu/xác minh email, hồ sơ khách, dịch vụ phụ và housekeeping. Những phần này không có hợp đồng API hay yêu cầu trong repository để triển khai chính xác; không nên dựng nút giả. Tìm kiếm/phân trang dữ liệu lớn cần bổ sung hợp đồng phân trang và giao diện tương ứng.

Chưa kiểm thử tích hợp backend, phân quyền server, cuộc đua đặt trùng, cookie/CORS/CSRF hoặc thanh toán. Kiểm thử Node hiện kiểm tra validator; lint/build không thay thế kiểm thử end-to-end. Cần chạy nghiệm thu trên trình duyệt với backend và ba tài khoản thật: truy cập URL trái quyền, phiên hết hạn, lỗi mạng, tạo/hủy đơn, check-in/out, chỉnh sửa phòng, viewport di động.
