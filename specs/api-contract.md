# API Contract — MDV Sensores Frontend

> This document defines every backend API endpoint consumed by the frontend.
> Generated from `src/services/` analysis. Backend base URL: `http://localhost:5000`

**Base URL:** `VITE_API_URL=http://localhost:5000`
**Authentication:** `Authorization: Bearer <jwt_token>` (auto-attached by `axiosClient` interceptor)
**Timeout:** 20 seconds

---

## 1. Auth (`src/services/authService.js`)

### 1.1 Login
```
POST /api/auth/login
```
**Body:**
```json
{ "dni": "string (7-9 digits)", "password": "string" }
```
**Response 200:**
```json
{ "user": { "uuid", "dni", "name", "email", "image", "businesses": [...] }, "token": "jwt_string" }
```

### 1.2 Send Activation Email
```
GET /api/auth/users/sendactivation/:email
```
**Response 200:** `{ "message": "..." }`

### 1.3 Activate User
```
POST /api/auth/users/activate/:token
```
**Body:** `{ "password": "string" }`
**Response 200:** `{ "success": true, "message": "...", "user": {...} }`

---

## 2. Locations / Businesses (`src/services/locationsService.js`)

### 2.1 Get All Businesses
```
GET /api/businesses
```
**Response 200:** `{ "businesses": [...] }`

### 2.2 Get Business by ID
```
GET /api/businesses/:locationId
```
**Response 200:** `{ "business": {...} }`

### 2.3 Create Business
```
POST /api/businesses
Content-Type: multipart/form-data
```
**Body (FormData):** `{ locationData: stringified JSON, image: File }`

### 2.4 Update Business Image
```
PUT /api/businesses/:locationId/image
Content-Type: multipart/form-data
```
**Body (FormData):** `{ locationData: stringified JSON, image: File }`

### 2.5 Delete Business
```
DELETE /api/locations/:locationId
```
**Response 200:** `{ "message": "..." }`

---

## 3. Users (`src/services/usersService.js`)

### 3.1 Get All Users in Business
```
GET /api/businesses/:businessUuid/users
```
**Response 200:** `{ "users": [...] }`

### 3.2 Get User by ID
```
GET /api/businesses/:uuidOrigin/users/:uuid
```
**Response 200:** `{ "user": {...} }`

### 3.3 Create User
```
POST /api/businesses/:businessUuid/users
Content-Type: multipart/form-data
```
**Body (FormData):** `{ userData: stringified JSON, image: File }`

### 3.4 Update User
```
PUT /api/businesses/:businessUuid/users/:uuid
Content-Type: multipart/form-data
```
**Body (FormData):** `{ userData: stringified JSON (must include business_uuid), image: File }`

### 3.5 Hard Delete User
```
DELETE /api/businesses/:businessUuid/users/:id/hard
```
**Response 200:** `{ "message": "..." }`

---

## 4. Dataloggers (`src/services/dataloggersService.js`)

### 4.1 Get All Dataloggers in Business
```
GET /api/businesses/:businessUuid/dataloggers
```
**Response 200:** `{ "items": [...] }`

### 4.2 Get Dataloggers by User
```
GET /api/businesses/:businessUuid/dataloggers/:userId
```
**Response 200:** `{ "dataloggers": [...] }`

### 4.3 Get Dataloggers by Location
```
GET /api/dataloggers/bylocation/:locationId
```
**Response 200:** `{ "dataloggers": [...] }`

### 4.4 Get Datalogger by ID
```
GET /api/businesses/:businessUuid/dataloggers/:id
```
**Response 200:** `{ "item": {...} }`

### 4.5 Create Datalogger
```
POST /api/businesses/:businessUuid/dataloggers
Content-Type: multipart/form-data
```
**Body (FormData):** `{ formData: stringified JSON, image: File }`

### 4.6 Update Datalogger
```
PUT /api/businesses/:businessUuid/dataloggers/:id
Content-Type: multipart/form-data
```
**Body (FormData):** `{ formData: stringified JSON (must include businessUuid), image: File }`

