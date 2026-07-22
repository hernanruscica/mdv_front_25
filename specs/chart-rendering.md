# Spec: Chart Rendering & Visualization

> Complete specification of how data is visualized in charts, gauges, and reports.

**Status:** `approved`
**Skill:** `chart-rendering`
**Owner:** Frontend Agent + Review Agent

---

## 1. Library Inventory

| Library | Version | Status | Used By |
|---------|---------|--------|---------|
| **D3.js** | `^7.9.0` | Active | `Gauge.jsx`, `GaugeLinear.jsx` |
| **Recharts** | `^3.6.0` | Active (primary) | `GenericLineChart.jsx`, `GenericBarChart.jsx` |
| **ApexCharts** | `^1.7.0` | Active (secondary) | `TimeSeriesChart.jsx`, `AnalogData.jsx` |
| **Chart.js** | `^4.4.9` | **DEAD** | Not imported anywhere |

---

## 2. Two Parallel Charting Systems

### System A: Recharts (Primary)

**Location:** `src/components/ViewChart/`
**Used by:** `ViewChannel.jsx`, `ViewAlarm.jsx`, `ReportPreview.jsx`

Components:
- `ViewChart.jsx` — Orchestrator (data fetching + transformation + range selection)
- `GenericLineChart.jsx` — Line chart with alarm dots
- `GenericBarChart.jsx` — 3 overlapping bars for weekly data
- `chartRanges.js` — Range presets (constants)

**Data source:** Zustand `dataStore` (via store subscriptions inside ViewChart)

### System B: ApexCharts (Secondary)

**Location:** `src/components/Graphics/`
**Used by:** `DigitalPorcentageOn.jsx`, `AnalogData.jsx`

Components:
- `TimeSeriesChart.jsx` — Adaptive aggregation chart with statistics
- `DigitalPorcentageOn.jsx` — Single-series percentage chart wrapper
- `AnalogData.jsx` — Multi-series (instant/min/max) chart

**Data source:** Props (passed from parent component)

---

## 3. Gauge System (D3.js)

### 3.1 Gauge (Semicircular)

**File:** `src/components/Gauge/Gauge.jsx`

**Props:**
```javascript
{ currentValue: number, alarmMax: number, alarmMin: number }
```

**Configuration:**
- SVG: 320 x 240 px
- Domain: Fixed `[0, 100]` percentage
- Arc: Semicircle from `-PI/2` to `PI/2`
- Outer radius: `min(320, 240) / 2 - 20 = 100`
- Inner radius: `100 - 30 = 70`

**Zones (traffic light):**
```
Red left:    [-PI/2, x(alarmMin)]        → danger (below minimum)
Green middle: [x(alarmMin), x(alarmMax)]  → safe
Red right:   [x(alarmMax), PI/2]         → danger (above maximum)
```

**Colors:** Red `#FF6666`, Green `#66CC66`, Black needle
**Animation:** D3 transition 1000ms needle rotation

**Consumer:** `AlarmMonitorCard.jsx`
- `currentValue` from `usageData?.lastData?.porcentajeUsagePeriod`
- `alarmMin`/`alarmMax` derived from alarm condition:
  - If condition `>` → min=0, max=`alarm.var01`
  - If condition `<` → min=`alarm.var01`, max=100

---

### 3.2 GaugeLinear (Horizontal Bar)

**File:** `src/components/GaugeLinear/GaugeLinear.jsx`

**Props:**
```javascript
{ currentValue: number, alarmMin: number (default 0), alarmMax: number (default 100) }
```

**Configuration:**
- SVG: 320 x 50 px
- Domain: Fixed `[0, 100]` with `.clamp(true)`
- Bar height: 20 px
- Clip-path ID generated via `useMemo` with `Math.random()` (avoids conflicts)

**Zones:**
```
Gray base:   [0, 100]         → background
Red left:    [0, alarmMin]    → danger (only if alarmMin > 0)
Green middle: [alarmMin, alarmMax] → safe (only if alarmMax > alarmMin)
Red right:   [alarmMax, 100]  → danger (only if alarmMax < 100)
```

**Colors:** Red `#FF5252`, Green `#66BB6A`, Gray `#e0e0e0`
**Value display:** `val.toFixed(1)%` with smart anchoring (< 10: start, > 90: end)

