# Skills Catalog — MDV Sensores Frontend

## Overview

This document defines the specialized skills available to each agent. Skills are composable capabilities that agents invoke when performing tasks.

---

## Frontend Development Skills

### `react-component-dev`
**Agents:** Frontend Agent
**Purpose:** Create or modify React functional components

**Pattern reference:** `src/components/CardInfo/CardInfo.jsx`, `src/components/LoadingSpinner/LoadingSpinner.jsx`, `src/components/BtnSmall/BtnSmall.jsx`

**Capabilities:**
- Create new component directory following `PascalCase/PascalCase.jsx` pattern
- Implement functional components with proper prop destructuring
- Add component-specific CSS (co-located `.css` files)
- Use existing layout components (`Title1`, `Title2`, `ButtonsBar`, `Breadcrumb`)
- Handle loading/error states with `LoadingSpinner`
- Use `react-hot-toast` for user feedback
- Apply `sanitizeInput()` from `src/utils/validation.js` for user inputs

**Guardrails:**
- Never create class components
- Never use inline styles for complex layouts
- Always destructure props (no `props.xxx`)
- Import order: React → libraries → components → services → hooks → utils

---

### `zustand-store-dev`
**Agents:** Frontend Agent
**Purpose:** Create or modify Zustand state management stores

**Pattern reference:** `src/store/locationsStore.js`, `src/store/channelsStore.js`

**Capabilities:**
- Create stores with `zustand/create`
- Define state shape: domain array + selected entity + error + loadingStates
- Implement async actions that call services and update state
- Use fine-grained per-action boolean loading states
- Handle errors with consistent error state pattern

**Store template structure:**
```javascript
const useXxxStore = create((set, get) => ({
  // State
  xxx: [],
  selectedXxx: null,
  error: null,
  loadingStates: {
    fetchXxx: false,
    createXxx: false,
    updateXxx: false,
    deleteXxx: false,
  },

  // Actions
  fetchXxx: async (...) => { /* set loading → call service → set data → clear loading */ },
  createXxx: async (...) => { /* ... */ },
  updateXxx: async (...) => { /* ... */ },
  deleteXxx: async (...) => { /* ... */ },
}));
```

**Guardrails:**
- Never mutate state directly (always return new objects)
- Always reset error state on new action start
- Always handle try/catch with error state update
- Keep loading state keys consistent: `fetch`, `create`, `update`, `delete`

---

### `hook-dev`
**Agents:** Frontend Agent
**Purpose:** Create custom React hooks for data orchestration

**Pattern reference:** `src/hooks/useAlarmDetails.js`, `src/hooks/useAlarmsStrategy.js`, `src/hooks/useTimeSeriesChart.js`

**Capabilities:**
- Create data-fetching hooks (load entity by params)
- Create strategy hooks (determine loading behavior by context)
- Create composite hooks (combine multiple stores/services)
- Create transformation hooks (process data for charts, tables)
- Return consistent shape: `{ data, isLoading, error, actions }`

**Hook types:**
1. **Single-entity hook:** Fetch one entity by ID (`useAlarmDetails`)
2. **Strategy hook:** Determine data source by URL context (`useAlarmsStrategy`)
3. **Composite hook:** Orchestrate multiple store calls
4. **Transformation hook:** Process raw data for UI consumption (`useTimeSeriesChart`)

**Guardrails:**
- Always use `useEffect` with proper dependency arrays
- Always handle cleanup (abort controllers where applicable)
- Never call hooks conditionally
- Prefix with `use` (always)

---

### `service-dev`
**Agents:** Frontend Agent, API Contract Agent
**Purpose:** Create or modify API service modules

**Pattern reference:** `src/services/locationsService.js`, `src/services/alarmsService.js`

**Capabilities:**
- Create service files in `src/services/`
- Import and use `axiosClient` from `src/utils/axiosClient.js`
- Implement CRUD operations matching backend endpoints
- Handle multipart/form-data uploads with `uploadFile()`/`uploadFilePUT()`
- Return `response.data` consistently

**Service template:**
```javascript
import axiosClient from '../utils/axiosClient';

const xxxService = {
  getAll: async (businessUuid) => {
    const response = await axiosClient.get(`/api/businesses/${businessUuid}/xxx`);
    return response.data;
  },
  getById: async (businessUuid, id) => { /* ... */ },
  create: async (businessUuid, data) => { /* ... */ },
  update: async (businessUuid, id, data) => { /* ... */ },
  delete: async (businessUuid, id) => { /* ... */ },
};

export default xxxService;
```