---

## 5. Channels (`src/services/channelsService.js`)

### 5.1 Get All Channels in Business
```
GET /api/businesses/:businessId/channels
```
**Response 200:** `{ "channels": [...] }`

### 5.2 Get Channels by User
```
GET /api/businesses/:businessId/channels/byuser/:userId
```
**Response 200:** `{ "channels": [...] }`

### 5.3 Get Channel by ID
```
GET /api/businesses/:businessId/channels/:channelId
```
**Response 200:** `{ "item": {...} }`

### 5.4 Create Channel
```
POST /api/businesses/:businessId/channels
Content-Type: multipart/form-data
```
**Body (FormData):** `{ channelData: stringified JSON, image: File }`

### 5.5 Update Channel
```
PUT /api/businesses/:businessId/channels/:channelId
Content-Type: multipart/form-data
```
**Body (FormData):** `{ channelData: stringified JSON (must include businessUuid), image: File }`

> **Known bug:** `getAll()` and `getAllById()` reference an undefined `businessId` closure variable.

---

## 6. Alarms (`src/services/alarmsService.js`)

### 6.1 Get All Alarms in Business
```
GET /api/businesses/:businessUuid/alarms
```
**Response 200:** `{ "items": [...] }`

### 6.2 Get Alarms by User (via alarmusers)
```
GET /api/alarmusers/alarmsbyuser/:userId
```
**Response 200:** `{ "alarms": [...] }`

### 6.3 Get Alarms by Location
```
GET /api/businesses/:locationId/alarms
```
**Response 200:** `{ "items": [...] }`

### 6.4 Get Alarms by User in Location
```
GET /api/businesses/:locationId/alarms/user/:userId
```
**Response 200:** `{ "alarms": [...] }`

### 6.5 Get Alarms by Channel
```
GET /api/alarms/bychannel/:channelId
```
**Response 200:** `{ "alarms": [...] }`

### 6.6 Get Alarm by ID
```
GET /api/businesses/:businessUuid/alarms/:alarmId
```
**Response 200:** `{ "item": {...} }`

### 6.7 Create Alarm
```
POST /api/businesses/:businessUuid/alarms
```
**Body (JSON):** `{ "businessUuid", "name", "channelUuid", "type", "condition", "threshold", ... }`

### 6.8 Update Alarm
```
PUT /api/businesses/:businessUuid/alarms/:alarmId
```
**Body (JSON):** alarm fields

### 6.9 Get All Alarms by User UUID
```
GET /api/users/alarms/:userUuid
```
**Response 200:** `{ "items": [...] }`

---

## 7. Alarm Logs (`src/services/alarmLogsService.js`)

### 7.1 Get Alarm Logs by Alarm ID
```
GET /api/businesses/:businessUuid/alarmlogs/alarm/:alarmId
```
**Response 200:** `{ "items": [...] }`

### 7.2 Get Alarm Logs by Datalogger ID
```
GET /api/businesses/:businessUuid/alarmlogs/datalogger/:dataloggerId
```
**Response 200:** `{ "items": [...] }`

### 7.3 Update Alarm Log
```
PUT /api/businesses/:businessUuid/alarmLogs/:id
```
**Body (JSON):** alarm log fields

---

## 8. Users-Alarms Subscriptions (`src/services/usersAlarmsService.js`)

### 8.1 Get All Location-User Assignments
```
GET /api/locationsusers
```
**Response 200:** `{ "locationsUsers": [...] }`

### 8.2 Get Users Subscribed to Alarm
```
GET /api/businesses/:businessUuid/users-alarms/alarm/:alarmUuid
```
**Response 200:** `{ "users": [...] }`

### 8.3 Subscribe User to Alarm
```
POST /api/businesses/:businessUuid/users-alarms
```
**Body (JSON):** `{ "alarm_uuid", "user_uuid", "business_uuid" }`

### 8.4 Unsubscribe User from Alarm (hard delete)
```
DELETE /api/businesses/:businessUuid/users-alarms/:userAlarmUuid/hard
```

