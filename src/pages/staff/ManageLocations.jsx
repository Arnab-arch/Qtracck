import { useState, useEffect, useRef, useCallback } from "react";
import { locationsAPI } from "../../services/api";


export default function ManageLocations() {
  const [locations, setLocations]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("all"); // all | active | inactive
  const [modal, setModal]           = useState(null);  // null | "manual" | "osm" | "edit" | "delete"
  const [selected, setSelected]     = useState(null);  // location being edited/deleted
  const [toast, setToast]           = useState(null);


  const fetchLocations = useCallback(() => {
    setLoading(true);
    locationsAPI.getAll()
      .then(r => setLocations(Array.isArray(r.data) ? r.data : r.data?.locations || []))
      .catch(() => showToast("Failed to load locations", "error"))
      .finally(() => setLoading(false));
      
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);


  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };


  const filtered = locations.filter(l => {
    const q = search.toLowerCase();
    const matchText = !q || [l.name, l.city, l.address, l.state]
      .some(v => v?.toLowerCase().includes(q));
    const matchStatus = filterStatus === "all"
      ? true
      : filterStatus === "active" ? l.is_active : !l.is_active;
    return matchText && matchStatus;
  });


  const openCreate = () => { setSelected(null); setModal("manual"); };
  const openOSM    = () => { setSelected(null); setModal("osm"); };
  const openEdit   = (loc) => { setSelected(loc); setModal("edit"); };
  const openDelete = (loc) => { setSelected(loc); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (data, isOSM = false) => {
    try {
      if (modal === "edit" && selected) {
        await locationsAPI.update(selected.location_id, data);
        showToast("Location updated successfully");
      } else if (isOSM) {
        await locationsAPI.createFromOSM(data);
        showToast("Location created from OpenStreetMap");
      } else {
        await locationsAPI.create(data);
        showToast("Location created successfully");
      }
      fetchLocations();
      closeModal();
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await locationsAPI.delete(selected.location_id);
      showToast("Location deactivated");
      fetchLocations();
      closeModal();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
  };


  const activeCount   = locations.filter(l => l.is_active).length;
  const inactiveCount = locations.filter(l => !l.is_active).length;

  return (
    <div className="ml-root">

 
      <div className="ml-header">
        <div className="ml-header-left">
          <div className="ml-header-icon">📍</div>
          <div>
            <h1 className="ml-title">Manage Locations</h1>
            <p className="ml-subtitle">Add, edit, and manage service locations</p>
          </div>
        </div>
        <div className="ml-header-actions">
          <button className="ml-btn ml-btn--ghost" onClick={openOSM}>
            <OsmIcon /> Search OpenStreetMap
          </button>
          <button className="ml-btn ml-btn--primary" onClick={openCreate}>
            <PlusIcon /> Add Location
          </button>
        </div>
      </div>


      <div className="ml-stats">
        <div className="ml-stat-pill ml-stat-pill--total">
          <span className="ml-stat-n">{locations.length}</span>
          <span className="ml-stat-l">Total</span>
        </div>
        <div className="ml-stat-pill ml-stat-pill--active">
          <span className="ml-stat-n">{activeCount}</span>
          <span className="ml-stat-l">Active</span>
        </div>
        <div className="ml-stat-pill ml-stat-pill--inactive">
          <span className="ml-stat-n">{inactiveCount}</span>
          <span className="ml-stat-l">Inactive</span>
        </div>
      </div>

    
      <div className="ml-toolbar">
        <div className="ml-search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by name, city, address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ml-search-input"
          />
          {search && (
            <button className="ml-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
        <div className="ml-filter-tabs">
          {["all","active","inactive"].map(f => (
            <button
              key={f}
              className={`ml-filter-tab ${filterStatus === f ? "ml-filter-tab--on" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

  
      {loading ? (
        <div className="ml-loader">
          <div className="ml-spinner" />
          <span>Loading locations…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ml-empty">
          <span className="ml-empty-icon">📭</span>
          <p className="ml-empty-title">{search ? "No results found" : "No locations yet"}</p>
          <p className="ml-empty-sub">
            {search ? "Try a different search term." : "Click Add Location or import from OpenStreetMap."}
          </p>
        </div>
      ) : (
        <div className="ml-table-wrap">
          <table className="ml-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>City / State</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(loc => (
                <LocationRow
                  key={loc.location_id}
                  loc={loc}
                  onEdit={() => openEdit(loc)}
                  onDelete={() => openDelete(loc)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}


      {(modal === "manual" || modal === "edit") && (
        <LocationFormModal
          initial={selected}
          onSave={(data) => handleSave(data, false)}
          onClose={closeModal}
        />
      )}
      {modal === "osm" && (
        <OSMSearchModal
          onSave={(data) => handleSave(data, true)}
          onClose={closeModal}
        />
      )}
      {modal === "delete" && (
        <DeleteModal
          name={selected?.name}
          onConfirm={handleDelete}
          onClose={closeModal}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`ml-toast ml-toast--${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <style>{`
        /* ── ROOT ── */
        .ml-root { display: flex; flex-direction: column; gap: 20px; }

        /* ── HEADER ── */
        .ml-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .ml-header-left { display: flex; align-items: center; gap: 14px; }
        .ml-header-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg,#727EFD22,#727EFD44);
          border: 1.5px solid #727EFD55;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; flex-shrink: 0;
        }
        .ml-title { font-size: 1.4rem; font-weight: 800; color: var(--text-1); margin: 0 0 3px; }
        .ml-subtitle { font-size: 0.82rem; color: var(--text-3); margin: 0; }
        .ml-header-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        /* ── BUTTONS ── */
        .ml-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 10px;
          font-size: 0.85rem; font-weight: 700; cursor: pointer;
          border: none; transition: all 0.15s; white-space: nowrap;
        }
        .ml-btn svg { width: 15px; height: 15px; flex-shrink: 0; }
        .ml-btn--primary { background: var(--brand); color: #fff; }
        .ml-btn--primary:hover { background: var(--brand-dark); transform: translateY(-1px); }
        .ml-btn--ghost {
          background: var(--surface); color: var(--text-2);
          border: 1.5px solid var(--border);
        }
        .ml-btn--ghost:hover { border-color: var(--brand); color: var(--brand); background: #f0f2ff; }
        .ml-btn--danger { background: #fee2e2; color: #b91c1c; border: 1.5px solid #fecaca; }
        .ml-btn--danger:hover { background: #ef4444; color: #fff; }
        .ml-btn--sm { padding: 6px 12px; font-size: 0.78rem; }
        .ml-btn--icon {
          padding: 7px; background: none; border: 1.5px solid var(--border);
          color: var(--text-3); border-radius: 8px;
        }
        .ml-btn--icon:hover { border-color: var(--brand); color: var(--brand); background: #f0f2ff; }

        /* ── STAT PILLS ── */
        .ml-stats { display: flex; gap: 10px; flex-wrap: wrap; }
        .ml-stat-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 20px;
          border: 1.5px solid transparent;
        }
        .ml-stat-pill--total   { background:#f0f2ff; border-color:#c7d0fd; }
        .ml-stat-pill--active  { background:#dcfce7; border-color:#86efac; }
        .ml-stat-pill--inactive{ background:#fef2f2; border-color:#fecaca; }
        .ml-stat-n { font-size: 1rem; font-weight: 800; color: var(--text-1); }
        .ml-stat-l { font-size: 0.75rem; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.05em; }

        /* ── TOOLBAR ── */
        .ml-toolbar {
          display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
        }
        .ml-search-box {
          display: flex; align-items: center; gap: 8px;
          background: var(--surface); border: 1.5px solid var(--border);
          border-radius: 10px; padding: 8px 12px; flex: 1; min-width: 220px;
          transition: border-color 0.15s;
        }
        .ml-search-box:focus-within { border-color: var(--brand); }
        .ml-search-box svg { color: var(--text-3); flex-shrink: 0; width: 16px; height: 16px; }
        .ml-search-input {
          border: none; outline: none; background: none;
          font-size: 0.875rem; color: var(--text-1); width: 100%;
        }
        .ml-search-input::placeholder { color: var(--text-3); }
        .ml-search-clear {
          background: none; border: none; cursor: pointer;
          color: var(--text-3); font-size: 0.75rem; padding: 0;
          line-height: 1;
        }
        .ml-search-clear:hover { color: var(--text-1); }

        .ml-filter-tabs { display: flex; gap: 4px; }
        .ml-filter-tab {
          padding: 7px 14px; border-radius: 8px; border: none;
          font-size: 0.8rem; font-weight: 600; cursor: pointer;
          background: var(--surface); color: var(--text-3);
          border: 1.5px solid var(--border);
          transition: all 0.15s;
        }
        .ml-filter-tab--on {
          background: var(--brand); color: #fff; border-color: var(--brand);
        }
        .ml-filter-tab:hover:not(.ml-filter-tab--on) { border-color: var(--brand); color: var(--brand); }

        /* ── TABLE ── */
        .ml-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 2px 8px rgba(114,126,253,0.06);
        }
        .ml-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .ml-table th {
          padding: 11px 16px; background: var(--bg);
          text-align: left; font-size: 0.7rem; font-weight: 700;
          color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em;
          border-bottom: 1px solid var(--border);
        }
        .ml-table td {
          padding: 14px 16px; border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .ml-table tr:last-child td { border-bottom: none; }
        .ml-table tbody tr { transition: background 0.1s; }
        .ml-table tbody tr:hover td { background: #fafbff; }

        /* ── LOADER / EMPTY ── */
        .ml-loader {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; padding: 60px; color: var(--text-3);
          font-size: 0.875rem;
        }
        .ml-spinner {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2.5px solid var(--border); border-top-color: var(--brand);
          animation: ml-spin 0.7s linear infinite;
        }
        @keyframes ml-spin { to { transform: rotate(360deg); } }
        .ml-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 70px 24px; text-align: center;
          background: var(--surface); border-radius: 14px;
          border: 1.5px dashed var(--border);
        }
        .ml-empty-icon { font-size: 2.5rem; }
        .ml-empty-title { font-size: 1rem; font-weight: 700; color: var(--text-2); margin: 0; }
        .ml-empty-sub { font-size: 0.82rem; color: var(--text-3); margin: 0; }

        /* ── TOAST ── */
        .ml-toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 9999;
          padding: 12px 20px; border-radius: 10px;
          font-size: 0.875rem; font-weight: 600;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          animation: ml-toast-in 0.25s ease;
        }
        .ml-toast--success { background: #052e16; color: #bbf7d0; }
        .ml-toast--error   { background: #450a0a; color: #fecaca; }
        @keyframes ml-toast-in { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }

        /* ── MODAL OVERLAY ── */
        .ml-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15,23,42,0.55); backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: ml-fade-in 0.18s ease;
        }
        @keyframes ml-fade-in { from { opacity:0; } to { opacity:1; } }
        .ml-modal {
          background: var(--surface); border-radius: 18px;
          width: 100%; max-width: 560px; max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 32px 80px rgba(0,0,0,0.22);
          animation: ml-modal-in 0.22s cubic-bezier(.34,1.56,.64,1);
        }
        .ml-modal--wide { max-width: 680px; }
        @keyframes ml-modal-in { from { opacity:0; transform: scale(0.95) translateY(16px); } to { opacity:1; transform: none; } }
        .ml-modal-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 24px 0;
        }
        .ml-modal-title { font-size: 1.1rem; font-weight: 800; color: var(--text-1); margin: 0; }
        .ml-modal-close {
          background: none; border: none; cursor: pointer;
          color: var(--text-3); padding: 4px;
          border-radius: 6px; font-size: 1.1rem; line-height: 1;
          transition: color 0.15s, background 0.15s;
        }
        .ml-modal-close:hover { background: var(--bg); color: var(--text-1); }
        .ml-modal-body { padding: 20px 24px 24px; }

        /* ── FORM ── */
        .ml-form { display: flex; flex-direction: column; gap: 14px; }
        .ml-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ml-field { display: flex; flex-direction: column; gap: 5px; }
        .ml-label {
          font-size: 0.72rem; font-weight: 700; color: var(--text-2);
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .ml-input, .ml-textarea {
          padding: 9px 12px; border: 1.5px solid var(--border);
          border-radius: 9px; font-size: 0.875rem; color: var(--text-1);
          background: var(--bg); outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .ml-input:focus, .ml-textarea:focus {
          border-color: var(--brand); background: #fff;
          box-shadow: 0 0 0 3px rgba(114,126,253,0.1);
        }
        .ml-textarea { resize: vertical; min-height: 72px; }
        .ml-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; background: var(--bg);
          border-radius: 9px; border: 1.5px solid var(--border);
        }
        .ml-toggle-label { font-size: 0.875rem; font-weight: 600; color: var(--text-2); }
        .ml-toggle {
          position: relative; width: 40px; height: 22px;
          cursor: pointer; flex-shrink: 0;
        }
        .ml-toggle input { opacity: 0; width: 0; height: 0; }
        .ml-toggle-track {
          position: absolute; inset: 0; border-radius: 99px;
          background: #cbd5e1; transition: background 0.2s;
        }
        .ml-toggle input:checked + .ml-toggle-track { background: var(--brand); }
        .ml-toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff; transition: transform 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .ml-toggle input:checked ~ .ml-toggle-thumb { transform: translateX(18px); }
        .ml-form-actions {
          display: flex; gap: 10px; justify-content: flex-end;
          padding-top: 4px;
        }

        /* ── OSM SEARCH ── */
        .ml-osm-search { display: flex; gap: 8px; margin-bottom: 14px; }
        .ml-osm-search .ml-input { flex: 1; }
        .ml-osm-results { display: flex; flex-direction: column; gap: 8px; max-height: 360px; overflow-y: auto; }
        .ml-osm-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 13px 14px; border: 1.5px solid var(--border);
          border-radius: 10px; cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .ml-osm-item:hover { border-color: var(--brand); background: #f8f9ff; }
        .ml-osm-item--selected { border-color: var(--brand); background: #f0f2ff; }
        .ml-osm-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); flex-shrink: 0; margin-top: 5px; }
        .ml-osm-name { font-size: 0.875rem; font-weight: 700; color: var(--text-1); margin: 0 0 2px; }
        .ml-osm-addr { font-size: 0.78rem; color: var(--text-3); margin: 0; }
        .ml-osm-badge {
          margin-left: auto; flex-shrink: 0;
          font-size: 0.68rem; font-weight: 700; padding: 2px 8px;
          border-radius: 20px; background: #ede9fe; color: #7c3aed;
        }
        .ml-osm-empty { text-align: center; padding: 32px; color: var(--text-3); font-size: 0.875rem; }

        /* ── DELETE MODAL ── */
        .ml-delete-body {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; text-align: center; padding: 24px;
        }
        .ml-delete-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: #fee2e2; display: flex; align-items: center;
          justify-content: center; font-size: 1.5rem;
        }
        .ml-delete-title { font-size: 1rem; font-weight: 800; color: var(--text-1); margin: 0; }
        .ml-delete-sub { font-size: 0.85rem; color: var(--text-3); margin: 0; }
        .ml-delete-actions { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
        .ml-delete-actions button { flex: 1; }

        @media (max-width: 700px) {
          .ml-form-row { grid-template-columns: 1fr; }
          .ml-header { flex-direction: column; align-items: flex-start; }
          .ml-header-actions { width: 100%; }
          .ml-header-actions .ml-btn { flex: 1; justify-content: center; }
          .ml-toolbar { flex-direction: column; }
          .ml-search-box { min-width: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── LOCATION ROW ──────────────────────────────────────────────────────── */
function LocationRow({ loc, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontWeight: 700, color: "var(--text-1)" }}>{loc.name}</span>
          {loc.address && (
            <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{loc.address}</span>
          )}
        </div>
      </td>
      <td style={{ color: "var(--text-2)" }}>
        {[loc.city, loc.state].filter(Boolean).join(", ") || "—"}
      </td>
      <td>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {loc.phone && <span style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>📞 {loc.phone}</span>}
          {loc.email && <span style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>✉ {loc.email}</span>}
          {!loc.phone && !loc.email && <span style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>—</span>}
        </div>
      </td>
      <td>
        <span style={{
          padding: "3px 10px", borderRadius: 20,
          fontSize: "0.72rem", fontWeight: 700,
          background: loc.is_active ? "#dcfce7" : "#f1f5f9",
          color:      loc.is_active ? "#15803d" : "#64748b",
        }}>
          {loc.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="ml-btn ml-btn--icon" onClick={onEdit} title="Edit">
            <EditIcon />
          </button>
          <button className="ml-btn ml-btn--icon" onClick={onDelete} title="Deactivate"
            style={{ borderColor: "#fecaca", color: "#ef4444" }}>
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── LOCATION FORM MODAL (create / edit) ───────────────────────────────── */
function LocationFormModal({ initial, onSave, onClose }) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:      initial?.name      || "",
    address:   initial?.address   || "",
    city:      initial?.city      || "",
    state:     initial?.state     || "",
    phone:     initial?.phone     || "",
    email:     initial?.email     || "",
    is_active: initial?.is_active ?? true,
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  return (
    <div className="ml-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ml-modal">
        <div className="ml-modal-head">
          <h2 className="ml-modal-title">
            {isEdit ? "Edit Location" : "Add Location Manually"}
          </h2>
          <button className="ml-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ml-modal-body">
          <form className="ml-form" onSubmit={handleSubmit}>
            <div className="ml-field">
              <label className="ml-label">Location Name *</label>
              <input className="ml-input" value={form.name} onChange={set("name")}
                placeholder="e.g. City General Hospital" required />
            </div>
            <div className="ml-field">
              <label className="ml-label">Address</label>
              <input className="ml-input" value={form.address} onChange={set("address")}
                placeholder="Street address" />
            </div>
            <div className="ml-form-row">
              <div className="ml-field">
                <label className="ml-label">City</label>
                <input className="ml-input" value={form.city} onChange={set("city")}
                  placeholder="City" />
              </div>
              <div className="ml-field">
                <label className="ml-label">State</label>
                <input className="ml-input" value={form.state} onChange={set("state")}
                  placeholder="State / Province" />
              </div>
            </div>
            <div className="ml-form-row">
              <div className="ml-field">
                <label className="ml-label">Phone</label>
                <input className="ml-input" value={form.phone} onChange={set("phone")}
                  placeholder="+1 555 000 0000" type="tel" />
              </div>
              <div className="ml-field">
                <label className="ml-label">Email</label>
                <input className="ml-input" value={form.email} onChange={set("email")}
                  placeholder="contact@location.com" type="email" />
              </div>
            </div>
            <div className="ml-toggle-row">
              <span className="ml-toggle-label">Location is Active</span>
              <label className="ml-toggle">
                <input type="checkbox" checked={form.is_active}
                  onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <span className="ml-toggle-track" />
                <span className="ml-toggle-thumb" />
              </label>
            </div>
            <div className="ml-form-actions">
              <button type="button" className="ml-btn ml-btn--ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="ml-btn ml-btn--primary" disabled={saving}>
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Location"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── OSM SEARCH MODAL ──────────────────────────────────────────────────── */
function OSMSearchModal({ onSave, onClose }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  const doSearch = async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setSearching(true);
    setSearched(true);
    try {
      const r = await locationsAPI.searchOSM(q);
      setResults(Array.isArray(r.data) ? r.data : r.data?.results || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    setSelected(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(v), 600);
  };

  const handleImport = async () => {
    if (!selected) return;
    setSaving(true);
    try { await onSave(selected); }
    finally { setSaving(false); }
  };

  return (
    <div className="ml-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ml-modal ml-modal--wide">
        <div className="ml-modal-head">
          <h2 className="ml-modal-title">🗺️ Search OpenStreetMap</h2>
          <button className="ml-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ml-modal-body">
          <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginTop: 0, marginBottom: 14 }}>
            Search for hospitals, clinics, or any public facility to import its details automatically.
          </p>

          <div className="ml-osm-search">
            <input className="ml-input" value={query} onChange={handleInput}
              placeholder="Search by name or city, e.g. 'Apollo Hospital Chennai'" autoFocus />
            <button className="ml-btn ml-btn--ghost" onClick={() => doSearch(query)} disabled={searching}>
              {searching ? <LoadingIcon /> : <SearchIcon />}
              {searching ? "Searching…" : "Search"}
            </button>
          </div>

          <div className="ml-osm-results">
            {searching && (
              <div className="ml-osm-empty">
                <div className="ml-spinner" style={{ margin: "0 auto 8px" }} />
                Searching OpenStreetMap…
              </div>
            )}
            {!searching && searched && results.length === 0 && (
              <div className="ml-osm-empty">No results found. Try a different search term.</div>
            )}
            {!searching && results.map((r, i) => (
              <div key={i}
                className={`ml-osm-item ${selected === r ? "ml-osm-item--selected" : ""}`}
                onClick={() => setSelected(r)}
              >
                <div className="ml-osm-dot" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="ml-osm-name">{r.name || r.display_name?.split(",")[0]}</p>
                  <p className="ml-osm-addr">{r.address || r.display_name}</p>
                </div>
                {r.type && <span className="ml-osm-badge">{r.type}</span>}
              </div>
            ))}
          </div>

          {selected && (
            <div style={{
              marginTop: 14, padding: "12px 14px",
              background: "#f0f2ff", borderRadius: 10,
              border: "1.5px solid #c7d0fd",
              fontSize: "0.82rem", color: "var(--text-2)"
            }}>
              <strong style={{ color: "var(--brand)" }}>Selected:</strong> {selected.name || selected.display_name?.split(",")[0]}
            </div>
          )}

          <div className="ml-form-actions" style={{ marginTop: 16 }}>
            <button className="ml-btn ml-btn--ghost" onClick={onClose}>Cancel</button>
            <button className="ml-btn ml-btn--primary" onClick={handleImport}
              disabled={!selected || saving}>
              {saving ? "Importing…" : "Import Location"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DELETE CONFIRM MODAL ──────────────────────────────────────────────── */
function DeleteModal({ name, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="ml-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ml-modal" style={{ maxWidth: 400 }}>
        <div className="ml-modal-head" style={{ justifyContent: "flex-end" }}>
          <button className="ml-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ml-delete-body">
          <div className="ml-delete-icon">🗑️</div>
          <p className="ml-delete-title">Deactivate Location?</p>
          <p className="ml-delete-sub">
            <strong style={{ color: "var(--text-1)" }}>{name}</strong> will be marked inactive.
            Existing queues will not be affected.
          </p>
          <div className="ml-delete-actions">
            <button className="ml-btn ml-btn--ghost" onClick={onClose}>Cancel</button>
            <button className="ml-btn ml-btn--danger" disabled={busy}
              onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }}>
              {busy ? "Deactivating…" : "Deactivate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ICONS ─────────────────────────────────────────────────────────────── */
function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function OsmIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
function LoadingIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}