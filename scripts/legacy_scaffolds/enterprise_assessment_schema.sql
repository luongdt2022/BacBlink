CREATE SCHEMA IF NOT EXISTS enterprise;
CREATE SCHEMA IF NOT EXISTS assessment;

CREATE TABLE IF NOT EXISTS enterprise.enterprises (
    id UUID PRIMARY KEY,
    tax_code VARCHAR(20) UNIQUE NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    subject_type VARCHAR(30) NOT NULL,
    legal_form_code VARCHAR(30) NOT NULL,
    established_date DATE,
    headquarters_address TEXT NOT NULL,
    province_code VARCHAR(10) NOT NULL,
    district_code VARCHAR(10),
    organization_email VARCHAR(150),
    organization_phone VARCHAR(30),
    website_url VARCHAR(255),
    primary_industry_code VARCHAR(20),
    verification_status VARCHAR(30) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment.tt17_assessments (
    id UUID PRIMARY KEY,
    enterprise_id UUID NOT NULL REFERENCES enterprise.enterprises(id),
    assessment_year INT NOT NULL,
    scope_type VARCHAR(30) NOT NULL,
    target_site_id UUID,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment.tt17_assessment_revisions (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessment.tt17_assessments(id),
    revision_no INT NOT NULL,
    reporter_info JSONB,
    enterprise_snapshot JSONB,
    equipment_b_json JSONB,
    production_c_json JSONB,
    management_d_json JSONB,
    rd_innovation_e_json JSONB,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_by UUID NOT NULL,
    UNIQUE (assessment_id, revision_no)
);

CREATE TABLE IF NOT EXISTS assessment.tt17_yearly_metrics (
    revision_id UUID NOT NULL REFERENCES assessment.tt17_assessment_revisions(id),
    reporting_year INT NOT NULL,
    production_value_gsp DECIMAL(18,2),
    qualified_value_gd DECIMAL(18,2),
    revenue_gdt DECIMAL(18,2),
    total_cost_gcp DECIMAL(18,2),
    energy_cost_gnl DECIMAL(18,2),
    training_cost_gdthl DECIMAL(18,2),
    rd_cost_grd DECIMAL(18,2),
    it_cost_gtt DECIMAL(18,2),
    workforce_m INT,
    workforce_mtt INT,
    workforce_mbc INT,
    workforce_mql INT,
    workforce_mnv INT,
    PRIMARY KEY (revision_id, reporting_year)
);
