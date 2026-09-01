import { useState, useEffect, useCallback, useRef } from "react";
import { servicesAPI, locationsAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white bg-slate-800"
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function WaitBadge({ minutes }) {
  if (!minutes) return null;
  const color =
    minutes <= 10
      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
      : minutes <= 30
        ? "bg-amber-50 text-amber-600 border-amber-200"
        : "bg-red-50 text-red-500 border-red-200";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}
    >
      ⏱ ~{minutes} min
    </span>
  );
}

// function onJoinQueue([service ,location]){

// }
function ServiceDrawer({ service, location, onClose, onJoinQueue }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        {/* header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#727EFD] to-[#9b87f5]
              flex items-center justify-center text-white text-2xl shadow-md shadow-indigo-200 shrink-0"
            >
              🔧
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-lg text-slate-800 leading-tight">
                {service.service_name}
              </h2>
              {location && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {location.name} · {location.city}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* description */}
          {service.description && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                About this service
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          )}

          {/* details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 mb-1">Avg. Wait Time</p>
              <p className="text-xl font-bold text-[#727EFD]">
                {service.avg_service_time
                  ? `${service.avg_service_time} min`
                  : "—"}
              </p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 mb-1">Status</p>
              <p
                className={`text-sm font-bold ${service.is_active ? "text-emerald-600" : "text-slate-400"}`}
              >
                {service.is_active ? "✅ Available" : "❌ Unavailable"}
              </p>
            </div>
          </div>

          {/* location info */}
          {location && (
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Location
              </h3>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                  <svg
                    className="w-4 h-4 text-[#727EFD]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {location.name}
                  </p>
                  <p className="text-xs text-slate-400">{location.address}</p>
                  <p className="text-xs text-slate-400">
                    {location.city}, {location.state}
                  </p>
                </div>
              </div>
              {location.phone && (
                <a
                  href={`tel:${location.phone}`}
                  className="flex items-center gap-2 text-sm text-[#727EFD] hover:underline font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                    />
                  </svg>
                  {location.phone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-6 py-4 border-t border-slate-100">
          {service.is_active ? (
            <button
              onClick={() => onJoinQueue(service, location)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#727EFD] to-[#9b87f5]
                text-white font-bold text-sm shadow-md shadow-indigo-200
                hover:opacity-90 transition-opacity"
            >
              Join Queue for this Service →
            </button>
          ) : (
            <div
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-400
              font-semibold text-sm text-center cursor-not-allowed"
            >
              Service currently unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service, location, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-5
        flex flex-col gap-3 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-200 group"
    >
      {/* icon + name */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0
            group-hover:bg-[#727EFD] transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 text-[#727EFD] group-hover:text-white transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m5.585-6.272a3 3 0 0 0-4.243 4.243"
              />
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-[#727EFD] transition-colors line-clamp-2">
            {service.service_name}
          </h3>
        </div>
        <WaitBadge minutes={service.avg_service_time} />
      </div>

      {service.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {service.description}
        </p>
      )}

      {location && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <svg
            className="w-3 h-3 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <span className="truncate">
            {location.name} · {location.city}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
        <span
          className={`text-xs font-semibold ${service.is_active ? "text-emerald-500" : "text-slate-400"}`}
        >
          {service.is_active ? "● Available" : "● Unavailable"}
        </span>
        <span className="text-xs font-semibold text-[#727EFD] group-hover:translate-x-0.5 transition-transform">
          View →
        </span>
      </div>
    </button>
  );
}

export default function PatientServices() {
  const navigate = useNavigate();
  const { location_id } = useParams();
  const { state } = useLocation();
  const passedLocation = state?.location;

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [pagination, setPagination] = useState(null);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const [search, setSearch] = useState("");
  const [filterLoc, setFilterLoc] = useState("all");
  const [filterStatus, setFilterStatus] = useState("active");
  const [selected, setSelected] = useState(null);

  const debounceRef = useRef(null);

  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const params = {
          page,
          limit,
          status: filterStatus,
        };

        if (search) params.search = search;

        if (location_id) params.location_id = location_id;

        if (!location_id && filterLoc !== "all") params.location_id = filterLoc;

        const [sRes, lRes] = await Promise.all([
          servicesAPI.getAll(params),
          locationsAPI.getAll(),
        ]);

        setServices(sRes.data.data);
        setPagination(sRes.data.pagination);
        setLocations(lRes.data.data.filter((l) => l.is_active));
      } catch {
        addToast("Failed to load services");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page, search, filterLoc, filterStatus, location_id]);

  useEffect(() => {
    setPage(1);
  }, [search, filterLoc, filterStatus]);

  function handleSearchChange(val) {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 300);
  }
  function handleJoinQueue(service, location) {
    navigate(`/dashboard/queues/${service.service_id}`, {
      state: { service, location },
    });
  }

  function getLocation(service) {
    return locations.find((l) => l.location_id === service.location_id);
  }

  /* stats */
  const activeCount = services.filter((s) => s.is_active).length;
  const locCount = new Set(
    services.filter((s) => s.is_active).map((s) => s.location_id),
  ).size;
  const avgWait = (() => {
    const timed = services.filter((s) => s.avg_service_time);
    if (!timed.length) return null;
    return Math.round(
      timed.reduce((a, s) => a + s.avg_service_time, 0) / timed.length,
    );
  })();

  /* filter */
  const visible = services;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
          bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-200"
        >
          🔧
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Services</h1>
          <p className="text-sm text-slate-500">
            Find and join queues for available services
          </p>
        </div>
      </div>

      {(passedLocation || location_id) && (
        <div
          className="flex items-center gap-3 bg-indigo-50 border border-indigo-100
          rounded-2xl px-5 py-3"
        >
          <svg
            className="w-5 h-5 text-[#727EFD] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5
              11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700">
              {passedLocation?.name || `Location #${location_id}`}
            </p>
            {passedLocation && (
              <p className="text-xs text-slate-400">
                {passedLocation.city}, {passedLocation.state}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-[#727EFD] hover:underline shrink-0"
          >
            ← Back to Locations
          </button>
        </div>
      )}

      {!location_id && (
        <select
          value={filterLoc}
          onChange={(e) => setFilterLoc(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm ..."
        >
          <option value="all">All Locations</option>
          {locations.map((l) => (
            <option key={l.location_id} value={l.location_id}>
              {l.name} — {l.city}
            </option>
          ))}
        </select>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: "🔧",
            label: "Active Services",
            value: activeCount,
            color: "bg-indigo-50 text-indigo-600",
          },
          {
            icon: "🏥",
            label: "Locations",
            value: locCount,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            icon: "⏱",
            label: "Avg. Wait Time",
            value: avgWait ? `${avgWait} min` : "—",
            color: "bg-amber-50 text-amber-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.color}`}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-none">
                {s.value}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            placeholder="Search by service name, description, location…"
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#727EFD]/30 focus:border-[#727EFD]"
          />
        </div>

        {/* location filter */}
        <select
          value={filterLoc}
          onChange={(e) => setFilterLoc(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none
            focus:ring-2 focus:ring-[#727EFD]/30 focus:border-[#727EFD] text-slate-600"
        >
          <option value="all">All Locations</option>
          {locations.map((l) => (
            <option key={l.location_id} value={l.location_id}>
              {l.name} — {l.city}
            </option>
          ))}
        </select>

        {/* status tabs */}
        <div className="flex rounded-xl overflow-hidden border border-slate-200 text-sm font-medium shrink-0">
          {[
            { val: "active", label: "Available" },
            { val: "all", label: "All" },
            { val: "inactive", label: "Unavailable" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setFilterStatus(tab.val)}
              className={`px-3 py-2 transition-colors
                ${filterStatus === tab.val ? "bg-[#727EFD] text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="sm:ml-auto text-xs text-slate-400 self-center whitespace-nowrap">
          {visible.length} service{visible.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#727EFD] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div
          className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col
          items-center justify-center py-24 text-slate-400"
        >
          <div className="text-5xl mb-3">🔧</div>
          <p className="font-semibold text-slate-500">No services found</p>
          <p className="text-sm mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((svc) => (
            <ServiceCard
              key={svc.service_id}
              service={svc}
              location={getLocation(svc)}
              onClick={() => setSelected(svc)}
            />
          ))}
        </div>
      )}

       <div className="flex justify-center items-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm font-medium">
          Page {pagination?.page || 1} of {pagination?.totalPages || 1}
        </span>

        <button
          disabled={page === pagination?.totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 rounded-lg border disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <ServiceDrawer
          service={selected}
          location={getLocation(selected)}
          onClose={() => setSelected(null)}
          onJoinQueue={(svc, loc) => {
            setSelected(null);
            handleJoinQueue(svc, loc);
          }}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
