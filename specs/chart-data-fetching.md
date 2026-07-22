# Spec: Chart Data Fetching Pipeline

> Complete specification of how time-series data flows from backend API to chart-ready state.

**Status:** `approved`
**Skill:** `chart-data-fetching`
**Owner:** Frontend Agent + API Contract Agent

---

## 1. Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────────┐
│ Backend API │────▶│ dataService  │────▶│  dataStore   │────▶│ ViewChart / hooks │
│  (7 endpoints)   │  (axios calls)│     │  (Zustand)   │     │  (transformation) │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────────┘
```

---

## 2. Service Layer — `src/services/dataService.js`

### 2.1 Channel Usage (Summary/Gauge)

```
GET /api/data/getLastPorcentageUsageByChannel/businesses/:businessUuid/:dataloggerUuid/:channelUuid
```

**Function:** `getChannelUsage(businessUuid, dataloggerUuid, channelUuid)`
**Returns:** `response.data.data` or `null` on error

**Response shape:**
```json
{
  "name": "Canal A1",
  "averaging_period": 10,
  "totalData": {
    "total_time_on_hours": 1234.5,
    "first_date": "2025-01-01",
    "average_usage_percentage": 72.3
  },
  "lastData": {
    "last_record_date": "2025-07-22T10:30:00Z",
    "porcentajeUsagePeriod": 85.2
  }
}
```

---

### 2.2 Datalogger Usage

```
GET /api/data/getDataloggerLastData/businesses/:businessUuid/:dataloggerUuid
```

**Function:** `getDataloggerUsage(businessUuid, dataloggerUuid)`
**Returns:** `response.data.data` or `null`

**Response shape:**
```json
{
  "lastConection": "2025-07-22T10:30:00Z",
  "channels": [
    { "uuid": "...", "lastData": { "porcentajeUsagePeriod": 85.2 } }
  ]
}
```

---

### 2.3 Channel All Registers (Fine-Grained)

```
GET /api/data/allregisters/businesses/:businessUuid/:channelUuid?start='...'&end='...'
```

**Function:** `getChannelAllRegisters(businessUuid, channelUuid, start, end)`
**Returns:** `response.data.data` or `null`
**Used for ranges:** `LAST_HOUR`, `LAST_12H`, `LAST_24H`, `CUSTOM_DAY_ZOOM`

**Note:** Dates are wrapped in single quotes in the query string.

**Response shape:**
```json
[
  {
    "fecha": "2025-01-15T10:30:00Z",
    "porcentaje_promedio": 75.5,
    "texto": "Normal",
    "energia": 0,
    "conection_failures": 0,
    "energy_failures": 0,
    "phase_failures": 0,
    "failure": false
  }
]
```

---

### 2.4 Channel Daily Aggregates

```
GET /api/data/alldaily/businesses/:businessUuid/:channelUuid?start='...'&end='...'
```

**Function:** `getChannelDaily(businessUuid, channelUuid, start, end)`
**Returns:** `response.data.data` or `null`
**Used for ranges:** `LAST_WEEK`, `LAST_MONTH`, `CUSTOM_WEEK_ZOOM`

**Response shape:**
```json
[
  {
    "dia": "2025-01-15",
    "porcentaje_uso": 65.3,
    "conection_failures": 0,
    "energy_failures": 0,
    "phase_failures": 0
  }
]
```

---

### 2.5 Channel Weekly Aggregates

```
GET /api/data/allweekly/businesses/:businessUuid/:channelUuid?start='...'&end='...'
```

**Function:** `getChannelWeekly(businessUuid, channelUuid, start, end)`
**Returns:** `response.data.data` or `null`
**Used for ranges:** `LAST_6_MONTHS`, `LAST_YEAR`

**Response shape:**
```json
[
  {
    "inicio_semana": "2025-01-13",
    "numero_semana": "2025-3",
    "porcentaje_semanal": 72.1,
    "max_dia_porcentaje": 89.0,
    "fecha_del_maximo": "2025-01-15",
    "min_dia_porcentaje": 55.2,
    "fecha_del_minimo": "2025-01-19"
  }
]
```

---

### 2.6 Total On-Time

```
GET /api/data/totalontime/businesses/:businessUuid/:channelUuid[?start='...'][&end='...']
```

**Function:** `getTotalOnTime(businessUuid, channelUuid, start, end)`
**Returns:** `response.data` (NOT `.data.data` — different from other functions)
**Error return:** `{ success: false, data: null }`

---

### 2.7 Energy Incidents

```
GET /api/data/energyincidents/businesses/:businessUuid/:dataloggerUuid[?start='...'][&end='...']
```

**Function:** `getEnergyIncidents(businessUuid, dataloggerUuid, start, end)`
**Returns:** `response.data` (NOT `.data.data`)
**Error return:** `{ success: false, data: [], count: 0 }`

---

## 3. Store Layer — `src/store/dataStore.js`

### 3.1 State Shape

```javascript
{
  channelUsage: null,
  dataloggerUsage: null,
  channelAllRegistersData: null,
  channelDailyData: null,
  channelWeeklyData: null,
  energyIncidents: null,

  loadingStates: {
    fetchChannelUsage: false,
    fetchDataloggerUsage: false,
    fetchAllRegistersChannelData: false,
    fetchDailyChannelData: false,
    fetchWeeklyChannelData: false,
    fetchEnergyIncidents: false,
  },

  error: null,  // single string — last error only
}
```

### 3.2 Fetch Actions

| Action | Calls Service | Stores In |
|--------|-------------|-----------|
| `fetchChannelUsage(businessUuid, dataloggerUuid, channelUuid)` | `getChannelUsage` | `channelUsage` |
| `fetchDataloggerUsage(businessUuid, dataloggerUuid)` | `getDataloggerUsage` | `dataloggerUsage` |
| `fetchAllRegistersChannelData(businessUuid, channelUuid, start, end)` | `getChannelAllRegisters` | `channelAllRegistersData` |
| `fetchDailyChannelData(businessUuid, channelUuid, start, end)` | `getChannelDaily` | `channelDailyData` |
| `fetchWeeklyChannelData(businessUuid, channelUuid, start, end)` | `getChannelWeekly` | `channelWeeklyData` |
| `fetchEnergyIncidents(businessUuid, dataloggerUuid, start, end)` | `getEnergyIncidents` | `energyIncidents` |

All actions return the fetched data (allows `await` chaining).

---

## 4. Range-to-Endpoint Mapping

**Defined in:** `src/components/ViewChart/constants/chartRanges.js`

| Range Key | Label | Granularity | Store Action | Date Calculation |
|-----------|-------|-------------|--------------|-----------------|
| `LAST_HOUR` | 1 Hora | Registers | `fetchAllRegistersChannelData` | now - 1h |
| `LAST_12H` | 12 Horas | Registers | `fetchAllRegistersChannelData` | now - 12h |
| `LAST_24H` | 24 Horas | Registers | `fetchAllRegistersChannelData` | now - 24h |
| `LAST_WEEK` | 1 Semana | Daily | `fetchDailyChannelData` | now - 7d |
| `LAST_MONTH` | 1 Mes | Daily | `fetchDailyChannelData` | now - 30d |
| `LAST_6_MONTHS` | 6 Meses | Weekly | `fetchWeeklyChannelData` | now - 6 months |
| `LAST_YEAR` | 1 Año | Weekly | `fetchWeeklyChannelData` | now - 1 year |
| `CUSTOM_DAY_ZOOM` | (drill-down) | Registers | `fetchAllRegistersChannelData` | clicked day start/end |
| `CUSTOM_WEEK_ZOOM` | (drill-down) | Daily | `fetchDailyChannelData` | clicked week start/end |

---

## 5. ViewChart Data Transformation

**File:** `src/components/ViewChart/ViewChart.jsx`

### 5.1 Data Selection (`standardizedData` useMemo)

Selects correct raw data based on active range:

```
Registers (hourly/12h/24h/day-zoom):
  source: channelAllRegistersData
  map: { date: item.fecha, value: item.porcentaje_promedio, ... }

