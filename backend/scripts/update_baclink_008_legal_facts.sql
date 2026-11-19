-- CR-BACLINK-008 · T-00.BL08.02 — Chuẩn hóa dữ kiện pháp nhân trong nội dung CSDL.
-- Idempotent: chạy nhiều lần không đổi kết quả. Không sửa script/migration cũ.
-- Nguyên tắc: nội dung tường thuật sự kiện lịch sử KHÔNG gán số QĐ mới;
-- chỉ bỏ số QĐ cũ (1652) để tránh mâu thuẫn với nguồn pháp nhân hiện hành
-- (frontend/src/lib/constants/organization.ts) trong khi chờ BACLINK xác nhận.
BEGIN;

UPDATE content.techmart_events
SET description = replace(
      description,
      'theo Quyết định số 1652/QĐ-UBND của Chủ tịch UBND tỉnh Bắc Ninh',
      'theo Quyết định cho phép thành lập của UBND tỉnh Bắc Ninh')
WHERE description LIKE '%1652/QĐ-UBND%';

COMMIT;

-- Kiểm chứng: phải trả về 0
SELECT count(*) AS remaining_old_decision_refs
FROM content.techmart_events
WHERE description ~ '1652/QĐ|Lý Thái Tổ|3888\.?686|contact@baclink';
