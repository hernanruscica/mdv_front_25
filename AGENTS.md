# Agents Configuration — MDV Sensores Frontend

## Overview

This document defines the agent roles, responsibilities, and workflows for the Spec-Driven Development (SDD) process in the `mdv_front_25` React frontend project.

## Agent Roles

### 1. Architect Agent

**Responsibility:** Design specifications, enforce architectural consistency, and validate that all pieces fit together.

- Writes and maintains specs in `specs/`
- Defines API contracts, domain models, and data flows
- Reviews implementations for architectural coherence
- Maintains `AGENTS.md` and `skills.md`

**When to use:**
- Creating new feature specs
- Refactoring architectural patterns
- Resolving cross-cutting concerns (auth, RBAC, routing)
- Reviewing PRs for architectural fitness

---

### 2. Frontend Agent

**Responsibility:** Implement React components, Zustand stores, custom hooks, and API services according to specs.

- Creates and modifies components following existing patterns
- Implements Zustand stores with fine-grained loading states
- Builds custom hooks (strategy, data-fetching, composite)
- Creates API services using the `axiosClient` singleton
- Applies form validation using `src/utils/validation.js`
- Implements chart data fetching pipeline (`chart-data-fetching` skill)
- Implements chart visualization components (`chart-rendering` skill)
- Manages API data persistence patterns (`api-data-persistence` skill)

**When to use:**
- Building new pages or components
- Creating new stores or extending existing ones
- Writing custom hooks
- Adding new API service methods
- Implementing UI features (charts, gauges, modals, forms)
- Modifying `src/services/dataService.js`, `src/store/dataStore.js`
- Creating or modifying chart components (`ViewChart/`, `Graphics/`, `Gauge/`)
- Adding auto-refresh, caching, or optimistic update patterns

---

### 3. API Contract Agent

**Responsibility:** Document and validate the frontend's expectations of the backend API.

- Maintains `specs/api-contract.md` with all endpoint schemas
- Validates that services match the contract
- Identifies missing or inconsistent API patterns
- Documents request/response shapes and error formats
- Validates data service endpoint contracts (`chart-data-fetching` skill)

**When to use:**
- Onboarding a new API endpoint
- Validating service implementations against backend
- Documenting API changes or new features
- Auditing error handling across services
- Documenting time-series data endpoints (registers, daily, weekly, energy incidents)

---

### 4. Review Agent

**Responsibility:** Validate implementations against specs, enforce code quality, and audit security patterns.

- Checks implementation against specs in `specs/`
- Audits RBAC rules across routes and components
- Validates loading state patterns in stores
- Runs lint (`npm run lint`) and verifies correctness
- Identifies code duplication and naming inconsistencies
- Audits chart rendering consistency (`chart-rendering` skill)
- Validates API data persistence patterns (`api-data-persistence` skill)

**When to use:**
- Pre-commit or pre-merge review
- Spec compliance audit
- RBAC security audit
- Code quality review (duplication, naming, patterns)
- Chart color semantics audit (red/green/yellow/blue/violet consistency)
- Store loading state consistency audit (always use `finally` block)

---

## Workflows

### Feature Development Flow

```
1. Architect Agent  →  Writes spec in specs/<feature>.md
2. Frontend Agent   →  Implements per spec (components, stores, hooks, services)
3. API Contract Agent → Validates service layer matches api-contract.md
4. Review Agent     →  Validates implementation against spec + runs lint
```

### Bug Fix Flow

```
1. Review Agent     →  Identifies root cause against spec
2. Frontend Agent   →  Implements fix
3. Review Agent     →  Verifies fix doesn't break spec contract
```

### Refactoring Flow

```
1. Architect Agent  →  Updates spec with new pattern
2. Frontend Agent   →  Refactors code to match updated spec
3. Review Agent     →  Validates full compliance
```

### API Contract Update Flow

```
1. API Contract Agent →  Updates specs/api-contract.md
2. Frontend Agent    →  Updates services + stores to match
3. Architect Agent   →  Validates spec coherence
```

## Directory Responsibilities

| Directory | Owner Agent | Description |
|-----------|-------------|-------------|
| `src/components/` | Frontend Agent | Reusable UI components |
| `src/pages/` | Frontend Agent | Page-level components (route targets) |
| `src/store/` | Frontend Agent | Zustand state management |
| `src/hooks/` | Frontend Agent | Custom React hooks |
| `src/services/` | API Contract Agent + Frontend Agent | API communication layer |
| `src/utils/` | Architect Agent | Shared utilities (validation, crypto, axios, roles) |
| `src/routes/` | Architect Agent | Route definitions and RBAC mapping |
| `specs/` | Architect Agent | All specifications |
| `specs/templates/` | Architect Agent | Reusable spec templates |

## Conventions

### File Naming
- **Components:** `PascalCase/` directories with matching `.jsx` file (e.g., `CardInfo/CardInfo.jsx`)
- **Services:** `camelCase.js` (e.g., `channelsService.js`)
- **Stores:** `camelCase.js` (e.g., `channelsStore.js`)
- **Hooks:** `camelCase.js` with `use` prefix (e.g., `useChannelDetails.js`)
- **Pages:** `PascalCase/` directories with matching `.jsx` file
- **Specs:** `kebab-case.md` (e.g., `api-contract.md`)

### Code Patterns to Enforce
1. **Service → Store → Hook → Component** layering (never skip layers)
2. **Fine-grained loading states** per action in stores (not single `isLoading`)
3. **AxiosClient singleton** for all HTTP requests (never raw axios)
4. **PrivateRoute** wrapper for all authenticated routes
5. **Form validation** via `src/utils/validation.js`
6. **Toast notifications** via `react-hot-toast` for user feedback
7. **Spanish** for user-facing strings, **English** for code identifiers
8. **Chart data pipeline:** `dataService` → `dataStore` → hooks → components (never call service directly from component)
9. **Chart color semantics:** Red=danger, Green=safe, Yellow=warning, Blue=normal, Violet=alarm
10. **Store loading states:** Always use `finally` block or sequential state updates (never leave `loading: true` stuck)

### Language Convention
- **Route paths:** Spanish (`/panel/ubicaciones`, `/panel/usuarios`)
- **Code identifiers:** English (`locationsStore`, `fetchChannels`)
- **User-facing UI:** Spanish ("Agregar", "Editar", "Eliminar")
- **Spec documents:** English (for agent consumption)
