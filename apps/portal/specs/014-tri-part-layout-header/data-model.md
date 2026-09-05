# UI Design: Top Header & Tri-Part Layout

## 1. TopHeader Component Contract

```typescript
interface TopHeaderProps {
  onToggleSidebar: () => void; // Trigger for mobile drawer
  sidebarCollapsed: boolean;   // To adjust left padding/offset on desktop
}
```

## 2. CSS Variable Updates (`theme.css`)

```css
:root {
  --header-height: 4rem;
}
```

## 3. Visual Strategy

- **Header**: Semi-transparent white with blur (`bg-white/80 backdrop-blur-md`) and a subtle bottom border.
- **Sidebar**: Full height, border-right.
- **Content**: `padding-top: var(--header-height)`.
