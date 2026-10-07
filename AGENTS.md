# Quy tắc giao diện Frontend NacenTech

Trước khi thêm hoặc sửa màn hình, đọc `DESIGN_SYSTEM.md`. Dùng token tại `src/app/globals.css` và common component trong `src/components/ui/design-system.tsx`.

- Font duy nhất cho UI: Be Vietnam Pro được tải bằng `next/font/local` ở root layout. Không ghi đè `font-sans`, thêm font qua CDN, hoặc chỉ khai báo tên font chưa được tải.
- Typography: `type-hero`, `type-page-title`, `type-section-title`, `text-card-title`, `text-body`, `text-body-lg`, `text-label`, `text-caption`. Không tự chọn cỡ chữ pixel cho nội dung. Cỡ và khoảng cách dùng rem để A−/A+ có hiệu lực.
- Giữ đầy đủ dấu tiếng Việt, line-height theo token. Không ép ngắt dòng tiêu đề trên mobile. Caption 12px chỉ dùng cho thông tin phụ; nội dung mô tả dùng 16px.
- Dùng `AppButton`, `SectionHeading`, `page-container`, `surface-card`, `focus-ring`; kiểm tra hover/focus/disabled. Nút/chạm chính tối thiểu 44px ở cỡ chuẩn.
- Navbar co giãn và chuyển menu đúng breakpoint. Không giảm cỡ chữ để nhét menu; không dùng overflow-x-hidden toàn trang để che lỗi tràn.
- Khi thay common, ghi nhận phạm vi ảnh hưởng các màn khác. Không thay nghiệp vụ/nội dung nếu chưa được yêu cầu.
- Kiểm tra 390px, 1280px, 1440px; font tải thành công, không cuộn ngang, nội dung tiếng Việt không bị cắt, A−/A/A+ thay đổi cỡ chữ thực tế và giữ lựa chọn khi tải lại.

Nếu rule trong skill cũ khác palette/font PO chốt tại `DESIGN_SYSTEM.md`, dùng bản PO chốt.
