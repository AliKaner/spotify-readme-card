import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { authFetch } from "../lib/authFetch";

export type PickerType = "track" | "artist" | "playlist";

export interface PickerItem {
  id: string;
  label: string;
  sublabel?: string;
  imageUrl?: string;
}

function normalize(type: PickerType, raw: any): PickerItem {
  if (type === "track") return { id: raw.id, label: raw.title, sublabel: raw.artist, imageUrl: raw.imageUrl };
  if (type === "artist") return { id: raw.id, label: raw.name, imageUrl: raw.imageUrl };
  return { id: raw.id, label: raw.name, sublabel: raw.owner ? `by ${raw.owner}` : undefined, imageUrl: raw.imageUrl };
}

export function SpotifySearchPicker({
  type,
  token,
  selected,
  onSelect,
}: {
  type: PickerType;
  token: string | null;
  selected: PickerItem | null;
  onSelect: (item: PickerItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickerItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await authFetch(token, `/api/spotify/search?q=${encodeURIComponent(query)}&type=${type}`);
        if (!response.ok) {
          setResults([]);
          return;
        }
        const data = await response.json();
        setResults((data.results ?? []).map((raw: unknown) => normalize(type, raw)));
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, type, token]);

  return (
    <div>
      {selected && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-bg p-2">
          {selected.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="h-10 w-10 rounded bg-surface-hover" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selected.label}</p>
            {selected.sublabel && <p className="truncate text-xs text-text-muted">{selected.sublabel}</p>}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${type}s…`}
          className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      {loading && <p className="mt-2 text-xs text-text-muted">Searching…</p>}

      {results.length > 0 && (
        <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(item);
                  setQuery("");
                  setResults([]);
                }}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-surface-hover"
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="h-9 w-9 rounded object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded bg-surface-hover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.label}</p>
                  {item.sublabel && <p className="truncate text-xs text-text-muted">{item.sublabel}</p>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
