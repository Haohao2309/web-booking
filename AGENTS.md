# Quy tắc bắt buộc cho AI — Web Booking

## 1. Trước khi sửa code

- Đọc `README.md`, `docs/API-CONTRACT.md` và `docs/QUY-TRINH-PHAT-TRIEN-CHUC-NANG.md`.
- Kiểm tra `git status` và giữ nguyên mọi thay đổi chưa commit của người dùng.
- Không tự ý xóa, reset, checkout hoặc ghi đè file khi chưa được yêu cầu rõ ràng.
- Tìm code hiện có trước khi tạo file, component, API hoặc quy tắc mới.
- Nếu yêu cầu nghiệp vụ, quyền, tiền, ngày tháng hoặc API chưa rõ, phải ghi giả định và hỏi lại trước phần có rủi ro.

## 2. Nguyên tắc kiến trúc

- Frontend dùng React/Vite; UI ở `src/features`, layout dùng `src/components/layout`.
- API call chỉ đặt trong `src/api`; logic dùng lại đặt trong `src/hooks` hoặc `src/utils`.
- Không đặt SQL, nghiệp vụ backend, secret hoặc quyền bảo mật trong frontend.
- Không tự tính giá cuối cùng, quyền truy cập hoặc trạng thái booking ở frontend.
- Tôn trọng API contract: `{ success, message, data, status }`.
- API danh sách phải dùng phân trang server; không lọc giả trên một trang dữ liệu đã tải.
- Xử lý đầy đủ trạng thái `loading`, `empty`, `error`, `success`.
- Form phải có validation, thông báo lỗi rõ ràng và hỗ trợ keyboard/responsive.

## 3. Quy tắc nghiệp vụ booking

- Kiểm tra quyền ở backend; frontend chỉ ẩn/hiện UI để hỗ trợ người dùng.
- Không cho client quyết định tổng tiền, chủ tài khoản, role hoặc trạng thái cuối cùng.
- Không thay đổi ý nghĩa field/API hiện có nếu chưa có kế hoạch tương thích.
- Thay đổi trạng thái booking phải đi qua use case rõ ràng, không cho phép sửa `status` tùy ý.
- Khoảng lưu trú dùng quy ước `[checkIn, checkOut)`.
- Tiền phải chính xác; không dùng phép tính floating-point tùy tiện.
- Các thao tác đặt, đổi, hủy booking phải xử lý dữ liệu cũ, gửi lặp và xung đột đồng thời.

## 4. Khi triển khai chức năng

1. Mô tả vai trò, mục tiêu, luồng chính và luồng lỗi.
2. Xác định file, API, dữ liệu, quyền và trạng thái bị ảnh hưởng.
3. Thiết kế hoặc cập nhật API contract trước khi nối frontend.
4. Sửa phạm vi nhỏ nhất đủ giải quyết yêu cầu; không refactor không liên quan.
5. Viết test cho nghiệp vụ, quyền, lỗi và hồi quy quan trọng.
6. Cập nhật tài liệu nếu thay đổi API, database, env hoặc quy trình.
7. Chạy kiểm tra phù hợp và báo cáo đúng kết quả thực tế.

## 5. Kiểm tra bắt buộc

Frontend:

```powershell
npm run lint
npm test
npm run build
git diff --check
```

Backend:

```powershell
.\mvnw.cmd --batch-mode verify
git diff --check
```

- Không báo “đã test” nếu chưa chạy lệnh.
- Nếu lệnh thất bại, phải nêu nguyên nhân, phạm vi ảnh hưởng và phần chưa xác minh.
- Trước khi hoàn tất, kiểm tra diff, file mới, secret, log nhạy cảm và build artifact.

## 6. Quy tắc bàn giao

- Tạo tài liệu trong `docs/changes/YYYY-MM-DD-ten-chuc-nang.md` khi thay đổi không chỉ là chỉnh sửa nhỏ.
- Ghi rõ file đã thêm/sửa/xóa, API, migration, test đã chạy, giới hạn còn lại và cách kiểm tra lại.
- Không tự commit, push, merge hoặc tạo PR nếu người dùng chưa yêu cầu.
- Khi thay đổi cả hai repository, ghi rõ dependency và thứ tự triển khai.

## 7. Cách phản hồi của AI

- Nói rõ mình đã kiểm tra gì, đã thay đổi file nào và kiểm tra nào đã chạy.
- Không bịa endpoint, bảng database, role, package, kết quả test hoặc trạng thái triển khai.
- Ưu tiên giải pháp đơn giản, dễ review, phù hợp cấu trúc hiện tại.
- Nếu phát hiện lỗi ngoài phạm vi, không tự sửa; báo lại riêng để người dùng quyết định.
