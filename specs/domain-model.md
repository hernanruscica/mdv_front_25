# Domain Model — MDV Sensores Frontend

> This document defines the domain entities, their relationships, and the data model inferred from the frontend's API consumption patterns.

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    User      │──M:N──│  UserBusiness    │──M:1──│  Business   │
│              │       │  (role assigned) │       │ (Location)  │
└──────┬──────┘       └──────────────────┘       └──────┬──────┘
       │                                                  │
       │         ┌──────────────────┐                    │
       └────M:N──│   UserAlarm      │──M:1──┐           │
                 │ (alarm subscribe)│       │           │
                 └──────────────────┘       │           │
                                            │           │
┌─────────────┐       ┌──────────────┐      │           │
│   Datalogger │──M:1──│   Business   │──────┘           │
│              │       └──────────────┘                  │
└──────┬──────┘                                          │
       │                                                  │
       │         ┌──────────────┐                        │
       └────M:1──│   Channel    │──M:1──Business         │
                 │              │                         │
                 └──────┬───────┘                         │
                        │                                 │
       ┌────────────────┼────────────────┐               │
       │                │                │               │
       ▼                ▼                ▼               ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Alarm     │  │ MaintenanceLog│  │ ChannelData  │  │   Solution   │
│              │  │              │  │ (time-series) │  │              │
└──────┬──────┘  └──────────────┘  └──────────────┘  └──────────────┘
       │
       │
       ▼
┌──────────────┐
│  AlarmLog    │
│              │
└──────────────┘

┌──────────────┐
│ BackendLog   │  (standalone, system-level audit)
└──────────────┘
```

---

## Entity Definitions

### 1. User

**Service:** `usersService.js`
**Store:** `usersStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string (uuid)` | Primary key |
| `dni` | `string` | National ID (7-9 digits) |
| `name` | `string` | Full name |
| `email` | `string` | Email address |
| `image` | `string (URL)` | Profile image (Cloudinary) |
| `createdAt` | `ISO 8601` | Creation timestamp |
| `updatedAt` | `ISO 8601` | Last update timestamp |

**Relationships:**
- Has many `Business` (via `UserBusiness` join table, with role)
- Has many `Alarm` subscriptions (via `UserAlarm` join table)

---

### 2. Business (Location)

**Service:** `locationsService.js`
**Store:** `locationsStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string (uuid)` | Primary key |
| `name` | `string` | Business name |
| `image` | `string (URL)` | Location image (Cloudinary) |
| `address` | `string` | Physical address |
| `phone` | `string` | Contact phone |
| `email` | `string` | Contact email |
| `createdAt` | `ISO 8601` | Creation timestamp |
| `updatedAt` | `ISO 8601` | Last update timestamp |

**Relationships:**
- Has many `Datalogger`
- Has many `Channel`
- Has many `Alarm`
- Has many `User` (via `UserBusiness` join table)
- Has many `AlarmLog`
- Has many `Solution`

---

### 3. UserBusiness (Join Table)

**Service:** `locationUsersService.js` / `usersAlarmsService.js`
**Store:** `locationUsersStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string (uuid)` | Primary key |
| `user_uuid` | `string (uuid)` | FK → User |
| `business_uuid` | `string (uuid)` | FK → Business |
| `role_uuid` | `string (uuid)` | FK → Role |

**Roles:**
| Role UUID | Name | Spanish | Permissions |
|-----------|------|---------|-------------|
| (owner) | Owner | Propietario | Full access, global |
| (admin) | Administrator | Administrador | CRUD on all entities |
| (tech) | Technician | Operario | Read-only |

---

### 4. Datalogger

**Service:** `dataloggersService.js`
**Store:** `dataloggersStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string (uuid)` | Primary key |
| `name` | `string` | Datalogger name |
| `businessUuid` | `string (uuid)` | FK → Business |
| `image` | `string (URL)` | Device image |
| `createdAt` | `ISO 8601` | Creation timestamp |
| `updatedAt` | `ISO 8601` | Last update timestamp |

**Relationships:**
- Belongs to `Business`
- Has many `Channel`
- Has many `MaintenanceLog`
- Generates `Data` (time-series)

---

### 5. Channel

**Service:** `channelsService.js`
**Store:** `channelsStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string (uuid)` | Primary key |
| `name` | `string` | Channel name |
| `businessUuid` | `string (uuid)` | FK → Business |
| `dataloggerUuid` | `string (uuid)` | FK → Datalogger |
| `image` | `string (URL)` | Channel image |
| `createdAt` | `ISO 8601` | Creation timestamp |
| `updatedAt` | `ISO 8601` | Last update timestamp |

**Relationships:**
- Belongs to `Business` and `Datalogger`
- Has many `Alarm`
- Has many `MaintenanceLog`
- Generates `ChannelData` (time-series registers)

---

### 6. Alarm

**Service:** `alarmsService.js`
**Store:** `alarmsStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string (uuid)` | Primary key |
| `name` | `string` | Alarm name |
| `businessUuid` | `string (uuid)` | FK → Business |
| `channelUuid` | `string (uuid)` | FK → Channel |
| `type` | `string` | Alarm type (e.g., `PORCENTAJE_ENCENDIDO`) |
| `condition` | `string` | Condition operator |
| `threshold` | `number` | Threshold value |
| `createdAt` | `ISO 8601` | Creation timestamp |
| `updatedAt` | `ISO 8601` | Last update timestamp |

**Relationships:**
- Belongs to `Business` and `Channel`
- Has many `AlarmLog`
- Has many `User` subscriptions (via `UserAlarm`)

---

### 7. UserAlarm (Join Table)

**Service:** `usersAlarmsService.js`
**Store:** `usersAlarmsStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string (uuid)` | Primary key |
| `alarm_uuid` | `string (uuid)` | FK → Alarm |
| `user_uuid` | `string (uuid)` | FK → User |
| `business_uuid` | `string (uuid)` | FK → Business |

---

### 8. AlarmLog

**Service:** `alarmLogsService.js`
**Store:** `alarmLogsStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string (uuid)` | Primary key |
| `alarmUuid` | `string (uuid)` | FK → Alarm |
| `dataloggerUuid` | `string (uuid)` | FK → Datalogger |
| `businessUuid` | `string (uuid)` | FK → Business |
| `triggeredAt` | `ISO 8601` | When alarm was triggered |
| `value` | `number` | Value that triggered the alarm |
| `resolvedAt` | `ISO 8601` | When alarm was resolved (nullable) |
| `createdAt` | `ISO 8601` | Creation timestamp |

**Relationships:**
- Belongs to `Alarm` and `Business`
- Has many `Solution`

---

### 9. MaintenanceLog

**Service:** `maintenanceLogsService.js`
**Store:** `maintenanceLogsStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string (uuid)` | Primary key |
| `businessUuid` | `string (uuid)` | FK → Business |
| `dataloggerUuid` | `string (uuid)` | FK → Datalogger |
| `channelUuid` | `string (uuid)` | FK → Channel (nullable, null = datalogger-level) |
| `type` | `string` | `"task"` or `"observation"` |
| `title` | `string` | Log title |
| `description` | `string` | Log description |
| `completed` | `boolean` | Whether task is completed |
| `createdAt` | `ISO 8601` | Creation timestamp |
| `updatedAt` | `ISO 8601` | Last update timestamp |

**Relationships:**
- Belongs to `Business` and `Datalogger`
- Optionally belongs to `Channel`

---

### 10. Solution

**Service:** `solutionsService.js`
**Store:** `solutionsStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string (uuid)` | Primary key |
| `alarmLogUuid` | `string (uuid)` | FK → AlarmLog |
| `description` | `string` | Solution description |
| `userId` | `string (uuid)` | FK → User (who proposed solution) |
| `businessUuid` | `string (uuid)` | FK → Business |
| `createdAt` | `ISO 8601` | Creation timestamp |

**Relationships:**
- Belongs to `AlarmLog` and `User`

---

### 11. ChannelData (Time-Series)

**Service:** `dataService.js`
**Store:** `dataStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | `ISO 8601` | Measurement timestamp |
| `value` | `number` | Measured value |
| `failure` | `boolean` | Communication failure flag |
| `channelUuid` | `string (uuid)` | FK → Channel |

