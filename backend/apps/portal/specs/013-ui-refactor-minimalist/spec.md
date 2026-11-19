# Feature Specification: Refactor UI for Modern Minimalist Look

**Feature Branch**: `013-ui-refactor-minimalist`  
**Created**: 2026-05-14  
**Status**: Draft  
**Input**: User description: "ta sẽ sửa lại giao diện, bạn hãy xem lại toàn bộ các màn để nghĩ xem làm như nào cho giao diện nó đẹp, hiện đại, và minimalism chứ không cần hoa lá cành sặc sỡ đâu"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Brand Experience (Priority: P1)

As a user, I want to see a consistent and professional interface that reflects the NACENTECH identity so that I feel trust in the platform.

**Why this priority**: Branding is the foundation of the UI refactor and establishes the core color palette.

**Independent Test**: Can be tested by navigating through all main pages (Dashboard, Intakes, Marketplace) and verifying that the primary color is consistently the new Teal Green (#00A388).

**Acceptance Scenarios**:

1. **Given** a user navigates to the Intakes page, **When** they view the page header and buttons, **Then** the primary actions and accents must use the NACENTECH brand colors.
2. **Given** a user is on any page, **When** they look at the sidebar or navigation menu, **Then** the active state and primary icons should reflect the new brand identity.

---

### User Story 2 - Minimalist Content Focus (Priority: P2)

As a user, I want a clean and minimalist layout with plenty of white space so that I can focus on the content without visual distraction.

**Why this priority**: Minimalism improves readability and user focus, which is a key requirement of the request.

**Independent Test**: Can be tested by comparing the current "busy" areas (like dense tables or cards) with the new "airy" versions.

**Acceptance Scenarios**:

1. **Given** a user views a list of items (e.g., Intakes), **When** they see the list items, **Then** there should be clear separation, adequate padding, and no unnecessary decorative elements.
2. **Given** a user is reading a detail page, **When** they scroll through the content, **Then** the typography and spacing should lead the eye naturally without feeling "cramped".

---

### User Story 3 - Modern Component Interaction (Priority: P3)

As a user, I want interactive elements (buttons, inputs, dropdowns) to feel modern and responsive so that the platform feels like a cutting-edge technology tool.

**Why this priority**: Modern interactions (hover states, transitions) provide feedback and enhance the "premium" feel of the minimalist design.

**Independent Test**: Can be tested by interacting with buttons and forms to see the refined transitions and hover effects.

**Acceptance Scenarios**:

1. **Given** a user hovers over a primary button, **When** the hover state is active, **Then** it should transition smoothly to a brand-accent color (e.g., Bright Cyan or a darker Teal).
2. **Given** a user clicks on an input field, **When** the field is focused, **Then** the focus ring should use a subtle brand color instead of default browser styles.

---

### Edge Cases

- **Dark Mode**: How do the new NACENTECH colors (Teal, Olive) translate to Dark Mode while maintaining accessibility (WCAG)?
- **Empty States**: How do empty states look in a minimalist design? They should be clean but still informative.
- **Complex Data**: How to handle very long titles or complex metadata in a minimalist table without losing information?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST update global CSS variables (theme.css) to reflect NACENTECH brand colors (Teal Green #00A388 as Primary).
- **FR-002**: System MUST adopt the 60-30-10 color rule across all layouts (60% Neutral/Background, 30% Primary/Secondary, 10% Accent).
- **FR-003**: System MUST use Inter as the primary typeface for all text content.
- **FR-004**: System MUST refine component spacing (padding/margins) to follow a consistent 4px or 8px grid system for an "airy" feel.
- **FR-005**: System MUST remove non-functional decorative elements (e.g., excessive gradients, heavy borders) to achieve a minimalist aesthetic.
- **FR-006**: System MUST ensure all color combinations pass WCAG 2.1 AA accessibility standards for contrast.
- **FR-007**: System MUST update interactive states (Hover, Active, Focus, Disabled) to be consistent with the new color palette.

### Key Entities *(include if feature involves data)*

- **Theme Configuration**: The set of CSS variables and Tailwind configuration that defines the visual language.
- **UI Components**: The library of shared components (Buttons, Inputs, Cards, Tables) that need aesthetic refinement.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of primary UI elements (Headers, Main Buttons, Active Sidebar items) use the new brand colors.
- **SC-002**: Page load visual "noise" (measured by number of distinct non-content decorative elements) is reduced by at least 30%.
- **SC-003**: Average vertical padding in list items and cards is increased by at least 25% to improve readability.
- **SC-004**: All text-to-background contrast ratios for primary and secondary text meet or exceed 4.5:1.

## Assumptions

- **Existing Frameworks**: We will continue using Tailwind CSS and the existing component architecture.
- **Logo**: The new NACENTECH logo will be provided or updated separately, but the UI should accommodate its placement.
- **Browser Support**: Minimalist design usually relies on modern CSS (flex, grid, transitions), which is assumed to be supported by the target audience.
- **Iconography**: We will stick with `lucide-react` but ensure icons are used sparingly and consistently.
