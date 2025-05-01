import { useEffect, useState, useMemo } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Card, CardContent } from "../components/ui/card";
import GenerationBreakdown from "../components/GenerationBreakdown";
import "../components/SummaryTable.css";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as PieTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as AreaTooltip,
} from "recharts";
import { Table, Tbody, Td, Th, Thead, Tr } from "../components/ui/table";

// ────────────────────────────────────────────────────────────────────────────
// CONFIG
// ────────────────────────────────────────────────────────────────────────────
const API = {
  live: "https://poweroptimiseai-0390a8a27103.herokuapp.com/grid-api/grid_live/",
  halfhour: "https://poweroptimiseai-0390a8a27103.herokuapp.com/grid-api/grid_halfhours/",
  day: "https://poweroptimiseai-0390a8a27103.herokuapp.com/grid-api/grid_day/",
  week: "https://poweroptimiseai-0390a8a27103.herokuapp.com/grid-api/grid_week/",
};

// Additional helper to get last snapshot in a time series
// Additional

const getLastSnapshot = (series) => series?.[series.length - 1];


const SOURCE_COLOURS = {
  Coal: "#636363",            // dark grey
  Gas: "#fd8d3c",             // orange
  Solar: "#ffd700",           // yellow (Solar = Yellow ☀️)
  Wind: "#ADD8E6",            // light blue
  Hydroelectric: "#2b8cbe",   // blue
  Nuclear: "#756bb1",         // purple
  Biomass: "#d95f0e",         // brown
  
  Belgium: "#66c2a5",
  Denmark: "#fc8d62",
  France: "#8da0cb",
  Ireland: "#e78ac3",
  Netherlands: "#a6d854",
  Norway: "#ffd92f",
};

const GROUP_COLOURS = {
  Renewables: "#31a354",    // Green
  Fossils: "#e41a1c",       // Red
  Others: "#377eb8",        // Blue
};

// ────────────────────────────────────────────────────────────────────────────
// HOOKS
// ────────────────────────────────────────────────────────────────────────────
const useFetch = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(endpoint)
      .then((r) => r.json())
      .then((d) => mounted && setData(d))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [endpoint]);

  return { data, loading };
};

// ────────────────────────────────────────────────────────────────────────────
// CONTRIBUTION TABLES
// ────────────────────────────────────────────────────────────────────────────
// ── Mappings originate from the Python side; duplicated here for the UI only


const INT_COMPONENTS = {
  component_belgium: ["nemo"],
  component_denmark: ["viking"],
  component_france: ["ifa", "ifa2", "eleclink"],
  component_ireland: ["moyle", "ewic", "greenlink"],
  component_netherlands: ["britned"],
  component_norway: ["nsl"],
};


const SOURCES = {
  // Generation fields
  coal: "Coal",
  ccgt: "Gas",
  ocgt: "Gas",
  solar: "Solar",
  embedded_wind: "Wind",
  wind: "Wind",
  hydro: "Hydroelectric",
  nuclear: "Nuclear",
  biomass: "Biomass",
  pumped: "Pumped storage",
  
  // Interconnector fields
  nemo: "Belgium",
  viking: "Denmark",
  ifa: "France",
  ifa2: "France",
  eleclink: "France",
  moyle: "Ireland",
  ewic: "Ireland",
  greenlink: "Ireland",
  britned: "Netherlands",
  nsl: "Norway",
};


