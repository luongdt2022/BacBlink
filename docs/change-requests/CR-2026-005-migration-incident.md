# Concurrent migration incident — 2026-10-07

During CR-2026-005 PostgreSQL regression on isolated fresh test containers, migration `20261007074723_CreateEnterpriseSchema` failed SQLSTATE42P07 (`dataroom.access_grants` already exists). Concurrent backend commit `aac9b57` introduced this migration outside the expert-search change. By edit time HEAD was `7501e0f0762594e305cbad1b068560dead19a05c`; preserved concurrent commits. Read-only operation audit found57CreateTable operations, of which53already exist from prior migrations;106CreateIndex operations included only3enterprise indexes. Down incorrectly attempted to delete all57tables.

Root approved minimal delta correction: Up retains enterprise EnsureSchema,4new enterprise tables and3indexes; Down drops3children then enterprises. Existing table definitions, designer target model and model snapshot remain unchanged. No existing database is modified in this task; regression uses isolatedcontainers. DemandSurvey creates1novel table and Assessment is empty, retained.

Verification pending: backend compile, contracts and integration suites, freshDB migration.
