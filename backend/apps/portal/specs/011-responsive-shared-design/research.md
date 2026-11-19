# Research: Shared Responsive Web Design

**Branch**: `011-responsive-shared-design` | **Date**: 2026-04-06

## Finding 1 - Use one shared responsive pattern before page-specific tuning

**Decision**: Establish a shared responsive baseline at shell/layout level (navigation, content container, section spacing) and then apply that pattern to representative pages.

**Rationale**: The request asks for one design used across web and responsive states. A shell-first approach prevents fragmented per-page fixes and creates reusable standards for future pages.

**Alternatives considered**:
- Patch each page independently: rejected due to inconsistent outcomes and higher regression risk.
- Redesign only one page as a pilot: rejected because it does not satisfy the shared-design expectation.

## Finding 2 - Keep existing visual language and adapt only layout behavior

**Decision**: Preserve current palette, tone, and component style cues while changing stacking, spacing, and control positioning per viewport.

**Rationale**: The user explicitly requires colors and style to remain the same. Layout adaptation can solve responsiveness without introducing a brand/style shift.

**Alternatives considered**:
- Introduce a refreshed visual theme alongside responsive work: rejected because it changes scope and increases QA effort.
- Apply a separate mobile visual identity: rejected because it conflicts with cross-device consistency goals.

## Finding 3 - Validate responsiveness against practical viewport classes

**Decision**: Use three acceptance viewport classes: mobile (360px), tablet (768px), and desktop baseline.

**Rationale**: These widths directly align with the measurable criteria in the feature spec and represent common user environments.

**Alternatives considered**:
- Use only desktop + one mobile breakpoint: rejected because tablet behavior often reveals layout gaps.
- Use a large matrix of device-specific breakpoints: rejected for this phase because it adds complexity without proportional value.

## Finding 4 - Prioritize high-traffic authenticated screens for first responsive pass

**Decision**: Scope this iteration to representative navigation destinations and shared shells (`marketplace`, `intakes`, `infrastructure`, selected service pages), not every route in the application.

**Rationale**: This preserves delivery speed while addressing the most visible workflow pain points and establishes a reusable blueprint for additional screens.

**Alternatives considered**:
- Make the entire app responsive in one pass: rejected due to high risk and longer cycle time.
- Restrict to one module only: rejected because it fails the "shared design" intent.

## Finding 5 - Define responsive UX quality by interaction safety, not only visual fit

**Decision**: Treat touch usability, action visibility, and safe empty/loading/error states as first-class responsive requirements.

**Rationale**: A visually compressed layout is not enough if critical actions become hard to tap or states become unreadable on narrow screens.

**Alternatives considered**:
- Limit QA to visual overflow checks: rejected because functional usability regressions would be missed.
- Defer interaction checks to a later phase: rejected because responsive issues often originate in interaction density.

## Finding 6 - Use manual quickstart scenarios plus lint/build as release gate

**Decision**: Gate completion with both existing static checks (`lint`, `build`) and a responsive quickstart walkthrough across representative routes and breakpoints.

**Rationale**: Responsive quality is largely behavioral and visual; automated checks alone cannot validate full UX integrity.

**Alternatives considered**:
- Rely on static checks only: rejected because viewport-specific regressions would pass unnoticed.
- Require full visual regression automation in this phase: rejected as out of scope for the immediate iteration.
