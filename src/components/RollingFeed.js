import { useEffect, useRef, useState } from "react";
import "./RollingFeed.css";

export default function RollingFeed({
  apiBase = "",
  pageSize = 50,
  reloadMs = 60000,        // 60 s
}) {
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchFeed = () =>
      fetch(`${apiBase}/grid-api/feed/?page=1&page_size=${pageSize}`)
        .then((r) => r.json())
        .then((data) => setItems(data.results || []));

    fetchFeed();
    const id = setInterval(fetchFeed, reloadMs);
    return () => clearInterval(id);
  }, [apiBase, pageSize, reloadMs]);

  return (
    <div
      className="rf-container"
      ref={containerRef}
      onMouseEnter={() => containerRef.current?.classList.add("rf-pause")}
      onMouseLeave={() => containerRef.current?.classList.remove("rf-pause")}
    >
      <ul className="rf-track">
        {items.concat(items).map((it, idx) => (
          <li key={idx} className="rf-item">
            <a href={it.identifier} target="_blank" rel="noopener noreferrer">
              <span className="rf-time">
                {new Date(it.fetched_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="rf-source">{it.source.toUpperCase()}</span>
              <span className="rf-title">
                {it.payload?.title || it.identifier}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