### 8.5 Create User-Business Assignment
```
POST /api/businesses/:businessUuid/user-businesses
```
**Body (FormData):** `{ user_uuid, business_uuid, role_uuid }`

### 8.6 Update User-Business Assignment
```
PUT /api/businesses/:businessUuid/user-businesses/:businessUserUuid
```
**Body (FormData):** `{ user_uuid, business_uuid, role_uuid }`

### 8.7 Delete User-Business Assignment (hard)
```
DELETE /api/businesses/:businessUuid/user-businesses/:businessUserUuid/hard
```

---

## 9. Location-Users (`src/services/locationUsersService.js`)

> **Note:** Endpoints 9.1–9.4 are identical to `usersAlarmsService.js` 8.5–8.8. Significant code duplication.

### 9.1 Get All Location-User Assignments
```
GET /api/locationsusers
```
**Response 200:** `{ "locationsUsers": [...] }`

### 9.2 Get Locations by User
```
GET /api/locationsusers/locationsbyuser/:userId
```
**Response 200:** `{ "locationUserData": [...] }`

### 9.3 Create User-Business Assignment
```
POST /api/businesses/:businessUuid/user-businesses
```

### 9.4 Update User-Business Assignment
```
PUT /api/businesses/:businessUuid/user-businesses/:businessUserUuid
```

### 9.5 Delete User-Business Assignment (hard)
```
DELETE /api/businesses/:businessUuid/user-businesses/:businessUserUuid/hard
```

---

## 10. Data / Time-Series (`src/services/dataService.js`)

### 10.1 Get Channel Usage (Last Percentage)
```
GET /api/data/getLastPorcentageUsageByChannel/businesses/:businessUuid/:dataloggerUuid/:channelUuid
```
**Response 200:** `{ "data": [...] }`

### 10.2 Get Datalogger Usage (Last Data)
```
GET /api/data/getDataloggerLastData/businesses/:businessUuid/:dataloggerUuid
```
**Response 200:** `{ "data": [...] }`

### 10.3 Get Channel All Registers
```
GET /api/data/allregisters/businesses/:businessUuid/:channelUuid?start='...'&end='...'
```
**Query params:** `start`, `end` (quoted ISO date strings)
**Response 200:** `{ "data": [...] }`

### 10.4 Get Channel Daily Aggregates
```
GET /api/data/alldaily/businesses/:businessUuid/:channelUuid?start='...'&end='...'
```
**Response 200:** `{ "data": [...] }`

### 10.5 Get Channel Weekly Aggregates
```
GET /api/data/allweekly/businesses/:businessUuid/:channelUuid?start='...'&end='...'
```
**Response 200:** `{ "data": [...] }`

### 10.6 Get Total On-Time
```
GET /api/data/totalontime/businesses/:businessUuid/:channelUuid[?start='...'][&end='...']
```
**Response 200:** `{ "success": true, "data": {...} }`

### 10.7 Get Energy Incidents
```
GET /api/data/energyincidents/businesses/:businessUuid/:dataloggerUuid[?start='...'][&end='...']
```
**Response 200:** `{ "success": true, "data": [...], "count": number }`

---

## 11. Maintenance Logs (`src/services/maintenanceLogsService.js`)

### Datalogger-Level (no channelUuid):

| Method | Path |
|--------|------|
| `GET` | `/api/businesses/:businessUuid/dataloggers/:dataloggerUuid/maintenance-logs` |
| `GET` | `/api/businesses/:businessUuid/dataloggers/:dataloggerUuid/maintenance-logs/:maintenanceLogUuid` |
| `POST` | `/api/businesses/:businessUuid/dataloggers/:dataloggerUuid/maintenance-logs` |
| `PUT` | `/api/businesses/:businessUuid/dataloggers/:dataloggerUuid/maintenance-logs/:maintenanceLogUuid` |
| `PUT` | `/api/businesses/:businessUuid/dataloggers/:dataloggerUuid/maintenance-logs/:maintenanceLogUuid/complete` |
| `DELETE` | `/api/businesses/:businessUuid/dataloggers/:dataloggerUuid/maintenance-logs/:maintenanceLogUuid` |
| `DELETE` | `/api/businesses/:businessUuid/dataloggers/:dataloggerUuid/maintenance-logs/:maintenanceLogUuid/hard` |

