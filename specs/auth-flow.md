# Authentication & RBAC Flow — MDV Sensores Frontend

> This document specifies the complete authentication, authorization, and role-based access control system.

---

## 1. Authentication Flow

### 1.1 Login

```
User → /ingresar (LoginPage)
  → enters dni + password
  → authService.login(dni, password)
  → POST /api/auth/login
  → Response: { user, token }
  → authStore.login(user, token)
  → Zustand persist middleware encrypts state via AES
  → Stored in localStorage (encrypted)
  → Navigate to /panel
```

**Auth store state shape:**
```javascript
{
  user: {
    uuid: string,
    dni: string,
    name: string,
    email: string,
    image: string,
    businesses: [
      { uuid: string, name: string, role: string }
    ]
  },
  token: string (JWT)
}
```

### 1.2 Encrypted Persistence

**File:** `src/utils/cryptoUtils.js`

- On first login, generates a random 256-bit AES encryption key
- Key stored separately in `localStorage` at key `auth-enc-key`
- Entire Zustand auth state is encrypted before writing to `localStorage`
- On app load, state is decrypted from `localStorage`
- On logout, both auth state AND encryption key are removed

**Security properties:**
- JWT token is never stored in plaintext
- User data is encrypted at rest in browser
- Encryption key is ephemeral per browser session
- No sensitive data in `sessionStorage` or cookies

### 1.3 Token Refresh / Expiry

- JWT `exp` claim is decoded on every route navigation via `jwt-decode`
- If expired: `authStore.logout()` is called, user redirected to `/ingresar`
- No refresh token mechanism — user must re-authenticate
- Axios response interceptor catches `401` status → auto-logout + redirect

### 1.4 Activation Flow

```
1. Admin creates user → backend sends activation email
2. User receives email with link: /resetear?token=<jwt_token>
3. User clicks link → SendActivationEmail page
4. User enters new password
5. authService.activateUser(token, password)
6. POST /api/auth/users/activate/:token
7. Response: { success, message, user }
8. Redirect to /ingresar for first login
```

### 1.5 Logout

```
authStore.logout()
  → Clear user + token from state
  → Remove encryption key from localStorage
  → Zustand persist clears encrypted data
  → Navigate to /ingresar
```

---

## 2. Route Protection (PrivateRoute)

**File:** `src/components/PrivateRoute/PrivateRoute.jsx`

### 2.1 Protection Layers

```
Route request
  │
  ├─ Layer 1: JWT Expiration Check
  │   ├─ Decode token via jwt-decode
  │   ├─ Check exp claim against current time
  │   ├─ If expired → logout() + redirect /ingresar
  │   └─ If valid → continue
  │
  ├─ Layer 2: Basic Auth Check
  │   ├─ If no user or no token → redirect /ingresar
  │   └─ If user + token → continue
  │
  ├─ Layer 3: Role-Based Access Control
  │   ├─ Determine user's role in current businessUuid context
  │   ├─ If Owner or Administrator → full access
  │   ├─ If Technician → blocked from agregar/editar/informe routes
  │   └─ If blocked → redirect to parent route
  │
  └─ Layer 4: Alarm Status Token Validation
      ├─ Only for /panel/verestadoalarma/:token routes
      ├─ Decode URL token to extract userId
      ├─ Verify userId matches current logged-in user's UUID
      └─ If mismatch → redirect to /panel
```

### 2.2 Role Resolution

The user's role is determined per `businessUuid` context:

```javascript
// In PrivateRoute.jsx
const userRole = user.businesses.find(
  b => b.uuid === businessUuid
)?.role;

// Role hierarchy:
// Owner → Administrator → Technician
```

---

## 3. Role-Based Access Control (RBAC)

### 3.1 Role Definitions

**File:** `src/utils/userRoles.js`

| Role | Spanish Name | Level | Scope |
|------|-------------|-------|-------|
| `Owner` | Propietario | 1 (highest) | Global — all businesses |
| `Administrator` | Administrador | 2 | Per-business CRUD |
| `Technician` | Operario | 3 (lowest) | Read-only |

### 3.2 Permission Matrix

#### Route-Level Permissions

| Route Pattern | Owner | Admin | Technician |
|---------------|-------|-------|------------|
| `/panel` (Dashboard) | ✅ | ✅ | ✅ |
| `/panel/ubicaciones` | ✅ | ✅ | ✅ |
| `/panel/ubicaciones/:businessUuid` | ✅ | ✅ | ✅ |
| `*/agregar` (any create route) | ✅ | ✅ | ❌ |
| `*/editar` (any edit route) | ✅ | ✅ | ❌ |
| `/panel/usuarios` | ✅ | ✅ | ✅ |
| `/panel/usuarios/:userId` | ✅ | ✅ | ✅ |
| `/panel/dataloggers` | ✅ | ✅ | ✅ |
| `/panel/canales` | ✅ | ✅ | ✅ |
| `/panel/alarmas` | ✅ | ✅ | ✅ |
| `/panel/historial` (Backend Logs) | ✅ | ❌ | ❌ |
| `*/informe` (Reports) | ✅ | ✅ | ❌ |
| `/panel/verestadoalarma/:token` | ✅ | ✅ | ✅ (own only) |

#### Component-Level Permissions

