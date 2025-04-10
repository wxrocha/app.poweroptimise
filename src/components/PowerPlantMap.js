import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PowerPlantMap.css'; // 👈 for styling legend

// Fuel color map
const fuelColors = {
  Coal: 'black',
  Gas: 'orange',
  Oil: 'brown',
  Hydro: 'blue',
  Nuclear: 'purple',
  Solar: 'gold',
  Wind: 'green',
  Biomass: 'darkgreen',
  'Wave and Tidal': 'yellow',
  Storage: 'gray',
  Waste: 'red',
  Cogeneration: 'pink',
};

// Colored marker icon factory
const createColoredIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${color}`,
    iconSize: [21, 34],
    iconAnchor: [10, 34],
    popupAnchor: [0, -28],
  });
};

const PowerPlantMap = () => {
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    fetch('https://poweroptimiseai-0390a8a27103.herokuapp.com/api/power-plants/')
      .then(res => res.json())
      .then(data => setPlants(data));
  }, []);

  return (
    <div className="map-wrapper">
      <MapContainer center={[54.5, -3]} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup>
          {plants
            .filter(p => p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0)
            .map((plant, idx) => {
              const color = fuelColors[plant.primary_fuel] || 'gray';
              const icon = createColoredIcon(color);

              return (
                <Marker key={idx} position={[plant.latitude, plant.longitude]} icon={icon}>
                  <Popup>
                    <strong>{plant.name}</strong><br />
                    Fuel: {plant.primary_fuel}<br />
                    Capacity: {plant.capacity_mw} MW
                  </Popup>
                </Marker>
              );
            })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Fuel type legend */}
      <div className="fuel-legend">
        <h4>Fuel Type Legend</h4>
        <ul>
          {Object.entries(fuelColors).map(([fuel, color]) => (
            <li key={fuel}>
              <span className="legend-color" style={{ backgroundColor: color }}></span>
              {fuel}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PowerPlantMap;
