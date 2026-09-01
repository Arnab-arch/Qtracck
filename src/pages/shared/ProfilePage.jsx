import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  tokensAPI,
  locationsAPI,
  servicesAPI,
  queuesAPI,
} from "../../services/api";


function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg ${className}`}
    />
  );
}


function RoleBadge({ role }) {
  const map = {
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    staff: "bg-blue-100 text-blue-700 border-blue-200",
    patient: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wide ${
        map[role] ?? "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {role}
    </span>
  );
}


function Avatar({ name, size = "lg" }) {
  const initials = (name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const sizes = {
    lg: "w-24 h-24 text-3xl",
    sm: "w-10 h-10 text-sm",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}
    >
      {initials}
    </div>
  );
}


function StatCard({ label, value, color = "indigo", icon }) {
  const colors = {
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    purple: "from-purple-500 to-purple-600",
    sky: "from-sky-500 to-sky-600",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-xl flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">
          {value ?? <Skeleton className="h-7 w-12" />}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}


function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors =
    type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : "bg-rose-50 border-rose-200 text-rose-800";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg ${colors} animate-fade-in`}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        ×
      </button>
    </div>
  );
}


function PatientStats() {
  const [tokens, setTokens] = useState(null);

  useEffect(() => {
    tokensAPI
      .getMyTokens()
      .then((res) => setTokens(res.data))
      .catch(() => setTokens([]));
  }, []);

  const active = tokens?.filter((t) =>
    ["waiting", "serving"].includes(t.status)
  ).length;
  const completed = tokens?.filter((t) => t.status === "completed").length;
  const cancelled = tokens?.filter((t) =>
    ["cancelled", "no_show"].includes(t.status)
  ).length;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        My Queue Activity
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active Tokens"
          value={tokens === null ? undefined : active}
          color="indigo"
          icon="🎫"
        />
        <StatCard
          label="Completed"
          value={tokens === null ? undefined : completed}
          color="emerald"
          icon="✅"
        />
        <StatCard
          label="Cancelled / No-show"
          value={tokens === null ? undefined : cancelled}
          color="rose"
          icon="❌"
        />
      </div>
    </div>
  );
}


function StaffStats({ user }) {
  // Staff stats come from the user profile object (no dedicated endpoint exists)
  const locations = user?.locations ?? [];
  const services = user?.services ?? [];
  const queues = user?.queues ?? [];

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Staff Overview
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Assigned Locations"
          value={locations.length}
          color="sky"
          icon="📍"
        />
        <StatCard
          label="Assigned Services"
          value={services.length}
          color="purple"
          icon="🏥"
        />
        <StatCard
          label="Queues Managed"
          value={queues.length}
          color="amber"
          icon="📋"
        />
      </div>
      {locations.length > 0 && (
        <div className="mt-4 bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            Locations
          </p>
          <div className="flex flex-wrap gap-2">
            {locations.map((l, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700"
              >
                {l.name ?? l}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function AdminStats() {
  const [data, setData] = useState({
    locations: null,
    services: null,
    queues: null,
  });

  useEffect(() => {
    Promise.all([
      locationsAPI.getAll(),
      servicesAPI.getAll(),
      queuesAPI.getAll(),
    ])
      .then(([l, s, q]) =>
        setData({
          locations: l.data,
          services: s.data,
          queues: q.data,
        })
      )
      .catch(() =>
        setData({ locations: [], services: [], queues: [] })
      );
  }, []);

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        System Overview
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Locations"
          value={data.locations === null ? undefined : data.locations.length}
          color="sky"
          icon="📍"
        />
        <StatCard
          label="Total Services"
          value={data.services === null ? undefined : data.services.length}
          color="purple"
          icon="🏥"
        />
        <StatCard
          label="Total Queues"
          value={data.queues === null ? undefined : data.queues.length}
          color="amber"
          icon="📋"
        />
      </div>
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, editing, name, onChange, type = "text" }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 sm:w-40 flex-shrink-0">{label}</span>
      {editing ? (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className="flex-1 text-sm px-3 py-1.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        />
      ) : (
        <span className="flex-1 text-sm font-medium text-slate-800">
          {value || <span className="text-slate-400 italic">Not set</span>}
        </span>
      )}
    </div>
  );
}


export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name ?? user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    state: user?.state ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (updateUser) await updateUser(form);
      setEditing(false);
      setToast({ message: "Profile updated successfully.", type: "success" });
    } catch {
      setToast({ message: "Failed to save changes. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: user?.full_name ?? user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
      city: user?.city ?? "",
      state: user?.state ?? "",
    });
    setEditing(false);
  };

  const displayName = user?.full_name ?? user?.name ?? "User";
  const role = user?.role ?? "patient";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Profile Header ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end justify-between">
              <div className="ring-4 ring-white rounded-full shadow-xl">
                <Avatar name={displayName} size="lg" />
              </div>
              <button
                onClick={() => logout?.()}
                className="mb-1 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                <span>⎋</span> Logout
              </button>
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-slate-800">{displayName}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-3 mt-3">
                <RoleBadge role={role} />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    user?.is_active === false
                      ? "bg-rose-50 text-rose-600 border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {user?.is_active === false ? "Inactive" : "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Personal Information ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-800">Personal Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-sm px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-medium transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="text-sm px-4 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm px-4 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>

          <InfoRow
            label="Full Name"
            value={form.full_name}
            editing={editing}
            name="full_name"
            onChange={handleChange}
          />
          <InfoRow
            label="Email"
            value={form.email}
            editing={editing}
            name="email"
            type="email"
            onChange={handleChange}
          />
          <InfoRow
            label="Phone"
            value={form.phone}
            editing={editing}
            name="phone"
            type="tel"
            onChange={handleChange}
          />
          <InfoRow
            label="Address"
            value={form.address}
            editing={editing}
            name="address"
            onChange={handleChange}
          />
          <InfoRow
            label="City"
            value={form.city}
            editing={editing}
            name="city"
            onChange={handleChange}
          />
          <InfoRow
            label="State"
            value={form.state}
            editing={editing}
            name="state"
            onChange={handleChange}
          />
        </div>

        {/* ── Account Information ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Account Information</h2>
          <div className="space-y-0">
            <InfoRow label="User ID" value={user?.id ? `#${user.id}` : "—"} />
            <InfoRow label="Role" value={role.charAt(0).toUpperCase() + role.slice(1)} />
            <InfoRow
              label="Last Login"
              value={
                user?.last_login
                  ? new Date(user.last_login).toLocaleString()
                  : "—"
              }
            />
            <InfoRow
              label="Account Status"
              value={user?.is_active === false ? "Inactive" : "Active"}
            />
          </div>
        </div>

        {/* ── Role-Specific Dashboard ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          {role === "patient" && <PatientStats />}
          {role === "staff" && <StaffStats user={user} />}
          {role === "admin" && <AdminStats />}
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