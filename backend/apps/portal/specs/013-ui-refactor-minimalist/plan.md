# Implementation Plan: Refactor UI for Modern Minimalist Look

**Branch**: `013-ui-refactor-minimalist` | **Date**: 2026-05-14 | **Spec**: [specs/013-ui-refactor-minimalist/spec.md](specs/013-ui-refactor-minimalist/spec.md)
**Input**: Feature specification for UI refactor based on NACENTECH brand guidelines.

## Summary

The goal is to modernize the application's UI to a minimalist aesthetic using the NACENTECH brand identity. This involves updating the color palette to Teal Green (#00A388), adopting a 60-30-10 color distribution, integrating the Inter font, and refining component spacing and interactions for a cleaner, professional look.

## Technical Context

**Language/Version**: TypeScript / React 18+  
**Primary Dependencies**: Tailwind CSS 4.x, Lucide React, Shadcn UI (Radix), Vite  
**Storage**: N/A (Pure UI/UX change)  
**Testing**: NEEDS CLARIFICATION (No testing framework detected in package.json)  
**Target Platform**: Web (Responsive)
**Project Type**: Web Application  
**Performance Goals**: WCAG 2.1 AA Accessibility, Improved CLS (Cumulative Layout Shift) through stable typography  
**Constraints**: Must strictly follow NACENTECH brand colors; 60-30-10 rule.  
**Scale/Scope**: Global theme updates + Refinement of shared components + Key feature pages (Intakes, Marketplace).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Library-First**: Shared components are stored in `src/shared/components`.
- [x] **II. CLI Interface**: N/A for this UI task.
- [x] **III. Test-First**: NEEDS CLARIFICATION. No test runner is currently set up.
- [x] **IV. Integration Testing**: NEEDS CLARIFICATION.

## Project Structure

### Documentation (this feature)

```text
specs/013-ui-refactor-minimalist/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (CSS variable contract)
└── tasks.md             # Phase 2 output (to be generated)
```

### Source Code (repository root)

```text
src/
├── app/                 # Routing and global layout
├── features/            # Feature-specific components (Intakes, Marketplace, etc.)
├── shared/
│   ├── components/      # Global UI library (Buttons, Tables, etc.)
│   └── styles/          # Theme tokens (theme.css, index.css)
└── main.tsx             # Entry point
```

**Structure Decision**: We will use the existing project structure. Changes will focus on `src/styles/` for global tokens and `src/shared/components/` for UI refinements.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |

---

## Phase 0: Outline & Research

### Tasks

- **Task 0.1**: Research how to integrate `Inter 4.0` font (self-hosted vs. Google Fonts) and update `src/styles/fonts.css`.
- **Task 0.2**: Map NACENTECH color palette to `theme.css` variables, replacing current Blue/Slate defaults.
- **Task 0.3**: Audit `IntakesPage` and `Marketplace` components to identify high-noise decorative elements for removal.
- **Task 0.4**: Research a lightweight visual testing strategy (e.g., adding Vitest + Happy DOM or just manual verification plan).

---

## Phase 1: Design & Contracts

### Tasks

- **Task 1.1**: Define the `data-model.md` for UI tokens (Primary, Secondary, Accent, Muted, Background).
- **Task 1.2**: Create a `contracts/theme-contract.md` documenting the required CSS variables and their semantic usage.
- **Task 1.3**: Update agent context to include the new brand guidelines and minimalist principles.
- **Task 1.4**: Design the "Modern Minimalist" versions of a Button, a Table Row, and a Card.

---

## Phase 2: Implementation (Summary)

*Note: Phase 2 tasks will be detailed in `tasks.md` after /speckit.tasks*

- Update `theme.css` and `tailwind.config`.
- Implement `Inter` font loading.
- Refactor `src/shared/components/ui/` components (Buttons, Inputs, Badges).
- Refactor high-priority pages (`IntakesPage`, `Marketplace`).
- Validate accessibility and responsive behavior.
