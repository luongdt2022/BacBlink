# Quickstart: User Settings Screen

## Prerequisites

- Dev server running (`npm run dev`)
- Backend running at `VITE_API_BASE_URL` (default `http://localhost:3001`) with `003-user-settings` migration applied
- Valid user credentials for login

---

## 1. Navigate to Settings

Log in and click on the user avatar at the bottom-left of the sidebar. In the dropdown menu, click **Cài đặt** (Settings). You should land on `/settings`.

Alternatively, visit `/settings` directly — it redirects to `/login` if not authenticated.

---

## 2. Verify Default State

The Settings page shows the **Tự động khớp (Auto-Matching)** toggle. For a new user it should be **ON** (enabled).

---

## 3. Toggle Auto-Matching Off

Click the toggle. It flips to OFF immediately (optimistic update). A success toast appears at the top. Reload the page — the toggle stays OFF, confirming the setting was persisted.

---

## 4. Verify the Setting Gates Intake Matching

With auto-matching OFF:

1. Create a new intake via `/intakes/create` and publish it.
2. Wait ~30 seconds.
3. Confirm no matching job runs for that intake (check with the backend team or directly in the `intake_matches` table).

Turn auto-matching back ON, publish another intake, and confirm matches appear.

---

## 5. Verify Per-User Isolation

Log in as User A and set auto-matching to OFF.
Log in as User B in a different browser/private window.
Open Settings — User B should see auto-matching ON (default), unaffected by User A's preference.

---

## 6. Error Handling

To test the failure path, stop the backend and try toggling the setting. The toggle should revert to its previous state and an error toast should appear.