**Guardrails:**
- Always use `axiosClient`, never raw `axios`
- Always use `businessUuid` as first path segment for scoped endpoints
- Always return `response.data` (unwrap axios response)
- Never handle errors in service layer (let store handle)

---

## Documentation & Specification Skills

### `spec-writing`
**Agents:** Architect Agent
**Purpose:** Write or update feature specifications

**Templates:** `specs/templates/feature-spec.md`, `specs/templates/component-spec.md`, `specs/templates/api-endpoint-spec.md`

**Capabilities:**
- Follow template structure strictly
- Map user flows step-by-step
- Define acceptance criteria as testable statements
- Document API contract (request/response schemas)
- Specify RBAC rules per route/action
- Identify edge cases and error scenarios

**Guardrails:**
- Every spec must have: Context, API Contract, Components, User Flow, RBAC, Acceptance Criteria
- Every API endpoint must document: method, path, request body, response shape, error codes
- Every component must document: props, parent, children, loading state, error state

---

### `api-contract-doc`
**Agents:** API Contract Agent
**Purpose:** Document and maintain the API contract specification

**Reference:** `specs/api-contract.md`, all 14 service files in `src/services/`

**Capabilities:**
- Extract endpoint patterns from service files
- Document request/response schemas
- Identify missing or inconsistent API patterns
- Validate services against documented contract
- Track API version changes

**Guardrails:**
- One section per service file
- Every endpoint: method, full path, params, body schema, response schema, errors
- Group by domain entity (locations, users, dataloggers, channels, alarms, data, logs)

---

## Quality & Review Skills

### `spec-review`
**Agents:** Review Agent
**Purpose:** Validate implementation against specification

**Capabilities:**
- Compare component tree against spec
- Verify store actions match spec-defined operations
- Check hook data flow against spec
- Validate service calls match api-contract.md
- Identify spec drift (implementation deviates from spec)

**Guardrails:**
- Reference spec by filename (e.g., "violates `specs/auth-flow.md` section 3.2")
- List every deviation found
- Classify deviations: Critical (breaks contract), Warning (inconsistency), Info (improvement)

---

### `rbac-audit`
**Agents:** Review Agent
**Purpose:** Audit role-based access control across routes and components

**Reference:** `src/components/PrivateRoute/PrivateRoute.jsx`, `src/utils/userRoles.js`, `src/routes/routes.jsx`

**Capabilities:**
- Verify every `private: true` route has proper RBAC
- Check that `agregar`/`editar` routes are blocked for Technician role
- Validate that API services include auth headers via axiosClient
- Audit Zustand stores for role-based conditional logic
- Check that `/panel/verestadoalarma/:token` validates userId
- Validate the navbar location switcher sourcing (`specs/auth-flow.md` §3.5): single source = `locationsStore` via `fetchLocations(user)` (all businesses for Owners, assigned otherwise); Owner detection via `businesses_roles.some(br => br.role === 'Owner')`; role subtitles in Spanish via `mappedCurrentRole`

**RBAC rules to enforce:**
| Route Pattern | Owner | Admin | Technician |
|---------------|-------|-------|------------|
| `/panel/*` (read) | ✅ | ✅ | ✅ |
| `*/agregar` | ✅ | ✅ | ❌ |
| `*/editar` | ✅ | ✅ | ❌ |
| `/panel/historial` | ✅ | ❌ | ❌ |
| `*/informe` | ✅ | ✅ | ❌ |

**Guardrails:**
- Always check both route-level AND component-level RBAC
- Verify PrivateRoute receives correct role mapping
- Check for bypass vulnerabilities (direct URL access)

---

### `code-quality-audit`
**Agents:** Review Agent
**Purpose:** Identify code quality issues and inconsistencies

**Capabilities:**
- Detect code duplication across services/stores
- Flag naming inconsistencies (Spanish/English mix in code)
- Identify broken references or undefined variables
- Check import hygiene (unused imports, circular deps)
- Verify loading state consistency across stores

**Known issues to flag:**
- `useFetchChannel.js` misnamed (fetches datalogger)
- `channelsService.js` `businessId` out of scope
- `usersAlarmsService.js` / `locationUsersService.js` duplication
- `useChannelDetails.js` undefined variable references

---

## Charting & Data Visualization Skills

### `chart-data-fetching`
**Agents:** Frontend Agent, API Contract Agent
**Purpose:** Manage the complete pipeline from backend API to chart-ready data

**Spec reference:** `specs/chart-data-fetching.md`

**Pipeline layers:**
```
dataService.js → dataStore.js → ViewChart.jsx / useTimeSeriesChart hook → Chart components
```

