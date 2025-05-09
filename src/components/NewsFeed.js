import { useEffect, useState } from "react";
import './NewsFeed.css';

interface Item {
  id: number;
  source: string;
  identifier: string;   // URL
  payload: {
    title?: string;
    description?: string;
    publishedAt?: string;
    urlToImage?: string;
  };
  fetched_at: string;
}

export default function NewsFeed() {
  const [items, setItems] = useState([]);   // removed <Item[]>
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    fetch(
      `https://poweroptimiseai-0390a8a27103.herokuapp.com/grid-api/feed/?page=${page}&page_size=${pageSize}`
    )
      .then((r) => r.json())
      .then((data) => setItems(data.results || []));
  }, [page]);

  return (
    <div className="news-grid">
      {items.map((it) => (
        <article key={it.id} className="news-card">
          {it.payload.urlToImage && (
            <img src={it.payload.urlToImage} alt="thumbnail" className="w-full h-40 object-cover rounded-xl mb-3" />
          )}
          <h2 className="font-semibold text-lg mb-1">
            <a href={it.identifier} target="_blank" rel="noreferrer" className="hover:underline">
              {it.payload.title || it.identifier}
            </a>
          </h2>
          <p className="text-sm text-gray-600 mb-2 line-clamp-3">
            {it.payload.description}
          </p>
          <footer className="text-xs text-gray-500 flex justify-between items-center">
            <span>{it.source.toUpperCase()}</span>
            <time dateTime={it.fetched_at}>{new Date(it.fetched_at).toLocaleString()}</time>
          </footer>
        </article>
      ))}
    </div>
  );
}