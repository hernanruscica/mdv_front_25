# Spec: API Data Persistence & Update Patterns

> Complete specification of how API data is stored, cached, refreshed, and kept consistent across the application.

**Status:** `approved`
**Skill:** `api-data-persistence`
**Owner:** Architect Agent + Frontend Agent

---

## 1. Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│ Backend API │────▶│ axiosClient  │────▶│  Services    │────▶│    Stores    │
│             │     │ (interceptors)│    │ (14 files)   │     │  (Zustand)   │
└─────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                     │
                                                              ┌──────▼───────┐
                                                              │   Hooks /    │
                                                              │  Components  │
                                                              └──────────────┘
```

**Current architecture:** Fetch-on-mount, replace-on-mutation. No cache layer, no auto-refresh, no optimistic updates.

---

## 2. Persistence Mechanisms

### 2.1 Auth Store (Only Persistent Store)

**File:** `src/store/authStore.js`
**Middleware:** `zustand/middleware/persist` with custom encrypted storage

```javascript
persist(config, {
  name: 'auth-storage',
  storage: encryptedStorage,    // Custom AES-encrypted localStorage adapter
  partialize: (state) => ({ user: state.user, token: state.token })
})
```

**Encrypted storage lifecycle:**
1. **Login:** Generate random 256-bit AES key → store in `localStorage('auth-enc-key')` → encrypt auth state → write to `localStorage('auth-storage')`
2. **App load:** Read encrypted data → decrypt with stored key → hydrate Zustand
3. **Logout:** Remove both `auth-enc-key` and `auth-storage` from localStorage

**What is persisted:** `user` object + JWT `token`
**What is NOT persisted:** All 13 other stores (channels, alarms, data, etc.)

### 2.2 No Other Persistence

- Zero `sessionStorage` usage
- Zero IndexedDB usage
- Zero service worker caching
- Zero HTTP cache headers manipulation

---

## 3. Store Pattern (All 14 Stores)

### 3.1 Standard State Shape

```javascript
{
  // Domain data
  entities: [],           // Array of domain objects
  selectedEntity: null,   // Single entity for detail view

  // Loading states (fine-grained per action)
  loadingStates: {
    fetchEntities: false,
    fetchEntity: false,
    createEntity: false,
    updateEntity: false,
    deleteEntity: false,
  },

  // Error state (single string)
  error: null,
}
```

### 3.2 Standard Fetch Action Template

```javascript
fetchEntities: async (businessUuid) => {
  // 1. Set loading + clear error
  set((state) => ({
    loadingStates: { ...state.loadingStates, fetchEntities: true },
    error: null,
  }));

  try {
    // 2. Call service
    const data = await entitiesService.getAll(businessUuid);

    // 3. Update state + clear loading
    set((state) => ({
      entities: data,
      loadingStates: { ...state.loadingStates, fetchEntities: false },
    }));

    // 4. Return data (allows await chaining)
    return data;
  } catch (error) {
    // 5. Handle error
    set((state) => ({
      error: error.response?.data?.message || 'Error fetching entities',
      loadingStates: { ...state.loadingStates, fetchEntities: false },
    }));
    return null;
  }
},
```

---

## 4. Post-Mutation Update Strategies

### 4.1 Inline Update (Preferred for Simple Cases)

**Create — append to array:**
```javascript
createEntity: async (businessUuid, data) => {
  // ...
  const response = await entitiesService.create(businessUuid, data);
  set((state) => ({
    entities: [...state.entities, response.item],
  }));
  return response;
}
```

**Update — map and replace:**
```javascript
updateEntity: async (businessUuid, id, data) => {
  // ...
  const response = await entitiesService.update(businessUuid, id, data);
  set((state) => ({
    entities: state.entities.map((e) =>
      e.uuid === id ? response.entity : e
    ),
  }));
  return response;
}
```

**Delete — filter out:**
```javascript
deleteEntity: async (businessUuid, id) => {
  // ...
  await entitiesService.delete(businessUuid, id);
  set((state) => ({
    entities: state.entities.filter((e) => e.uuid !== id),
  }));
}
```

### 4.2 Callback-Based Refresh (For Complex Scenarios)

Parent pages pass `onSuccess` callbacks to modal components:

```jsx
// ViewChannel.jsx
<ModalCreateMaintenanceLog
  onCreateSuccess={() =>
    fetchMaintenanceLogs(businessUuid, dataloggerUuid, channelUuid)
  }