**Consumer:** `AlarmLinkCard.jsx`

---

## 4. GenericLineChart (Recharts)

**File:** `src/components/ViewChart/GenericLineChart.jsx`

**Props:**
```javascript
{
  data: Array,              // Processed chart data
  height: number (400),     // Chart height
  lineColor: string,        // Default line color
  xAxisFormatter: Function, // Date formatting function
  onPointClick: Function,   // Click handler for drill-down
  isClickable: boolean,     // Enable click interactions
  xDomain: Array | null,    // Fixed X-axis domain
  ticks: Array | null       // Custom tick positions
}
```

**Data format expected:**
```javascript
{
  date: number,            // Unix timestamp (ms)
  value: number,           // 0-100 percentage
  texto: string,           // Event description
  isAlarm: boolean,        // Is this an alarm point?
  alarmType: string|null,  // 'porcentage_on' | 'comunication_failure' | 'energy_failure'
  energia: number,         // 0 or 1
  isEnergyEvent: boolean,
  conection_failures: number,
  energy_failures: number,
  phase_failures: number,
  alarm_count: number
}
```

**Configuration:**
```jsx
<YAxis domain={[0, 100]} unit="%" />
<Line type="monotone" dataKey="value" connectNulls={false} />
```

**Custom dot rendering (`CustomDot`):**

| Condition | Radius | Fill Color | Border |
|-----------|--------|-----------|--------|
| `alarmType === 'porcentage_on'` | 10 | `#aa89f8` (violet) | white |
| `alarmType === 'comunication_failure'` | 10 | `#FACC15` (yellow) | white |
| `alarmType === 'energy_failure'` | 10 | `#DC2626` (red) | white |
| `isEnergyEvent` | 10 | `#DC2626` (red) | white |
| Normal point | — | Not rendered | — |

**Custom tooltip:** Shows formatted date, value as `X%`, alarm details with colored left border.

**Legend:** 4 entries: line (blue), violet circle, yellow circle, red circle.

---

## 5. GenericBarChart (Recharts)

**File:** `src/components/ViewChart/GenericBarChart.jsx`

**Props:**
```javascript
{
  data: Array,              // Weekly bar data
  height: number (400),
  onBarClick: Function,     // Drill-down handler
  xAxisFormatter: Function
}
```

**Data format expected:**
```javascript
{
  label: number|string,     // Week number
  value: number,            // Weekly average percentage
  max_val: number,          // Max day percentage
  min_val: number,          // Min day percentage
  fecha_max: string,        // Date of max
  fecha_min: string,        // Date of min
  startDate: string,        // "YYYY-MM-DD"
  endDate: string           // "YYYY-MM-DD"
}
```

**Triple overlapping bars:**
```jsx
<XAxis xAxisId="0" dataKey="label" />           {/* Visible axis */}
<XAxis xAxisId="1" dataKey="label" hide />      {/* Hidden — middle bar */}
<XAxis xAxisId="2" dataKey="label" hide />      {/* Hidden — front bar */}

<Bar xAxisId="0" dataKey="max_val"  fill="#ef4444" barSize={45} />  {/* Red — background */}
<Bar xAxisId="1" dataKey="value"    fill="#f59e0b" barSize={45} />  {/* Yellow — middle */}
<Bar xAxisId="2" dataKey="min_val"  fill="#22c55e" barSize={45} />  {/* Green — foreground */}
```

**Tooltip:** Week number, date range, avg (yellow), max (red) + date, min (green) + date.

---

## 6. TimeSeriesChart (ApexCharts)

**File:** `src/components/Graphics/TimeSeriesChart/TimeSeriesChart.jsx`

**Props:**
```javascript
{
  dataSets: Array<Array>,    // Array of data arrays (one per series)
  series: Array<{name, field, color}>,
  title: string,
  description: string,
  hoursBackView: number,     // Default 24
  yAxisTitle: string,
  enableZoom: boolean,       // Default true
  showFailureMarkers: boolean, // Default true
  height: number,            // Default 300
  timeRanges: Array          // Custom time range options
}
```

**Data format per point:**
```javascript
{ timestamp: "ISO string", porcentaje_encendido: number, failure: boolean }
```