| Component | Owner | Admin | Technician |
|-----------|-------|-------|------------|
| CardBtnSmall (Edit) | ✅ | ✅ | ❌ |
| CardBtnSmall (Delete) | ✅ | ❌ | ❌ |
| ModalDelete | ✅ | ❌ | ❌ |
| Button (Agregar) | ✅ | ✅ | ❌ |
| Forms (Create/Edit) | ✅ | ✅ | ❌ |
| Table actions (Edit/Delete) | ✅ | ✅ | ❌ |

### 3.3 RBAC Implementation Flow

```
User navigates to /panel/usuarios/agregar
  │
  ├─ PrivateRoute intercepts
  │   ├─ Check JWT → valid ✅
  │   ├─ Check auth → user exists ✅
  │   ├─ Check RBAC:
  │   │   ├─ Route contains "agregar" → requires write access
  │   │   ├─ User role = "Technician"
  │   │   └─ Technician → BLOCKED ❌
  │   └─ Redirect to /panel/usuarios
  │
  └─ User sees list view (read-only)
```

### 3.4 Multi-Tenant Context

All data operations are scoped under `businessUuid`:

```
User belongs to multiple businesses:
  [
    { uuid: "abc", name: "Business A", role: "Administrator" },
    { uuid: "def", name: "Business B", role: "Technician" }
  ]

When user selects Business A:
  - Role: Administrator → can CRUD in Business A
  - businessUuid: "abc" → all API calls use this UUID

When user selects Business B:
  - Role: Technician → read-only in Business B
  - businessUuid: "def" → all API calls use this UUID
```

### 3.5 Navbar Location Switcher

**File:** `src/components/Header/Header.jsx`

The location dropdown in the navbar is visible for every logged-in user with at least one accessible location (not only when they have multiple):

- **Single source:** items come from `locationsStore.fetchLocations(user)`, which resolves all businesses for Owners and assigned businesses for other roles. The store fetch is triggered on `user` change (mirroring `Locations.jsx`).
- **Owner detection:** a user is treated as Owner when `user.businesses_roles.some(br => br.role === 'Owner')` (NOT `user.isOwner == 1`), matching `GetUserCurrentRole` and `Dashboard.jsx`. Owners see all businesses even if not listed in `businesses_roles`.
- **Role subtitle in Spanish:** per-item role is resolved with the `Dashboard.jsx` pattern and mapped via `mappedCurrentRole` (`Owner` → Propietario, `Administrator` → Administrador, `Technician` → Operario).
- `getCurrentBusiness()` matches the URL's `businessUuid` segment against the same source, falling back to the first item.

---

## 4. Axios Client Interceptors

**File:** `src/utils/axiosClient.js`

### 4.1 Request Interceptor

```
Request → interceptor
  │
  ├─ Check if public endpoint (login, register, reset-password)
  │   ├─ If public → send without Authorization header
  │   └─ If private → attach Authorization: Bearer <token>
  │
  └─ Forward request to backend
```

**Public endpoints (no auth required):**
- `/api/users/login`
- `/api/users/register`
- `/api/users/reset-password`
- `/api/auth/login`
- `/api/auth/users/sendactivation/*`
- `/api/auth/users/activate/*`

### 4.2 Response Interceptor

```
Response → interceptor
  │
  ├─ If status 200 → return response
  ├─ If status 401 →
  │   ├─ authStore.logout()
  │   └─ Navigate to /ingresar
  └─ If other error → throw error (handled by store)
```

### 4.3 File Upload Support

```
axiosClient.uploadFile(url, formData)   // POST with multipart/form-data
axiosClient.uploadFilePUT(url, formData) // PUT with multipart/form-data
```

Used by: `locationsService`, `usersService`, `dataloggersService`, `channelsService`

---

## 5. Security Considerations

### 5.1 What IS Protected
- ✅ JWT-based authentication on all private routes
- ✅ AES-encrypted localStorage persistence
- ✅ Auto-logout on JWT expiry
- ✅ Auto-logout on 401 response
- ✅ Role-based route protection (PrivateRoute)
- ✅ Alarm status token validation (userId match)
- ✅ Input sanitization via `sanitizeInput()`

### 5.2 Known Gaps / Risks
- ⚠️ No refresh token — session dies on JWT expiry
- ⚠️ Encryption key stored in same localStorage (accessible to XSS)
- ⚠️ No CSRF protection (state-changing requests via POST/PUT/DELETE)
- ⚠️ No rate limiting on frontend login attempts
- ⚠️ Technician RBAC is frontend-only — backend should also enforce
- ⚠️ No Content Security Policy (CSP) headers configured
- ⚠️ `businessUuid` extracted from URL params, not from auth context (potential for IDOR)

---

## 6. Acceptance Criteria for Any Auth-Related Feature

- [ ] Login stores encrypted auth state
- [ ] JWT expiry triggers auto-logout
- [ ] PrivateRoute blocks unauthenticated users
- [ ] PrivateRoute blocks Technician from write routes
- [ ] PrivateRoute blocks Admin from Backend Logs
- [ ] Axios interceptor attaches token to all private requests
- [ ] 401 response triggers auto-logout
- [ ] Logout clears both auth state and encryption key
- [ ] `sanitizeInput()` applied to all user inputs
- [ ] No sensitive data in plaintext localStorage
- [ ] No hardcoded secrets or tokens in codebase
