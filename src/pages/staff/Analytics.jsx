import { useState, useEffect, useMemo, useCallback } from "react";
import { locationsAPI, servicesAPI, queuesAPI, tokensAPI } from "../../services/api";


function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg ${className}`}
    />
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors =
    type === "error"
      ? "bg-rose-50 border-rose-200 text-rose-800"
      : "bg-emerald-50 border-emerald-200 text-emerald-800";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg ${colors}`}
    >
      <span>{type === "error" ? "✕" : "✓"}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">×</button>
    </div>
  );
}


function SummaryCard({ label, value, sub, color = "indigo", icon, loading }) {
  const gradients = {
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    purple: "from-purple-500 to-purple-600",
    sky: "from-sky-500 to-sky-600",
    slate: "from-slate-500 to-slate-600",
    teal: "from-teal-500 to-teal-600",
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center text-white text-base`}
        >
          {icon}
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-9 w-20" />
      ) : (
        <p className="text-3xl font-bold text-slate-800">{value ?? "—"}</p>
      )}
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      {count !== undefined && (
        <span className="text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-0.5 rounded-full">
          {count} record{count !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ value, trueLabel = "Active", falseLabel = "Inactive" }) {
  const active =
    value === true ||
    value === "active" ||
    value === 1 ||
    value === "true";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-slate-100 text-slate-500 border border-slate-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? "bg-emerald-500" : "bg-slate-400"}`}
      />
      {active ? trueLabel : falseLabel}
    </span>
  );
}