Daily (week/month/week-zoom):
  source: channelDailyData
  map: { date: item.dia, value: item.porcentaje_uso, ... }

Weekly (6-month/year):
  source: channelWeeklyData
  map: Generates complete week sequence, fills gaps with zeros
```

### 5.2 Date Parsing Rules

| Data Type | Source Field | Parsing |
|-----------|-------------|---------|
| Registers | `fecha` (ISO with time) | `new Date(fecha)` |
| Daily | `dia` or `fecha` (date-only) | UTC midnight `new Date(dia + 'T00:00:00Z')` |
| Weekly | `inicio_semana` (date-only) | Local `new Date(fecha)` |

### 5.3 Alarm Overlay

Alarm data points are merged into the chart data:
1. **Source A:** `alarmLogs` → percentage-on alarms (filtered by `triggered === 1`)
2. **Source B:** `alarmLogsComunicationFailure` → communication failure logs
3. **Source C:** `energyIncidentsData` → energy incidents from API

Combined into `processedAlarms`:
```javascript
{
  timestamp: number (ms),
  originalValue: number | null,
  message: string,
  alarmType: 'porcentage_on' | 'comunication_failure' | 'energy_failure',
  dateStr: 'YYYY-MM-DD',
  energia: number
}
```

Multiple alarms at same timestamp are grouped with `|` separator.

### 5.4 Gap Detection

After sorting, null-value points are inserted between distant data points:

| Data Type | Gap Threshold |
|-----------|--------------|
| Daily | 26 hours |
| Registers | `average_period * 3` minutes |

---

## 6. useTimeSeriesChart Hook (ApexCharts System)

**File:** `src/hooks/useTimeSeriesChart.js`

### Adaptive Aggregation

| hoursBackView | Strategy | Output Series |
|--------------|----------|---------------|
| `<= 168` (1 week) | Raw points | Original series config |
| `168-720` (1 week - 1 month) | Group by day | Máximo (green), Promedio (blue), Mínimo (red) |
| `> 720` (1 month+) | Group by 7-day weeks | Same 3 series |

### Grouping Functions

- `groupDataByDay(data)`: Groups by ISO date key, computes min/max/avg per day
- `groupDataByWeek(data)`: Groups by 7-day windows anchored to first data point

### Statistics Output

```javascript
{
  "Series Name": {
    max: "89.10",
    min: "12.30",
    avg: "55.70"
  }
}
```

---

## 7. Known Issues

| Issue | Severity | Location |
|-------|----------|----------|
| `useAlarmsGaugesData` references non-existent `fetchDataChannel` | Critical | `src/hooks/useAlarmsGaugesData.js:11` |
| `useChannelDetails` references undefined `datalogger`, `hoursBackView` | Critical | `src/hooks/useChannelDetails.js:77-79` |
| Inconsistent return values: `data.data` vs `data` in services | Medium | `src/services/dataService.js` |
| Shared error string (last error only) | Low | `src/store/dataStore.js` |
| `useTimeSeriesChart` loading state is mount-only, not async | Low | `src/hooks/useTimeSeriesChart.js` |

---

## 8. Acceptance Criteria

- [ ] `dataService` has 7 functions mapping to 7 backend endpoints
- [ ] `dataStore` has 6 fetch actions with per-action loading states
- [ ] `ViewChart` correctly selects data source based on active range
- [ ] Register data maps `fecha` → `date`, `porcentaje_promedio` → `value`
- [ ] Daily data maps `dia` → `date`, `porcentaje_uso` → `value`
- [ ] Weekly data fills gap weeks with zero values
- [ ] Alarm overlay merges 3 sources into unified structure
- [ ] Gap detection inserts null points at correct thresholds
- [ ] Timezone offset applied to all date comparisons
- [ ] All actions return data for `await` chaining
- [ ] `npm run lint` passes
