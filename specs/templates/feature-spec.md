# Feature Specification Template

> Copy this template to `specs/<feature-name>.md` and fill in each section.

---

## 1. Context & Purpose

**Feature name:** `[Feature Name]`
**Author:** `[Agent Name]`
**Date:** `[YYYY-MM-DD]`
**Status:** `draft | in-review | approved | implemented`

### Problem Statement
[What problem does this feature solve? What user need does it address?]

### Scope
[What is included and what is explicitly excluded?]

### Related Specs
- [Link to related spec, if any]

---

## 2. User Flow

Describe the step-by-step user journey:

1. **Entry:** User navigates to `[route]`
2. **Action:** User `[performs action]`
3. **System response:** System `[does something]`
4. **Feedback:** User sees `[toast / modal / redirect / etc.]`
5. **Completion:** Flow ends at `[final state]`

### Alternate Flows
- **Error path:** [What happens when API fails?]
- **Empty state:** [What happens when no data exists?]
- **Unauthorized:** [What happens when user lacks permission?]

---

## 3. API Contract

### Endpoints Used

| Method | Path | Purpose | Service |
|--------|------|---------|---------|
| `GET` | `/api/...` | Fetch data | `xxxService.js` |
| `POST` | `/api/...` | Create entity | `xxxService.js` |

### Request Schema

```json
{
  "field": "type (constraints)"
}
```

### Response Schema

```json
{
  "field": "type"
}
```

### Error Responses

| Status | Body | Meaning |
|--------|------|---------|
| `400` | `{ "message": "..." }` | Validation error |
| `401` | `{ "message": "..." }` | Unauthorized |
| `404` | `{ "message": "..." }` | Not found |

---

## 4. State Management

### Store Shape

```javascript
{
  // Domain data
  items: [],
  selectedItem: null,

  // Loading states (fine-grained)
  loadingStates: {
    fetchItems: false,
    createItem: false,
    updateItem: false,
    deleteItem: false,
  },

  // Error state
  error: null,
}
```

### Actions

| Action | Params | Calls | Updates |
|--------|--------|-------|---------|
| `fetchItems` | `businessUuid` | `xxxService.getAll()` | `items` |
| `createItem` | `businessUuid, data` | `xxxService.create()` | `items` |
| `updateItem` | `businessUuid, id, data` | `xxxService.update()` | `items` |
| `deleteItem` | `businessUuid, id` | `xxxService.delete()` | `items` |

---

## 5. Components

### Component Tree

```
PageXxx
├── Breadcrumb
├── Title1
├── ButtonsBar
│   └── Button (Agregar)
├── Table / Cards
│   └── Row / CardItem
│       ├── Data fields
│       └── Actions (Edit, Delete)
└── ModalXxx (conditional)
```

### Component Specifications

#### `ComponentName`
- **File:** `src/components/Xxx/Xxx.jsx`
- **Props:** `{ prop1, prop2, onAction }`
- **Behavior:** [What it does]
- **Loading state:** Shows `LoadingSpinner` when `loadingStates.fetchXxx`
- **Error state:** Shows error message when `error` is set
- **Empty state:** Shows `[message]` when `items.length === 0`

---

## 6. RBAC Rules

| Action | Owner | Administrator | Technician |
|--------|-------|---------------|------------|
| View list | ✅ | ✅ | ✅ |
| View detail | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |

### Route Protection
- Route: `/panel/xxx` → `private: true`
- Create/Edit routes: Blocked for Technician via `PrivateRoute` RBAC logic

---

## 7. Validation Rules

| Field | Rules | Regex |
|-------|-------|-------|
| `name` | required, minLength: 2, maxLength: 100 | — |
| `email` | required, pattern: email | `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| `dni` | required, pattern: 7-9 digits | `^\d{7,9}$` |

### Sanitization
All string inputs pass through `sanitizeInput()` from `src/utils/validation.js` before submission.

---

## 8. Edge Cases

| Case | Behavior |
|------|----------|
| Empty list | Show "No hay XXX registrados" message |
| API timeout (20s) | Show generic error toast |
| Network error | Show "Error de conexión" toast |
| Concurrent edits | Last write wins (no optimistic locking) |
| JWT expired | Redirect to `/ingresar` via axiosClient interceptor |

---

## 9. Acceptance Criteria

- [ ] User can navigate to `/panel/xxx` and see list of items
- [ ] User can click "Agregar" to open create form
- [ ] Form validates all required fields before submission
- [ ] Successful creation shows success toast and refreshes list
- [ ] Failed creation shows error toast without leaving form
- [ ] User can click "Editar" to open edit form pre-filled with data
- [ ] User can delete item with confirmation modal
- [ ] Technician role cannot see create/edit/delete buttons
- [ ] Loading spinners show during all async operations
- [ ] Empty state message shows when no items exist
- [ ] `npm run lint` passes with no errors
