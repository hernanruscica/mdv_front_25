# API Endpoint Specification Template

> Copy this template for each new API endpoint or group of related endpoints.

---

## 1. Overview

**Service file:** `src/services/xxxService.js`
**Domain entity:** `[Entity Name]`
**Author:** `[Agent Name]`
**Date:** `[YYYY-MM-DD]`
**Status:** `draft | in-review | approved | implemented`

### Base URL
```
VITE_API_URL=http://localhost:5000
```

### Authentication
All endpoints require `Authorization: Bearer <token>` header (added automatically by `axiosClient` interceptor).

---

## 2. Endpoints

### 2.1 Get All `[Entities]`

```
GET /api/businesses/:businessUuid/xxx
```

**Purpose:** Fetch all entities for a given business

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `businessUuid` | `string (uuid)` | The business/location UUID |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| — | — | — | None |

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:** None

**Response 200:**
```json
{
  "xxx": [
    {
      "uuid": "string",
      "name": "string",
      "businessUuid": "string (uuid)",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ]
}
```

**Error Responses:**
| Status | Body | Condition |
|--------|------|-----------|
| `401` | `{ "message": "Token expired" }` | JWT expired |
| `403` | `{ "message": "Not authorized" }` | User lacks permission |
| `500` | `{ "message": "Server error" }` | Backend failure |

**Frontend mapping:**
- Service: `xxxService.getAll(businessUuid)`
- Store: `fetchXxx()` → updates `xxx[]`
- Loading: `loadingStates.fetchXxx`

---

### 2.2 Get Single `[Entity]`

```
GET /api/businesses/:businessUuid/xxx/:id
```

**Purpose:** Fetch a single entity by ID

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `businessUuid` | `string (uuid)` | The business UUID |
| `id` | `string (uuid)` | The entity UUID |

**Response 200:**
```json
{
  "uuid": "string",
  "name": "string",
  "businessUuid": "string (uuid)"
}
```

**Error Responses:**
| Status | Body | Condition |
|--------|------|-----------|
| `404` | `{ "message": "XXX not found" }` | Entity doesn't exist |

**Frontend mapping:**
- Service: `xxxService.getById(businessUuid, id)`
- Store: `fetchXxxById()` → updates `selectedXxx`

---

### 2.3 Create `[Entity]`

```
POST /api/businesses/:businessUuid/xxx
```

**Purpose:** Create a new entity

**Request Body:**
```json
{
  "name": "string (required, 2-100 chars)",
  "description": "string (optional)"
}
```

**Validation (frontend):**
```javascript
{
  name: { required: true, minLength: 2, maxLength: 100 },
  description: { required: false }
}
```

**Response 201:**
```json
{
  "message": "XXX created successfully",
  "xxx": {
    "uuid": "string (newly created)",
    "name": "string",
    "businessUuid": "string (uuid)"
  }
}
```

**Error Responses:**
| Status | Body | Condition |
|--------|------|-----------|
| `400` | `{ "message": "Validation error: ..." }` | Invalid data |
| `409` | `{ "message": "XXX already exists" }` | Duplicate name |

**Frontend mapping:**
- Service: `xxxService.create(businessUuid, data)`
- Store: `createXxx()` → appends to `xxx[]`
- Loading: `loadingStates.createXxx`
- Toast: `toast.success("XXX creado exitosamente")`

---

### 2.4 Update `[Entity]`

```
PUT /api/businesses/:businessUuid/xxx/:id
```

**Purpose:** Update an existing entity

**Request Body:** (partial update — only sent fields are updated)
```json
{
  "name": "string (optional)"
}
```

**Response 200:**
```json
{
  "message": "XXX updated successfully",
  "xxx": {
    "uuid": "string",
    "name": "string (updated)"
  }
}
```

**Error Responses:**
| Status | Body | Condition |
|--------|------|-----------|
| `404` | `{ "message": "XXX not found" }` | Entity doesn't exist |
| `400` | `{ "message": "Validation error: ..." }` | Invalid data |

**Frontend mapping:**
- Service: `xxxService.update(businessUuid, id, data)`
- Store: `updateXxx()` → updates item in `xxx[]`
- Loading: `loadingStates.updateXxx`
- Toast: `toast.success("XXX actualizado exitosamente")`

---

### 2.5 Delete `[Entity]`

```
DELETE /api/businesses/:businessUuid/xxx/:id
```

**Purpose:** Delete an entity

**Response 200:**
```json
{
  "message": "XXX deleted successfully"
}
```

**Error Responses:**
| Status | Body | Condition |
|--------|------|-----------|
| `404` | `{ "message": "XXX not found" }` | Entity doesn't exist |
| `409` | `{ "message": "Cannot delete: referenced by other entities" }` | FK constraint |

**Frontend mapping:**
- Service: `xxxService.delete(businessUuid, id)`
- Store: `deleteXxx()` → removes from `xxx[]`
- Loading: `loadingStates.deleteXxx`
- Toast: `toast.success("XXX eliminado exitosamente")`
- Confirmation: `ModalConfirmation` before action

---

## 3. Service File Structure

```javascript
// src/services/xxxService.js
import axiosClient from '../utils/axiosClient';

const xxxService = {
  getAll: async (businessUuid) => {
    const response = await axiosClient.get(`/api/businesses/${businessUuid}/xxx`);
    return response.data;
  },

  getById: async (businessUuid, id) => {
    const response = await axiosClient.get(`/api/businesses/${businessUuid}/xxx/${id}`);
    return response.data;
  },

  create: async (businessUuid, data) => {
    const response = await axiosClient.post(`/api/businesses/${businessUuid}/xxx`, data);
    return response.data;
  },

  update: async (businessUuid, id, data) => {
    const response = await axiosClient.put(`/api/businesses/${businessUuid}/xxx/${id}`, data);
    return response.data;
  },

  delete: async (businessUuid, id) => {
    const response = await axiosClient.delete(`/api/businesses/${businessUuid}/xxx/${id}`);
    return response.data;
  },
};

export default xxxService;
```

---

## 4. Store Integration

```javascript
// In the corresponding store
fetchXxx: async (businessUuid) => {
  set((state) => ({
    loadingStates: { ...state.loadingStates, fetchXxx: true },
    error: null,
  }));
  try {
    const data = await xxxService.getAll(businessUuid);
    set((state) => ({
      xxx: data.xxx,
      loadingStates: { ...state.loadingStates, fetchXxx: false },
    }));
  } catch (error) {
    set({
      error: error.response?.data?.message || 'Error fetching XXX',
      loadingStates: { ...get().loadingStates, fetchXxx: false },
    });
  }
},
```

---

## 5. Acceptance Criteria

- [ ] Service file follows `axiosClient` pattern
- [ ] All CRUD operations are implemented
- [ ] Store actions use fine-grained loading states
- [ ] Error handling extracts `response.data.message`
- [ ] Toast notifications on success for create/update/delete
- [ ] Confirmation modal before delete
- [ ] `npm run lint` passes
