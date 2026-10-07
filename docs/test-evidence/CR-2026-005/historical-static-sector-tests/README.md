# Historical baseline test snapshots

These `.snapshot` files preserve pre-Delta v12 tests outside the runnable suite. The previous fixed 10-sector/count/name assertions were superseded by PO-approved CR-2026-005 dynamic runtime taxonomy requirements. CV parser test credential literal was sanitized to an inert dummy value.

Replacement tests are QC-authored mocked component / route / SDK regressions, **not** real-service black-box tests and **not** evidence for PostgreSQL or Gate 4 sign-off. Expectations are runtime count/code/name fidelity, active-only count, empty/error without seed fallback, failed writes without local success, prompt sourced from current sectors and rejection of out-of-taxonomy AI values.

Focused run 2026-10-07: 3 files, 15 cases PASS; log `/private/tmp/delta-qc-focused-final.log`. Runtime SDK tests reported separately.
