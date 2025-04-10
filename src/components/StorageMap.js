import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './StorageMap.css';

// Marker colors by status
const statusColors = {
  Operational: 'blue',
  'De-Commissioned': 'red',
  Contracted: 'green',

};

// 🧪 Optional: storage type colors (can be used for icons or just legend)
const storageTypes = {
  'Pumped hydro storage': '💧',
  Flywheel: '🌀',
  'Lead-acid battery': '🔋',
  'Lithium-ion battery': '⚡',
  'Latent heat': '🔥',
  'Sodium-based battery': '🧂',
  'Flow battery': '💡',

};

// Create marker icon based on status color
const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${color}`,
    iconSize: [21, 34],
    iconAnchor: [10, 34],
    popupAnchor: [0, -28],
  });

const StorageMap = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('https://poweroptimiseai-0390a8a27103.herokuapp.com/api/storage-projects/')
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  return (
    <div className="map-wrapper">
      <MapContainer center={[51, -0.1]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <MarkerClusterGroup>
          {projects
            .filter(p => p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0)
            .map((project, idx) => {
              const color = statusColors[project.status] || statusColors['Unknown'];
              const icon = createIcon(color);

              return (
                <Marker key={idx} position={[project.latitude, project.longitude]} icon={icon}>
                  <Popup>
                    <strong>{project.name}</strong><br />
                    <strong>Status:</strong> {project.status}<br />
                    <strong>Storage Type:</strong> {project.storage_type}<br />
                    <strong>Capacity:</strong> {project.storage_capacity_kwh} kWh<br />
                    <strong>Rated Energy:</strong> {project.rated_power_kw} kW<br />
                    <strong>Construction Year:</strong> {project.construction_year}
                  </Popup>
                </Marker>
              );
            })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Status Legend */}
      <div className="status-legend">
        <h4>Status Legend</h4>
        <ul>
          {Object.entries(statusColors).map(([status, color]) => (
            <li key={status}>
              <span className="legend-color" style={{ backgroundColor: color }}></span>
              {status}
            </li>
          ))}
        </ul>
      </div>

      {/* ✅ Storage Type Legend */}
      <div className="type-legend">
        <h4>Storage Type Legend</h4>
        <ul>
          {Object.entries(storageTypes).map(([type, emoji]) => (
            <li key={type}>
              <span className="legend-icon">{emoji}</span>
              {type}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StorageMap;
