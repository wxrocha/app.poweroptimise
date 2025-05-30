import React, { useEffect, useState } from "react";
import axios from "axios";
import Plot  from "react-plotly.js";
import "./SolarProductionExplorer.css";   

const PAGE_SIZE = 20;

export default function RiskExplorer() {
  /* ───────────────────────────────── STATE ───────────────────────── */
  const [plants, setPlants]           = useState([]);        // full list
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(0);         // 0-based page #
  const [selectedId, setSelectedId]   = useState(null);
  const [plotJson, setPlotJson]       = useState(null);
  const [tableRows, setTableRows]     = useState([]);

  /* ─────────────────────────── 1. fetch plant list ───────────────── */
  useEffect(() => {
    axios.get("https://poweroptimiseai-0390a8a27103.herokuapp.com/api/solar-plants/")             // ← your Django view
      .then(res => setPlants(res.data))
      .catch(err => console.error("Plant list error:", err));
  }, []);

  /* ─────────────────────────── 2. derived, filtered list ─────────── */
  const filtered = plants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const paged    = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  /* ─────────────────────────── 3. load plot when plant chosen ────── */
  useEffect(() => {
    if (!selectedId) return;
    axios.get(`https://poweroptimiseai-0390a8a27103.herokuapp.com/api/future-production/${selectedId}/`)
      .then(res => {
        setPlotJson(JSON.parse(res.data.graphJSON));
        setTableRows(res.data.projections);
      })
      .catch(err => console.error("Risk API error:", err));
  }, [selectedId]);

  /* ─────────────────────────── render ────────────────────────────── */
  return (
    <section className="risk-explorer">
      <h2>Solar Plant Forecasted Production</h2>

      {/* search + paging toolbar */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search plant…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
        />
        <button disabled={page === 0}                 onClick={() => setPage(p => p - 1)}>◀</button>
        <span>{page + 1}/{Math.max(totalPages, 1)}</span>
        <button disabled={page + 1 >= totalPages}     onClick={() => setPage(p => p + 1)}>▶</button>
      </div>

      {/* dropdown */}
      <select
        size="10"
        value={selectedId ?? ""}
        onChange={e => setSelectedId(e.target.value)}
      >
        {paged.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.county}
          </option>
        ))}
      </select>

      {/* plot + table */}
      {plotJson && (
        <div className="risk-output">
          <Plot
            data={plotJson.data}
            layout={plotJson.layout}
            style={{ width: "100%", height: "500px" }}
            config={{ responsive: true }}
          />

          <table className="risk-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Temp (°C)</th>
                <th>Wind (m/s)</th>
                <th>Prec (mm)</th>
                <th>Production MW</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(r => (
                <tr key={r.date}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.temperature.toFixed(1)}</td>
                  <td>{r.wind_speed.toFixed(1)}</td>
                  <td>{r.precipitation.toFixed(1)}</td>
                  <td>{r.ml_risk_score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
