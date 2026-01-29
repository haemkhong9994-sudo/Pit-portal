# Cấu trúc Dự án Quản lý Thuế TNCN & Người phụ thuộc (Cập nhật 27/01/2026)

Tài liệu này tóm tắt các quy tắc nghiệp vụ và cấu trúc giao diện mới nhất sau các đợt cập nhật quan trọng về tính năng tìm kiếm địa chỉ và quản lý hồ sơ thực tế.

## 1. Hệ thống Quản lý Người phụ thuộc (DependentTab)

### A. Danh sách hiển thị (Table)
Bảng danh sách người phụ thuộc đã được tối ưu hóa:
- **Thông tin cơ bản**: Họ tên, Quan hệ, Mã số thuế.
- **Thời điểm quan trọng**: 
    - Thời điểm được giảm trừ (mm/yyyy).
    - Thời điểm áp dụng trong lương (mm/yyyy).
- **Chi tiết**: 
    - Xem chi tiết (Icon con mắt - Modal Profile).
    - Chỉnh sửa (Nếu chưa được xác nhận hoàn toàn).
    - Xác nhận (Checkbox lưu nhanh).
- **Lưu ý**: Cột **"Trạng thái"** đã được ẩn tại bảng chính để làm gọn giao diện (vẫn xem được trong chi tiết).

### B. Chức năng Thêm người phụ thuộc mới
- **Linh hoạt**: Nút "Thêm người phụ thuộc" luôn hiển thị để nhân viên có thể đăng ký mới bất cứ lúc nào, ngay cả khi danh sách cũ đã được HR xác nhận.
- **Quy tắc**: Hồ sơ mới thêm vào sẽ không bị khóa chỉnh sửa cho đến khi được gửi lưu về hệ thống.

### C. Chức năng Cắt người phụ thuộc (Terminate)
Chức năng mới dành cho trường hợp dừng giảm trừ gia cảnh:
- **Searchable Select**: Cho phép tìm nhanh người cần cắt từ danh sách hiện tại.
- **Thông tin đối chiếu**: Hiển thị Read-only Họ tên, MST, CCCD để tránh cắt nhầm.
- **Tách biệt Tháng/Năm**: 
    - **Tháng**: Dropdown chọn từ 01 - 12 (Lưu vào **Cột R** sheet Confirm NPT).
    - **Năm**: Dropdown chọn từ (Hiện tại - 10) đến (Hiện tại + 5) (Lưu vào **Cột S** sheet Confirm NPT).

### D. Hệ thống Địa chỉ thông minh (Searchable Dropdowns)
- **Dữ liệu thực**: Lấy trực tiếp từ sheet **"Data"** (Cột A: Tỉnh, Cột B: Phường).
- **Searchable Select**: Linh kiện tùy chỉnh cho phép gõ từ khóa để lọc nhanh kết quả (Search-as-you-type).
- **Cascading Logic**: Khi chọn Tỉnh/Thành phố, danh sách Xã/Phường sẽ tự động lọc theo đơn vị tương ứng.

---

## 2. Quy tắc Đồng bộ & Xác nhận (Global Sync Logic)

### A. Đồng bộ trạng thái từ Google Sheets
Hệ thống tự động kiểm tra Email người dùng tại các sheet "Confirm" khi đăng nhập:
- **MST**: Nếu Email tồn tại trong sheet `Confirm MST` và cột xác nhận (Cột H) là `TRUE` -> Hiển thị badge **ĐÃ HOÀN TẤT** và khóa chỉnh sửa tại trang Thuế.
- **NPT**: Nếu Email hiện diện trong sheet `Confirm NPT` (kiểm tra qua Apps Script) -> Trang Người phụ thuộc sẽ hiển thị banner thành công và khóa các hồ sơ đã xác nhận.

### B. Xác nhận thông tin (Confirmation)
- **Trong danh sách**: Dấu tích xanh hiển thị cho các hồ sơ đã được đồng bộ xác nhận.
- **Trong Modal chi tiết**: Nhãn "Xác nhận thông tin" tự động chuyển sang **"Đã xác nhận"** (Màu xanh) để khớp với trạng thái ngoài bảng.

---

## 3. Cấu trúc Địa chỉ (3 Cột)
Loại bỏ cấp Quận/Huyện, thống nhất 3 cấp:
1. **Tỉnh / Thành phố** (Searchable Dropdown)
2. **Xã / Phường** (Searchable Dropdown - Lọc theo Tỉnh)
3. **Số nhà / Đường / Tổ** (Ô nhập liệu tự do)

---

## 4. Cấu trúc Kỹ thuật & Vận hành
- **Frontend**: Vite + React + Tailwind CSS.
- **Backend**: Google Apps Script (GAS) Web App.
- **API Key**: Bảo mật qua mã bí mật `PIT_SYSTEM_SECRET_KEY_2026`.
- **Lệnh chạy local**: `node "node_modules\vite\bin\vite.js"`
- **Cổng mặc định**: `http://localhost:3000/`
