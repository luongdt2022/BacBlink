# DD-07 — Role assignment Delta v12

Scope: CR-2026-005, TASK07 T032–T034. Read-only officer listing and existing assignment operate on persisted Identity Person records, no local roster.

- GET `/api/v1/governance/roles/officers`: authenticated SUPER_ADMIN/OPERATOR_ADMIN/ADMIN only; GLOBAL actor scope required. `{success:true,data:[{id,name,email,role,scopeType,scopeId,assignedAt}]}` includes current administrative-role records; assignedAt null until audit records ASSIGN_ROLE and then the latest audit timestamp. No password/contact fields other than required email.
- POST existing `/api/v1/governance/roles/assign`: same admin authorization, reject noncanonical role/scope combinations; SECTOR scope must match an active SECTOR taxonomy code. GLOBAL scopeId null. Role selector derives scope from canonical rules (CLUSTER_ADMIN uses ORG_UNIT). Existing response retained; audit persisted before success.
- UI saves remotely before announcing success and reloads roster. Network/envelope/auth errors remain visible with retry. Empty sectors disable assignment. Sector names resolve through shared active taxonomy; unavailable/inactive historical values keep their code for transparency.

Verification pending: runtime GET/POST authorization, invalid/inactive sector rejection, successful persistence/reload and FE loading/error/empty transitions.
