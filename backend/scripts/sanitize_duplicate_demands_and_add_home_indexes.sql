-- Data sanitization and index optimization for Home screen Cung - Cầu
-- Reference: TASK-01 Delta v2 (T-01.19)

-- 1. Unlist duplicate demands, keeping 1 representative (the latest)
UPDATE demand.demand_items
SET is_public_listed = false, updated_at = NOW()
WHERE id IN (
    WITH RankedDemands AS (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY lower(trim(technical_problem)) ORDER BY created_at DESC) as rn
        FROM demand.demand_items
        WHERE is_public_listed = true
    )
    SELECT id FROM RankedDemands WHERE rn > 1
);

-- 2. Optimize home query indexes
CREATE INDEX IF NOT EXISTS ix_demand_items_home ON demand.demand_items (status, is_public_listed, sector_code);
CREATE INDEX IF NOT EXISTS ix_seller_offers_home ON technology.seller_technology_offers (status, sector_code);
