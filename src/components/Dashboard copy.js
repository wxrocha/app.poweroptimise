import React, { useEffect, useState } from "react";
import axios from "axios";
import GridDashboard from "./GridDashboard";
import PowerPlantMap from "./PowerPlantMap";
import StorageMap from "./StorageMap";
import RollingFeed from "./RollingFeed";
import Plot from "react-plotly.js";
import "./Dashboard.css";

const API_URL =
  "https://poweroptimiseai-0390a8a27103.herokuapp.com/grid-api/grid_analysis_api/";

export default function Dashboard() {
  const [fig, setFig] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------------ */
  /* fetch helper                                                       */
  /* ------------------------------------------------------------------ */
  const fetchChart = () =>
    axios
      .get(API_URL)
      .then((res) => {
        const { graphJSON, lastUpdated } = res.data; 
        setFig(JSON.parse(graphJSON));
        setLastUpdated(lastUpdated || new Date().toISOString());
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching graph JSON:", err);
        setLoading(false);
      });

  /* ------------------------------------------------------------------ */
  /* initial load + 60-s polling                                        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchChart();                      // first load
    const id = setInterval(fetchChart, 60_000); // every 60 s

    return () => clearInterval(id);    // cleanup on unmount
  }, []);

  if (loading) return <div>Loading dashboard…</div>;

  /* -------- UI ------------------------------------------------------- */
  return (
    <div className="dashboard-container">
      <h1>Energy &amp; Climate Dashboard</h1>

      {/* ── Section 1 ─────────────────────────────── */}
      <section className="dashboard-section">
        <h2>Section 1: UK National Grid Overview</h2>
        <GridDashboard />
      </section>

      {/* ── Section 2 ─────────────────────────────── */}
      <section className="dashboard-section">
        <h2>Section 2: Grid Analysis – Imbalance (Demand vs Generation)</h2>

        <div className="dashboard-panel">
          <Plot
            data={fig.data}
            layout={fig.layout}
            style={{ width: "100%", height: "500px" }}
            config={{ responsive: true }}
          />
          <p className="last-updated">
            Last updated:{" "}
            {new Date(lastUpdated).toLocaleString("en-GB", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>
      </section>

      {/* ── Section 3 ─────────────────────────────── */}
      <section className="dashboard-section">
        <h2>Section 3: UK Power Plants and Storage Information</h2>

        <div className="dashboard-map">
          <h3>Power Plants Map</h3>
          <PowerPlantMap />
        </div>

        <div className="dashboard-map" style={{ marginTop: "2rem" }}>
          <h3>Storage Projects Map</h3>
          <StorageMap />
        </div>
      </section>

      {/* ── Section 4 ─────────────────────────────── */}
      <section className="dashboard-section">
        <h2>Section 4: Live Energy &amp; Climate Wire</h2>
        <RollingFeed apiBase="https://poweroptimiseai-0390a8a27103.herokuapp.com" />
      </section>
    </div>
  );
}
