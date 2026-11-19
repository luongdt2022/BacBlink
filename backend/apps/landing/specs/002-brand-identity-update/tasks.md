# Tasks: Brand Identity Update

**Feature**: Brand Identity Update
**Plan**: [specs/002-brand-identity-update/plan.md]
**Branch**: `002-brand-identity-update`

## Phase 1: Setup

- [x] T001 Create directory `public/fonts/` for self-hosted font assets
- [x] T002 Add Inter-Variable.woff2 and Roboto-Regular.woff2 font files to `public/fonts/`
- [x] T003 Create directory `src/shared/assets/brand/` for official NACENTECH logo assets

## Phase 2: Foundational

- [x] T004 [P] Update `src/styles/fonts.css` with `@font-face` declarations for Inter and Roboto
- [x] T005 [P] Update `:root` in `src/styles/theme.css` with brand OKLCH tokens (`--brand-teal-green`, etc.) and semantic mappings (`--primary`, `--secondary`, etc.)

## Phase 3: User Story 1 - Unified Visual Identity (P1)

**Story Goal**: Visitors see a consistent visual identity matching official brand guidelines.
**Independent Test**: Page uses Inter/Roboto and brand Teal as dominant colors.

- [x] T006 [US1] Update `body` selector in `src/styles/theme.css` to use `--font-sans` and `--foreground` (Deep Teal)
- [x] T007 [US1] Refactor `src/layout/Header.tsx` to use `public/NACENTECH_LOGO.png`
- [x] T008 [US1] Refactor `src/layout/Footer.tsx` to use `public/NACENTECH_LOGO.png`
- [x] T009 [US1] Update `src/features/landing/HeroSection.tsx` to use `--brand-teal-green` for its background
- [x] T010 [US1] Update `src/features/landing/CoreServicesSection.tsx` to use brand-aligned typography and colors

## Phase 4: User Story 2 - Clear Information Hierarchy (P2)

**Story Goal**: Information hierarchy is clear through 60-30-10 color rule and typography.
**Independent Test**: Teal (60%), Olive (30%), Cyan/Blue (10%) distribution verified.

- [x] T011 [US2] Implement the 5-color brand gradient for the background in `src/features/landing/HeroSection.tsx`
- [x] T012 [US2] Refactor `src/shared/ui/button.tsx` to use `--brand-cyan` for primary variant background and `--brand-blue` for hover
- [x] T013 [US2] Apply `--secondary` (Light Olive Green) to `src/features/landing/OffersSection.tsx` background
- [x] T014 [US2] Apply `--secondary` (Light Olive Green) to `src/features/landing/ProcessSection.tsx` background
- [x] T015 [US2] Update `src/features/landing/ProblemSolutionSection.tsx` to align with the 60-30-10 distribution

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T016 Verify WCAG AA color contrast ratios for all text elements using browser DevTools
- [x] T017 Perform a full visual regression check against `specs/001-brand-identity/brand-identity.md`
- [x] T018 Run `npm run build` to ensure no production bundle issues with new fonts/assets

## Dependencies

- Phase 2 depends on Phase 1
- Phase 3 depends on Phase 2
- Phase 4 depends on Phase 3
- Phase 5 depends on all previous phases

## Parallel Execution

- T004 and T005 can be done in parallel (Phase 2)
- US1 and US2 components can be worked on in parallel once foundational tokens are in place
