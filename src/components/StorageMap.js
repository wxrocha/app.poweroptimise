import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./StorageMap.css";

/* ──────────────────────────────────────────────────────────
   Status → 6-digit hex colours (no leading “#”)
   ────────────────────────────────────────────────────────── */
const statusColours = {
  Operational:        "0000ff", // blue
  "De-Commissioned":  "ff0000", // red
  Contracted:         "008000", // green
  Unknown:            "808080", // fallback grey
};

/* Optional storage-type legend (emojis) */
const storageTypes = {
  "Pumped hydro storage": "💧",
  Flywheel:               "🌀",
  "Lead-acid battery":    "🔋",
  "Lithium-ion battery":  "⚡",
  "Latent heat":          "🔥",
  "Sodium-based battery": "🧂",
  "Flow battery":         "💡",
};

/* ──────────────────────────────────────────────────────────
   Square DivIcon factory (12 × 12 px)
   ────────────────────────────────────────────────────────── */
const squareIcon = (hex) =>
  L.divIcon({
    className: "",
    html: `<div style="
            width:12px;height:12px;
            background:#${hex};
            border:1px solid #fff;
            box-shadow:0 0 2px rgba(0,0,0,.5);
          "></div>`,
    iconSize:   [14, 14],
    iconAnchor: [7 , 7 ],
    popupAnchor:[0 ,-8 ],
  });

/* ──────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────── */
export default function StorageMap() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch(
      "https://poweroptimiseai-0390a8a27103.herokuapp.com/api/storage-projects/"
    )
      .then((r) => r.json())
      .then(setProjects)
      .catch(console.error);
  }, []);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[51, -0.1]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup>
          {projects
            .filter(
              (p) =>
                p.latitude &&
                p.longitude &&
                Number(p.latitude) !== 0 &&
                Number(p.longitude) !== 0
            )
            .map((p, i) => {
              const hex  = statusColours[p.status] || statusColours.Unknown;
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
                    <strong>Status:</strong> {p.status}
                    <br />
                    <strong>Storage Type:</strong> {p.storage_type}
                    <br />
                    <strong>Capacity:</strong>{" "}
                    {p.storage_capacity_kwh?.toLocaleString()} kWh
                    <br />
                    <strong>Rated Power:</strong>{" "}
                    {p.rated_power_kw?.toLocaleString()} kW
                    <br />
                    <strong>Commissioned:</strong> {p.commissioned_date ?? "—"}
                  </Popup>
                </Marker>
              );
            })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Status legend */}
      <div className="status-legend">
        <h4>Status Legend</h4>
        <ul>
          {Object.entries(statusColours).map(([status, hex]) => (
            <li key={status}>
              <span
                className="legend-color"
                style={{ backgroundColor: `#${hex}` }}
              />
              {status}
            </li>
          ))}
        </ul>
      </div>

      {/* Storage-type legend */}
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
}