**ApexCharts config:**
```javascript
{
  chart: { type: 'line', zoom: { enabled, type: 'x', autoScaleYaxis: true } },
  stroke: { curve: 'smooth', width: [1, 2, 1] },     // [min, avg, max]
  fill: { type: 'solid', opacity: [0.35, 1, 0.35] },  // [min=transparent, avg=solid, max=transparent]
  xaxis: { type: 'datetime', labels: { datetimeUTC: false } },
  yaxis: { labels: { formatter: v => `${v}%` } },
}
```

**Grouped series (longer views):**
```javascript
[
  { name: 'Máximo',   type: 'area', color: '#00B746' },  // green
  { name: 'Promedio', type: 'line', color: '#008FFB' },  // blue
  { name: 'Mínimo',   type: 'area', color: '#EF403C' }   // red
]
```

---

## 7. Color Semantics (MUST Enforce)

| Color | Hex | Semantic |
|-------|-----|----------|
| **Red** | `#ef4444` / `#DC2626` / `#FF6666` / `#FF5252` | Danger, max alarm, energy failure, danger zones |
| **Green** | `#22c55e` / `#66CC66` / `#66BB6A` / `#00B746` | Safe, min value, safe zones |
| **Yellow/Amber** | `#f59e0b` / `#FACC15` / `#FEB019` | Warning, average, communication failure |
| **Blue** | `#0052cc` / `#008FFB` | Normal, default series |
| **Violet** | `#aa89f8` | Percentage-on alarm trigger |

---

## 8. Unified Y-Axis

**Every visualization uses fixed 0-100% scale:**
- `Gauge`: `d3.scaleLinear().domain([0, 100])`
- `GaugeLinear`: `d3.scaleLinear().domain([0, 100]).clamp(true)`
- `GenericLineChart`: `<YAxis domain={[0, 100]} unit="%" />`
- `GenericBarChart`: `<YAxis domain={[0, 100]} unit="%" />`
- `TimeSeriesChart`: y-axis formatter adds `%`

**Exception:** `AnalogData` uses computed min/max from data (no fixed scale).

---

## 9. Drill-Down Navigation

```
ViewChart (default range)
  │
  ├─ Week bar click → CUSTOM_WEEK_ZOOM (fetch daily data for that week)
  │   │
  │   └─ Day point click → CUSTOM_DAY_ZOOM (fetch registers for that day)
  │       │
  │       └─ "Volver" → back to week view
  │
  └─ "Volver" → back to default range
```

Each drill-down level calls `fetchDataForRange` with the appropriate range key and date boundaries.

---

## 10. PDF Export

**File:** `src/components/ViewChart/ReportExportButton.jsx`

- Uses `html2canvas` at 2x scale to capture report DOM
- Creates A4 portrait PDF for text content
- If chart section exists: adds landscape page (297mm x 190mm)
- Filename: `informe-canal.pdf`
- Print CSS: chart wrapper forced to `297mm x 180mm`, hide interactive controls

---

## 11. Known Issues

| Issue | Severity | Location |
|-------|----------|----------|
| Chart.js `^4.4.9` installed but never imported | Low | `package.json` |
| `Gauge.jsx` rebuilds entire SVG on every render (D3 imperativo) | Low | `src/components/Gauge/Gauge.jsx` |
| Color hex inconsistency across components (e.g., 4 different reds) | Medium | Multiple files |
| `TimeSeriesChart` `loading` state is mount-only, not async | Low | `src/hooks/useTimeSeriesChart.js` |

---

## 12. Acceptance Criteria

- [ ] Recharts system renders line charts with alarm dots (correct colors by type)
- [ ] Recharts system renders weekly bar charts with 3 overlapping bars
- [ ] ApexCharts system renders adaptive aggregation charts
- [ ] Gauges use fixed 0-100% domain with traffic-light zones
- [ ] Drill-down: week click → daily data, day click → hourly data
- [ ] Gap detection inserts null points to break lines
- [ ] Alarm overlay merges 3 data sources
- [ ] Custom tooltip shows alarm details with colored borders
- [ ] PDF export produces correct A4/landscape layout
- [ ] Color semantics enforced: red=danger, green=safe, yellow=warning, blue=normal, violet=alarm
- [ ] Y-axis always [0, 100] with % unit (except AnalogData)
- [ ] `npm run lint` passes
