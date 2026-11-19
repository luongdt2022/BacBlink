-- ====================================================================
-- MIGRATION: 20261024_master_industry_benchmarks.sql
-- DESCRIPTION: Master Data 23 Ngành Chế Biến Chế Tạo C.10 - C.32 (TT17)
-- ====================================================================

CREATE SCHEMA IF NOT EXISTS assessment;

CREATE TABLE IF NOT EXISTS assessment.industry_benchmarks (
    industry_code VARCHAR(10) PRIMARY KEY,
    industry_name VARCHAR(255) NOT NULL,
    k_chuan_1 NUMERIC(10, 2) NOT NULL, -- Hệ số tự động hóa trung bình (triệu đồng/LĐ)
    k_chuan_2 NUMERIC(6, 4) NOT NULL,  -- Hệ số chi phí năng lượng trung bình (Gnl / Gdt)
    k_chuan_3 NUMERIC(6, 4) NOT NULL,  -- Hệ số chi phí nguyên vật liệu trung bình (Gnvl / Gdt)
    k_chuan_4 NUMERIC(10, 2) NOT NULL, -- Năng suất lao động trung bình (triệu đồng/người/năm)
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO assessment.industry_benchmarks (industry_code, industry_name, k_chuan_1, k_chuan_2, k_chuan_3, k_chuan_4)
VALUES
('C.10', 'Sản xuất chế biến thực phẩm', 200.0, 0.07, 0.75, 150.0),
('C.11', 'Sản xuất đồ uống', 200.0, 0.05, 0.2, 150.0),
('C.12', 'Sản xuất sản phẩm thuốc lá', 200.0, 0.07, 0.45, 200.0),
('C.13', 'Dệt', 200.0, 0.05, 0.4, 75.0),
('C.14', 'Sản xuất trang phục', 200.0, 0.05, 0.65, 75.0),
('C.15', 'Sản xuất da và các sản phẩm có liên quan', 200.0, 0.05, 0.35, 75.0),
('C.16', 'Chế biến gỗ và sản xuất sản phẩm từ gỗ, tre, nứa (trừ giường, tủ, bàn, ghế); sản xuất sản phẩm từ rơm, rạ và vật liệu tết bện', 150.0, 0.05, 0.65, 100.0),
('C.17', 'Sản xuất giấy và sản phẩm từ giấy', 250.0, 0.05, 0.65, 100.0),
('C.18', 'In, sao chép bản ghi các loại', 250.0, 0.05, 0.65, 100.0),
('C.19', 'Sản xuất than cốc, sản phẩm dầu mỏ tinh chế', 300.0, 0.1, 0.75, 150.0),
('C.20', 'Sản xuất hóa chất và sản phẩm hóa chất', 250.0, 0.1, 0.55, 150.0),
('C.21', 'Sản xuất thuốc, hóa dược và dược liệu', 300.0, 0.07, 0.6, 200.0),
('C.22', 'Sản xuất sản phẩm từ cao su và plastic', 250.0, 0.1, 0.55, 150.0),
('C.23', 'Sản xuất sản phẩm từ khoáng phi kim loại khác', 250.0, 0.1, 0.4, 100.0),
('C.24', 'Sản xuất kim loại', 300.0, 0.1, 0.65, 150.0),
('C.25', 'Sản xuất sản phẩm từ kim loại đúc sẵn (trừ máy móc, TB)', 300.0, 0.07, 0.65, 100.0),
('C.26', 'Sản xuất sản phẩm điện tử, máy vi tính và sản phẩm quang học', 300.0, 0.05, 0.45, 100.0),
('C.27', 'Sản xuất thiết bị điện', 300.0, 0.05, 0.45, 100.0),
('C.28', 'Sản xuất máy móc, thiết bị chưa được phân vào đâu', 300.0, 0.07, 0.55, 150.0),
('C.29', 'Sản xuất xe có động cơ', 300.0, 0.07, 0.65, 150.0),
('C.30', 'Sản xuất phương tiện vận tải khác', 300.0, 0.07, 0.65, 150.0),
('C.31', 'Sản xuất giường, tủ, bàn, ghế', 150.0, 0.05, 0.55, 100.0),
('C.32', 'Công nghiệp chế biến, chế tạo khác', 200.0, 0.07, 0.55, 150.0)
ON CONFLICT (industry_code) DO UPDATE SET
    industry_name = EXCLUDED.industry_name,
    k_chuan_1 = EXCLUDED.k_chuan_1,
    k_chuan_2 = EXCLUDED.k_chuan_2,
    k_chuan_3 = EXCLUDED.k_chuan_3,
    k_chuan_4 = EXCLUDED.k_chuan_4,
    updated_at = CURRENT_TIMESTAMP;