### Channel-Level (with channelUuid):

| Method | Path |
|--------|------|
| `GET` | `/api/businesses/:businessUuid/dataloggers/:dataloggerUuid/channels/:channelUuid/maintenance-logs` |
| `GET` | `.../channels/:channelUuid/maintenance-logs/:maintenanceLogUuid` |
| `POST` | `.../channels/:channelUuid/maintenance-logs` |
| `PUT` | `.../channels/:channelUuid/maintenance-logs/:maintenanceLogUuid` |
| `PUT` | `.../channels/:channelUuid/maintenance-logs/:maintenanceLogUuid/complete` |
| `DELETE` | `.../channels/:channelUuid/maintenance-logs/:maintenanceLogUuid` |
| `DELETE` | `.../channels/:channelUuid/maintenance-logs/:maintenanceLogUuid/hard` |

**POST/PUT Body (JSON):** `{ "type": "task|observation", "title", "description", "completed", ... }`

---

## 12. Solutions (`src/services/solutionsService.js`)

### 12.1 Create Solution
```
POST /api/businesses/:businessUuid/solutions
```
**Body (JSON):** `{ "alarmLogUuid", "description", "userId", ... }`

### 12.2 Get Solutions by Alarm Log ID
```
GET /api/businesses/:businessUuid/solutions/alarmlogs/:alarmLogId
```
**Response 200:** `{ "items": [...] }`

### 12.3 Get Solutions by User ID
```
GET /api/solutions/byuser/:userId
```
**Response 200:** `{ "success": true, "data": [...] }`

---

## 13. Backend Logs (`src/services/backendLogsService.js`)

### 13.1 Get All Logs (paginated)
```
GET /api/backendlogs?page=...&limit=...&[filters]
```
**Response 200:** `{ "items": [...], "total": number, "page": number, "pages": number }`
**Note:** Timestamps adjusted by -3h (UTC-3 Argentina timezone)

### 13.2 Get Log by UUID
```
GET /api/backendlogs/:uuid
```
**Response 200:** `{ "item": {...} }`

---

## 14. Reports (`src/services/reportService.js`)

This service makes **no direct HTTP calls**. It aggregates data from:
- `dataService.getChannelUsage`
- `maintenanceLogsService.getAllByChannel`
- `alarmLogsService.getByDataloggerId`
- `dataService.getTotalOnTime`
- `dataService.getEnergyIncidents`

**Returns composite object:**
```json
{
  "channelData": [...],
  "maintenanceLogs": [...],
  "maintenanceByType": { "tasks": [...], "observations": [...] },
  "alarmLogs": [...],
  "periodData": {...},
  "hasPeriodData": boolean,
  "energyIncidents": [...],
  "summary": {
    "totalUsageHours", "avgFunctioning", "firstDate", "lastDate",
    "periodUsageHours", "periodAvgFunctioning", "periodFirstDate", "periodLastDate",
    "periodRegistersQuantity", "comunicationFailuresCount", "alarmTriggersCount", "energyFailuresCount"
  },
  "details": {
    "comunicationFailures": [...],
    "alarmTriggers": [...],
    "maintenanceLogs": [...]
  }
}
```

---

## Appendix: Endpoint Count Summary

| Domain | Unique Endpoints |
|--------|-----------------|
| Auth | 3 |
| Locations/Businesses | 5 |
| Users | 5 |
| Dataloggers | 6 |
| Channels | 5 |
| Alarms | 9 |
| Alarm Logs | 3 |
| Users-Alarms | 7 |
| Location-Users | 5 |
| Data/Time-Series | 7 |
| Maintenance Logs | 14 |
| Solutions | 3 |
| Backend Logs | 2 |
| Reports | 0 (composite) |
| **Total** | **~74 unique endpoints** |
