# Quickstart: Manual Intake Match Button

## Prerequisites

- Dev server running (`npm run dev`)
- Backend running with BGE-M3 embedding server and Elasticsearch available
- At least one own published intake in the system

---

## 1. Open an own published intake

Navigate to `/intakes`, click on a published intake to open its detail page at `/intakes/detail?id=<uuid>`.

---

## 2. Locate the Match button in the right sidebar

In the right info panel (the narrow column on the right), you should see a prominent **"Tìm kiếm giải pháp phù hợp"** button with a Sparkles icon, styled in the primary filled colour. It appears above (or after) the info metadata section.

---

## 3. Click the button

Click the button. Immediately (within 300ms) a loading toast appears:
> "Hệ thống đang xử lý, vui lòng chờ giây lát..."

The button becomes disabled and shows a loading state while the request is in-flight.

---

## 4. Verify success notification

When the response arrives, the loading toast is replaced by a success toast:
> "Tìm thấy N kết quả phù hợp" (where N is the matchCount from the API)

The button is re-enabled.

---

## 5. Verify draft intakes do not show the button

Navigate to a draft intake's detail page. Confirm the "Tìm kiếm giải pháp phù hợp" button is **not** displayed in the right sidebar.

---

## 6. Verify error handling

Stop the backend (or disconnect the network) and click the button on a published intake. The loading toast should be replaced with an error toast:
> "Không thể tìm kiếm kết quả. Vui lòng thử lại."

The button is re-enabled for retry.
