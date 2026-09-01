import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createLocation,
  searchLocations,
  createLocationFromSearch,
} from "../../services/locationService";
import logo from "../../assets/images/logo.png";

export default function AdminAddLocationPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // tabs: "search" | "manual"
  const [activeTab, setActiveTab] = useState("search");

  // manual form
  const [form, setForm] = useState({
    name: "", address: "", city: "", state: "", phone: "", email: "",
  });
  const [manualLoading, setManualLoading] = useState(false);

  // nominatim search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [savingId, setSavingId] = useState(null); // place_id being saved

  // feedback
  const [toast, setToast] = useState(null); // { type: "success"|"error", msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Manual submit ──
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualLoading(true);
    try {
      await createLocation(form, token);
      showToast("success", `"${form.name}" created successfully!`);
      setForm({ name: "", address: "", city: "", state: "", phone: "", email: "" });
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to create location.");
    } finally {
      setManualLoading(false);
    }
  };

  // ── Nominatim search ──
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await searchLocations(searchQuery);
      setSearchResults(res.data.data ?? []);
      if ((res.data.data ?? []).length === 0) {
        showToast("error", "No results found. Try a different query.");
      }
    } catch {
      showToast("error", "Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // ── Pick a result ──
  const handlePickResult = async (result) => {
    setSavingId(result.place_id);
    try {
      await createLocationFromSearch(
        { display_name: result.display_name, lat: result.lat, lon: result.lon },
        token
      );
      showToast("success", `"${result.display_name.split(",")[0]}" saved!`);
      setSearchResults([]);
      setSearchQuery("");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save.");
    } finally {
      setSavingId(null);
    }
  };

  const manualFields = [
    { key: "name",    label: "Location Name",   placeholder: "e.g. Apollo Hospital",         required: true,  type: "text"  },
    { key: "address", label: "Street Address",  placeholder: "e.g. 21 Greams Lane",          required: true,  type: "text"  },
    { key: "city",    label: "City",            placeholder: "e.g. Chennai",                 required: true,  type: "text"  },
    { key: "state",   label: "State",           placeholder: "e.g. Tamil Nadu",              required: true,  type: "text"  },
    { key: "phone",   label: "Phone (optional)",placeholder: "e.g. 044-28290200",            required: false, type: "tel"   },
    { key: "email",   label: "Email (optional)", placeholder: "e.g. info@location.com",      required: false, type: "email" },
  ];

  return (
    <div className="al-root">

      {/* ── TOPBAR ── */}
      <header className="al-topbar">
        <Link to="/" className="al-logo-link">
          <img src={logo} alt="QTrack" className="al-logo" />
          <span className="al-brand">QTrack</span>
        </Link>
        <div className="al-topbar-right">
          <span className="al-role-badge">
            <ShieldIcon /> Admin
          </span>
          <button className="al-back-btn" onClick={() => navigate("/locations")}>
            ← Locations
          </button>
        </div>
      </header>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`al-toast al-toast--${toast.type}`}>
          {toast.type === "success" ? <CheckCircleIcon /> : <ErrorCircleIcon />}
          {toast.msg}
        </div>
      )}

      {/* ── PAGE BODY ── */}
      <div className="al-body">

        {/* Page heading */}
        <div className="al-heading">
          <div className="al-heading-icon">
            <LocationPlusIcon />
          </div>
          <div>
            <h1 className="al-page-title">Add New Location</h1>
            <p className="al-page-sub">
              Search OpenStreetMap for real places, or fill in the details manually.
            </p>
          </div>
        </div>

        {/* ── TAB SWITCHER ── */}
        <div className="al-tabs">
          <button
            className={`al-tab${activeTab === "search" ? " al-tab--active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            <SearchIcon /> Search OpenStreetMap
          </button>
          <button
            className={`al-tab${activeTab === "manual" ? " al-tab--active" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            <EditIcon /> Add Manually
          </button>
        </div>

        {/* ═══════════════════════════════════
            TAB 1 — NOMINATIM SEARCH
        ═══════════════════════════════════ */}
        {activeTab === "search" && (
          <div className="al-card">
            <div className="al-card-header">
              <h2 className="al-card-title">Search OpenStreetMap</h2>
              <p className="al-card-sub">
                Find hospitals, banks, government offices and more. Completely free — no API key needed.
              </p>
            </div>

            {/* Search input */}
            <div className="al-search-row">
              <div className="al-search-wrap">
                <SearchIcon />
                <input
                  className="al-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. Apollo Hospital Chennai"
                />
                {searchQuery && (
                  <button
                    className="al-search-clear"
                    onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                  >✕</button>
                )}
              </div>
              <button
                className="al-search-btn"
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
              >
                {searching ? <><Spinner /> Searching…</> : "Search"}
              </button>
            </div>

            {/* Tip */}
            <div className="al-tip">
              <LightbulbIcon />
              <span>Try <strong>"Apollo Hospital Chennai"</strong>, <strong>"SBI Bank Mumbai"</strong> or <strong>"RTO Office Coimbatore"</strong></span>
            </div>

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="al-results">
                <p className="al-results-label">{searchResults.length} results found — pick one to save</p>
                <div className="al-results-list">
                  {searchResults.map((r) => (
                    <div className="al-result-row" key={r.place_id}>
                      <div className="al-result-icon">
                        <LocationIcon />
                      </div>
                      <div className="al-result-info">
                        <p className="al-result-name">{r.display_name.split(",")[0]}</p>
                        <p className="al-result-addr">{r.display_name}</p>
                        {(r.city || r.state) && (
                          <p className="al-result-meta">
                            📍 {[r.city, r.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                      <button
                        className="al-add-btn"
                        onClick={() => handlePickResult(r)}
                        disabled={savingId === r.place_id}
                      >
                        {savingId === r.place_id
                          ? <><Spinner /> Saving…</>
                          : <><PlusIcon /> Add</>}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state after search */}
            {!searching && searchResults.length === 0 && searchQuery && (
              <div className="al-search-empty">
                <MapSearchIcon />
                <p>Search for a place above to see results here.</p>
              </div>
            )}

            {/* Initial state */}
            {!searchQuery && searchResults.length === 0 && (
              <div className="al-search-empty">
                <MapSearchIcon />
                <p>Start typing a location name to search.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════
            TAB 2 — MANUAL FORM
        ═══════════════════════════════════ */}
        {activeTab === "manual" && (
          <div className="al-card">
            <div className="al-card-header">
              <h2 className="al-card-title">Add Location Manually</h2>
              <p className="al-card-sub">
                Fill in the details if the place isn't available on OpenStreetMap.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="al-form">
              <div className="al-form-grid">
                {manualFields.map(({ key, label, placeholder, required, type }) => (
                  <div
                    key={key}
                    className={`al-field${key === "address" ? " al-field--full" : ""}`}
                  >
                    <label className="al-label">
                      {label}
                      {required && <span className="al-required">*</span>}
                    </label>
                    <input
                      type={type}
                      className="al-input"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      required={required}
                    />
                  </div>
                ))}
              </div>

              <div className="al-form-footer">
                <button
                  type="button"
                  className="al-reset-btn"
                  onClick={() => setForm({ name: "", address: "", city: "", state: "", phone: "", email: "" })}
                >
                  Clear form
                </button>
                <button type="submit" className="al-submit-btn" disabled={manualLoading}>
                  {manualLoading
                    ? <><Spinner /> Creating…</>
                    : <><PlusIcon /> Create Location</>}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ── STYLES ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .al-root {
          min-height: 100vh;
          background: #f4f5fb;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        /* TOPBAR */
        .al-topbar {
          position: sticky; top: 0; z-index: 40;
          background: #fff; border-bottom: 1px solid #eaecf5;
          padding: 0 32px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .al-logo-link { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .al-logo  { width: 34px; height: 34px; object-fit: contain; border-radius: 7px; }
        .al-brand { font-size: 1.1rem; font-weight: 800; color: #727EFD; }
        .al-topbar-right { display: flex; align-items: center; gap: 12px; }
        .al-role-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(114,126,253,0.1); color: #727EFD;
          font-size: 0.72rem; font-weight: 700; letter-spacing: .06em;
          text-transform: uppercase; padding: 5px 12px; border-radius: 20px;
        }
        .al-back-btn {
          font-size: 0.82rem; font-weight: 600; color: #727EFD;
          text-decoration: none; padding: 7px 16px; border-radius: 8px;
          border: 1.5px solid #727EFD; background: none; cursor: pointer;
          transition: all 0.15s;
        }
        .al-back-btn:hover { background: #727EFD; color: #fff; }

        /* TOAST */
        .al-toast {
          position: fixed; top: 76px; right: 24px; z-index: 99;
          display: flex; align-items: center; gap: 10px;
          padding: 13px 18px; border-radius: 12px;
          font-size: 0.875rem; font-weight: 600;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          animation: al-slide-in 0.25s ease;
        }
        .al-toast--success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
        .al-toast--error   { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        @keyframes al-slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* BODY */
        .al-body {
          max-width: 760px; margin: 0 auto;
          padding: 36px 24px 64px;
          display: flex; flex-direction: column; gap: 24px;
        }

        /* HEADING */
        .al-heading {
          display: flex; align-items: center; gap: 16px;
        }
        .al-heading-icon {
          width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
          background: rgba(114,126,253,0.1); color: #727EFD;
          display: flex; align-items: center; justify-content: center;
        }
        .al-page-title { font-size: 1.5rem; font-weight: 900; color: #0f172a; }
        .al-page-sub   { font-size: 0.875rem; color: #64748b; margin-top: 4px; }

        /* TABS */
        .al-tabs {
          display: flex; gap: 8px;
          background: #fff; padding: 6px;
          border-radius: 14px; border: 1px solid #eaecf5;
          width: fit-content;
        }
        .al-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 10px;
          font-size: 0.85rem; font-weight: 600;
          border: none; cursor: pointer; color: #64748b;
          background: transparent; transition: all 0.15s;
        }
        .al-tab:hover { color: #727EFD; background: rgba(114,126,253,0.06); }
        .al-tab--active {
          background: #727EFD; color: #fff !important;
          box-shadow: 0 2px 8px rgba(114,126,253,0.3);
        }

        /* CARD */
        .al-card {
          background: #fff; border-radius: 18px;
          border: 1px solid #eaecf5;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          padding: 28px 28px 24px;
          display: flex; flex-direction: column; gap: 20px;
        }
        .al-card-header { display: flex; flex-direction: column; gap: 4px; }
        .al-card-title  { font-size: 1.05rem; font-weight: 800; color: #0f172a; }
        .al-card-sub    { font-size: 0.83rem; color: #64748b; }

        /* SEARCH */
        .al-search-row {
          display: flex; gap: 10px; align-items: center;
        }
        .al-search-wrap {
          position: relative; flex: 1;
          display: flex; align-items: center;
        }
        .al-search-wrap > svg {
          position: absolute; left: 14px; color: #94a3b8; flex-shrink: 0;
        }
        .al-search-input {
          width: 100%; padding: 12px 40px 12px 44px;
          border: 1.5px solid #e2e8f0; border-radius: 11px;
          font-size: 0.93rem; color: #0f172a; background: #f8fafc;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .al-search-input:focus {
          border-color: #727EFD; background: #fff;
          box-shadow: 0 0 0 3px rgba(114,126,253,0.12);
        }
        .al-search-input::placeholder { color: #94a3b8; }
        .al-search-clear {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          color: #94a3b8; font-size: 0.78rem; padding: 4px;
          border-radius: 4px;
        }
        .al-search-clear:hover { color: #374151; }
        .al-search-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 12px 22px; border-radius: 11px;
          background: #727EFD; color: #fff; border: none;
          font-size: 0.875rem; font-weight: 700; cursor: pointer;
          white-space: nowrap; transition: background 0.15s;
          flex-shrink: 0;
        }
        .al-search-btn:hover:not(:disabled) { background: #5b6de8; }
        .al-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* TIP */
        .al-tip {
          display: flex; align-items: center; gap: 8px;
          background: rgba(254,182,0,0.08); border: 1px solid rgba(254,182,0,0.25);
          border-radius: 10px; padding: 10px 14px;
          font-size: 0.8rem; color: #92400e;
        }
        .al-tip svg { flex-shrink: 0; color: #FEB600; }

        /* RESULTS */
        .al-results { display: flex; flex-direction: column; gap: 10px; }
        .al-results-label {
          font-size: 0.78rem; font-weight: 600; color: #64748b;
          letter-spacing: 0.03em;
        }
        .al-results-list { display: flex; flex-direction: column; gap: 8px; }
        .al-result-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px; border-radius: 12px;
          border: 1.5px solid #eaecf5; background: #f8fafc;
          transition: border-color 0.15s, background 0.15s;
        }
        .al-result-row:hover { border-color: #727EFD; background: #fff; }
        .al-result-icon {
          width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
          background: rgba(114,126,253,0.1); color: #727EFD;
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }
        .al-result-info { flex: 1; min-width: 0; }
        .al-result-name {
          font-size: 0.9rem; font-weight: 700; color: #0f172a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .al-result-addr {
          font-size: 0.76rem; color: #64748b; margin-top: 2px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .al-result-meta {
          font-size: 0.74rem; color: #727EFD; font-weight: 600; margin-top: 4px;
        }
        .al-add-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 8px 16px; border-radius: 8px; flex-shrink: 0;
          background: #FEB600; border: none; cursor: pointer;
          font-size: 0.78rem; font-weight: 800; color: #111827;
          transition: background 0.15s; margin-top: 2px;
        }
        .al-add-btn:hover:not(:disabled) { background: #e5a500; }
        .al-add-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* SEARCH EMPTY */
        .al-search-empty {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 32px 16px; color: #94a3b8; font-size: 0.875rem; text-align: center;
          border: 1.5px dashed #e2e8f0; border-radius: 12px;
        }
        .al-search-empty svg { opacity: 0.4; }

        /* MANUAL FORM */
        .al-form { display: flex; flex-direction: column; gap: 20px; }
        .al-form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        .al-field { display: flex; flex-direction: column; gap: 6px; }
        .al-field--full { grid-column: 1 / -1; }
        .al-label {
          font-size: 0.75rem; font-weight: 700; color: #374151;
          letter-spacing: 0.05em; text-transform: uppercase;
          display: flex; align-items: center; gap: 4px;
        }
        .al-required { color: #ef4444; }
        .al-input {
          padding: 11px 14px; border: 1.5px solid #e2e8f0;
          border-radius: 10px; font-size: 0.93rem; color: #0f172a;
          background: #f8fafc; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .al-input:focus {
          border-color: #727EFD; background: #fff;
          box-shadow: 0 0 0 3px rgba(114,126,253,0.12);
        }
        .al-input::placeholder { color: #94a3b8; }

        /* FORM FOOTER */
        .al-form-footer {
          display: flex; align-items: center; justify-content: flex-end; gap: 10px;
          padding-top: 4px; border-top: 1px solid #f1f5f9;
        }
        .al-reset-btn {
          padding: 11px 20px; border-radius: 10px;
          border: 1.5px solid #e2e8f0; background: #fff;
          font-size: 0.875rem; font-weight: 600; color: #64748b;
          cursor: pointer; transition: all 0.15s;
        }
        .al-reset-btn:hover { border-color: #94a3b8; color: #374151; }
        .al-submit-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 24px; border-radius: 10px;
          background: #FEB600; border: none; cursor: pointer;
          font-size: 0.875rem; font-weight: 800; color: #111827;
          transition: background 0.15s, transform 0.12s;
        }
        .al-submit-btn:hover:not(:disabled) { background: #e5a500; transform: translateY(-1px); }
        .al-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* SPINNER */
        .al-spin {
          width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor;
          border-radius: 50%; animation: al-spin 0.65s linear infinite;
          display: inline-block;
        }
        @keyframes al-spin { to { transform: rotate(360deg); } }

        /* RESPONSIVE */
        @media (max-width: 640px) {
          .al-topbar  { padding: 0 16px; }
          .al-body    { padding: 24px 16px 48px; }
          .al-card    { padding: 20px 16px; }
          .al-form-grid { grid-template-columns: 1fr; }
          .al-tabs    { width: 100%; }
          .al-tab     { flex: 1; justify-content: center; }
          .al-search-row { flex-direction: column; }
          .al-search-btn { width: 100%; justify-content: center; }
          .al-form-footer { flex-direction: column-reverse; }
          .al-reset-btn, .al-submit-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}

// ── Spinner ──
function Spinner() {
  return <span className="al-spin" />;
}

// ── SVG Icons ──
const ic = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

function LocationPlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...ic}>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" {...ic}>
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...ic}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" {...ic}>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...ic}>
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" {...ic}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function LightbulbIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" {...ic}>
      <line x1="9" y1="18" x2="15" y2="18"/>
      <line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  );
}
function MapSearchIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" {...ic}>
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" {...ic}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function ErrorCircleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" {...ic}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}