**Capabilities:**
- Implement service methods in `src/services/dataService.js` for time-series endpoints
- Create Zustand store actions in `src/store/dataStore.js` with fine-grained loading states
- Map time-range presets to correct data granularity:
  - `LAST_HOUR`, `LAST_12H`, `LAST_24H` → `fetchAllRegistersChannelData` (registers)
  - `LAST_WEEK`, `LAST_MONTH` → `fetchDailyChannelData` (daily aggregates)
  - `LAST_6_MONTHS`, `LAST_YEAR` → `fetchWeeklyChannelData` (weekly aggregates)
- Implement `ViewChart.jsx` data transformation pipeline:
  - `standardizedData`: Map raw API fields to normalized `{ date, value, ... }` shape
  - Alarm overlay: Inject alarm data points into chart data
  - Gap detection: Insert null points between distant data points to break lines
- Handle timezone offset (`VITE_APP_TIMEZONE_OFFSET`, default -3)
- Implement `useTimeSeriesChart` adaptive aggregation:
  - `<= 168 hours` → raw data points
  - `168-720 hours` → group by day (min/max/avg)
  - `> 720 hours` → group by 7-day weeks (min/max/avg)
- Fetch energy incidents via `fetchEnergyIncidents` and merge into chart data
- Implement drill-down navigation: week → day → hour with range-specific fetches

**Data shapes (API responses):**
- **Registers:** `{ fecha, porcentaje_promedio, texto, energia, failure }`
- **Daily:** `{ dia, porcentaje_uso, conection_failures, energy_failures, phase_failures }`
- **Weekly:** `{ inicio_semana, numero_semana, porcentaje_semanal, max_dia_porcentaje, min_dia_porcentaje }`
- **Channel usage:** `{ totalData: { total_time_on_hours, average_usage_percentage }, lastData: { porcentajeUsagePeriod } }`

**Guardrails:**
- Always use `dataStore` actions (never call `dataService` directly from components)
- Handle `null` return from services (show empty/error state, never crash)
- Timezone offset must be applied to ALL date comparisons in ViewChart
- Weekly data must fill gaps with zero-value weeks (no missing bars)
- Alarm points must preserve `originalValue` for Y-axis positioning
- Never mix register-level and daily-level data in the same chart view

---

### `chart-rendering`
**Agents:** Frontend Agent, Review Agent
**Purpose:** Implement chart visualization components and their configuration

**Spec reference:** `specs/chart-rendering.md`

**Charting libraries in use:**
| Library | Version | Used By |
|---------|---------|---------|
| **D3.js** | `^7.9.0` | `Gauge.jsx`, `GaugeLinear.jsx` (imperative SVG) |
| **Recharts** | `^3.6.0` | `GenericLineChart.jsx`, `GenericBarChart.jsx` |
| **ApexCharts** | `^1.7.0` | `TimeSeriesChart.jsx`, `AnalogData.jsx` |
| **Chart.js** | `^4.4.9` | **DEAD DEPENDENCY** — not imported anywhere |

**Two parallel charting systems:**
1. **Recharts system** (`src/components/ViewChart/`): Primary, used by `ViewChannel`, `ReportPreview`
   - `GenericLineChart.jsx`: Line charts with alarm dots, custom tooltip, gap handling
   - `GenericBarChart.jsx`: 3 overlapping bars (max/avg/min) for weekly data
2. **ApexCharts system** (`src/components/Graphics/`): Secondary, used by `DigitalPorcentageOn`, `AnalogData`
   - `TimeSeriesChart.jsx`: Adaptive aggregation + statistics display

**Gauge system (D3.js):**
- `Gauge.jsx`: Semicircular arc with animated needle, traffic-light zones (red-green-red)
- `GaugeLinear.jsx`: Horizontal bar with threshold markers
- Both use fixed 0-100% domain with `alarmMin`/`alarmMax` thresholds

**Capabilities:**
- Create chart components following existing Recharts/ApexCharts patterns
- Implement custom dot rendering for alarm points (color by type):
  - Violet `#aa89f8`: percentage-on alarms
  - Yellow `#FACC15`: communication failures
  - Red `#DC2626`: energy/phase failures
- Configure axes: Y fixed `[0, 100]` with `%` unit, X datetime with dynamic formatting
- Implement drill-down: week bar click → daily line, day point click → hourly registers
- Build time range selector buttons (1h, 12h, 24h, 1w, 1m, 6m, 1y)
- Implement custom tooltip with alarm details, energy events, formatted dates
- Create gauge components with D3.js (clear + rebuild SVG on data change)
- Implement PDF export with `jsPDF` + `html2canvas` (A4 portrait + landscape for charts)

