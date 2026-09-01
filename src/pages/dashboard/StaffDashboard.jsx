import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { queuesAPI, tokensAPI, locationsAPI, servicesAPI } from "../../services/api";

export default function StaffDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [counts, setCounts] = useState({ locations: 0, services: 0, queues: 0, tokens: 0 });
  const [loading, setLoading] = useState(true);
  const [recentTokens, setRecentTokens] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      locationsAPI.getAll(),
      servicesAPI.getAll(),
      queuesAPI.getAll(),
      tokensAPI.getMyTokens(),
    ]).then(([locs, svcs, qs, toks]) => {
      setCounts({
        locations: locs.value?.data?.length || 0,
        services:  svcs.value?.data?.length || 0,
        queues:    qs.value?.data?.length   || 0,
        tokens:    toks.value?.data?.length || 0,
      });
      const allTokens = toks.value?.data || [];
      setRecentTokens(allTokens.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Locations",  value: counts.locations, icon: "📍", to: "/dashboard/manage-locations", color: "#ede9fe", accent: "#7c3aed" },
    { label: "Services",   value: counts.services,  icon: "🏥", to: "/dashboard/manage-services",  color: "#dcfce7", accent: "#15803d" },
    { label: "Queues",     value: counts.queues,    icon: "⏳", to: "/dashboard/manage-queues",    color: "#fef9c3", accent: "#ca8a04" },
    { label: "Tokens",     value: counts.tokens,    icon: "🎫", to: "/dashboard/manage-tokens",    color: "#fce7f3", accent: "#db2777" },
  ];

  const managementLinks = [
    { to: "/dashboard/manage-locations", icon: "📍", label: "Manage Locations", desc: "Add, edit & deactivate locations" },
    { to: "/dashboard/manage-services",  icon: "⚙️", label: "Manage Services",  desc: "Configure services & wait times"  },
    { to: "/dashboard/manage-queues",    icon: "📋", label: "Manage Queues",    desc: "Monitor & update queue statuses"  },
    { to: "/dashboard/manage-tokens",    icon: "🎟️", label: "Manage Tokens",    desc: "Track & update visitor tokens"    },
    { to: "/dashboard/analytics",        icon: "📊", label: "Analytics",        desc: "View reports & performance data"  },
  ];

  return (
    <div className="sd-root">

     
      <div className="sd-greeting">
        <div>
          <p className="sd-greeting-sub">{isAdmin ? "Administrator" : "Staff"} Portal</p>
          <h1 className="sd-greeting-title">
            Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="sd-greeting-date">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        {isAdmin && (
          <div className="sd-admin-badge">
            <ShieldIcon />
            Administrator Access
          </div>
        )}
      </div>

      {/* ── STAT CARDS ── */}
      <div className="sd-stats">
        {statCards.map(s => (
          <Link to={s.to} key={s.label} className="sd-stat-card"
            style={{ "--sc-bg": s.color, "--sc-accent": s.accent }}>
            <div className="sd-stat-top">
              <span className="sd-stat-icon">{s.icon}</span>
              <ArrowIcon />
            </div>
            <p className="sd-stat-value">{loading ? "—" : s.value}</p>
            <p className="sd-stat-label">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* ── MANAGEMENT ── */}
      <section className="sd-section">
        <h2 className="sd-section-title">Management</h2>
        <div className="sd-mgmt-grid">
          {managementLinks.map(m => (
            <Link to={m.to} key={m.to} className="sd-mgmt-card">
              <span className="sd-mgmt-icon">{m.icon}</span>
              <div>
                <p className="sd-mgmt-label">{m.label}</p>
                <p className="sd-mgmt-desc">{m.desc}</p>
              </div>
              <ChevronIcon />
            </Link>
          ))}
        </div>
      </section>

      {/* ── RECENT TOKENS ── */}
      <section className="sd-section">
        <div className="sd-section-head">
          <h2 className="sd-section-title">Recent Tokens</h2>
          <Link to="/dashboard/manage-tokens" className="sd-see-all">View all →</Link>
        </div>
        {loading ? (
          <p className="sd-loading">Loading…</p>
        ) : recentTokens.length === 0 ? (
          <p className="sd-empty">No tokens yet today.</p>
        ) : (
          <div className="sd-token-table-wrap">
            <table className="sd-token-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Visitor</th>
                  <th>Service</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTokens.map(t => (
                  <tr key={t.token_id}>
                    <td className="sd-token-num">#{t.token_number}</td>
                    <td>{t.user_name || t.email || "—"}</td>
                    <td>{t.service_name || "—"}</td>
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        .sd-root { display: flex; flex-direction: column; gap: 28px; }

        /* Greeting */
        .sd-greeting {
          display: flex; align-items: flex-start;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .sd-greeting-sub { font-size: 0.82rem; font-weight: 600; color: var(--brand); margin: 0 0 2px; text-transform: uppercase; letter-spacing: 0.06em; }
        .sd-greeting-title { font-size: 1.75rem; font-weight: 800; color: var(--text-1); margin: 0 0 4px; }
        .sd-greeting-date { font-size: 0.82rem; color: var(--text-3); margin: 0; }
        .sd-admin-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: #f3e8ff; color: #7e22ce;
          padding: 8px 14px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 700;
          border: 1.5px solid #e9d5ff;
        }
        .sd-admin-badge svg { width: 15px; height: 15px; }

        /* Stats */
        .sd-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .sd-stat-card {
          background: var(--sc-bg, #f0f2ff);
          border: 1.5px solid transparent;
          border-radius: var(--radius); padding: 20px;
          text-decoration: none;
          display: flex; flex-direction: column; gap: 6px;
          transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
        }
        .sd-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          border-color: var(--sc-accent);
        }
        .sd-stat-top { display: flex; align-items: center; justify-content: space-between; }
        .sd-stat-icon { font-size: 1.4rem; }
        .sd-stat-top svg { width: 14px; height: 14px; color: var(--sc-accent); }
        .sd-stat-value { font-size: 2rem; font-weight: 800; color: var(--text-1); margin: 4px 0 0; }
        .sd-stat-label { font-size: 0.8rem; font-weight: 600; color: var(--text-2); margin: 0; }

        /* Section */
        .sd-section { display: flex; flex-direction: column; gap: 14px; }
        .sd-section-head { display: flex; align-items: center; justify-content: space-between; }
        .sd-section-title { font-size: 1.05rem; font-weight: 700; color: var(--text-1); margin: 0; }
        .sd-see-all { font-size: 0.82rem; font-weight: 600; color: var(--brand); text-decoration: none; }
        .sd-see-all:hover { text-decoration: underline; }

        /* Management grid */
        .sd-mgmt-grid { display: flex; flex-direction: column; gap: 8px; }
        .sd-mgmt-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 16px 18px;
          text-decoration: none; display: flex; align-items: center; gap: 14px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .sd-mgmt-card:hover {
          border-color: var(--brand);
          box-shadow: 0 4px 16px rgba(114,126,253,0.1);
        }
        .sd-mgmt-icon { font-size: 1.3rem; flex-shrink: 0; }
        .sd-mgmt-label { font-size: 0.9rem; font-weight: 700; color: var(--text-1); margin: 0 0 2px; }
        .sd-mgmt-desc { font-size: 0.78rem; color: var(--text-3); margin: 0; }
        .sd-mgmt-card svg { width: 16px; height: 16px; color: var(--text-3); margin-left: auto; flex-shrink: 0; }

        /* Table */
        .sd-token-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); overflow: hidden;
        }
        .sd-token-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .sd-token-table th {
          background: var(--bg); padding: 10px 16px;
          text-align: left; font-size: 0.72rem; font-weight: 700;
          color: var(--text-3); text-transform: uppercase; letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
        }
        .sd-token-table td {
          padding: 12px 16px; border-bottom: 1px solid var(--border);
          color: var(--text-2);
        }
        .sd-token-table tr:last-child td { border-bottom: none; }
        .sd-token-table tr:hover td { background: #fafbff; }
        .sd-token-num { font-weight: 700; color: var(--brand) !important; }
        .sd-loading, .sd-empty { font-size: 0.875rem; color: var(--text-3); padding: 4px 0; }

        @media (max-width: 900px) {
          .sd-stats { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .sd-stats { grid-template-columns: 1fr 1fr; }
          .sd-greeting-title { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    waiting:   { bg: "#fef3c7", color: "#b45309" },
    serving:   { bg: "#dcfce7", color: "#15803d" },
    completed: { bg: "#dbeafe", color: "#1d4ed8" },
    cancelled: { bg: "#fee2e2", color: "#b91c1c" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 9px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>
      {status || "unknown"}
    </span>
  );
}
function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}
function ChevronIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}