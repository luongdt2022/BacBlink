# Quickstart: Intake Match Tab Refresh

## Prerequisites

- Frontend dev server running
- A published intake that can be opened in the detail page
- One test intake with existing matches
- One test intake with no matches yet

---

## 1. Verify the matching tab is visible and prominent

Open `/intakes/detail?id=<published-intake-with-matches>`.

**Expected**:
- The page shows a dedicated matching tab in the main tab area
- The matching tab is visually more prominent than a normal informational subsection
- The tab label reflects the intake type (`Nhu cầu phù hợp` for IP, `Giải pháp phù hợp` for Challenge)

---

## 2. Verify the tab exposes current result count

Stay on the same page with existing matches.

**Expected**:
- The matching tab itself shows that results already exist
- The visible count matches the number of items displayed inside the tab

---

## 3. Verify users can open results in one click

Click the matching tab.

**Expected**:
- The tab content opens immediately
- Existing matched items are shown in the main content area
- The results no longer feel like a secondary section hidden at the bottom of the page

---

## 4. Verify empty state for an intake with no matches

Open `/intakes/detail?id=<published-intake-without-matches>` and click the matching tab.

**Expected**:
- The matching tab is still visible
- The content shows a clear empty state indicating that no suitable results have been found yet
- The page still exposes a clear way to trigger matching

---

## 5. Verify redesigned match-search action

On a published intake detail page, inspect the right sidebar.

**Expected**:
- The match-search action looks like a primary CTA rather than a generic utility button
- Its copy and styling clearly communicate the purpose of finding suitable counterpart results

---

## 6. Verify first-time matching does not require confirmation

Use a published intake with no current matches and click the redesigned match-search action.

**Expected**:
- No confirmation popup appears
- Matching starts immediately
- The action enters a loading/progress state

---

## 7. Verify rerun confirmation when matches already exist

Use a published intake that already has at least one current match and click the redesigned match-search action.

**Expected**:
- A confirmation popup appears before any new search starts
- The popup explains that the system will search again for the current intake

---

## 8. Verify cancel preserves current state

With the confirmation popup open, click cancel or close the popup.

**Expected**:
- The popup closes
- No new matching request is triggered
- The current result list remains unchanged

---

## 9. Verify confirm starts rerun

Open the confirmation popup again and choose confirm.

**Expected**:
- The popup closes
- Matching starts
- The action shows the normal in-progress feedback

---

## 10. Verify duplicate requests are prevented

While matching is already in progress, click the action repeatedly.

**Expected**:
- The action remains disabled or otherwise unavailable during processing
- No duplicate rerun is triggered
