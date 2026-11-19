-- Migration: ScopedMultiTierRbac
-- Date: 2026-09-25
-- Description: Bổ sung scope_type, scope_id và mở rộng platform_role cho bảng identity.persons

ALTER TABLE identity.persons 
    ALTER COLUMN platform_role TYPE VARCHAR(50);

ALTER TABLE identity.persons 
    ADD COLUMN IF NOT EXISTS scope_type VARCHAR(20) NOT NULL DEFAULT 'GLOBAL',
    ADD COLUMN IF NOT EXISTS scope_id VARCHAR(50) NULL;

CREATE INDEX IF NOT EXISTS ix_persons_scope_type_scope_id 
    ON identity.persons (scope_type, scope_id);

COMMENT ON COLUMN identity.persons.scope_type IS 'Phạm vi phân cấp quản trị: GLOBAL | PROVINCE | SECTOR | ORG_UNIT';
COMMENT ON COLUMN identity.persons.scope_id IS 'Mã định danh phạm vi tương ứng (mã tỉnh, mã ngành, mã viện/trường)';
