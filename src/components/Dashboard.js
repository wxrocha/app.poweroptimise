import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GridDashboard from './GridDashboard';
import PowerPlantMap from './PowerPlantMap';
import StorageMap from './StorageMap';
import Plot from 'react-plotly.js';
import './Dashboard.css';

const Dashboard = () => {
  const [fig, setFig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://poweroptimiseai-0390a8a27103.herokuapp.com/grid-api/grid_analysis_api/')
      .then(response => {
        const parsedFig = JSON.parse(response.data.graphJSON);
        setFig(parsedFig);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching graph JSON:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <h1>Energy & Climate Dashboard</h1>

      {/* Section 1: UK National Grid */}
      <section className="dashboard-section">
        <h2>Section 1: UK National Grid Overview</h2>
        <GridDashboard />
      </section>

      {/* Section 2: Grid Analysis */}
      <section className="dashboard-section">
        <h2>Section 2: Grid Analysis – Imbalance (Demand versus Generation)</h2>
        <div className="dashboard-panel">
          <Plot
            data={fig.data}
            layout={fig.layout}
            style={{ width: '100%', height: '500px' }}
            config={{ responsive: true }}
          />
        </div>
      </section>

      {/* Section 3: Maps */}
      <section className="dashboard-section">
        <h2>Section 3: UK Power Plants and Storage Information</h2>

        <div className="dashboard-map">
          <h3>Power Plants Map</h3>
          <PowerPlantMap />
        </div>

        <div className="dashboard-map" style={{ marginTop: '2rem' }}>
          <h3>Storage Projects Map</h3>
          <StorageMap />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
