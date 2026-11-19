-- Migration: Baclink3TierRbacNormalization
-- Date: 2026-11-17
-- Epic: TASK-00 (T-00.BL.04) & TASK-07 (CR-BACLINK-001)
-- Description: Chuan hoa phi pha huy identity.persons ve 3 cap (ADMIN | ENTERPRISE | PUBLIC_USER)
--              voi scope_type = 'GLOBAL', scope_id = NULL, va cap DUAL capability cho doanh nghiep da duyet.

BEGIN;

-- 1. Bang luu vet phuc hoi (Rollback Ledger - Zero-Destructive)
CREATE TABLE IF NOT EXISTS identity.baclink_rbac_migration_log (
    person_id uuid PRIMARY KEY REFERENCES identity.persons(id) ON DELETE CASCADE,
    legacy_role varchar(50) NOT NULL,
    legacy_scope_type varchar(20) NOT NULL,
    legacy_scope_id varchar(50) NULL,
    target_role varchar(50) NOT NULL,
    migrated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 2. Chup anh trang thai cu truoc khi chuan hoa (idempotent)
INSERT INTO identity.baclink_rbac_migration_log (person_id, legacy_role, legacy_scope_type, legacy_scope_id, target_role)
SELECT
    p.id,
    p.platform_role,
    p.scope_type,
    p.scope_id,
    CASE UPPER(TRIM(p.platform_role))
        WHEN 'ADMIN' THEN 'ADMIN'
        WHEN 'SUPER_ADMIN' THEN 'ADMIN'
        WHEN 'OPERATOR_ADMIN' THEN 'ADMIN'
        WHEN 'ENTERPRISE' THEN 'ENTERPRISE'
        WHEN 'SELLER' THEN 'ENTERPRISE'
        WHEN 'BUYER' THEN 'ENTERPRISE'
        WHEN 'INNOVATION_ENTITY' THEN 'ENTERPRISE'
        WHEN 'VERIFIED_EXPERT' THEN 'ENTERPRISE'
        ELSE 'PUBLIC_USER'
    END AS target_role
FROM identity.persons p
WHERE p.platform_role NOT IN ('ADMIN', 'ENTERPRISE', 'PUBLIC_USER')
   OR p.scope_type IS DISTINCT FROM 'GLOBAL'
   OR p.scope_id IS NOT NULL
ON CONFLICT (person_id) DO NOTHING;

-- 3. Chuan hoa identity.persons ve 3 cap + GLOBAL
UPDATE identity.persons
SET
    platform_role = CASE UPPER(TRIM(platform_role))
        WHEN 'ADMIN' THEN 'ADMIN'
        WHEN 'SUPER_ADMIN' THEN 'ADMIN'
        WHEN 'OPERATOR_ADMIN' THEN 'ADMIN'
        WHEN 'ENTERPRISE' THEN 'ENTERPRISE'
        WHEN 'SELLER' THEN 'ENTERPRISE'
        WHEN 'BUYER' THEN 'ENTERPRISE'
        WHEN 'INNOVATION_ENTITY' THEN 'ENTERPRISE'
        WHEN 'VERIFIED_EXPERT' THEN 'ENTERPRISE'
        ELSE 'PUBLIC_USER'
    END,
    scope_type = 'GLOBAL',
    scope_id = NULL,
    updated_at = NOW()
WHERE platform_role NOT IN ('ADMIN', 'ENTERPRISE', 'PUBLIC_USER')
   OR scope_type IS DISTINCT FROM 'GLOBAL'
   OR scope_id IS NOT NULL;

-- 4. Cap DUAL capability (IsBuyer = true, IsSeller = true) cho doanh nghiep hoi vien da duyet
UPDATE enterprise.enterprises
SET
    capability_tier = 'DUAL',
    is_buyer = TRUE,
    is_seller = TRUE,
    active_role = COALESCE(NULLIF(TRIM(active_role), ''), 'BUYER'),
    updated_at = NOW()
WHERE (is_verified = TRUE OR UPPER(COALESCE(verification_status, '')) = 'VERIFIED')
  AND (
      capability_tier IS DISTINCT FROM 'DUAL'
      OR is_buyer IS DISTINCT FROM TRUE
      OR is_seller IS DISTINCT FROM TRUE
  );

COMMIT;
