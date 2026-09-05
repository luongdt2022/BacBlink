DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'platform') THEN
        CREATE SCHEMA platform;
    END IF;
END $EF$;
CREATE TABLE IF NOT EXISTS platform.__ef_migrations_history (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___ef_migrations_history" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'dataroom') THEN
            CREATE SCHEMA dataroom;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'identity') THEN
            CREATE SCHEMA identity;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'brokerage') THEN
            CREATE SCHEMA brokerage;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'audit') THEN
            CREATE SCHEMA audit;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'casework') THEN
            CREATE SCHEMA casework;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'communication') THEN
            CREATE SCHEMA communication;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'matching') THEN
            CREATE SCHEMA matching;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'demand') THEN
            CREATE SCHEMA demand;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'platform') THEN
            CREATE SCHEMA platform;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'policy') THEN
            CREATE SCHEMA policy;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'content') THEN
            CREATE SCHEMA content;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
        IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'technology') THEN
            CREATE SCHEMA technology;
        END IF;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE dataroom.access_grants (
        id uuid NOT NULL,
        subject_kind character varying(40) NOT NULL,
        subject_id uuid NOT NULL,
        grantee_person_id uuid NOT NULL,
        purpose character varying(60) NOT NULL,
        ceiling character varying(30) NOT NULL,
        valid_from timestamp with time zone NOT NULL,
        valid_to timestamp with time zone,
        revoked_at timestamp with time zone,
        issued_by_actor_ref uuid,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_access_grants PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE identity.activation_tokens (
        id uuid NOT NULL,
        person_id uuid NOT NULL,
        token character varying(255) NOT NULL,
        expires_at timestamp with time zone NOT NULL,
        consumed_at timestamp with time zone,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_activation_tokens PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE brokerage.assignments (
        id uuid NOT NULL,
        case_id uuid NOT NULL,
        broker_person_id uuid NOT NULL,
        role character varying(20) NOT NULL,
        status character varying(20) NOT NULL,
        assigned_at timestamp with time zone NOT NULL,
        sla_due_at timestamp with time zone,
        ended_at timestamp with time zone,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_assignments PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE audit.audit_events (
        id uuid NOT NULL,
        actor_ref uuid,
        actor_role character varying(20) NOT NULL,
        action character varying(100) NOT NULL,
        object_kind character varying(60) NOT NULL,
        object_id uuid,
        object_version integer,
        purpose character varying(60),
        outcome character varying(20) NOT NULL,
        rule_id character varying(120),
        correlation_id character varying(100) NOT NULL,
        ip_address character varying(64),
        user_agent character varying(512),
        details character varying(4000),
        occurred_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_audit_events PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE brokerage.broker_profiles (
        id uuid NOT NULL,
        person_id uuid NOT NULL,
        status character varying(20) NOT NULL,
        capacity integer NOT NULL,
        sector_ids uuid[] NOT NULL,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_broker_profiles PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE communication.case_invitations (
        id uuid NOT NULL,
        requester_kind character varying(40) NOT NULL,
        requester_id uuid NOT NULL,
        target_kind character varying(40) NOT NULL,
        target_id uuid NOT NULL,
        requester_person_id uuid NOT NULL,
        target_person_id uuid NOT NULL,
        message character varying(1000),
        status character varying(20) NOT NULL,
        responded_at timestamp with time zone,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_case_invitations PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE casework.commercialization_cases (
        id uuid NOT NULL,
        case_code character varying(30) NOT NULL,
        track character varying(40) NOT NULL,
        stage character varying(40) NOT NULL,
        title character varying(255) NOT NULL,
        problem_owner_person_id uuid NOT NULL,
        lead_broker_person_id uuid,
        demand_brief_id uuid NOT NULL,
        demand_brief_version_no integer NOT NULL,
        policy_snapshot_id uuid,
        confidentiality_level character varying(30) NOT NULL,
        budget_path_status character varying(30) NOT NULL,
        target_decision_at timestamp with time zone,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_commercialization_cases PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE matching.content_chunks (
        id uuid NOT NULL,
        subject_kind character varying(40) NOT NULL,
        subject_id uuid NOT NULL,
        index integer NOT NULL,
        text text NOT NULL,
        embedding real[] NOT NULL,
        embedding_model_version character varying(60) NOT NULL,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_content_chunks PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE demand.demand_briefs (
        id uuid NOT NULL,
        owner_person_id uuid,
        status character varying(20) NOT NULL,
        current_version_no integer NOT NULL,
        ai_title character varying(255),
        ai_processed_content text,
        ai_processing_status character varying(20),
        ai_chunking_status character varying(20),
        sector_ids uuid[] NOT NULL,
        category_id uuid,
        deleted_at timestamp with time zone,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_demand_briefs PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE dataroom.documents (
        id uuid NOT NULL,
        subject_kind character varying(40) NOT NULL,
        subject_id uuid NOT NULL,
        owner_person_id uuid,
        kind character varying(30) NOT NULL,
        file_type character varying(30) NOT NULL,
        classification character varying(30) NOT NULL,
        section_code character varying(60),
        current_version_no integer NOT NULL,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_documents PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE platform.idempotency_records (
        key character varying(200) NOT NULL,
        actor_ref uuid,
        request_hash character varying(64) NOT NULL,
        status_code integer NOT NULL,
        response_body text,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_idempotency_records PRIMARY KEY (key)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE platform.job_queue (
        id uuid NOT NULL,
        kind character varying(400) NOT NULL,
        payload jsonb NOT NULL,
        enqueued_at timestamp with time zone NOT NULL,
        run_after timestamp with time zone NOT NULL,
        dedup_key character varying(300),
        attempts integer NOT NULL,
        max_attempts integer NOT NULL,
        locked_until timestamp with time zone,
        completed_at timestamp with time zone,
        failed_at timestamp with time zone,
        last_error text,
        correlation_id text,
        CONSTRAINT pk_job_queue PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE matching.match_rounds (
        id uuid NOT NULL,
        subject_kind character varying(40) NOT NULL,
        subject_id uuid NOT NULL,
        search_engine_version character varying(120) NOT NULL,
        embedding_model_version character varying(60) NOT NULL,
        scoring_mode character varying(40) NOT NULL,
        query_text text,
        is_authoritative boolean NOT NULL,
        completed_at timestamp with time zone NOT NULL,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_match_rounds PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE communication.notifications (
        id uuid NOT NULL,
        person_id uuid NOT NULL,
        type character varying(60) NOT NULL,
        payload jsonb NOT NULL,
        is_read boolean NOT NULL,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_notifications PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE platform.outbox_messages (
        id uuid NOT NULL,
        type character varying(400) NOT NULL,
        payload jsonb NOT NULL,
        occurred_at timestamp with time zone NOT NULL,
        processed_at timestamp with time zone,
        attempts integer NOT NULL,
        locked_until timestamp with time zone,
        last_error text,
        correlation_id text,
        CONSTRAINT pk_outbox_messages PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE identity.password_reset_tokens (
        id uuid NOT NULL,
        person_id uuid NOT NULL,
        token character varying(255) NOT NULL,
        expires_at timestamp with time zone NOT NULL,
        consumed_at timestamp with time zone,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE identity.persons (
        id uuid NOT NULL,
        email character varying(255) NOT NULL,
        password_hash character varying(255) NOT NULL,
        password_hash_algorithm character varying(20) NOT NULL,
        previous_password_hash character varying(255),
        previous_password_hash_algorithm character varying(20),
        first_name character varying(100),
        last_name character varying(100),
        phone character varying(20),
        organization_name character varying(255),
        platform_role character varying(20) NOT NULL,
        is_active boolean NOT NULL,
        matching_auto boolean NOT NULL,
        preferences_updated_at timestamp with time zone NOT NULL,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_persons PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE policy.policy_snapshots (
        id uuid NOT NULL,
        case_id uuid NOT NULL,
        resolved_at timestamp with time zone NOT NULL,
        platform_policy_version character varying(50) NOT NULL,
        track_policy_version character varying(50) NOT NULL,
        document_json jsonb NOT NULL,
        document_hash character varying(64) NOT NULL,
        canonicalization_version character varying(20) NOT NULL,
        supersedes_id uuid,
        supersede_decision_record_id uuid,
        is_current boolean NOT NULL,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_policy_snapshots PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE platform.scheduled_obligations (
        id uuid NOT NULL,
        case_id uuid,
        kind character varying(100) NOT NULL,
        due_at timestamp with time zone NOT NULL,
        timezone_for_display text NOT NULL,
        payload_ref uuid,
        state character varying(30) NOT NULL,
        fired_at timestamp with time zone,
        acknowledged_at timestamp with time zone,
        attempts integer NOT NULL,
        last_error text,
        cancel_reason text,
        cancelled_by_actor_ref uuid,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_scheduled_obligations PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE matching.search_query_logs (
        id uuid NOT NULL,
        actor_ref uuid,
        query_text text NOT NULL,
        target_kind character varying(40),
        sector_ids uuid[] NOT NULL,
        min_score double precision NOT NULL,
        "limit" integer NOT NULL,
        scoring_mode character varying(40) NOT NULL,
        engine_version character varying(120) NOT NULL,
        result_subject_ids uuid[] NOT NULL,
        took_ms bigint NOT NULL,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_search_query_logs PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE content.stories (
        id uuid NOT NULL,
        author_person_id uuid NOT NULL,
        title character varying(255) NOT NULL,
        type character varying(20) NOT NULL,
        content text NOT NULL,
        lesson text,
        status character varying(20) NOT NULL,
        is_hidden boolean NOT NULL,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_stories PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE policy.taxonomy_terms (
        id uuid NOT NULL,
        kind character varying(30) NOT NULL,
        name character varying(255) NOT NULL,
        is_active boolean NOT NULL,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_taxonomy_terms PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE technology.technology_assets (
        id uuid NOT NULL,
        owner_person_id uuid,
        publication_status character varying(20) NOT NULL,
        quality_level character varying(30) NOT NULL,
        current_version_no integer NOT NULL,
        ai_title character varying(255),
        ai_processed_content text,
        ai_processing_status character varying(20),
        ai_chunking_status character varying(20),
        sector_ids uuid[] NOT NULL,
        category_id uuid,
        deleted_at timestamp with time zone,
        version integer NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        legacy_source_system character varying(50),
        legacy_source_table character varying(80),
        legacy_id character varying(100),
        legacy_source_hash character varying(64),
        legacy_migrated_at timestamp with time zone,
        legacy_mapping_version character varying(30),
        legacy_batch_id uuid,
        CONSTRAINT pk_technology_assets PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE casework.case_holds (
        id uuid NOT NULL,
        case_id uuid NOT NULL,
        reason character varying(200) NOT NULL,
        opened_by_actor_ref uuid,
        opened_at timestamp with time zone NOT NULL,
        released_at timestamp with time zone,
        release_decision_record_id uuid,
        CONSTRAINT pk_case_holds PRIMARY KEY (id),
        CONSTRAINT fk_case_holds_commercialization_cases_case_id FOREIGN KEY (case_id) REFERENCES casework.commercialization_cases (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE casework.case_parties (
        id uuid NOT NULL,
        case_id uuid NOT NULL,
        person_id uuid NOT NULL,
        role character varying(40) NOT NULL,
        since timestamp with time zone NOT NULL,
        until timestamp with time zone,
        CONSTRAINT pk_case_parties PRIMARY KEY (id),
        CONSTRAINT fk_case_parties_commercialization_cases_case_id FOREIGN KEY (case_id) REFERENCES casework.commercialization_cases (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE casework.decision_records (
        id uuid NOT NULL,
        case_id uuid NOT NULL,
        from_stage character varying(40) NOT NULL,
        to_stage character varying(40) NOT NULL,
        decision character varying(30) NOT NULL,
        reason_codes text[] NOT NULL,
        rationale character varying(4000) NOT NULL,
        decided_by_actor_ref uuid NOT NULL,
        mandate_ref character varying(200),
        evidence_refs text[] NOT NULL,
        policy_snapshot_id uuid,
        decided_at timestamp with time zone NOT NULL,
        supersedes_id uuid,
        signature_ref character varying(200),
        CONSTRAINT pk_decision_records PRIMARY KEY (id),
        CONSTRAINT fk_decision_records_commercialization_cases_case_id FOREIGN KEY (case_id) REFERENCES casework.commercialization_cases (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE demand.demand_brief_versions (
        id uuid NOT NULL,
        demand_brief_id uuid NOT NULL,
        version_no integer NOT NULL,
        title character varying(255) NOT NULL,
        problem_statement text,
        created_by_actor_ref uuid,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_demand_brief_versions PRIMARY KEY (id),
        CONSTRAINT fk_demand_brief_versions_demand_briefs_demand_brief_id FOREIGN KEY (demand_brief_id) REFERENCES demand.demand_briefs (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE dataroom.document_versions (
        id uuid NOT NULL,
        document_id uuid NOT NULL,
        version_no integer NOT NULL,
        file_name character varying(255),
        storage_key character varying(500),
        content_type character varying(120),
        size bigint,
        text_content text,
        sha256 character varying(64) NOT NULL,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_document_versions PRIMARY KEY (id),
        CONSTRAINT fk_document_versions_documents_document_id FOREIGN KEY (document_id) REFERENCES dataroom.documents (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE matching.match_candidates (
        id uuid NOT NULL,
        round_id uuid NOT NULL,
        candidate_kind character varying(40) NOT NULL,
        candidate_id uuid NOT NULL,
        raw_score double precision NOT NULL,
        matched_chunk text NOT NULL,
        chunk_index integer NOT NULL,
        rank integer NOT NULL,
        reason character varying(120),
        computed_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_match_candidates PRIMARY KEY (id),
        CONSTRAINT fk_match_candidates_match_rounds_round_id FOREIGN KEY (round_id) REFERENCES matching.match_rounds (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE TABLE technology.technology_package_versions (
        id uuid NOT NULL,
        technology_asset_id uuid NOT NULL,
        version_no integer NOT NULL,
        title character varying(255) NOT NULL,
        description text,
        created_by_actor_ref uuid,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_technology_package_versions PRIMARY KEY (id),
        CONSTRAINT "fk_technology_package_versions_technology_assets_technology_as~" FOREIGN KEY (technology_asset_id) REFERENCES technology.technology_assets (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_access_grants_subject_kind_subject_id_grantee_person_id ON dataroom.access_grants (subject_kind, subject_id, grantee_person_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_activation_tokens_expires_at ON identity.activation_tokens (expires_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_activation_tokens_person_id ON identity.activation_tokens (person_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE UNIQUE INDEX ix_activation_tokens_token ON identity.activation_tokens (token);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_assignments_broker_person_id_status ON brokerage.assignments (broker_person_id, status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_assignments_case_id ON brokerage.assignments (case_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_audit_events_actor_ref_occurred_at ON audit.audit_events (actor_ref, occurred_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_audit_events_object_kind_object_id ON audit.audit_events (object_kind, object_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_audit_events_occurred_at ON audit.audit_events (occurred_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE UNIQUE INDEX ix_broker_profiles_person_id ON brokerage.broker_profiles (person_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_case_holds_case_id_released_at ON casework.case_holds (case_id, released_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_case_invitations_requester_kind_requester_id_status ON communication.case_invitations (requester_kind, requester_id, status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_case_invitations_requester_person_id ON communication.case_invitations (requester_person_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_case_invitations_target_kind_target_id_status ON communication.case_invitations (target_kind, target_id, status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_case_invitations_target_person_id ON communication.case_invitations (target_person_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_case_parties_case_id_person_id_role ON casework.case_parties (case_id, person_id, role);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE UNIQUE INDEX ix_commercialization_cases_case_code ON casework.commercialization_cases (case_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_commercialization_cases_lead_broker_person_id ON casework.commercialization_cases (lead_broker_person_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_commercialization_cases_problem_owner_person_id ON casework.commercialization_cases (problem_owner_person_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_commercialization_cases_stage ON casework.commercialization_cases (stage);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE UNIQUE INDEX ix_content_chunks_subject_kind_subject_id_index ON matching.content_chunks (subject_kind, subject_id, index);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_decision_records_case_id_decided_at ON casework.decision_records (case_id, decided_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE UNIQUE INDEX ix_demand_brief_versions_demand_brief_id_version_no ON demand.demand_brief_versions (demand_brief_id, version_no);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_demand_briefs_deleted_at ON demand.demand_briefs (deleted_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_demand_briefs_owner_person_id ON demand.demand_briefs (owner_person_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_demand_briefs_status ON demand.demand_briefs (status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE UNIQUE INDEX ix_document_versions_document_id_version_no ON dataroom.document_versions (document_id, version_no);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_document_versions_storage_key ON dataroom.document_versions (storage_key);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_documents_subject_kind_subject_id ON dataroom.documents (subject_kind, subject_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_documents_subject_kind_subject_id_section_code ON dataroom.documents (subject_kind, subject_id, section_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_idempotency_records_created_at ON platform.idempotency_records (created_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_job_queue_completed_at_failed_at_run_after ON platform.job_queue (completed_at, failed_at, run_after);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE UNIQUE INDEX ix_job_queue_dedup_key ON platform.job_queue (dedup_key) WHERE dedup_key IS NOT NULL AND completed_at IS NULL AND failed_at IS NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_match_candidates_candidate_kind_candidate_id ON matching.match_candidates (candidate_kind, candidate_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_match_candidates_round_id_rank ON matching.match_candidates (round_id, rank);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_match_rounds_subject_kind_subject_id_created_at ON matching.match_rounds (subject_kind, subject_id, created_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_match_rounds_subject_kind_subject_id_is_authoritative ON matching.match_rounds (subject_kind, subject_id, is_authoritative);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_notifications_person_id_created_at ON communication.notifications (person_id, created_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_notifications_person_id_is_read ON communication.notifications (person_id, is_read);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_outbox_messages_processed_at_occurred_at ON platform.outbox_messages (processed_at, occurred_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_password_reset_tokens_expires_at ON identity.password_reset_tokens (expires_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_password_reset_tokens_person_id ON identity.password_reset_tokens (person_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE UNIQUE INDEX ix_password_reset_tokens_token ON identity.password_reset_tokens (token);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE UNIQUE INDEX ix_persons_email ON identity.persons (email);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_persons_platform_role_is_active ON identity.persons (platform_role, is_active);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_policy_snapshots_case_id_is_current ON policy.policy_snapshots (case_id, is_current);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_scheduled_obligations_state_due_at ON platform.scheduled_obligations (state, due_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_search_query_logs_created_at ON matching.search_query_logs (created_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_stories_author_person_id ON content.stories (author_person_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_stories_status_is_hidden ON content.stories (status, is_hidden);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_taxonomy_terms_kind_is_active ON policy.taxonomy_terms (kind, is_active);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_taxonomy_terms_kind_name ON policy.taxonomy_terms (kind, name);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_technology_assets_deleted_at ON technology.technology_assets (deleted_at);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_technology_assets_owner_person_id ON technology.technology_assets (owner_person_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE INDEX ix_technology_assets_publication_status ON technology.technology_assets (publication_status);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    CREATE UNIQUE INDEX ix_technology_package_versions_technology_asset_id_version_no ON technology.technology_package_versions (technology_asset_id, version_no);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM platform.__ef_migrations_history WHERE "MigrationId" = '20260903153427_InitialCreate') THEN
    INSERT INTO platform.__ef_migrations_history ("MigrationId", "ProductVersion")
    VALUES ('20260903153427_InitialCreate', '10.0.0');
    END IF;
END $EF$;
COMMIT;

