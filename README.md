# Google Drive Downloader Extension

Extension Chrome tự động tải nhiều file từ Google Drive với URL đã được làm sạch.

## Chức năng

Extension sẽ tự động:
- Xóa tham số `range=...&` từ URL
- Xóa tham số `=1&srfvp=1` từ cuối URL
- Tải file về máy tự động
- Hỗ trợ tải nhiều file cùng lúc

## Cài đặt

1. Mở Chrome và truy cập `chrome://extensions/`
2. Bật "Developer mode" ở góc trên bên phải
3. Click "Load unpacked"
4. Chọn thư mục chứa extension này
5. Extension sẽ được kích hoạt tự động

## Sử dụng

1. Click vào icon extension trên thanh công cụ Chrome
2. Dán URL Google Drive vào ô Link 1
3. Muốn tải nhiều file? Click nút "+ Thêm link" để thêm ô mới
4. Click nút "⬇️ Tải tất cả" để tự động tải tất cả file về máy
5. Các file sẽ được tự động làm sạch URL và tải về thư mục Downloads

## Tính năng

- Thêm không giới hạn số lượng link bằng nút "+"
- Xóa link không cần thiết bằng nút "✕" (hiện khi có > 1 link)
- 2 phương thức xử lý:
  - **Chrome**: Tải bằng trình tải mặc định của Chrome
  - **Copy**: Hiển thị từng link đã làm sạch với nút copy riêng
- Tự động lưu link, không mất khi đóng popup
- Giao diện đẹp với scroll bar khi có nhiều link

## Sử dụng với Download Manager khác

Nếu muốn tải nhanh hơn với IDM, Free Download Manager, hoặc tool khác:
1. Chọn "Copy link đã làm sạch"
2. Click "⬇️ Xử lý tất cả"
3. Extension sẽ hiển thị tất cả link đã làm sạch
4. Copy từng link hoặc copy tất cả
5. Dán vào download manager của bạn

## Lưu ý

- Extension hoạt động với tất cả URL từ Google Drive
- File sẽ được tải về thư mục Downloads mặc định của Chrome
