import { useState, useEffect, useCallback } from "react";
import { servicesAPI, locationsAPI } from "../../services/api";


export default function ManageServices() {
  const [services,   setServices]   = useState([]);
  const [locations,  setLocations]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [locFilter,  setLocFilter]  = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal,      setModal]      = useState(null); // null | "create" | "edit" | "delete"
  const [selected,   setSelected]   = useState(null);
  const [toast,      setToast]      = useState(null);


  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([
        servicesAPI.getAll(),
        locationsAPI.getAll(),
      ]);
      setServices(Array.isArray(sRes.data) ? sRes.data : sRes.data?.services || []);
      setLocations(Array.isArray(lRes.data) ? lRes.data : lRes.data?.locations || []);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── TOAST ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── FILTERED ── */
  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    const matchText = !q || [s.service_name, s.description, s.location_name]
      .some(v => v?.toLowerCase().includes(q));
    const matchLoc = locFilter === "all" || String(s.location_id) === String(locFilter);
    const matchStatus = statusFilter === "all"
      ? true
      : statusFilter === "active" ? s.is_active : !s.is_active;
    return matchText && matchLoc && matchStatus;
  });


  const openCreate = () => { setSelected(null); setModal("create"); };
  const openEdit   = (svc) => { setSelected(svc); setModal("edit"); };
  const openDelete = (svc) => { setSelected(svc); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (data) => {
    try {
      if (modal === "edit" && selected) {
        await servicesAPI.update(selected.service_id, data);
        showToast("Service updated successfully");
      } else {
        await servicesAPI.create(data);
        showToast("Service created successfully");
      }
      fetchAll();
      closeModal();
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await servicesAPI.delete(selected.service_id);
      showToast("Service deactivated");
      fetchAll();
      closeModal();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  /* ── STATS ── */
  const activeCount  = services.filter(s => s.is_active).length;
  const locCount     = new Set(services.map(s => s.location_id)).size;
  const avgTime      = services.length
    ? Math.round(services.reduce((a, s) => a + (s.avg_service_time || 0), 0) / services.length)
    : 0;

  return (
    <div className="ms-root">

      {/* ── HEADER ── */}
      <div className="ms-header">
        <div className="ms-header-left">
          <div className="ms-header-icon">⚙️</div>
          <div>
            <h1 className="ms-title">Manage Services</h1>
            <p className="ms-subtitle">Configure services and average wait times per location</p>
          </div>
        </div>
        <button className="ms-btn ms-btn--primary" onClick={openCreate}>
          <PlusIcon /> Add Service
        </button>
      </div>

      {/* ── STAT ROW ── */}
      <div className="ms-stats-row">
        <StatCard icon="⚙️" value={services.length} label="Total Services"  color="#ede9fe" accent="#7c3aed" />
        <StatCard icon="✅" value={activeCount}      label="Active"          color="#dcfce7" accent="#15803d" />
        <StatCard icon="📍" value={locCount}         label="Locations"       color="#dbeafe" accent="#1d4ed8" />
        <StatCard icon="⏱️" value={`${avgTime}m`}   label="Avg Wait Time"   color="#fef9c3" accent="#b45309" />
      </div>

      {/* ── TOOLBAR ── */}
      <div className="ms-toolbar">
        <div className="ms-search-box">
          <SearchIcon />
          <input type="text" placeholder="Search by name, description…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="ms-search-input" />
          {search && (
            <button className="ms-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        <select className="ms-select" value={locFilter}
          onChange={e => setLocFilter(e.target.value)}>
          <option value="all">All Locations</option>
          {locations.map(l => (
            <option key={l.location_id} value={l.location_id}>{l.name}</option>
          ))}
        </select>

        <div className="ms-filter-tabs">
          {["all","active","inactive"].map(f => (
            <button key={f}
              className={`ms-filter-tab ${statusFilter === f ? "ms-filter-tab--on" : ""}`}
              onClick={() => setStatusFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="ms-loader">
          <div className="ms-spinner" />
          <span>Loading services…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ms-empty">
          <span className="ms-empty-icon">🔧</span>
          <p className="ms-empty-title">{search ? "No matching services" : "No services yet"}</p>
          <p className="ms-empty-sub">
            {search
              ? "Clear the search or change filters."
              : "Click Add Service to create the first service for a location."}
          </p>
          {!search && (
            <button className="ms-btn ms-btn--primary" onClick={openCreate} style={{ marginTop: 8 }}>
              <PlusIcon /> Add Service
            </button>
          )}
        </div>
      ) : (
        <div className="ms-cards">
          {filtered.map(svc => (
            <ServiceCard
              key={svc.service_id}
              svc={svc}
              locations={locations}
              onEdit={() => openEdit(svc)}
              onDelete={() => openDelete(svc)}
            />
          ))}
        </div>
      )}

      {/* ── MODALS ── */}
      {(modal === "create" || modal === "edit") && (
        <ServiceFormModal
          initial={selected}
          locations={locations}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
      {modal === "delete" && (
        <DeleteModal
          name={selected?.service_name}
          onConfirm={handleDelete}
          onClose={closeModal}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`ms-toast ms-toast--${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <style>{`
        .ms-root { display: flex; flex-direction: column; gap: 20px; }

        /* HEADER */
        .ms-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .ms-header-left { display: flex; align-items: center; gap: 14px; }
        .ms-header-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg,#7c3aed22,#7c3aed44);
          border: 1.5px solid #7c3aed55;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; flex-shrink: 0;
        }
        .ms-title { font-size: 1.4rem; font-weight: 800; color: var(--text-1); margin: 0 0 3px; }
        .ms-subtitle { font-size: 0.82rem; color: var(--text-3); margin: 0; }

        /* BUTTONS */
        .ms-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 10px;
          font-size: 0.85rem; font-weight: 700; cursor: pointer;
          border: none; transition: all 0.15s; white-space: nowrap;
          font-family: inherit;
        }
        .ms-btn svg { width: 15px; height: 15px; flex-shrink: 0; }
        .ms-btn--primary { background: var(--brand); color: #fff; }
        .ms-btn--primary:hover { background: var(--brand-dark); transform: translateY(-1px); }
        .ms-btn--ghost {
          background: var(--surface); color: var(--text-2);
          border: 1.5px solid var(--border);
        }
        .ms-btn--ghost:hover { border-color: var(--brand); color: var(--brand); }
        .ms-btn--danger { background: #fee2e2; color: #b91c1c; border: 1.5px solid #fecaca; }
        .ms-btn--danger:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
        .ms-btn--sm { padding: 6px 11px; font-size: 0.78rem; }
        .ms-btn--icon {
          padding: 7px; background: none; border: 1.5px solid var(--border);
          color: var(--text-3); border-radius: 8px; cursor: pointer;
          transition: all 0.15s; display: inline-flex; align-items: center;
        }
        .ms-btn--icon:hover { border-color: var(--brand); color: var(--brand); background: #f0f2ff; }
        .ms-btn--icon-danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

        /* STATS ROW */
        .ms-stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }

        /* TOOLBAR */
        .ms-toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .ms-search-box {
          display: flex; align-items: center; gap: 8px;
          background: var(--surface); border: 1.5px solid var(--border);
          border-radius: 10px; padding: 8px 12px; flex: 1; min-width: 200px;
          transition: border-color 0.15s;
        }
        .ms-search-box:focus-within { border-color: var(--brand); }
        .ms-search-box svg { color: var(--text-3); flex-shrink: 0; width: 16px; height: 16px; }
        .ms-search-input {
          border: none; outline: none; background: none;
          font-size: 0.875rem; color: var(--text-1); width: 100%;
        }
        .ms-search-input::placeholder { color: var(--text-3); }
        .ms-search-clear {
          background: none; border: none; cursor: pointer;
          color: var(--text-3); font-size: 0.75rem; padding: 0;
        }
        .ms-search-clear:hover { color: var(--text-1); }
        .ms-select {
          padding: 8px 12px; border: 1.5px solid var(--border);
          border-radius: 10px; font-size: 0.875rem; color: var(--text-2);
          background: var(--surface); outline: none; cursor: pointer;
          transition: border-color 0.15s; min-width: 170px;
          font-family: inherit;
        }
        .ms-select:focus { border-color: var(--brand); }
        .ms-filter-tabs { display: flex; gap: 4px; }
        .ms-filter-tab {
          padding: 7px 14px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer;
          background: var(--surface); color: var(--text-3);
          border: 1.5px solid var(--border); transition: all 0.15s;
          font-family: inherit;
        }
        .ms-filter-tab--on { background: var(--brand); color: #fff; border-color: var(--brand); }
        .ms-filter-tab:hover:not(.ms-filter-tab--on) { border-color: var(--brand); color: var(--brand); }

        /* CARDS GRID */
        .ms-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 14px;
        }

        /* LOADER / EMPTY */
        .ms-loader {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; padding: 60px; color: var(--text-3); font-size: 0.875rem;
        }
        .ms-spinner {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2.5px solid var(--border); border-top-color: var(--brand);
          animation: ms-spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes ms-spin { to { transform: rotate(360deg); } }
        .ms-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 70px 24px; text-align: center;
          background: var(--surface); border-radius: 14px;
          border: 1.5px dashed var(--border);
        }
        .ms-empty-icon { font-size: 2.5rem; }
        .ms-empty-title { font-size: 1rem; font-weight: 700; color: var(--text-2); margin: 0; }
        .ms-empty-sub { font-size: 0.82rem; color: var(--text-3); margin: 0; }

        /* TOAST */
        .ms-toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 9999;
          padding: 12px 20px; border-radius: 10px;
          font-size: 0.875rem; font-weight: 600;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          animation: ms-toast-in 0.25s ease;
        }
        .ms-toast--success { background: #052e16; color: #bbf7d0; }
        .ms-toast--error   { background: #450a0a; color: #fecaca; }
        @keyframes ms-toast-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }

        /* MODAL */
        .ms-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15,23,42,0.55); backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: ms-fade-in 0.18s ease;
        }
        @keyframes ms-fade-in { from { opacity:0; } to { opacity:1; } }
        .ms-modal {
          background: var(--surface); border-radius: 18px;
          width: 100%; max-width: 520px; max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 32px 80px rgba(0,0,0,0.22);
          animation: ms-modal-in 0.22s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes ms-modal-in { from { opacity:0; transform: scale(0.95) translateY(16px); } to { opacity:1; transform:none; } }
        .ms-modal-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 24px 0;
        }
        .ms-modal-title { font-size: 1.1rem; font-weight: 800; color: var(--text-1); margin: 0; }
        .ms-modal-close {
          background: none; border: none; cursor: pointer; color: var(--text-3);
          padding: 4px; border-radius: 6px; font-size: 1.1rem; line-height: 1;
          transition: color 0.15s, background 0.15s;
        }
        .ms-modal-close:hover { background: var(--bg); color: var(--text-1); }
        .ms-modal-body { padding: 20px 24px 24px; }

        /* FORM */
        .ms-form { display: flex; flex-direction: column; gap: 14px; }
        .ms-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ms-field { display: flex; flex-direction: column; gap: 5px; }
        .ms-label {
          font-size: 0.72rem; font-weight: 700; color: var(--text-2);
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .ms-input, .ms-textarea, .ms-select-field {
          padding: 9px 12px; border: 1.5px solid var(--border);
          border-radius: 9px; font-size: 0.875rem; color: var(--text-1);
          background: var(--bg); outline: none; font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ms-input:focus, .ms-textarea:focus, .ms-select-field:focus {
          border-color: var(--brand); background: #fff;
          box-shadow: 0 0 0 3px rgba(114,126,253,0.1);
        }
        .ms-textarea { resize: vertical; min-height: 80px; }
        .ms-input-with-unit { display: flex; align-items: center; }
        .ms-input-with-unit .ms-input {
          border-radius: 9px 0 0 9px; flex: 1;
        }
        .ms-input-unit {
          padding: 9px 12px; background: var(--bg); color: var(--text-3);
          border: 1.5px solid var(--border); border-left: none;
          border-radius: 0 9px 9px 0; font-size: 0.78rem; font-weight: 600;
          white-space: nowrap;
        }
        .ms-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; background: var(--bg); border-radius: 9px;
          border: 1.5px solid var(--border);
        }
        .ms-toggle-label { font-size: 0.875rem; font-weight: 600; color: var(--text-2); }
        .ms-toggle { position: relative; width: 40px; height: 22px; cursor: pointer; flex-shrink: 0; }
        .ms-toggle input { opacity: 0; width: 0; height: 0; }
        .ms-toggle-track { position: absolute; inset: 0; border-radius: 99px; background: #cbd5e1; transition: background 0.2s; }
        .ms-toggle input:checked + .ms-toggle-track { background: var(--brand); }
        .ms-toggle-thumb {
          position: absolute; top: 3px; left: 3px; width: 16px; height: 16px;
          border-radius: 50%; background: #fff; transition: transform 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .ms-toggle input:checked ~ .ms-toggle-thumb { transform: translateX(18px); }
        .ms-form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }

        /* DELETE MODAL */
        .ms-delete-body {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; text-align: center; padding: 24px;
        }
        .ms-delete-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: #fee2e2; display: flex; align-items: center;
          justify-content: center; font-size: 1.5rem;
        }
        .ms-delete-title { font-size: 1rem; font-weight: 800; color: var(--text-1); margin: 0; }
        .ms-delete-sub { font-size: 0.85rem; color: var(--text-3); margin: 0; }
        .ms-delete-actions { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
        .ms-delete-actions button { flex: 1; }

        @media (max-width: 900px) {
          .ms-stats-row { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .ms-header { flex-direction: column; align-items: flex-start; }
          .ms-toolbar { flex-direction: column; }
          .ms-search-box { min-width: 0; }
          .ms-stats-row { grid-template-columns: 1fr 1fr; }
          .ms-form-row { grid-template-columns: 1fr; }
          .ms-cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

/* ─── STAT CARD ─────────────────────────────────────────────────────────── */
function StatCard({ icon, value, label, color, accent }) {
  return (
    <div style={{
      background: color, borderRadius: 12, padding: "16px 18px",
      border: `1.5px solid ${accent}33`, display: "flex",
      alignItems: "center", gap: 12,
    }}>
      <span style={{ fontSize: "1.4rem" }}>{icon}</span>
      <div>
        <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-1)", margin: 0, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: "0.72rem", fontWeight: 600, color: accent, margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      </div>
    </div>
  );
}

/* ─── SERVICE CARD ──────────────────────────────────────────────────────── */
function ServiceCard({ svc, locations, onEdit, onDelete }) {
  const loc = locations.find(l => String(l.location_id) === String(svc.location_id));

  return (
    <div className="svc-card">
      <div className="svc-card-header">
        <div className="svc-card-icon">⚙️</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="svc-card-name">{svc.service_name}</p>
          {loc && (
            <p className="svc-card-loc">
              <PinIcon /> {loc.name}
            </p>
          )}
        </div>
        <span className={`svc-card-badge ${svc.is_active ? "svc-card-badge--on" : "svc-card-badge--off"}`}>
          {svc.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {svc.description && (
        <p className="svc-card-desc">{svc.description}</p>
      )}

      <div className="svc-card-meta">
        <div className="svc-meta-item">
          <ClockIcon />
          <span>{svc.avg_service_time ? `~${svc.avg_service_time} min avg` : "No avg time set"}</span>
        </div>
        {loc?.city && (
          <div className="svc-meta-item">
            <MapIcon />
            <span>{loc.city}{loc.state ? `, ${loc.state}` : ""}</span>
          </div>
        )}
      </div>

      <div className="svc-card-actions">
        <button className="ms-btn ms-btn--ghost ms-btn--sm" onClick={onEdit}>
          <EditIcon /> Edit
        </button>
        <button className="ms-btn ms-btn--sm"
          style={{ background: "#fee2e2", color: "#b91c1c", border: "1.5px solid #fecaca" }}
          onClick={onDelete}>
          <TrashIcon /> Deactivate
        </button>
      </div>

      <style>{`
        .svc-card {
          background: var(--surface); border: 1.5px solid var(--border);
          border-radius: 14px; padding: 18px 18px 14px;
          display: flex; flex-direction: column; gap: 10px;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .svc-card:hover { box-shadow: 0 6px 20px rgba(114,126,253,0.1); border-color: #c7d0fd; }
        .svc-card-header { display: flex; align-items: flex-start; gap: 10px; }
        .svc-card-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: #ede9fe; display: flex; align-items: center;
          justify-content: center; font-size: 1.1rem; flex-shrink: 0;
        }
        .svc-card-name { font-size: 0.95rem; font-weight: 700; color: var(--text-1); margin: 0 0 3px; }
        .svc-card-loc {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.75rem; color: var(--text-3); margin: 0;
        }
        .svc-card-loc svg { width: 11px; height: 11px; flex-shrink: 0; }
        .svc-card-badge {
          flex-shrink: 0; font-size: 0.68rem; font-weight: 700;
          padding: 3px 9px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .svc-card-badge--on  { background: #dcfce7; color: #15803d; }
        .svc-card-badge--off { background: #f1f5f9; color: #64748b; }
        .svc-card-desc {
          font-size: 0.82rem; color: var(--text-3); margin: 0;
          line-height: 1.5;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .svc-card-meta { display: flex; flex-wrap: wrap; gap: 10px; }
        .svc-meta-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.78rem; color: var(--text-3);
        }
        .svc-meta-item svg { width: 12px; height: 12px; flex-shrink: 0; }
        .svc-card-actions {
          display: flex; gap: 8px;
          padding-top: 8px; border-top: 1px solid var(--border);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}

/* ─── SERVICE FORM MODAL ────────────────────────────────────────────────── */
function ServiceFormModal({ initial, locations, onSave, onClose }) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    service_name:     initial?.service_name     || "",
    description:      initial?.description      || "",
    location_id:      initial?.location_id      || (locations[0]?.location_id ?? ""),
    avg_service_time: initial?.avg_service_time || "",
    is_active:        initial?.is_active        ?? true,
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      location_id:      Number(form.location_id),
      avg_service_time: form.avg_service_time ? Number(form.avg_service_time) : null,
    };
    try { await onSave(payload); }
    finally { setSaving(false); }
  };

  return (
    <div className="ms-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ms-modal">
        <div className="ms-modal-head">
          <h2 className="ms-modal-title">{isEdit ? "Edit Service" : "Add New Service"}</h2>
          <button className="ms-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ms-modal-body">
          <form className="ms-form" onSubmit={handleSubmit}>
            <div className="ms-field">
              <label className="ms-label">Service Name *</label>
              <input className="ms-input" value={form.service_name} onChange={set("service_name")}
                placeholder="e.g. General Consultation" required />
            </div>

            <div className="ms-field">
              <label className="ms-label">Location *</label>
              <select className="ms-select-field" value={form.location_id}
                onChange={set("location_id")} required>
                <option value="">— Select a location —</option>
                {locations.map(l => (
                  <option key={l.location_id} value={l.location_id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="ms-field">
              <label className="ms-label">Description</label>
              <textarea className="ms-textarea" value={form.description}
                onChange={set("description")}
                placeholder="Brief description of this service…" />
            </div>

            <div className="ms-field">
              <label className="ms-label">Average Service Time</label>
              <div className="ms-input-with-unit">
                <input className="ms-input" type="number" min="1" max="999"
                  value={form.avg_service_time} onChange={set("avg_service_time")}
                  placeholder="e.g. 15" />
                <span className="ms-input-unit">minutes</span>
              </div>
            </div>

            <div className="ms-toggle-row">
              <span className="ms-toggle-label">Service is Active</span>
              <label className="ms-toggle">
                <input type="checkbox" checked={form.is_active}
                  onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <span className="ms-toggle-track" />
                <span className="ms-toggle-thumb" />
              </label>
            </div>

            <div className="ms-form-actions">
              <button type="button" className="ms-btn ms-btn--ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="ms-btn ms-btn--primary" disabled={saving}>
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── DELETE MODAL ──────────────────────────────────────────────────────── */
function DeleteModal({ name, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="ms-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ms-modal" style={{ maxWidth: 400 }}>
        <div className="ms-modal-head" style={{ justifyContent: "flex-end" }}>
          <button className="ms-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ms-delete-body">
          <div className="ms-delete-icon">🗑️</div>
          <p className="ms-delete-title">Deactivate Service?</p>
          <p className="ms-delete-sub">
            <strong style={{ color: "var(--text-1)" }}>{name}</strong> will be marked inactive.
            Open queues for this service will not be affected.
          </p>
          <div className="ms-delete-actions">
            <button className="ms-btn ms-btn--ghost" onClick={onClose}>Cancel</button>
            <button className="ms-btn ms-btn--danger" disabled={busy}
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
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function ClockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function PinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function MapIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
}