const ContributionTable = ({ snapshot }) => {
  if (!snapshot) return null;
  const total = snapshot.total_generation ?? 0;

  const sourceSums = {};

  // Step 1: Sum values into source names
  Object.keys(SOURCES).forEach((field) => {
    const sourceName = SOURCES[field];
    const fieldValue = snapshot[field] ?? 0;
    sourceSums[sourceName] = (sourceSums[sourceName] || 0) + fieldValue;
  });

  // Step 2: Group sources by categories (big ones: Fossils, Renewables, Others, Storage, Interconnectors)
  const GROUP_CATEGORIES = {
    Fossils: ["Coal", "Gas"],
    Renewables: ["Solar", "Wind", "Hydroelectric"],
    Others: ["Nuclear", "Biomass"],
 
    Interconnectors: ["Belgium", "Denmark", "France", "Ireland", "Netherlands", "Norway"],
  };

  const rows = [];

  Object.entries(GROUP_CATEGORIES).forEach(([groupLabel, sourcesInGroup]) => {
    const groupSum = sourcesInGroup.reduce((sum, src) => sum + (sourceSums[src] ?? 0), 0);

    const subRows = sourcesInGroup.map((src) => ({
      name: src,
      val: sourceSums[src] ?? 0,
    }));

    rows.push({
      label: groupLabel,
      value: groupSum,
      pct: total ? groupSum / total : null,
      sub: subRows,
    });
  });

  return (
    <Table className="text-xs">
      <Thead>
        <Tr>
          <Th>Category</Th>
          <Th className="text-right">GW</Th>
          <Th className="text-right">%</Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((r) => (
          <>
            <Tr key={r.label} className="font-medium bg-gray-50">
              <Td>{r.label}</Td>
              <Td className="text-right">{r.value.toFixed(2)}</Td>
              <Td className="text-right">{r.pct !== null ? (r.pct * 100).toFixed(1) + "%" : "–"}</Td>
            </Tr>
            {r.sub.map((s) => (
              <Tr key={r.label + s.name}>
                <Td className="pl-4">{s.name}</Td>
                <Td className="text-right">{s.val.toFixed(2)}</Td>
                <Td className="text-right">
                  {total ? ((s.val / total) * 100).toFixed(1) + "%" : "–"}
                </Td>
              </Tr>
            ))}
          </>
        ))}
      </Tbody>
    </Table>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// CHART COMPONENTS
// ────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────
// DOUBLE‑LAYER PIE  (inner = groups, outer = individual components)
// ────────────────────────────────────────────────────────────────────────────
const GenerationPie = ({ snapshot }) => {
  if (!snapshot) return null;
  // inner ring – grouped
  const inner = [
    { name: "Fossils", value: snapshot.component_fossils ?? 0 },
    { name: "Renewables", value: snapshot.component_renewables ?? 0 },
    { name: "Others", value: snapshot.component_others ?? 0 },
  ];
  // outer ring – individual components (same colours order)
  const outer = [
    { name: "Coal", value: snapshot.coal ?? 0 },
    { name: "Gas", value: (snapshot.ccgt ?? 0) + (snapshot.ocgt ?? 0) },
    { name: "Solar", value: snapshot.solar ?? 0 },
    { name: "Wind", value: (snapshot.embedded_wind ?? 0) + (snapshot.wind ?? 0) },
    { name: "Hydro", value: snapshot.hydro ?? 0 },
    { name: "Nuclear", value: snapshot.nuclear ?? 0 },
    { name: "Biomass", value: snapshot.biomass ?? 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        {/* inner ring */}
        <Pie
          data={inner}
          dataKey="value"
          nameKey="name"
          innerRadius={0}
          outerRadius={70}
          paddingAngle={1}
        >
          {inner.map((d, i) => (
            <Cell key={i} fill={GROUP_COLOURS[d.name] || "#cccccc"} />
          ))}
        </Pie>

        {/* outer ring */}
        <Pie
          data={outer}
          dataKey="value"
          nameKey="name"
          innerRadius={80}
          outerRadius={120}
          paddingAngle={1}
        >
          {outer.map((d, i) => (
            <Cell key={i} fill={SOURCE_COLOURS[d.name] || "#cccccc"} />
          ))}
        </Pie>

        <PieTooltip formatter={(v) => `${v.toFixed(2)} GW`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const SummaryTable = ({ snapshot }) => {
  if (!snapshot) return null;

  const rows = [
    { label: "Total generation", value: snapshot.total_generation, unit: "GW" },
    { label: "Imports (+) / Exports (-)", value: snapshot.total_transfers, unit: "GW" },
    { label: "Demand", value: snapshot.total_demand, unit: "GW" },
    { label: "Price (APX)", value: snapshot.price, unit: "£/MWh" },
    { label: "Emissions", value: snapshot.emissions, unit: "gCO₂/kWh" },
  ];

  return (
    <div className="summary-table">
      {rows.map((row) => (
        <div className="summary-row" key={row.label}>
          <div className="summary-label">{row.label}</div>
          <div className="summary-value">
            {row.value !== null && row.value !== undefined
              ? row.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : "–"}
            <span className="summary-unit"> {row.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// convert ISO time → HH:MM for x‑axis (day) or D/M HH:MM (week)
const formatTick = (iso, compact = false) => {
  const d = new Date(iso);
  return compact
    ? `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`
    : `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const TrendChart = ({ series, metric, title, compactTicks = false }) => {
  const data = useMemo(
    () =>
      series?.map((d) => ({
        time: d.end_time || d.time, // field name differs between models
        value: d[metric],
      })) || [],
    [series, metric]
  );

  if (!data.length) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-4 pb-1">
        <h3 className="text-sm font-semibold mb-1">{title}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`${metric}-grad`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2b8cbe" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2b8cbe" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="time"
              tickFormatter={(t) => formatTick(t, compactTicks)}
              minTickGap={compactTicks ? 30 : 10}
            />
            <YAxis width={60} tick={{ fontSize: 11 }} />
            <AreaTooltip
              formatter={(v) => v !== null && v !== undefined ? v.toFixed(2) : "–"}
              labelFormatter={(l) => new Date(l).toLocaleString()}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2b8cbe"
              fillOpacity={1}
              fill={`url(#${metric}-grad)`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ────────────────────────────────────────────────────────────────────────────
export default function GridDashboard() {
  const { data: live, loading: loadingLive } = useFetch(API.live);
  const { data: halfHourSeries, loading: loadingHalfHour } = useFetch(API.halfhour);
  const { data: daySeries, loading: loadingDay } = useFetch(API.day);
  const { data: weekSeries, loading: loadingWeek } = useFetch(API.week);


  const lastDayPoint = getLastSnapshot(daySeries);
 
  const lastWeekPoint = weekSeries;


const mapSnapshotToSourceTotals = (snapshot) => {
  const sourceSums = {};

  // Step 1: map all individual fields to named sources (Gas, France, etc.)
  Object.keys(SOURCES).forEach((field) => {
    const label = SOURCES[field];
    const value = snapshot?.[field] ?? 0;
    sourceSums[label] = (sourceSums[label] || 0) + value;
  });

  // Step 2: add macro group totals
  const MACRO_GROUPS = {
    Fossils: ["Coal", "Gas"],
    Renewables: ["Solar", "Wind", "Hydroelectric"],
    Others: ["Nuclear", "Biomass"]
  };

  Object.entries(MACRO_GROUPS).forEach(([groupLabel, members]) => {
    sourceSums[groupLabel] = members.reduce(
      (sum, src) => sum + (sourceSums[src] || 0),
      0
    );
  });

  return sourceSums;
};

  return (
    <Card className="w-full max-w-6xl mx-auto p-4">
      <CardContent>
        <Tabs.Root defaultValue="live">
          <Tabs.List className="grid grid-cols-3 gap-2 mb-4">
            <Tabs.Trigger value="live" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 data-[state=active]:bg-gray-400">Live</Tabs.Trigger>
            <Tabs.Trigger value="day" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 data-[state=active]:bg-gray-400">Past Day</Tabs.Trigger>
            <Tabs.Trigger value="week" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 data-[state=active]:bg-gray-400">Past Week</Tabs.Trigger>
          </Tabs.List>

          {/* LIVE TAB */}
	  <Tabs.Content value="live">
  	     {loadingLive ? (
                <p>Loading live data…</p>
             ) : (
               <div className="grid md:grid-cols-2 gap-6">
                  <GenerationPie snapshot={live} />
                  <SummaryTable snapshot={live} />
                  <div className="md:col-span-2">
                      <GenerationBreakdown
                          snapshot={mapSnapshotToSourceTotals(live)}
                          total={live.total_generation}
                          sourceColors={SOURCE_COLOURS}
                          groupDefs={{
                            "Generation by Type": ["Fossils", "Renewables", "Others"],
                            "Generation by Source": ["Coal", "Gas", "Solar", "Wind", "Hydroelectric", "Nuclear", "Biomass"],
                            "Interconnectors": ["Belgium", "Denmark", "France", "Ireland", "Netherlands", "Norway"],
			    "Storage": ["Pumped storage"]
                          }}
                      />
                   </div>
               </div>
             )}
          </Tabs.Content>

<Tabs.Content value="day">
  {loadingDay ? (
    <p>Loading day series…</p>
  ) : (
    <>
      {lastDayPoint && (
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <GenerationPie snapshot={lastDayPoint} />
          <SummaryTable snapshot={lastDayPoint} />
          <div className="md:col-span-2">
            <GenerationBreakdown
              snapshot={mapSnapshotToSourceTotals(lastDayPoint)}
              total={lastDayPoint.total_generation}
              sourceColors={SOURCE_COLOURS}
              groupDefs={{
                "Generation by Type": ["Fossils", "Renewables", "Others"],
                "Generation by Source": ["Coal", "Gas", "Solar", "Wind", "Hydroelectric", "Nuclear", "Biomass"],
                "Interconnectors": ["Belgium", "Denmark", "France", "Ireland", "Netherlands", "Norway"],
		"Storage": ["Pumped storage"]
              }}
            />
          </div>
        </div>
      )}

      <TrendChart
        series={halfHourSeries}
        metric="price"
        title="Price (APX) £/MWh"
      />
      <TrendChart
        series={halfHourSeries}
        metric="emissions"
        title="Emissions gCO₂/kWh"
      />
    </>
  )}
</Tabs.Content>

<Tabs.Content value="week">
  {loadingWeek ? (
    <p>Loading week series…</p>
  ) : (
    <>
      
      {lastWeekPoint && (
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <GenerationPie snapshot={lastWeekPoint} />
          <SummaryTable snapshot={lastWeekPoint} />
          <div className="md:col-span-2">
            <GenerationBreakdown
              snapshot={mapSnapshotToSourceTotals(lastWeekPoint)}
              total={lastWeekPoint.total_generation}
              sourceColors={SOURCE_COLOURS}
              groupDefs={{
                "Generation by Type": ["Fossils", "Renewables", "Others"],
                "Generation by Source": ["Coal", "Gas", "Solar", "Wind", "Hydroelectric", "Nuclear", "Biomass"],
                "Interconnectors": ["Belgium", "Denmark", "France", "Ireland", "Netherlands", "Norway"],
	        "Storage": ["Pumped storage"]
              }}
            />
          </div>
        </div>
      )}

      <TrendChart
        series={daySeries}
        metric="price"
        title="Price (APX) £/MWh"
        compactTicks
      />
      <TrendChart
        series={daySeries}
        metric="emissions"
        title="Emissions gCO₂/kWh"
        compactTicks
      />
    </>
  )}
</Tabs.Content>

        </Tabs.Root>
      </CardContent>
    </Card>
  );
}
