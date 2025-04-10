import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import PowerPlantMap from './PowerPlantMap';
import StorageMap from './StorageMap'; 
import './Dashboard.css';

const Dashboard = () => {
  const [fig, setFig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://poweroptimiseai-0390a8a27103.herokuapp.com/grid-api/grid_analysis_api/')
      .then(response => {
        const graphJSONString = response.data.graphJSON;
        const parsedFig = JSON.parse(graphJSONString);
        setFig(parsedFig);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching graph JSON:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading graph...</div>;
  if (!fig) return <div>Error loading graph.</div>;

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        {/* Section 1: Plot */}
        <div className="dashboard-panel">
          <h2>Grid Analysis</h2>
          <Plot
            data={fig.data}
            layout={fig.layout}
            style={{ width: '100%', height: '100%' }}
            config={{ responsive: true }}
          />
        </div>

        {/* Section 2: UK Power Plants Map */}
        <div className="dashboard-panel">
          <h2>UK Power Plants Map</h2>
          <PowerPlantMap />
        </div>

        {/* Section 3: UK Storage Projects Map */}
        <div className="dashboard-panel">
          <h2>UK Storage Projects Map</h2>
          <StorageMap />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
