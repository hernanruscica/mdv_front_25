# Component Specification Template

> Copy this template for individual component specs. Use when a component is complex enough to warrant its own document.

---

## 1. Overview

**Component name:** `[ComponentName]`
**File path:** `src/components/Xxx/Xxx.jsx`
**Author:** `[Agent Name]`
**Date:** `[YYYY-MM-DD]`
**Status:** `draft | in-review | approved | implemented`

### Purpose
[What role does this component play in the UI?]

### Parent Components
- [Which pages/components render this?]

### Child Components
- [What components does this render?]

---

## 2. Props Interface

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `Object` | ✅ | — | The entity data to display |
| `onEdit` | `Function` | ❌ | `undefined` | Callback when edit is clicked |
| `onDelete` | `Function` | ❌ | `undefined` | Callback when delete is clicked |

### TypeScript Interface (if applicable)

```typescript
interface XxxProps {
  data: Entity;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}
```

---

## 3. Visual Structure

```
┌─────────────────────────────────┐
│ CardTitle: "Nombre del Item"    │
├─────────────────────────────────┤
│ Field 1: value                  │
│ Field 2: value                  │
│ Field 3: value                  │
├─────────────────────────────────┤
│ [Editar]  [Eliminar]            │
└─────────────────────────────────┘
```

### Layout Details
- Uses `CardInfo` wrapper for consistent card styling
- Uses `CardTitle` for header
- Uses `CardBtnSmall` for action buttons
- Responsive: Single column on mobile, grid on desktop

---

## 4. State & Behavior

### Local State
```javascript
const [isModalOpen, setIsModalOpen] = useState(false);
```

### Data Dependencies
- **Store:** `useXxxStore` → `selectedXxx`
- **Hook:** `useXxxDetails` (if applicable)

### User Interactions

| Action | Trigger | Effect |
|--------|---------|--------|
| Click "Editar" | `onEdit(id)` callback | Parent handles navigation |
| Click "Eliminar" | Opens `ModalConfirmation` | On confirm, calls `onDelete(id)` |
| Hover card | Visual feedback | CSS hover effect |

---

## 5. Loading & Error States

### Loading
- **Condition:** `loadingStates.fetchXxx === true`
- **Display:** `<LoadingSpinner />`
- **Position:** Centered within card container

### Error
- **Condition:** `error !== null`
- **Display:** Error message card with retry button
- **Toast:** N/A (errors handled at page level)

### Empty
- **Condition:** `data === null` or `data === undefined`
- **Display:** Not rendered (parent handles empty state)

---

## 6. Styling

**CSS file:** `src/components/Xxx/Xxx.css`

### CSS Classes
| Class | Purpose |
|-------|---------|
| `.xxx-container` | Main wrapper |
| `.xxx-header` | Title section |
| `.xxx-body` | Content fields |
| `.xxx-actions` | Button row |

### Design Tokens
- Uses project's existing color palette
- Follows `CardInfo` component's border/shadow patterns
- Button colors from global CSS variables

---

## 7. Accessibility

- All interactive elements are keyboard-focusable
- Button text is descriptive (not just icons)
- Modal has `aria-label` and focus trap
- Color contrast meets WCAG AA

---

## 8. Acceptance Criteria

- [ ] Renders all required props correctly
- [ ] Shows loading spinner during fetch
- [ ] Shows error state when data is unavailable
- [ ] Edit button triggers `onEdit` callback with correct ID
- [ ] Delete button opens confirmation modal
- [ ] Delete confirmation calls `onDelete` callback with correct ID
- [ ] Component is responsive on mobile and desktop
- [ ] CSS follows existing design patterns
- [ ] `npm run lint` passes
