# Chart Feature Specification Template

> Copy this template for features involving data visualization (charts, gauges, time-series).

---

## 1. Context & Purpose

**Feature name:** `[Feature Name]`
**Author:** `[Agent Name]`
**Date:** `[YYYY-MM-DD]`
**Status:** `draft | in-review | approved | implemented`

### Problem Statement
[What data needs to be visualized? What insight does the user need?]

### Scope
- [ ] New chart component
- [ ] New gauge component
- [ ] New data source (API endpoint)
- [ ] Modification to existing chart
- [ ] New drill-down path
- [ ] PDF/report integration

### Related Specs
- `specs/chart-data-fetching.md` — Data pipeline reference
- `specs/chart-rendering.md` — Visualization patterns reference
- `specs/api-data-persistence.md` — Storage/refresh patterns reference

---

## 2. Data Source

### API Endpoint

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/...` | [What data] |

### Response Schema

```json
{
  "data": [
    {
      "timestamp_field": "ISO 8601",
      "value_field": "number",
      "failure_flag": "boolean"
    }
  ]
}
```

### Data Mapping

| API Field | Chart Field | Transform |
|-----------|------------|-----------|
| `timestamp_field` | `date` | `new Date(field).getTime()` |
| `value_field` | `value` | Direct or `field * multiplier` |
| `failure_flag` | `failure` | Direct |

---

## 3. Chart Configuration

### Chart Type
- [ ] Line chart (Recharts)
- [ ] Bar chart (Recharts)
- [ ] Line/area chart (ApexCharts)
- [ ] Semicircular gauge (D3)
- [ ] Linear gauge (D3)

### Axes

| Axis | Domain | Unit | Format |
|------|--------|------|--------|
| X | datetime | — | `DD/MM HH:mm` or `DD/MM` |
| Y | `[0, 100]` | `%` | `v => v + '%'` |

### Color Scheme

| Element | Color | Hex | Semantic |
|---------|-------|-----|----------|
| Line/Bar | Blue | `#0052cc` | Normal |
| Max alarm | Red | `#ef4444` | Danger |
| Min alarm | Green | `#22c55e` | Safe |
| Warning | Yellow | `#f59e0b` | Warning |
| Alarm trigger | Violet | `#aa89f8` | Alarm |

### Series Configuration

```javascript
// Recharts
<Line type="monotone" dataKey="value" stroke="#0052cc" strokeWidth={2} />

// ApexCharts
{ name: 'Series Name', field: 'value_field', color: '#0052cc' }
```

---

## 4. Data Transformation

### Pre-Processing (in hook or useMemo)

1. **Time filtering:** Filter points where `timestamp >= (now - rangeHours)`
2. **Field mapping:** Transform API fields to chart fields
3. **Sorting:** Sort by timestamp ascending
4. **Gap detection:** Insert null points when gap > threshold
5. **Alarm overlay:** Merge alarm data points into chart data

### Adaptive Aggregation

| Range | Strategy | Output |
|-------|----------|--------|
| `<= 168 hours` | Raw points | No aggregation |
| `168-720 hours` | Group by day | min/max/avg per day |
| `> 720 hours` | Group by week | min/max/avg per week |

---

## 5. Component Tree

```
PageXxx
└── ChartWrapper
    ├── TimeRangeSelector (buttons: 1h, 12h, 24h, ...)
    ├── [ChartType] (GenericLineChart / GenericBarChart / Gauge)
    │   ├── CustomDot (alarm dots with color by type)
    │   └── CustomTooltip (formatted date, value, alarm details)
    └── StatisticsDisplay (optional: min/max/avg summary)
```

---

## 6. Interactions

| Action | Trigger | Effect |
|--------|---------|--------|
| Range change | Click range button | Fetch new data, re-render chart |
| Week drill-down | Click bar | Fetch daily data for that week |
| Day drill-down | Click data point | Fetch register data for that day |
| Go back | Click "Volver" | Return to previous range |
| Hover tooltip | Mouse hover | Show formatted date + value + alarm details |

---

## 7. Gauge-Specific (if applicable)

### Threshold Configuration

| Prop | Source | Computation |
|------|--------|-------------|
| `currentValue` | API response | `usageData?.lastData?.porcentajeUsagePeriod` |
| `alarmMin` | Alarm config | If condition `>`: min=0; if `<`: min=`alarm.var01` |
| `alarmMax` | Alarm config | If condition `>`: max=`alarm.var01`; if `<`: max=100 |

### Zones

```
[0 ──── alarmMin ──── alarmMax ──── 100]
 Red      Green zone       Red
```

---

## 8. Loading & Error States

| State | Display |
|-------|---------|
| Loading (fetch) | `LoadingSpinner` overlay on chart |
| Loading (range change) | `LoadingSpinner` overlay on chart |
| Error | Error message div with retry button |
| Empty | "Sin datos para el rango seleccionado" message |

---

## 9. Acceptance Criteria

- [ ] Chart renders with correct data from API
- [ ] Y-axis domain is `[0, 100]` with `%` unit
- [ ] Color semantics enforced (red/green/yellow/blue/violet)
- [ ] Alarm dots render with correct colors by type
- [ ] Custom tooltip shows formatted date + value + alarm details
- [ ] Range selection triggers data fetch and re-render
- [ ] Drill-down works: week → day → hour
- [ ] Gap detection inserts null points at correct thresholds
- [ ] Loading spinner shows during data fetch
- [ ] Error state shows on API failure
- [ ] Empty state shows when no data available
- [ ] `npm run lint` passes
