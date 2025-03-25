import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const Dashboard = () => {
  const [fig, setFig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your Django API endpoint URL
    axios.get('https://poweroptimiseai-0390a8a27103.herokuapp.com/grid-api/grid_analysis_api/')
      .then(response => {
        // The API returns { graphJSON: "<json string>" }
        const graphJSONString = response.data.graphJSON;
        // Parse the JSON string to an object
        const parsedFig = JSON.parse(graphJSONString);
        setFig(parsedFig);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching graph JSON:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading graph...</div>;
  }

  if (!fig) {
    return <div>Error loading graph.</div>;
  }

  return (
    <div>
      <h1>Dashboard Graph</h1>
      <Plot
        data={fig.data}
        layout={fig.layout}
        style={{ width: "100%", height: "500px" }}
        config={{ responsive: true }}
      />
    </div>
  );
};

export default Dashboard;

