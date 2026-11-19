# Quickstart: Intake Form UX Update

## Prerequisites

- Dev server running (`npm run dev`)
- At least one draft intake and one published intake in the system

---

## 1. Create new intake — default to Nháp

Navigate to the intake create page. In the left sidebar action card:
- Confirm there is **no** "Lưu nháp" button.
- Confirm there is a status selector with two options: **"Nháp"** and **"Công khai"**.
- Confirm **"Nháp"** is pre-selected by default.
- Click **"Lưu"** → intake is created with `status: draft`.

---

## 2. Create new intake — select Công khai

On the create page:
- Select **"Công khai"** in the status selector.
- Enter a title and content.
- Click **"Lưu"** → intake is created with `status: published`.

---

## 3. Edit a draft intake — status selector defaults to Nháp

Open an existing draft intake at `/intakes/edit?id=<draft-id>`:
- Confirm the status selector defaults to **"Nháp"**.
- Change selector to **"Công khai"** and click **"Lưu"** → intake is published.

---

## 4. Edit a published intake — status selector defaults to Công khai

Open an existing published intake at `/intakes/edit?id=<published-id>`:
- Confirm the status selector defaults to **"Công khai"**.
- Optionally change to **"Nháp"** and click **"Lưu"** → intake is reverted to draft.

---

## 5. Validation still works

On the create/edit page with **"Công khai"** selected:
- Clear the content field.
- Click **"Lưu"** → error toast: "Vui lòng nhập nội dung công khai" (content validation still enforced).

---

## 6. Action card is visually prominent

Open any intake form page. Without reading labels, scan the left sidebar:
- The bottom action card should appear visually elevated/distinct from the scrollable form fields above (shadow, separation).
