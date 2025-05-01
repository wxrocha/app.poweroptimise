import React from "react";
import "./GenerationBreakdown.css";

const BreakdownRow = ({ color, label, value, percent }) => (
  <div className="breakdown-row">
    <div className="breakdown-color" style={{ backgroundColor: color }}></div>
    <div className="breakdown-label">{label}</div>
    <div className="breakdown-value">
      {value.toFixed(2)}<span className="unit"> GW</span>
    </div>
    <div className="breakdown-percent">
      {percent !== null ? `${(percent * 100).toFixed(1)}%` : "–"}
    </div>
  </div>
);

const GenerationBreakdown = ({ snapshot, total, sourceColors, groupDefs }) => {
  if (!snapshot || total == null) return null;

  return (
    <div className="breakdown-section">
      {Object.entries(groupDefs).map(([title, sources]) => {
        const rows = sources.map((src) => ({
          label: src,
          color: sourceColors[src] || "#ccc",
          value: snapshot[src] ?? 0,
        }));

        return (
          <div key={title} className="breakdown-group">
            <h3>{title}</h3>
            {rows.map((r) => (
              <BreakdownRow
                key={r.label}
                color={r.color}
                label={r.label}
                value={r.value}
                percent={total ? r.value / total : null}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default GenerationBreakdown;
