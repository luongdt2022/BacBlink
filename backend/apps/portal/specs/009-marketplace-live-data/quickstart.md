# Quickstart: Marketplace Live Data

## Prerequisites

- Frontend dev server running
- User authenticated
- Backend running with `/api/v1/my/intakes?page=1&limit=10` and `/api/v1/sectors`
- At least one `ip` intake and one `challenge` intake available in the returned data
- At least one intake without `profilePicUrl`

---

## 1. Verify Marketplace uses live data

Open `/marketplace`.

**Expected**:
- The page no longer shows the old mock content set
- Results are populated from the live intake dataset
- The result counts reflect the actual visible cards

---

## 2. Verify IP tab shows only IP records

Stay on the default IP tab.

**Expected**:
- Only `ip` records appear
- No challenge records are mixed into the IP result grid

---

## 3. Verify Challenge tab shows only challenge records

Switch to `Thị trường Bài toán`.

**Expected**:
- Only `challenge` records appear
- No IP records are mixed into the challenge list

---

## 4. Verify sector filters load from live sector data

Inspect the filter area in either tab.

**Expected**:
- Sector filter options are present
- The options correspond to the live sector dataset rather than hard-coded marketplace-only labels

---

## 5. Verify sector filtering updates visible results

Select one or more sectors.

**Expected**:
- The visible cards narrow to records associated with the selected sectors
- The result count updates to match the visible set

---

## 6. Verify search works with live data

Enter a keyword that matches only some returned records.

**Expected**:
- The visible live result set narrows accordingly
- Search combines correctly with the active sector filters

---

## 7. Verify unsupported filters are removed

Inspect the filter column for both tabs.

**Expected**:
- `Mức độ TRL` is absent
- `Đơn vị` is absent
- `Nguồn cung (Giải pháp công nghệ)` is absent
- `Ngân sách` is absent

---

## 8. Verify default image fallback

Find a record whose intake has no image.

**Expected**:
- Its card still shows a valid image area
- A default placeholder image is displayed instead of a broken image

---

## 9. Verify empty state when a tab has no results

Use filters or data conditions so one tab has no visible records.

**Expected**:
- The tab shows an empty state
- No mock records appear as fallback content

---

## 10. Verify Marketplace remains usable if sector data is unavailable

Simulate sector API failure while the intake list still succeeds.

**Expected**:
- Live records still render
- The sector filter area does not fall back to outdated hard-coded filter choices