**Aggregation types:**
- **Registers:** Raw per-measurement data
- **Daily:** Daily aggregated data
- **Weekly:** Weekly aggregated data
- **On-time:** Total functioning time percentage
- **Energy incidents:** Energy failure events

---

### 12. BackendLog

**Service:** `backendLogsService.js`
**Store:** `backendLogsStore.js`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string (uuid)` | Primary key |
| `timestamp` | `ISO 8601` | Event timestamp (adjusted -3h for UTC-3) |
| `level` | `string` | Log level (info, warn, error) |
| `message` | `string` | Log message |
| `service` | `string` | Originating service |
| `createdAt` | `ISO 8601` | Creation timestamp |

**Access:** Owner-only

---

## Data Flow Summary

```
User → Login → JWT Token → axiosClient interceptor → Backend API
                                                              │
Business ← locationsService ← businessesStore ← LocationsPage
    │
    ├── Dataloggers ← dataloggersService ← dataloggersStore
    │       └── Channels ← channelsService ← channelsStore
    │               ├── Alarms ← alarmsService ← alarmsStore
    │               ├── Data ← dataService ← dataStore (time-series)
    │               └── MaintenanceLogs ← maintenanceLogsService
    │
    ├── Users ← usersService ← usersStore
    │       └── UserBusiness assignments (roles)
    │
    ├── AlarmLogs ← alarmLogsService ← alarmLogsStore
    │       └── Solutions ← solutionsService ← solutionsStore
    │
    └── BackendLogs ← backendLogsService ← backendLogsStore (Owner-only)
```
