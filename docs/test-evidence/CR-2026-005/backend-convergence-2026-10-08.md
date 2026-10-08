# Backend convergence — 2026-10-08

Real solution run after province lookup module registration repair: **272/272 PASS**.

| Suite | Passed | Failed |
|---|---:|---:|
| Architecture | 7 | 0 |
| Authorization | 47 | 0 |
| Contracts (including 5 new persistence regressions) | 42 | 0 |
| PostgreSQL integration | 84 | 0 |
| Invariants | 92 | 0 |

Command: `dotnet test NacenTech.slnx --disable-build-servers -m:1` with TRX logger.
TRX logs: `/private/tmp/nacen-delta-backend-converge/`; console: `/private/tmp/nacen-delta-backend-converge.log`.

Fresh isolated PostgreSQL containers apply actual migrations. Existing clone black-box evidence is separate. This technical result predates subsequent draft handoff and audit serialization changes, which require another run. Gate 4 and Gate 5 remain open.
