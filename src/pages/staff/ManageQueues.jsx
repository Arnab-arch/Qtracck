import { useState, useEffect, useCallback, useRef } from "react";
import { data, useNavigate } from "react-router-dom";
import { locationsAPI, servicesAPI, queuesAPI, tokensAPI } from "../../services/api";
import { socket } from "../../socket";


const STATUS_META = {
  active: { label: "Active", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  paused: { label: "Paused", cls: "bg-amber-100  text-amber-700  border-amber-200" },
  closed: { label: "Closed", cls: "bg-slate-100  text-slate-500  border-slate-200" },
};

function Badge({ status }) {
  const m = STATUS_META[status] || STATUS_META.closed;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${m.cls}`}>
      {m.label}
    </span>
  );
}


function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white
            ${t.type === "error" ? "bg-red-500" : "bg-slate-800"}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}


function SearchSelect({ label, placeholder, value, onChange, options, getKey, getLabel, getSub, disabled, emptyHint }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = options.find(o => String(getKey(o)) === String(value));
  const filtered = options.filter(o =>
    !query || getLabel(o).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative flex-1" ref={ref}>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between gap-2 border rounded-xl px-4 py-2.5 text-sm
          text-left transition-colors
          ${disabled ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-white border-slate-200 hover:border-[#727EFD] focus:ring-2 focus:ring-[#727EFD]/30"}`}
      >
        <span className={`truncate ${selected ? "text-slate-700 font-medium" : "text-slate-400"}`}>
          {selected ? getLabel(selected) : placeholder}
        </span>
        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl
          max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-[#727EFD]/30 focus:border-[#727EFD]"
            />
          </div>
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                {emptyHint || "No results found"}
              </div>
            ) : (
              filtered.map(o => (
                <button
                  key={getKey(o)}
                  type="button"
                  onClick={() => { onChange(getKey(o)); setOpen(false); setQuery(""); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors
                    ${String(getKey(o)) === String(value) ? "bg-indigo-50 text-[#727EFD] font-semibold" : "text-slate-700"}`}
                >
                  <div className="truncate">{getLabel(o)}</div>
                  {getSub && <div className="text-xs text-slate-400 truncate">{getSub(o)}</div>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function QueueFormModal({ mode, queue, service, location, onClose, onSaved, addToast }) {
  const [status, setStatus] = useState(queue?.status || "active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isCreate = mode === "create";
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit() {
    setSaving(true); setError("");
    try {
      if (isCreate) {
        await queuesAPI.create({ service_id: service.service_id });
        addToast("Queue created successfully");
      } else {
        await queuesAPI.updateStatus(queue.queue_id, { status });
        addToast("Queue updated successfully");
      }
      onSaved(); onClose();
    } catch (e) {
      const msg = e.response?.data?.message || (isCreate ? "Failed to create queue" : "Failed to update queue");
      setError(msg); addToast(msg, "error");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">
            {isCreate ? "Create New Queue" : `Edit Queue #${queue.queue_id}`}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Service</label>
            <div className="w-full border border-slate-100 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">{service?.service_name}</span>
              {location && <span className="text-slate-400"> · {location.name}</span>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Queue Date</label>
            <div className="w-full border border-slate-100 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-600">
              {isCreate
                ? new Date(today).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : new Date(queue.queue_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
            {isCreate && <p className="text-xs text-slate-400 mt-1.5">Queues are created for today's date. One queue per service per day.</p>}
          </div>
          {!isCreate && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {["active", "paused", "closed"].map(s => (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors capitalize
                      ${status === s ? "bg-[#727EFD] text-white border-[#727EFD]" : "bg-white text-slate-500 border-slate-200 hover:border-[#727EFD]"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#727EFD] text-white text-sm font-semibold hover:bg-[#5a67e8] transition-colors disabled:opacity-50">
            {saving ? "Saving…" : isCreate ? "Create Queue" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}


function DeleteConfirm({ queue, service, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 py-6 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">Delete Queue?</h3>
          <p className="text-sm text-slate-500 mb-1">
            <strong>{service?.service_name || "This queue"}</strong> (#{queue.queue_id}) will be permanently deleted.
          </p>
          <p className="text-xs text-slate-400">All associated token data will be lost.</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(queue.queue_id)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}


const TOKEN_STATUS = {
  waiting:   { cls: "bg-blue-100 text-blue-700 border-blue-200",   label: "Waiting" },
  serving:   { cls: "bg-violet-100 text-violet-700 border-violet-200", label: "Serving" },
  completed: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Done" },
  cancelled: { cls: "bg-slate-100 text-slate-500 border-slate-200", label: "Cancelled" },
};

function TokenPill({ status }) {
  const m = TOKEN_STATUS[status] || TOKEN_STATUS.waiting;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${m.cls}`}>
      {m.label}
    </span>
  );
}


function QueueDetailsPanel({ queue, service, onClose, onQueueUpdated, addToast }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // token_id being acted upon
  const [callingNext, setCallingNext] = useState(false);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    try {

      const res = await queuesAPI.getById(queue.queue_id);
      const data = res.data.data;
 
      setTokens(data.tokens || []);
      onQueueUpdated(data); 
    } catch {
      addToast("Failed to load token details", "error");
    } finally {
      setLoading(false);
    }
  }, [queue.queue_id]);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  async function handleCallNext() {
    setCallingNext(true);
    try {
      const res = await queuesAPI.callNext(queue.queue_id);
      addToast(`Token #${res.data.data?.token_number} is now being served`);
      fetchTokens();
    } catch (e) {
      addToast(e.response?.data?.message || "No waiting tokens", "error");
    } finally {
      setCallingNext(false);
    }
  }

  async function handleTokenAction(tokenId, newStatus, label) {
    setActing(tokenId);
    try {
      await tokensAPI.updateStatus(tokenId, { status: newStatus });
      addToast(`Token ${label}`);
      fetchTokens();
    } catch (e) {
      addToast(e.response?.data?.message || `Failed to ${label.toLowerCase()}`, "error");
    } finally {
      setActing(null);
    }
  }

  const waitingTokens   = tokens.filter(t => t.status === "waiting");
  const servingTokens   = tokens.filter(t => t.status === "serving");
  const completedTokens = tokens.filter(t => t.status === "completed");
  const cancelledTokens = tokens.filter(t => t.status === "cancelled");

  const currentToken = servingTokens[0] || null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 to-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#727EFD]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#727EFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Queue Details</h3>
            <p className="text-xs text-slate-400">
              {service?.service_name} · #{queue.queue_id} ·{" "}
              {new Date(queue.queue_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#727EFD] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 space-y-6">

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total",     value: tokens.length,           color: "text-slate-700", bg: "bg-slate-50" },
              { label: "Waiting",   value: waitingTokens.length,    color: "text-blue-600",  bg: "bg-blue-50" },
              { label: "Serving",   value: servingTokens.length,    color: "text-violet-600",bg: "bg-violet-50" },
              { label: "Done",      value: completedTokens.length,  color: "text-emerald-600",bg: "bg-emerald-50" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 text-center`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          
          <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#727EFD]/5 to-indigo-50/30
            rounded-xl px-5 py-4 border border-indigo-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Now Serving</p>
              {currentToken ? (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-[#727EFD]">#{currentToken.token_number}</span>
                  {currentToken.customer_name && (
                    <span className="text-sm text-slate-500">— {currentToken.customer_name}</span>
                  )}
                </div>
              ) : (
                <span className="text-xl font-semibold text-slate-400">—</span>
              )}
            </div>
            {queue.status === "active" && (
              <button
                onClick={handleCallNext}
                disabled={callingNext || waitingTokens.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#727EFD] text-white rounded-xl
                  font-semibold text-sm shadow-md shadow-indigo-200 hover:bg-[#5a67e8] transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {callingNext ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" />
                  </svg>
                )}
                Call Next
              </button>
            )}
          </div>

          
          {currentToken && queue.status === "active" && (
            <div className="flex gap-3">
              <button
                onClick={() => handleTokenAction(currentToken.token_id, "completed", "completed")}
                disabled={acting === currentToken.token_id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                  bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors
                  disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Complete Token
              </button>
              <button
                onClick={() => handleTokenAction(currentToken.token_id, "cancelled", "cancelled")}
                disabled={acting === currentToken.token_id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                  bg-white border border-slate-200 text-slate-600 text-sm font-semibold
                  hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors
                  disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
                Cancel Token
              </button>
            </div>
          )}

          {/* Waiting tokens list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Waiting Tokens
                <span className="ml-2 text-[#727EFD]">{waitingTokens.length}</span>
              </h4>
            </div>
            {waitingTokens.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl">
                No tokens in the waiting queue
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {waitingTokens.map((t, idx) => (
                  <div key={t.token_id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100
                      bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                    <span className="w-6 text-xs text-slate-400 font-medium">{idx + 1}.</span>
                    <span className="font-bold text-slate-700 text-sm min-w-[3rem]">#{t.token_number}</span>
                    {t.customer_name && (
                      <span className="text-sm text-slate-500 truncate flex-1">{t.customer_name}</span>
                    )}
                    <TokenPill status={t.status} />
                    {queue.status === "active" && (
                      <button
                        onClick={() => handleTokenAction(t.token_id, "cancelled", "cancelled")}
                        disabled={acting === t.token_id}
                        title="Cancel this token"
                        className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed tokens */}
          {completedTokens.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Completed
                <span className="ml-2 text-emerald-600">{completedTokens.length}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {completedTokens.map(t => (
                  <span key={t.token_id}
                    className="inline-flex items-center px-3 py-1.5 bg-emerald-50 border border-emerald-100
                      rounded-lg text-sm font-semibold text-emerald-700">
                    #{t.token_number}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled tokens */}
          {cancelledTokens.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Cancelled
                <span className="ml-2 text-slate-400">{cancelledTokens.length}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {cancelledTokens.map(t => (
                  <span key={t.token_id}
                    className="inline-flex items-center px-3 py-1.5 bg-slate-50 border border-slate-100
                      rounded-lg text-sm font-semibold text-slate-400 line-through">
                    #{t.token_number}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default function ManageQueues() {
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [queues, setQueues] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingQueues, setLoadingQueues] = useState(false);

  const [toasts, setToasts] = useState([]);

  const [activeQueueId, setActiveQueueId] = useState(null);

  const [formModal, setFormModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const addToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await locationsAPI.getAll();
        setLocations((res.data.data || []).filter(l => l.is_active));
      } catch { addToast("Failed to load locations", "error"); }
      finally { setLoadingLocations(false); }
    }
    load();
  }, []);

  
  useEffect(() => {
    if (!selectedLocation) { setServices([]); setSelectedService(""); return; }
    setLoadingServices(true);
    setSelectedService(""); setQueues([]); setActiveQueueId(null);

    async function load() {
      try {
        const res = await servicesAPI.getAll();
        const all = res.data.data || [];
        setServices(all.filter(s => String(s.location_id) === String(selectedLocation) && s.is_active));
      } catch { addToast("Failed to load services", "error"); }
      finally { setLoadingServices(false); }
    }
    load();
  }, [selectedLocation]);


  async function fetchQueues() {
    if (!selectedService) { setQueues([]); return; }
    setLoadingQueues(true);
    try {
      const res = await queuesAPI.getAll();
      const all = res.data.data || [];
      const filtered = all.filter(q => String(q.service_id) === String(selectedService));

      const detailed = await Promise.all(
        filtered.map(q => queuesAPI.getById(q.queue_id).then(r => r.data.data).catch(() => q))
      );
      detailed.sort((a, b) => new Date(b.queue_date) - new Date(a.queue_date));
      setQueues(detailed);
    } catch { addToast("Failed to load queues", "error"); }
    finally { setLoadingQueues(false); }
  }

  useEffect(() => {
    fetchQueues();
    setActiveQueueId(null);
    
  }, [selectedService]);

  useEffect(()=>{
    if (!activeQueueId) return ;
    const JoinQueue = ()=>{
      socket.emit("joinQueue" , activeQueueId);

    }
    JoinQueue();

    socket.on("connect" , JoinQueue)
    

    const handleUpdate = async () => {
    const res = await queuesAPI.getById(activeQueueId);

    setQueues(prev =>
        prev.map(q =>
            q.queue_id === activeQueueId
                ? res.data.data
                : q
        )
    );
};



    socket.on("queue_updated" , handleUpdate); 

    return ()=>{
      socket.off("connect" , JoinQueue)
      socket.off("queue_updated" , handleUpdate);
    }
  },[activeQueueId])






 
  function handleQueueUpdated(updatedQueue) {
    setQueues(prev => prev.map(q =>
      String(q.queue_id) === String(updatedQueue.queue_id) ? { ...q, ...updatedQueue } : q
    ));
  }

  
  async function handleDelete(queueId) {
    try {
      await queuesAPI.delete(queueId);
      addToast("Queue deleted");
      setDeleteTarget(null);
      if (String(activeQueueId) === String(queueId)) setActiveQueueId(null);
      fetchQueues();
    } catch (e) { addToast(e.response?.data?.message || "Failed to delete queue", "error"); }
  }

  const currentLocation = locations.find(l => String(l.location_id) === String(selectedLocation));
  const currentService  = services.find(s => String(s.service_id) === String(selectedService));
  const today = new Date().toISOString().split("T")[0];
  const hasTodayQueue = queues.some(q => q.queue_date?.startsWith(today));
  const activeQueue = queues.find(q => String(q.queue_id) === String(activeQueueId));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

     
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
          bg-gradient-to-br from-[#727EFD] to-[#9b87f5] shadow-md shadow-indigo-200">
          🗂
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Queues</h1>
          <p className="text-sm text-slate-500">Select a location and service to view and manage its queues</p>
        </div>
      </div>

     
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchSelect
            label="Location" placeholder={loadingLocations ? "Loading locations…" : "Select a location"}
            value={selectedLocation} onChange={setSelectedLocation}
            options={locations} getKey={l => l.location_id} getLabel={l => l.name}
            getSub={l => `${l.city}, ${l.state}`} disabled={loadingLocations} emptyHint="No locations found"
          />
          <SearchSelect
            label="Service"
            placeholder={
              !selectedLocation ? "Select a location first"
              : loadingServices  ? "Loading services…"
              : services.length === 0 ? "No services available"
              : "Select a service"
            }
            value={selectedService} onChange={setSelectedService}
            options={services} getKey={s => s.service_id} getLabel={s => s.service_name}
            getSub={s => s.avg_service_time ? `~${s.avg_service_time} min avg` : ""}
            disabled={!selectedLocation || loadingServices}
            emptyHint="No active services for this location"
          />
        </div>

        {selectedLocation && !loadingServices && services.length === 0 && (
          <div className="mt-4 flex items-center justify-between gap-4 bg-amber-50 border border-amber-200
            rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-amber-700">No services found</p>
                <p className="text-xs text-amber-600">
                  Create a service for <strong>{currentLocation?.name}</strong> before creating a queue.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/manage-services", { state: { location: currentLocation } })}
              className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold
                hover:bg-amber-600 transition-colors whitespace-nowrap">
              Manage Services →
            </button>
          </div>
        )}
      </div>

     
      {selectedService && (
        <div className={`grid gap-6 ${activeQueueId ? "lg:grid-cols-[1fr_420px]" : "grid-cols-1"}`}>

          <div className="space-y-4 min-w-0">
          
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-bold text-slate-800">
                  Queues for <span className="text-[#727EFD]">{currentService?.service_name}</span>
                </h2>
                <p className="text-xs text-slate-400">{currentLocation?.name} · {currentLocation?.city}</p>
              </div>
              <button
                onClick={() => setFormModal({ mode: "create" })}
                disabled={hasTodayQueue}
                title={hasTodayQueue ? "A queue already exists for today" : "Create a new queue"}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#727EFD] text-white rounded-xl
                  font-semibold text-sm shadow-md shadow-indigo-200 hover:bg-[#5a67e8] transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Queue
              </button>
            </div>

            {hasTodayQueue && (
              <p className="text-xs text-slate-400 -mt-2">
                A queue for today already exists — only one queue per service per day is allowed.
              </p>
            )}

            
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {loadingQueues ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-[#727EFD] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : queues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <div className="text-5xl mb-3">🗂</div>
                  <p className="font-semibold text-slate-500">No queues yet for this service</p>
                  <p className="text-sm mt-1">Click "New Queue" to create one for today</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Total</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Waiting</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Serving</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queues.map(q => {
                        const isActive = String(q.queue_id) === String(activeQueueId);
                        return (
                          <tr key={q.queue_id}
                            className={`border-b border-slate-50 transition-colors
                              ${isActive ? "bg-indigo-50/60 border-l-2 border-l-[#727EFD]" : "hover:bg-slate-50/60"}`}>
                            <td className="px-5 py-4">
                              <span className="text-sm font-semibold text-slate-700">
                                {new Date(q.queue_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </span>
                              <div className="text-xs text-slate-400">#{q.queue_id}</div>
                            </td>
                            <td className="px-4 py-4"><Badge status={q.status} /></td>
                            <td className="px-4 py-4 text-center text-sm font-bold text-slate-700">{q.total_tokens ?? "—"}</td>
                            <td className="px-4 py-4 text-center text-sm font-semibold text-blue-600">{q.waiting_tokens ?? "—"}</td>
                            <td className="px-4 py-4 text-center text-sm font-semibold text-violet-600">{q.serving_tokens ?? "—"}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1.5 flex-wrap">

                                <button
                                  onClick={() => setActiveQueueId(isActive ? null : q.queue_id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                    border transition-colors
                                    ${isActive
                                      ? "bg-[#727EFD] text-white border-[#727EFD]"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-[#727EFD] hover:text-[#727EFD]"}`}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
                                  </svg>
                                  {isActive ? "Close" : "Manage"}
                                </button>

                                <button
                                  onClick={() => setFormModal({ mode: "edit", queue: q })}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#727EFD] hover:bg-indigo-50 transition-colors"
                                  title="Edit queue"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                  </svg>
                                </button>

                       
                                <button
                                  onClick={() => setDeleteTarget(q)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  title="Delete queue"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          
          {activeQueue && (
            <div className="lg:sticky lg:top-6 h-fit">
              <QueueDetailsPanel
                key={activeQueue.queue_id}
                queue={activeQueue}
                service={currentService}
                onClose={() => setActiveQueueId(null)}
                onQueueUpdated={handleQueueUpdated}
                addToast={addToast}
              />
            </div>
          )}
        </div>
      )}

      
      {!selectedLocation && !loadingLocations && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col
          items-center justify-center py-20 text-slate-400">
          <div className="text-5xl mb-3">📍</div>
          <p className="font-semibold text-slate-500">Select a location to get started</p>
          <p className="text-sm mt-1">Then choose a service to view its queues</p>
        </div>
      )}

      {/* Modals */}
      {formModal && (
        <QueueFormModal
          mode={formModal.mode} queue={formModal.queue}
          service={currentService} location={currentLocation}
          onClose={() => setFormModal(null)} onSaved={fetchQueues} addToast={addToast}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          queue={deleteTarget} service={currentService}
          onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}