# Quickstart: Brand Identity Update

## Environment Setup

1. **Branch**: `002-brand-identity-update`
2. **Assets**: Ensure the NACENTECH logo files are available in `src/shared/assets/brand/`.

## Implementation Steps

### 1. Typography Setup

Update `src/styles/fonts.css` to include `@font-face` declarations for Inter 4.0 and Roboto.

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/Roboto-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

### 2. Design Token Update

Update `:root` in `src/styles/theme.css` with the new OKLCH brand colors.

```css
:root {
  --brand-teal-green: oklch(0.6 0.14 175);
  --brand-deep-teal: oklch(0.48 0.08 185);
  --brand-olive: oklch(0.8 0.14 135);
  --brand-cyan: oklch(0.72 0.12 210);
  --brand-blue: oklch(0.45 0.15 250);

  --primary: var(--brand-teal-green);
  --secondary: var(--brand-olive);
  --accent: var(--brand-cyan);
  --foreground: var(--brand-deep-teal);
}
```

### 3. Component Refactoring

- **Hero**: Apply the 5-color gradient using `background: linear-gradient(...)`.
- **Global Styles**: Verify `body` uses `--font-sans` (Inter).
- **Navigation/Buttons**: Ensure buttons use `--brand-cyan` with transitions.

## Verification

1. Run `npm run dev` to preview changes.
2. Check color contrast on all sections using DevTools.
3. Compare visual implementation with the `brand-identity.md` guidelines.
