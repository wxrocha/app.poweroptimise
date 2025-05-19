import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./PowerPlantMap.css";

/* Hex colours (6 chars, no “#”) */
const fuelColours = {
  Coal:            "000000",
  Gas:             "ff8c00",
  Oil:             "8b4513",
  Hydro:           "0000ff",
  Nuclear:         "800080",
  Solar:           "ffd700",
  Wind:            "008000",
  Biomass:         "006400",
  "Wave and Tidal":"ffff00",
  Storage:         "808080",
  Waste:           "ff0000",
  Cogeneration:    "ffc0cb",
};

/* ─────────────────────────  SVG-pin factory  ───────────────────────── */


/* Square DivIcon factory – size 12 × 12 px */
const squareIcon = (hex) =>
  L.divIcon({
    className: "",                       // no default class
    html: `<div style="
              width:12px;height:12px;
              background:#${hex};
              border:1px solid #fff;
              box-shadow:0 0 2px rgba(0,0,0,.5);
            "></div>`,
    iconSize:   [14, 14],  // reserva­tion rectangle
    iconAnchor: [7 , 7 ],  // centre of square sits on lat-lng
    popupAnchor:[0 ,-8 ],  // popup stems from just above
  });

/* ─────────────────────────  Component  ───────────────────────── */

export default function PowerPlantMap() {
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    fetch(
      "https://poweroptimiseai-0390a8a27103.herokuapp.com/api/power-plants/"
    )
      .then((r) => r.json())
      .then(setPlants)
      .catch(console.error);
  }, []);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[54.5, -3]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup>
          {plants
            .filter(
              (p) =>
                p.latitude &&
                p.longitude &&
                Number(p.latitude) !== 0 &&
                Number(p.longitude) !== 0
            )
            .map((p, i) => {
              const hex  = fuelColours[p.primary_fuel] || "808080";
              const icon = squareIcon(hex);
              return (
                <Marker
                  key={i}
                  position={[p.latitude, p.longitude]}
                  icon={icon}
                >
                  <Popup>
                    <strong>{p.name}</strong>
                    <br />
                    Fuel: {p.primary_fuel}
                    <br />
                    Capacity: {p.capacity_mw} MW
                  </Popup>
                </Marker>
              );
            })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Legend */}
      <div className="fuel-legend">
        <h4>Fuel Type Legend</h4>
        <ul>
          {Object.entries(fuelColours).map(([fuel, hex]) => (
            <li key={fuel}>
              <span
                className="legend-color"
                style={{ backgroundColor: `#${hex}` }}
              />
              {fuel}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