**Color semantics (MUST enforce):**
| Color | Hex | Meaning |
|-------|-----|---------|
| Red | `#ef4444` / `#DC2626` | Max value, energy failure, danger zone |
| Green | `#22c55e` / `#66CC66` | Min value, safe zone |
| Yellow | `#f59e0b` / `#FACC15` | Average, warning, communication failure |
| Blue | `#0052cc` / `#008FFB` | Normal line, default series |
| Violet | `#aa89f8` | Percentage-on alarm trigger |

**Guardrails:**
- Y-axis domain is ALWAYS `[0, 100]` (percentage scale) except `AnalogData`
- Never use `Chart.js` (dead dependency — prefer Recharts)
- Gauges MUST use `useMemo` for clip-path IDs (avoid conflicts with multiple instances)
- Alarm dots MUST have `r=10` radius with white border for visibility
- Weekly bar chart uses 3 overlapping `<Bar>` elements with separate `<XAxis>` IDs
- `connectNulls={false}` on line charts (gaps must break the line)
- Print CSS: chart wrapper forced to `297mm x 180mm`, hide interactive controls

---

### `api-data-persistence`
**Agents:** Architect Agent, Frontend Agent
**Purpose:** Manage how API data is stored, cached, refreshed, and kept consistent

**Spec reference:** `specs/api-data-persistence.md`

**Current architecture:**
- 14 Zustand stores, only `authStore` uses `persist` middleware (encrypted localStorage)
- No HTTP cache layer, no SWR/React Query, no IndexedDB
- No auto-refresh/polling for sensor data
- No AbortController usage (race condition risk)
- Fetch-on-mount, replace-on-mutation pattern

**Capabilities:**
- Implement Zustand stores with per-action fine-grained loading states
- Implement post-mutation inline updates:
  - Create: `[...array, newItem]`
  - Update: `array.map(item => item.id === id ? updated : item)`
  - Delete: `array.filter(item => item.id !== id)`
- Implement callback-based refresh for modal/page interactions
- Implement AbortController in data-fetching hooks to prevent race conditions
- Design auto-refresh patterns for time-series data (polling intervals)
- Implement stale-while-revalidate patterns for frequently accessed data
- Create cache invalidation strategies for post-mutation scenarios
- Implement optimistic updates with rollback on failure (future pattern)

**Store action template (MUST follow):**
```javascript
fetchXxx: async (params) => {
  set((state) => ({
    loadingStates: { ...state.loadingStates, fetchXxx: true },
    error: null,
  }));
  try {
    const data = await xxxService.method(params);
    set((state) => ({
      xxx: data,
      loadingStates: { ...state.loadingStates, fetchXxx: false },
    }));
    return data;
  } catch (error) {
    set((state) => ({
      error: error.response?.data?.message || 'Error message',
      loadingStates: { ...state.loadingStates, fetchXxx: false },
    }));
    return null;
  }
},
```

**Known issues to address:**
- No race condition handling → add AbortController to hooks
- `usersStore.updateUser` doesn't update local array → add inline update
- Loading states without `finally` blocks → risk of `loading: true` stuck
- Shared error string per store → only last error survives concurrent fetches
- Services return `null` on read errors vs `throw` on write errors → inconsistent

**Guardrails:**
- Always use `finally` block or sequential state updates (never leave `loading: true`)
- Always spread `loadingStates` correctly: `{ ...state.loadingStates, fetchXxx: false }`
- Always clear `error: null` at start of every action
- Post-mutation: prefer inline update over full re-fetch when possible
- For complex refresh scenarios, use callback pattern: parent passes `onSuccess` to modals
- Auth persistence: only store `user` + `token` via `partialize`, never functions

---

## Cross-Reference Matrix

| Skill | Architect | Frontend | API Contract | Review |
|-------|-----------|----------|--------------|--------|
| `react-component-dev` | | ✅ | | |
| `zustand-store-dev` | | ✅ | | |
| `hook-dev` | | ✅ | | |
| `service-dev` | | ✅ | ✅ | |
| `chart-data-fetching` | | ✅ | ✅ | |
| `chart-rendering` | | ✅ | | ✅ |
| `api-data-persistence` | ✅ | ✅ | | |
| `spec-writing` | ✅ | | | |
| `api-contract-doc` | | | ✅ | |
| `spec-review` | | | | ✅ |
| `rbac-audit` | | | | ✅ |
| `code-quality-audit` | | | | ✅ |
