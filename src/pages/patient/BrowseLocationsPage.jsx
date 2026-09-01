import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
// import { getLocations,   } from "../../services/locationService";
import { locationsAPI } from "../../services/api";
import logo from "../../assets/images/logo.png";

export default function BrowseLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    locationsAPI.getAll()
      .then((res) => {
        const data = res.data.data ?? [];
        setLocations(data);
        setFiltered(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    let result = locations;
    if (cityFilter !== "All") {
      result = result.filter(
        (l) => l.city?.toLowerCase() === cityFilter.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.address?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [searchQuery, cityFilter, locations]);

 
  const cities = ["All", ...new Set(locations.map((l) => l.city).filter(Boolean))];

  return (
    <div className="bl-root">

     
      <header className="bl-topbar">
        <Link to="/" className="bl-logo-link">
          <img src={logo} alt="QTrack" className="bl-logo" />
          <span className="bl-brand">QTrack</span>
        </Link>
        <Link to="/dashboard" className="bl-back-btn">
          ← Dashboard
        </Link>
      </header>

     
      <div className="bl-hero">
        <div className="bl-hero-inner">
          <p className="bl-hero-eyebrow">Find a location near you</p>
          <h1 className="bl-hero-title">
            Where would you like to <span>queue today?</span>
          </h1>
          <p className="bl-hero-sub">
            Browse all available locations, pick a service and join the queue — no waiting in line.
          </p>

          {/* Search bar */}
          <div className="bl-search-wrap">
            <SearchIcon />
            <input
              className="bl-search"
              placeholder="Search hospitals, banks, offices…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="bl-search-clear" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="bl-body">

        {/* City filter tabs */}
        {cities.length > 1 && (
          <div className="bl-filters">
            {cities.map((c) => (
              <button
                key={c}
                className={`bl-filter-tab${cityFilter === c ? " bl-filter-tab--active" : ""}`}
                onClick={() => setCityFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Result count */}
        {!loading && (
          <p className="bl-result-count">
            {filtered.length === 0
              ? "No locations found"
              : `${filtered.length} location${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        )}

        {/* ── CARDS ── */}
        {loading ? (
          <div className="bl-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bl-skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bl-empty">
            <div className="bl-empty-icon">
              <LocationIcon size={28} />
            </div>
            <p className="bl-empty-title">No locations found</p>
            <p className="bl-empty-sub">Try a different search term or city filter.</p>
            <button className="bl-empty-reset" onClick={() => { setSearchQuery(""); setCityFilter("All"); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="bl-grid">
            {filtered.map((loc) => (
              <LocationCard
                key={loc.location_id}
                loc={loc}
                onView={() => navigate(`/locations/${loc.location_id}/services`, {
  state: { location: loc }  
})}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── STYLES ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bl-root {
          min-height: 100vh;
          background: #f4f5fb;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        /* TOPBAR */
        .bl-topbar {
          position: sticky; top: 0; z-index: 40;
          background: #fff; border-bottom: 1px solid #eaecf5;
          padding: 0 32px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .bl-logo-link {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .bl-logo { width: 34px; height: 34px; object-fit: contain; border-radius: 7px; }
        .bl-brand { font-size: 1.1rem; font-weight: 800; color: #727EFD; }
        .bl-back-btn {
          font-size: 0.82rem; font-weight: 600; color: #727EFD;
          text-decoration: none; padding: 7px 16px; border-radius: 8px;
          border: 1.5px solid #727EFD; transition: all 0.15s;
        }
        .bl-back-btn:hover { background: #727EFD; color: #fff; }

        /* HERO */
        .bl-hero {
          background: #727EFD;
          padding: 56px 32px 48px;
        }
        .bl-hero-inner {
          max-width: 680px; margin: 0 auto; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .bl-hero-eyebrow {
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.75);
        }
        .bl-hero-title {
          font-size: 2rem; font-weight: 900; color: #fff; line-height: 1.2;
        }
        .bl-hero-title span { color: #FEB600; }
        .bl-hero-sub {
          font-size: 0.95rem; color: rgba(255,255,255,0.8); max-width: 480px;
        }

        /* Search */
        .bl-search-wrap {
          position: relative; width: 100%; max-width: 520px; margin-top: 8px;
          display: flex; align-items: center;
        }
        .bl-search-wrap svg {
          position: absolute; left: 16px; color: #94a3b8; flex-shrink: 0;
        }
        .bl-search {
          width: 100%; padding: 14px 44px 14px 48px;
          border-radius: 14px; border: none;
          font-size: 0.95rem; color: #0f172a; background: #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          outline: none; transition: box-shadow 0.15s;
        }
        .bl-search:focus { box-shadow: 0 4px 24px rgba(0,0,0,0.18); }
        .bl-search::placeholder { color: #94a3b8; }
        .bl-search-clear {
          position: absolute; right: 14px;
          background: none; border: none; cursor: pointer;
          color: #94a3b8; font-size: 0.8rem; padding: 4px;
          border-radius: 4px; transition: color 0.15s;
        }
        .bl-search-clear:hover { color: #374151; }

        /* BODY */
        .bl-body {
          max-width: 1100px; margin: 0 auto;
          padding: 32px 24px 60px;
          display: flex; flex-direction: column; gap: 20px;
        }

        /* City filter tabs */
        .bl-filters {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .bl-filter-tab {
          padding: 7px 18px; border-radius: 20px;
          font-size: 0.82rem; font-weight: 600;
          border: 1.5px solid #e2e8f0; background: #fff; color: #4b5563;
          cursor: pointer; transition: all 0.15s;
        }
        .bl-filter-tab:hover { border-color: #727EFD; color: #727EFD; }
        .bl-filter-tab--active {
          background: #727EFD; border-color: #727EFD; color: #fff;
        }

        .bl-result-count {
          font-size: 0.82rem; color: #64748b; font-weight: 500;
        }

        /* GRID */
        .bl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 18px;
        }

        /* CARD */
        .bl-card {
          background: #fff; border-radius: 16px;
          border: 1px solid #eaecf5;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          padding: 22px 22px 18px;
          display: flex; flex-direction: column; gap: 14px;
          transition: box-shadow 0.18s, transform 0.15s;
        }
        .bl-card:hover {
          box-shadow: 0 8px 28px rgba(114,126,253,0.13);
          transform: translateY(-2px);
        }
        .bl-card-top {
          display: flex; align-items: flex-start; gap: 14px;
        }
        .bl-card-icon {
          width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
          background: rgba(114,126,253,0.1); color: #727EFD;
          display: flex; align-items: center; justify-content: center;
        }
        .bl-card-name {
          font-size: 1rem; font-weight: 800; color: #0f172a; line-height: 1.3;
        }
        .bl-card-city {
          font-size: 0.78rem; color: #64748b; margin-top: 3px;
          display: flex; align-items: center; gap: 4px;
        }

        .bl-card-divider {
          height: 1px; background: #f1f5f9;
        }

        .bl-card-details {
          display: flex; flex-direction: column; gap: 7px;
        }
        .bl-card-detail {
          display: flex; align-items: flex-start; gap: 9px;
          font-size: 0.82rem; color: #475569;
        }
        .bl-card-detail svg { flex-shrink: 0; margin-top: 1px; color: #94a3b8; }

        .bl-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 2px;
        }
        .bl-card-badge {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase; padding: 4px 10px; border-radius: 20px;
          background: rgba(34,197,94,0.1); color: #16a34a;
        }
        .bl-card-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 9px;
          background: #FEB600; border: none; cursor: pointer;
          font-size: 0.82rem; font-weight: 800; color: #111827;
          transition: background 0.15s, transform 0.12s;
        }
        .bl-card-btn:hover { background: #e5a500; transform: translateY(-1px); }
        .bl-card-btn svg { transition: transform 0.15s; }
        .bl-card-btn:hover svg { transform: translateX(3px); }

        /* SKELETON */
        .bl-skeleton {
          height: 200px; border-radius: 16px;
          background: linear-gradient(90deg, #f0f2fa 25%, #e4e7f5 50%, #f0f2fa 75%);
          background-size: 200% 100%;
          animation: bl-shimmer 1.4s ease infinite;
        }
        @keyframes bl-shimmer { to { background-position: -200% 0; } }

        /* EMPTY */
        .bl-empty {
          background: #fff; border-radius: 16px;
          border: 1.5px dashed #dde1f0;
          padding: 56px 24px;
          display: flex; flex-direction: column;
          align-items: center; gap: 12px; text-align: center;
          grid-column: 1 / -1;
        }
        .bl-empty-icon {
          width: 60px; height: 60px; border-radius: 16px;
          background: rgba(114,126,253,0.1); color: #727EFD;
          display: flex; align-items: center; justify-content: center;
        }
        .bl-empty-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .bl-empty-sub   { font-size: 0.875rem; color: #64748b; }
        .bl-empty-reset {
          margin-top: 4px; padding: 9px 20px; border-radius: 9px;
          background: #727EFD; color: #fff; border: none; cursor: pointer;
          font-size: 0.82rem; font-weight: 700;
          transition: background 0.15s;
        }
        .bl-empty-reset:hover { background: #5b6de8; }

        /* RESPONSIVE */
        @media (max-width: 640px) {
          .bl-hero { padding: 40px 20px 36px; }
          .bl-hero-title { font-size: 1.5rem; }
          .bl-body { padding: 24px 16px 48px; }
          .bl-topbar { padding: 0 16px; }
          .bl-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

// ── Location Card ──────────────────────────────────────────
function LocationCard({ loc, onView }) {
  return (
    <div className="bl-card">
      <div className="bl-card-top">
        <div className="bl-card-icon">
          <LocationIcon size={22} />
        </div>
        <div>
          <p className="bl-card-name">{loc.name}</p>
          <p className="bl-card-city">
            <PinIcon />
            {loc.city}{loc.state ? `, ${loc.state}` : ""}
          </p>
        </div>
      </div>

      <div className="bl-card-divider" />

      <div className="bl-card-details">
        {loc.address && (
          <div className="bl-card-detail">
            <MapIcon />
            <span>{loc.address}</span>
          </div>
        )}
        {loc.phone && (
          <div className="bl-card-detail">
            <PhoneIcon />
            <span>{loc.phone}</span>
          </div>
        )}
        {loc.email && (
          <div className="bl-card-detail">
            <MailIcon />
            <span>{loc.email}</span>
          </div>
        )}
      </div>

      <div className="bl-card-footer">
        <span className="bl-card-badge">● Active</span>
        <button className="bl-card-btn" onClick={onView}>
          View Services <ArrowIcon />
        </button>
      </div>
    </div>
  );
}

// ── SVG Icons ──────────────────────────────────────────────
const ic = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

function LocationIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ic}>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...ic}>
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...ic}>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function MapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...ic}>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...ic}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.06 6.06l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...ic}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...ic}>
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}