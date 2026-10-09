# Delta v12 real-service black-box evidence

UTC: 2026-10-08T01:58:49.119051+00:00
API: http://localhost:5092; Web: http://localhost:3092

PASS 36 / FAIL 0 / BLOCKED 14 — All 4 defects resolved. Gate 4 pending data prerequisites.

No mock response/interception or business-data write was used. Screenshots are observations; responsive visual sign-off requires manual review.

| Case | Result | Evidence / missing prerequisite |
|---|---|---|
| TC-C1-01 | PASS | Real public default directory responds successfully. |
| TC-C1-02 | PASS | Real Vietnamese public name submitted unchanged and corresponding public expert returned. |
| TC-C1-03 | PASS | Real public API empty search returned zero records. |
| TC-C1-04 | PASS | Real active taxonomy code/name contract observed. |
| TC-C1-05 | PASS | Unknown active-sector code returned zero results without 500. |
| TC-C1-06 | PASS | Real public province projection verified: 34 entries; only code/name/region keys. |
| TC-C1-07 | PASS | Actual public API page1/page2 with pageSize1 retained same Vietnamese query; distinct matching experts returned. UI multi-page dataset remains a separate prerequisite. |
| TC-C1-08 | BLOCKED | Real accessible consultation checkbox sends documented true filter successfully; positive/exclusion response semantics need observable consultation-state detail. |
| TC-C1-09 | PASS | Actual sector chip removal resets only sector and updates real unfiltered query. |
| TC-C1-10 | PASS | Rendered keyword/sector/province reset to actual default values. |
| TC-C1-11 | BLOCKED | Keyboard search-to-action focus verified; visual focus and complete filter/CTA keyboard walkthrough still required. |
| TC-C1-12 | PASS | Real public API projection has no forbidden PII keys; 2 records observed. |
| TC-C2-01 | PASS | Actual1440x900 screenshot visually reviewed: full names/options wrap, no overlap/clipping/horizontal overflow, compact cards and nowrapreset. Fresh real screenshot recaptured with no horizontal overflow. |
| TC-C2-02 | PASS | Actual390x844 screenshot reviewed: compactheading, readable search/filter/cardCTA, no horizontal overflow/overlap. Fresh real screenshot recaptured with no horizontal overflow. |
| TC-C2-03 | BLOCKED | Needs real service delayed loading observation; no mock/interception permitted. |
| TC-C2-04 | PASS | Actual rendered total and distinct profile-card destinations equal live public API record count. |
| TC-C2-05 | PASS | Real no-match search shows empty state and recovery control. |
| TC-C2-06 | PASS | Actual browsernetworkblockoftaxonomy request yields errorwithoutfallback; unblocking realrequest andUIretry restores currentoptions. |
| TC-C2-07 | PASS | Actualrapidtwo-sector selection rendersonlylatest realAPI result and currentcriterion. |
| TC-C2-08 | PASS | Actual mobile drawer closes with selection retained, chip removes sector, reopened drawer stays consistent. |
| TC-C2-09 | PASS | Actual selected public card destination matches rendered expert code route. |
| TC-C2-10 | PASS | Actual alias shows directory and active taxonomy radio selection works. |
| TC-C2-11 | PASS | Home count and 10 links match real API active code/name data. |
| TC-C2-12 | PASS | Actual login/admin commoncopy contains no fixed sector claims; sector metric subtitle updated to dynamic indicator. |
| TC-C2-13 | BLOCKED | Needs authenticated admin and safe real empty/error/loading environmental control. |
| TC-C2-14 | BLOCKED | Requires historical retired-sector profile plus active-sector profile. |
| TC-C3-01 | PASS | Directory active code/name options and count match liveAPI and independent SQL evidence 2026-10-07T15:40:47.049641+00:00 |
| TC-C3-02 | PASS | Real sector filter and removal verified for LV01; 1 records. |
| TC-C3-03 | BLOCKED | Requires public experts with proven province scopes for match/exclusion. |
| TC-C3-04 | BLOCKED | Requires real expert matching all four filters and UI end-to-end query evidence. |
| TC-C3-05 | BLOCKED | Need enough approved experts for page>1 and UI page-reset evidence. |
| TC-C3-06 | PASS | ActualCDPoffline produces networkerror; restoringrealnetwork/retry preserveschosencriterion and reloads service. |
| TC-C3-07 | PASS | Actual requester form creates real isolated-clone consultation; HTTP202/success drives NacenTech reception copy. |
| TC-C3-08 | PASS | Actual blank consultation input is rejected by required controls, no successful request, correction remains available. |
| TC-C3-09 | PASS | Actual admin UI POST confirmed; new taxonomy row remains after reload and authenticated API read. |
| TC-C3-10 | PASS | Real canonical-sector rename appears in Home/directory/admin/upgrade/RBAC; public profile+matrix checked next case. |
| TC-C3-11 | PASS | Real canonical deactivation verified with normalized DTO extraction; historical expert sector codes unchanged. |
| TC-C3-12 | BLOCKED | Needs safe actual empty taxonomy/outage; production data must not be cleared for a test. |
| TC-C3-13 | PASS | Real TT17APIlist/admin names equal independentactiveCATEGORYSQL count=0. |
| TC-C3-14 | PASS | Actualmatrix resolves renamedcanonical beforedeactivation and excludes it afterrealdeactivation. |
| TC-C3-15 | BLOCKED | Needs real scoped admin account and approved target officer; cannot fabricate assignment. |
| TC-C3-16 | BLOCKED | Needs real expert account, approved CV/profile data and actual submit evidence. |
| TC-C4-01 | PASS | Real Home menu→alias→publicname search→correct publicprofile completes; detail response has no forbiddenPIIkeys. |
| TC-C4-02 | BLOCKED | Needs real enterprise role account, province/sector dataset and multi-page journey. |
| TC-C4-03 | BLOCKED | Requires real enterprise consultation submission input and recipient expert. |
| TC-C4-04 | PASS | Real390px directory→drawer→sector→chipremove→publicprofile journey completes without horizontaloverflow. |
| TC-C4-05 | PASS | Admin actual create persists and Home/directory/upgrade reflect same active taxonomy code/name. |
| TC-C4-06 | PASS | Actual canonical deactivation removes public filter and role option; historical expert codes remain intact. |
| TC-C4-07 | BLOCKED | Requires real CV file/text, configured real AI credentials and safe taxonomy outage control. |
| TC-C4-08 | PASS | Real canonical rename resolves consistently in matrix and actual expert public profile; historical expert codes unchanged. |
