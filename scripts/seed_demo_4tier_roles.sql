-- SQL Script tạo dữ liệu account demo 4 tầng (10 Roles, 3D Scoped) trực tiếp vào Database.
-- Dùng PasswordHash đã được mã hóa sẵn (BCRYPT) tương ứng với mật khẩu: Password@123
-- Lưu ý: Id được sinh bằng hàm gen_random_uuid().

INSERT INTO identity.persons 
("Id", "Email", "PasswordHash", "PasswordHashAlgorithm", "FirstName", "LastName", "OrganizationName", "PlatformRole", "ScopeType", "ScopeId", "IsActive", "MatchingAuto", "CreatedAt", "UpdatedAt", "PreferencesUpdatedAt", "Version") 
VALUES 
-- TẦNG 1: QUẢN TRỊ TOÀN CỤC (GLOBAL)
(gen_random_uuid(), 'super.admin@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Super', 'Demo', 'Ban Quản Trị Hệ Thống', 'SUPER_ADMIN', 'GLOBAL', NULL, true, false, NOW(), NOW(), NOW(), 1),
(gen_random_uuid(), 'operator.admin@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Operator', 'Demo', 'Ban Vận Hành', 'OPERATOR_ADMIN', 'GLOBAL', NULL, true, false, NOW(), NOW(), NOW(), 1),

-- TẦNG 2: QUẢN TRỊ LĨNH VỰC & ĐỊA PHƯƠNG (SECTOR & PROVINCE)
(gen_random_uuid(), 'hanoi.admin@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Hanoi', 'Demo', 'Sở KH&CN Hà Nội', 'PROVINCIAL_ADMIN', 'PROVINCE', 'HN', true, false, NOW(), NOW(), NOW(), 1),
(gen_random_uuid(), 'saigon.admin@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Saigon', 'Demo', 'Sở KH&CN TP.HCM', 'PROVINCIAL_ADMIN', 'PROVINCE', 'SG', true, false, NOW(), NOW(), NOW(), 1),
(gen_random_uuid(), 'agri.admin@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Agri', 'Demo', 'Ban Nông Nghiệp', 'SECTOR_ADMIN', 'SECTOR', 'LV01', true, false, NOW(), NOW(), NOW(), 1),
(gen_random_uuid(), 'tech.admin@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Tech', 'Demo', 'Ban Công Nghệ Lõi', 'SECTOR_ADMIN', 'SECTOR', 'LV05', true, false, NOW(), NOW(), NOW(), 1),

-- TẦNG 3: QUẢN TRỊ CỤM/TỔ CHỨC (ORG_UNIT)
(gen_random_uuid(), 'cluster.admin@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Cluster', 'Demo', 'Cụm Đổi Mới Sáng Tạo HN', 'CLUSTER_ADMIN', 'ORG_UNIT', 'CLUSTER_HN_01', true, false, NOW(), NOW(), NOW(), 1),

-- TẦNG 4: NGƯỜI DÙNG CUỐI (END USERS)
(gen_random_uuid(), 'seller.user@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Seller', 'Demo', 'Công Ty Cung Cấp Giải Pháp', 'SELLER', 'GLOBAL', NULL, true, false, NOW(), NOW(), NOW(), 1),
(gen_random_uuid(), 'buyer.user@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Buyer', 'Demo', 'Doanh Nghiệp Tìm Kiếm Công Nghệ', 'BUYER', 'GLOBAL', NULL, true, false, NOW(), NOW(), NOW(), 1),
(gen_random_uuid(), 'innovation.entity@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Innovation', 'Demo', 'Viện Nghiên Cứu Startup', 'INNOVATION_ENTITY', 'GLOBAL', NULL, true, false, NOW(), NOW(), NOW(), 1),
(gen_random_uuid(), 'expert.user@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Expert', 'Demo', 'Chuyên Gia Độc Lập', 'VERIFIED_EXPERT', 'GLOBAL', NULL, true, false, NOW(), NOW(), NOW(), 1),
(gen_random_uuid(), 'public.user@demo.nacentech.vn', '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7', 'bcrypt', 'Public', 'Demo', 'Người Dùng Phổ Thông', 'PUBLIC_USER', 'GLOBAL', NULL, true, false, NOW(), NOW(), NOW(), 1)
ON CONFLICT ("Email") DO NOTHING;
