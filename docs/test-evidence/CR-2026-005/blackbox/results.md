# Delta v12 real-service black-box evidence

UTC: 2026-10-07T15:38:07.270891+00:00
API: http://localhost:5092; Web: http://localhost:3092

PASS 11 / FAIL 2 / BLOCKED 37 — Gate 4 remains OPEN.

No mock response/interception or business-data write was used. Screenshots are observations; responsive visual sign-off requires manual review.

| Case | Result | Evidence / missing prerequisite |
|---|---|---|
| TC-C1-01 | PASS | Real public default directory responds successfully. |
| TC-C1-02 | PASS | Real Vietnamese public name submitted unchanged and corresponding public expert returned. |
| TC-C1-03 | PASS | Real public API empty search returned zero records. |
| TC-C1-04 | PASS | Real active taxonomy code/name contract observed. |
| TC-C1-05 | PASS | Unknown active-sector code returned zero results without 500. |
| TC-C1-06 | PASS | Real public province projection verified: 34 entries; only code/name/region keys. |
| TC-C1-07 | BLOCKED | Need >1 page of approved real experts plus observable UI pagination state. |
| TC-C1-08 | BLOCKED | Need approved experts in both consultation states and full UI interaction. |
| TC-C1-09 | BLOCKED | Need browser chip removal interaction and comparison of actual results. |
| TC-C1-10 | PASS | Rendered keyword/sector/province reset to actual default values. |
| TC-C1-11 | BLOCKED | Keyboard search-to-action focus verified; visual focus and complete filter/CTA keyboard walkthrough still required. |
| TC-C1-12 | PASS | Real public API projection has no forbidden PII keys; 2 records observed. |
| TC-C2-01 | BLOCKED | Real screenshot captured; no horizontal overflow. Manual density/overlap/clipping review required. |
| TC-C2-02 | BLOCKED | Real screenshot captured; no horizontal overflow. Manual density/overlap/clipping review required. |
| TC-C2-03 | BLOCKED | Needs real service delayed loading observation; no mock/interception permitted. |
| TC-C2-04 | BLOCKED | Needs browser grid/count-to-live-response comparison. |
| TC-C2-05 | PASS | Real no-match search shows empty state and recovery control. |
| TC-C2-06 | BLOCKED | Needs controlled real taxonomy outage/recovery authorization and UI retry. |
| TC-C2-07 | BLOCKED | Needs real browser rapid-filter observation, no route mocks. |
| TC-C2-08 | BLOCKED | Needs real mobile drawer and chip interactions. |
| TC-C2-09 | BLOCKED | Needs real card navigation and public profile evidence. |
| TC-C2-10 | BLOCKED | Alias loads real directory; remaining filter usability needs full interaction. |
| TC-C2-11 | PASS | Home count and 10 links match real API active code/name data. |
| TC-C2-12 | BLOCKED | Browser prerequisite missing/unavailable: No module named 'playwright' |
| TC-C2-13 | BLOCKED | Needs authenticated admin and safe real empty/error/loading environmental control. |
| TC-C2-14 | BLOCKED | Needs approved historical retired-sector profile plus active-sector profile. |
| TC-C3-01 | FAIL | Directory option count differs from active API |
| TC-C3-02 | PASS | Real sector filter and removal verified for LV01; 1 records. |
| TC-C3-03 | BLOCKED | Need approved public experts with proven province scopes for match/exclusion. |
| TC-C3-04 | BLOCKED | Need approved real expert matching all four filters and UI end-to-end query evidence. |
| TC-C3-05 | BLOCKED | Need enough approved experts for page>1 and UI page-reset evidence. |
| TC-C3-06 | BLOCKED | Needs authorized controlled real API outage and browser recovery, no mocks. |
| TC-C3-07 | BLOCKED | Needs approved live requester data and permission to create actual consultation request. |
| TC-C3-08 | BLOCKED | Needs approved requester input and UI validation/service refusal; no fake responses. |
| TC-C3-09 | FAIL | locator.waitFor: Timeout 10000ms exceeded. Call log: [2m  - waiting for getByText('LVQC1791387475035', { exact: true }) to be visible[22m  |
| TC-C3-10 | BLOCKED | Needs approved real taxonomy rename, cross-surface reload and restore plan. |
| TC-C3-11 | BLOCKED | Needs approved safe taxonomy deactivation and preserved historical profile evidence. |
| TC-C3-12 | BLOCKED | Needs safe actual empty taxonomy/outage; production data must not be cleared for a test. |
| TC-C3-13 | BLOCKED | Needs category API list + independent DB active-category read to verify count and membership. |
| TC-C3-14 | BLOCKED | Needs approved actual rename/deactivate and matrix replay. |
| TC-C3-15 | BLOCKED | Needs real scoped admin account and approved target officer; cannot fabricate assignment. |
| TC-C3-16 | BLOCKED | Needs real expert account, approved CV/profile data and actual submit evidence. |
| TC-C4-01 | BLOCKED | Alias-to-real-public-profile navigation succeeded; full menu/Vietnamese-search/PII journey remains incomplete. |
| TC-C4-02 | BLOCKED | Needs real enterprise role account, province/sector dataset and multi-page journey. |
| TC-C4-03 | BLOCKED | Needs approved real enterprise consultation submission input and recipient expert. |
| TC-C4-04 | BLOCKED | Needs completed browser mobile drawer/chip/profile journey. |
| TC-C4-05 | BLOCKED | Needs approved real admin mutation then Home/directory/upgrade verification. |
| TC-C4-06 | BLOCKED | Needs authorized real deactivation then filter/RBAC historical preservation verification. |
| TC-C4-07 | BLOCKED | Needs approved real CV file/text, configured real AI credentials and safe taxonomy outage control. |
| TC-C4-08 | BLOCKED | Needs approved actual taxonomy rename and matrix/profile reload verification. |