// ─── Sortable Table ───────────────────────────────────────────────────────────
function SortableTable({ columns, rows, loading, emptyMessage = "No data available." }) {
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const toggle = (key) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <span className="text-4xl mb-3">📭</span>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && toggle(col.key)}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                  col.sortable !== false ? "cursor-pointer select-none hover:text-slate-700" : ""
                }`}
              >
                {col.label}
                {sort.key === col.key && (
                  <span className="ml-1">{sort.dir === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {sorted.map((row, i) => (
            <tr
              key={i}
              className="bg-white hover:bg-indigo-50/40 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default function Analytics() {
  const [data, setData] = useState({
    locations: null,
    services: null,
    queues: null,
    tokens: null,
  });
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const loading = Object.values(data).some((v) => v === null);

  const fetchAll = useCallback(async () => {
    try {
      const [l, s, q, t] = await Promise.all([
        locationsAPI.getAll(),
        servicesAPI.getAll(),
        queuesAPI.getAll(),
        tokensAPI.getMyTokens().catch(() => ({ data: [] })), 
      ]);
      setData({
  locations: l.data.data ?? [],
  services: s.data.data ?? [],
  queues: q.data.data ?? [],
  tokens: t.data.data ?? [],
});

      setError(null);
    } catch{
      setError("Failed to load analytics data. Check your connection.");
      setToast({ message: "Failed to load some analytics data.", type: "error" });
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  
  const metrics = useMemo(() => {
    const { locations, services, queues } = data;
    if (!locations || !services || !queues)
      return {
        totalLocations: null,
        totalServices: null,
        activeServices: null,
        totalQueues: null,
        activeQueues: null,
        inactiveQueues: null,
        avgServiceTime: null,
        servicesPerLocation: null,
      };

    const activeServices = services.filter((s) => s.is_active).length;
    const activeQueues = queues.filter((q) => q.status === "active").length;
    const inactiveQueues = queues.filter((q) => q.status !== "active").length;

    const serviceTimes = services
      .map((s) => Number(s.avg_service_time))
      .filter((n) => !isNaN(n) && n > 0);
    const avgServiceTime =
      serviceTimes.length
        ? Math.round(serviceTimes.reduce((a, b) => a + b, 0) / serviceTimes.length)
        : 0;

    const servicesPerLocation =
      locations.length
        ? (services.length / locations.length).toFixed(1)
        : 0;

    return {
      totalLocations: locations.length,
      totalServices: services.length,
      activeServices,
      totalQueues: queues.length,
      activeQueues,
      inactiveQueues,
      avgServiceTime,
      servicesPerLocation,
    };
  }, [data]);

  // ── Queue table rows ──
  const queueRows = useMemo(() => {
    if (!data.queues || !data.services) return [];
    return data.queues.map((q) => {
      const service = data.services.find((s) => s.id === q.service_id);
      return {
        name: q.name ?? `Queue #${q.id}`,
        status: q.status,
        service: service?.name ?? q.service_name ?? "—",
        date: q.date
          ? new Date(q.date).toLocaleDateString()
          : q.created_at
          ? new Date(q.created_at).toLocaleDateString()
          : "—",
      };
    });
  }, [data.queues, data.services]);

  // ── Service table rows ──
  const serviceRows = useMemo(() => {
    if (!data.services || !data.locations) return [];
    return data.services.map((s) => {
      const loc = data.locations.find((l) => l.id === s.location_id);
      return {
        name: s.name,
        location: loc?.name ?? s.location_name ?? "—",
        avg_service_time: s.avg_service_time ? `${s.avg_service_time} min` : "—",
        is_active: s.is_active,
      };
    });
  }, [data.services, data.locations]);

  // ── Location table rows ──
  const locationRows = useMemo(() => {
    if (!data.locations || !data.services) return [];
    return data.locations.map((l) => {
      const count = data.services.filter((s) => s.location_id === l.id).length;
      return {
        name: l.name,
        city: l.city ?? "—",
        services_count: count,
        is_active: l.is_active,
      };
    });
  }, [data.locations, data.services]);

  // ── Column definitions ──
  const queueCols = [
    { key: "name", label: "Queue Name" },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge value={v} trueLabel="Active" falseLabel={v ?? "—"} />,
    },
    { key: "service", label: "Service" },
    { key: "date", label: "Date" },
  ];

  const serviceCols = [
    { key: "name", label: "Service Name" },
    { key: "location", label: "Location" },
    { key: "avg_service_time", label: "Avg Service Time" },
    {
      key: "is_active",
      label: "Status",
      render: (v) => <StatusBadge value={v} />,
    },
  ];

  const locationCols = [
    { key: "name", label: "Location Name" },
    { key: "city", label: "City" },
    { key: "services_count", label: "Services" },
    {
      key: "is_active",
      label: "Status",
      render: (v) => <StatusBadge value={v} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">
              Live overview calculated from all system data
            </p>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <span className={loading ? "animate-spin inline-block" : ""}>↻</span>
            Refresh
          </button>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 text-sm text-rose-700 flex items-center gap-3">
            <span>⚠</span>
            <span>{error}</span>
            <button onClick={fetchAll} className="ml-auto underline text-rose-600 hover:text-rose-800">
              Retry
            </button>
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Locations"
            value={metrics.totalLocations}
            icon="📍"
            color="sky"
            loading={loading}
          />
          <SummaryCard
            label="Total Services"
            value={metrics.totalServices}
            icon="🏥"
            color="purple"
            loading={loading}
          />
          <SummaryCard
            label="Active Services"
            value={metrics.activeServices}
            icon="✅"
            color="emerald"
            loading={loading}
          />
          <SummaryCard
            label="Total Queues"
            value={metrics.totalQueues}
            icon="📋"
            color="indigo"
            loading={loading}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            label="Active Queues"
            value={metrics.activeQueues}
            icon="🟢"
            color="teal"
            loading={loading}
          />
          <SummaryCard
            label="Inactive Queues"
            value={metrics.inactiveQueues}
            icon="⏸"
            color="slate"
            loading={loading}
          />
          <SummaryCard
            label="Avg Service Time"
            value={metrics.avgServiceTime !== null ? `${metrics.avgServiceTime} min` : null}
            icon="⏱"
            color="amber"
            loading={loading}
          />
          <SummaryCard
            label="Services / Location"
            value={metrics.servicesPerLocation}
            icon="📊"
            color="rose"
            loading={loading}
          />
        </div>

        {/* ── Queue Analytics ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <SectionHeader
            title="Queue Analytics"
            count={!loading ? queueRows.length : undefined}
          />
          <SortableTable
            columns={queueCols}
            rows={queueRows}
            loading={loading}
            emptyMessage="No queues found."
          />
        </div>

        {/* ── Service Analytics ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <SectionHeader
            title="Service Analytics"
            count={!loading ? serviceRows.length : undefined}
          />
          <SortableTable
            columns={serviceCols}
            rows={serviceRows}
            loading={loading}
            emptyMessage="No services found."
          />
        </div>

        {/* ── Location Analytics ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <SectionHeader
            title="Location Analytics"
            count={!loading ? locationRows.length : undefined}
          />
          <SortableTable
            columns={locationCols}
            rows={locationRows}
            loading={loading}
            emptyMessage="No locations found."
          />
        </div>

      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}