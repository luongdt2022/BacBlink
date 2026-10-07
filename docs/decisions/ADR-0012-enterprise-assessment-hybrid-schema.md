# ADR 0012: Hybrid Architecture (Relational + JSONB) for Enterprise and TT17 Assessment

## Date
2026-10-06

## Status
Accepted

## Context
NacenTech ecosystem needs to manage three highly interconnected but semantically different sets of data:
1. Enterprise Master Data (SSOT)
2. Small & Medium Enterprise (SME) Technology Needs Surveys (TASK-03)
3. Technology Capability Assessments based on Circular 17 (TT17 / TASK-09)

Circular 17 surveys (Phụ lục I) require collecting multi-year (3-year series) financial and workforce data, as well as complex lists (equipment, production lines, digital adoptions). Applying strict 3NF (Third Normal Form) creates over 20+ tables for a single survey submission, causing:
- Heavy `JOIN` penalties.
- High risk of `DbUpdateConcurrencyException` when performing Auto-Save for large draft forms.
- Severe explosion of Entity Change Tracker states in EF Core.

## Decision
We will use a **Hybrid Relational + JSONB architecture** partitioned across 3 PostgreSQL schemas:
1. `enterprise` schema: Stores strictly normalized, flat tables for canonical master data (`enterprises`, `enterprise_sites`, `enterprise_contacts`).
2. `assessment` schema (for TT17): 
   - `tt17_assessment_revisions`: A completely immutable (append-only) snapshot table.
   - We will use PostgreSQL `JSONB` columns (`equipment_b_json`, `production_c_json`, etc.) to store deeply nested arrays/lists of equipment and products. This drastically reduces the number of tables.
   - `tt17_yearly_metrics`: We extract exactly the 10 financial/workforce numerical metrics that are evaluated across the 3-year period into a flat relational table `(revision_id, reporting_year)` to allow ultra-fast EF Core `GroupBy`/`Sum` operations for the automated scoring engine.

## Consequences
- **Positive:** Reduces the number of DB tables from ~35 to exactly 11. Improves auto-save performance of complex forms by serializing sub-arrays into `JSONB`. Enforces immutability for regulatory compliance (Circular 17 submitted forms can never be accidentally modified by master data changes).
- **Negative:** querying inside JSON arrays (e.g., searching for all companies that bought a specific equipment by name inside the JSONB) requires PostgreSQL-specific JSONPath queries (`@>`), bypassing standard EF Core LINQ equality in some advanced scenarios.
