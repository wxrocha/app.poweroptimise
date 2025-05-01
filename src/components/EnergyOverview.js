import React from 'react';
import Plot from 'react-plotly.js';
import PowerPlantMap from './PowerPlantMap';
import StorageMap from './StorageMap';
import './Dashboard.css';

const EnergyOverview = ({ fig }) => {
  if (!fig) return <div>Loading energy overview...</div>;

  return (
    <div className="dashboard-grid">
      <div className="dashboard-panel">
        <h2>Grid Analysis</h2>
        <Plot
          data={fig.data}
          layout={fig.layout}
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true }}
        />
      </div>
      <div className="dashboard-panel">
        <h2>UK Power Plants Map</h2>
        <PowerPlantMap />
      </div>
      <div className="dashboard-panel">
        <h2>UK Storage Projects Map</h2>
        <StorageMap />
      </div>
      <div className="dashboard-panel">
        <h2>Coming Soon</h2>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>📊 Future Analytics Panel</div>
      </div>
    </div>
  );
};

export default EnergyOverview;