/>

// ModalCreateMaintenanceLog.jsx
const handleCreate = async (data) => {
  await maintenanceLogsService.create(...);
  toast.success('Log creado exitosamente');
  onCreateSuccess?.();  // Triggers parent re-fetch
  onRequestClose();
};
```

### 4.3 Hook-Exposed Refresh Functions

```javascript
// useAlarmLogs.js
return {
  alarmLogs,
  status: { isLoading, isError, errorMessage, isEmpty },
  actions: { refresh: handleRefresh }  // Manual refresh
};
```

---

## 5. Loading State Management

### 5.1 Per-Action Loading States (Good Pattern)

Every store uses fine-grained boolean flags per action. This prevents the "single loading flag" problem where unrelated operations block the UI.

### 5.2 Loading State Spread Pattern

```javascript
// CORRECT
set((state) => ({
  loadingStates: { ...state.loadingStates, fetchXxx: false },
}));

// WRONG (loses other loading states)
set({ loadingStates: { fetchXxx: false } });
```

### 5.3 `finally` Block Usage (Inconsistent)

| Store | Uses `finally`? | Risk |
|-------|----------------|------|
| `locationsStore.js` | ✅ Yes | Safe |
| `usersStore.js` | ✅ Yes | Safe |
| `dataloggersStore.js` | ✅ Yes | Safe |
| `channelsStore.js` | ❌ No | `loading: true` stuck on error |
| `alarmsStore.js` | ❌ No | `loading: true` stuck on error |
| `dataStore.js` | ❌ No | `loading: true` stuck on error |
| `alarmLogsStore.js` | ❌ No | `loading: true` stuck on error |
| `maintenanceLogsStore.js` | ❌ No | `loading: true` stuck on error |

---

## 6. Error Handling Patterns

### 6.1 Service-Level Error Handling (Inconsistent)

**Pattern A (reads) — returns null:**
```javascript
getAll: async (businessUuid) => {
  try {
    const { data } = await axiosClient.get(...);
    return data.channels;
  } catch (error) {
    console.error('Get channels error:', error);
    return null;  // Caller cannot distinguish "empty" from "error"
  }
}
```

**Pattern B (writes) — throws:**
```javascript
create: async (businessUuid, channelData) => {
  try {
    const { data } = await axiosClient.uploadFile(...);
    return data;
  } catch (error) {
    console.error('Create channel error:', error);
    throw error;  // Store must handle
  }
}
```

### 6.2 Store-Level Error Handling

- Error state is a single `string` per store
- `error: null` is set at the start of every action (overwrites previous errors)
- Only the most recent error survives concurrent fetches

### 6.3 AxiosClient Error Handling

**401 interceptor:** Auto-logout + redirect to `/ingresar`
**Timeout:** 20 seconds
**No retry logic, no exponential backoff**

---

## 7. Race Condition Analysis

### 7.1 No AbortController Usage

Zero `AbortController` instances across all stores and hooks. This means:

**Problem:** If a user navigates quickly between pages, old fetch responses can overwrite newer ones:
```
Navigate to Channel A → dispatch fetch(A)
Navigate to Channel B → dispatch fetch(B)
If fetch(A) resolves after fetch(B) → store shows Channel A data while URL is Channel B
```

### 7.2 Sequential Awaits (Partial Mitigation)

`ViewChannel.jsx` chains 6+ `await` calls sequentially in `loadData`. This prevents parallel race conditions within a single load cycle but NOT against overlapping cycles.

### 7.3 `nowRef` Pattern (Good)

```javascript
const nowRef = useRef(new Date());
useEffect(() => {
  nowRef.current = new Date();
}, [activeRange, channelAllRegistersData]);
```

This avoids stale closure issues in `getFixedDomain()`.

---

## 8. Data Freshness Strategies

### 8.1 Current: None

- No auto-refresh intervals (`setInterval`)
- No polling
- No stale-while-revalidate
- No background refresh

Data is fetched once on mount and becomes stale immediately.

### 8.2 Trigger Points for Fresh Data

| Trigger | Mechanism |
|---------|-----------|
| Component mount | `useEffect` with dependency array |
| URL parameter change | `useEffect` dependency change |
| Manual refresh button | `refresh()` callback from hook |
| Post-mutation | `onSuccess` callback from modal |
| Range change (charts) | `fetchDataForRange()` in ViewChart |
| Navigation back | Component remount → fresh fetch |

---

## 9. Optimistic Updates

**Status:** None implemented. All mutations use pessimistic updates (wait for server confirmation).

**Future pattern (not yet in codebase):**
```javascript
updateEntity: async (id, data) => {
  const previousEntities = get().entities;

  // Optimistic update
  set((state) => ({
    entities: state.entities.map(e => e.uuid === id ? { ...e, ...data } : e),
  }));

  try {
    await entitiesService.update(id, data);
  } catch (error) {
    // Rollback
    set({ entities: previousEntities });
    toast.error('Error al actualizar');
  }
}
```

---

## 10. Store Reset / Manual Invalidation

### `solutionsStore.clearSolutions()`

The only store with explicit data reset:
```javascript
clearSolutions: () => {
  set({
    solutions: [],
    selectedSolution: null,
    error: null,
  });
},
```

### No Other Reset Mechanisms

Other stores have no `clear`, `reset`, or `invalidate` actions. Data persists in memory until the next fetch replaces it.

---

## 11. `useAlarmLogs` — Reference Implementation

**File:** `src/hooks/useAlarmLogs.js`

This hook demonstrates the best patterns in the codebase:

```javascript
export const useAlarmLogs = (businessUuid, alarmId, options = { autoFetch: true }) => {
  const { alarmLogs, fetchAlarmLogsByAlarmId, loadingStates, error } = useAlarmLogsStore();

  // Configurable auto-fetch
  useEffect(() => {
    if (options.autoFetch && businessUuid && alarmId) {
      fetchAlarmLogsByAlarmId(businessUuid, alarmId);
    }
  }, [businessUuid, alarmId, options.autoFetch, fetchAlarmLogsByAlarmId]);

  // Manual refresh
  const handleRefresh = () => fetchAlarmLogsByAlarmId(businessUuid, alarmId);

  // Structured return
  return {
    alarmLogs,
    status: {
      isLoading: loadingStates.fetchAlarmLogs,
      isError: error !== null,
      errorMessage: error,
      isEmpty: alarmLogs?.length === 0,
    },
    actions: { refresh: handleRefresh },
  };
};
```

**Why this is the reference:**
- Configurable auto-fetch (can disable for manual control)
- Exposed manual refresh action
- Derived UI state (isEmpty, isError)
- Clean separation: data / status / actions

---

## 12. Known Issues

| Issue | Severity | Location |
|-------|----------|----------|
| No AbortController in any store or hook | High | All stores |
| No auto-refresh for sensor time-series data | High | Entire codebase |
| `usersStore.updateUser` doesn't update local array after success | Medium | `src/store/usersStore.js:70-88` |
| Loading states without `finally` in 6 stores | Medium | channels, alarms, data, alarmLogs, maintenanceLogs, solutions stores |
| Services return `null` on read errors vs `throw` on write errors | Medium | All services |
| Single shared error string per store | Low | All stores |
| No cache layer (every mount = fresh API call) | Low | Entire codebase |
| `usersAlarmsService` / `locationUsersService` duplication | Low | `src/services/` |

---

## 13. Acceptance Criteria

- [ ] All stores use fine-grained per-action loading states
- [ ] Loading states always use spread: `{ ...state.loadingStates, action: false }`
- [ ] All fetch actions clear `error: null` at start
- [ ] Post-mutation inline updates append/map/filter correctly
- [ ] Complex refresh uses callback pattern (`onSuccess` from modals)
- [ ] Auth persistence uses `partialize` (only `user` + `token`)
- [ ] `finally` block or sequential state updates prevent stuck `loading: true`
- [ ] AxiosClient 401 interceptor auto-logs out and redirects
- [ ] `useAlarmLogs` pattern used as reference for new hooks
- [ ] No direct service calls from components (always through stores)
- [ ] `npm run lint` passes
