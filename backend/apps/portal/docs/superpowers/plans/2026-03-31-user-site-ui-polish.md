# User Site UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the DMST user-facing frontend so the shared shell and key user pages feel cleaner, more consistent, and more professional without changing behavior.

**Architecture:** Update the shared visual system first so global improvements propagate naturally, then apply that system to the three highest-value user pages. Keep scope UI-only by preserving component responsibilities, routes, and data flow while refining layout, spacing, surface styling, and state presentation.

**Tech Stack:** TypeScript, React 18, React Router, Vite, Tailwind CSS, shadcn/ui, lucide-react, sonner

---

## File Structure

- Modify: `src/styles/theme.css`
  - Refine app-level tokens and shared background/surface feel.
- Modify: `src/app/layouts/RootLayout.tsx`
  - Apply improved shell background and content spacing.
- Modify: `src/shared/components/layout/DashboardLayout.tsx`
  - Keep the standalone dashboard shell visually aligned with `RootLayout`.
- Modify: `src/shared/components/navigation/Sidebar.tsx`
  - Improve panel styling, hierarchy, hover, and active states.
- Modify: `src/shared/components/header/PageHeader.tsx`
  - Normalize header surface, spacing, typography, and primary action styling.
- Modify: `src/features/intakes/pages/IntakesPage.tsx`
  - Apply polished container, control bar, and data-table styling.
- Modify: `src/features/marketplace/pages/MarketplacePage.tsx`
  - Apply polished search, tabs, filter column, and result workspace styling.
- Modify: `src/features/settings/pages/SettingsPage.tsx`
  - Apply polished settings panel styling and clearer state presentation.

### Task 1: Shared Visual System

**Files:**
- Modify: `src/styles/theme.css`
- Modify: `src/app/layouts/RootLayout.tsx`
- Modify: `src/shared/components/layout/DashboardLayout.tsx`

- [ ] Step 1: Update shared color/surface tokens in `src/styles/theme.css` for a softer app canvas and cleaner panel feel.
- [ ] Step 2: Apply the new shell background and content treatment in `src/app/layouts/RootLayout.tsx`.
- [ ] Step 3: Mirror the same shell treatment in `src/shared/components/layout/DashboardLayout.tsx`.
- [ ] Step 4: Run lint and visually check that authenticated layout spacing still works on desktop and smaller widths.

### Task 2: Sidebar and Shared Header Polish

**Files:**
- Modify: `src/shared/components/navigation/Sidebar.tsx`
- Modify: `src/shared/components/header/PageHeader.tsx`

- [ ] Step 1: Restyle the sidebar into a clearer panel with refined active, hover, and footer user states.
- [ ] Step 2: Restyle the shared page header so title, description, and actions feel more deliberate and reusable.
- [ ] Step 3: Run lint and manually verify sidebar navigation, user menu, and header action rendering.

### Task 3: Intakes Experience Polish

**Files:**
- Modify: `src/features/intakes/pages/IntakesPage.tsx`

- [ ] Step 1: Group search, filters, and top-level controls into a stronger surface hierarchy.
- [ ] Step 2: Improve table density, row hover affordance, and action menu presentation without changing data logic.
- [ ] Step 3: Run lint and manually verify listing, search debounce, filters, row click, and delete action UI states.

### Task 4: Marketplace Experience Polish

**Files:**
- Modify: `src/features/marketplace/pages/MarketplacePage.tsx`

- [ ] Step 1: Upgrade the page header/search/tabs area to match the new shell.
- [ ] Step 2: Improve the filter sidebar and results workspace so the page feels like one cohesive dashboard.
- [ ] Step 3: Run lint and manually verify tab switching, search input, filters, and result card layout.

### Task 5: Settings Experience Polish

**Files:**
- Modify: `src/features/settings/pages/SettingsPage.tsx`

- [ ] Step 1: Restyle the settings page into a stronger premium panel aligned with the new shell.
- [ ] Step 2: Improve the visual treatment of loading, error, and toggle states without changing save behavior.
- [ ] Step 3: Run lint and manually verify loading, error, and success interaction states.

### Task 6: Final Verification

**Files:**
- Modify: `src/styles/theme.css`
- Modify: `src/app/layouts/RootLayout.tsx`
- Modify: `src/shared/components/layout/DashboardLayout.tsx`
- Modify: `src/shared/components/navigation/Sidebar.tsx`
- Modify: `src/shared/components/header/PageHeader.tsx`
- Modify: `src/features/intakes/pages/IntakesPage.tsx`
- Modify: `src/features/marketplace/pages/MarketplacePage.tsx`
- Modify: `src/features/settings/pages/SettingsPage.tsx`

- [ ] Step 1: Run `npm run lint`.
- [ ] Step 2: Review for responsive layout regressions and inconsistent hard-coded colors introduced during polish.
- [ ] Step 3: Prepare a concise summary of changed surfaces and any remaining visual debt outside the scoped pages.
