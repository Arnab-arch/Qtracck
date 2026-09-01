import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { tokensAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";


export default function PatientDashboard() {
  const { user } = useAuth();
  const [myTokens, setMyTokens] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    tokensAPI.getMyTokens()
      .then(r => {
  const tokens = r.data?.data || [];
  setMyTokens(Array.isArray(tokens) ? tokens : []);
})
      .catch(() => setMyTokens([]))
      .finally(() => setLoading(false));
  }, []);

  const active   = myTokens.filter(t => t.status === "waiting" || t.status === "serving");
  const completed= myTokens.filter(t => t.status === "completed");

  const quickActions = [
    { to: "/dashboard/locations",  icon: "📍", label: "Browse Locations", color: "#dbeafe", accent: "#2563eb" },
    { to: "/dashboard/services",   icon: "🏥", label: "View Services",    color: "#dcfce7", accent: "#16a34a" },
    { to: "/dashboard/join",       icon: "➕", label: "Join a Queue",     color: "#fef9c3", accent: "#ca8a04" },
    { to: "/dashboard/my-tokens",  icon: "🎫", label: "My Tokens",        color: "#fce7f3", accent: "#db2777" },
  ];

  return (
    <div className="pd-root">

      {/* ── GREETING ── */}
      <div className="pd-greeting">
        <div>
          <p className="pd-greeting-sub">Good {timeOfDay()}</p>
          <h1 className="pd-greeting-title">Hello, {user?.name?.split(" ")[0] || "there"} 👋</h1>
        </div>
        
      </div>

      {/* ── STAT CARDS ── */}
      <div className="pd-stats">
        {[
          { label: "Active Tokens",    value: active.length,     icon: "🟢", sub: "currently in queue"   },
          { label: "Completed Today",  value: completed.length,  icon: "✅", sub: "visits completed"     },
          { label: "Total Visits",     value: myTokens.length,   icon: "📊", sub: "all time"             },
        ].map(s => (
          <div className="pd-stat-card" key={s.label}>
            <div className="pd-stat-icon">{s.icon}</div>
            <div className="pd-stat-body">
              <p className="pd-stat-value">{loading ? "—" : s.value}</p>
              <p className="pd-stat-label">{s.label}</p>
              <p className="pd-stat-sub">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <section className="pd-section">
        <h2 className="pd-section-title">Quick Actions</h2>
        <div className="pd-actions">
          {quickActions.map(a => (
            <Link key={a.to} to={a.to} className="pd-action-card"
              style={{ "--qa-bg": a.color, "--qa-accent": a.accent }}>
              <span className="pd-action-icon">{a.icon}</span>
              <span className="pd-action-label">{a.label}</span>
              <ArrowIcon />
            </Link>
          ))}
        </div>
      </section>

      
      <section className="pd-section">
        <div className="pd-section-head">
          <h2 className="pd-section-title">Active Queue Positions</h2>
          <Link to="/dashboard/my-tokens" className="pd-see-all">See all →</Link>
        </div>

        {loading ? (
          <div className="pd-empty">Loading your tokens…</div>
        ) : active.length === 0 ? (
          <div className="pd-empty-card">
            <span className="pd-empty-icon">🎫</span>
            <p className="pd-empty-text">No active queue positions</p>
            <Link to="/dashboard/join" className="pd-empty-btn">Join a Queue</Link>
          </div>
        ) : (
          <div className="pd-token-list">
            {active.map(token => (
              <TokenRow key={token.token_id} token={token}  />
            ))}
          </div>
        )}
      </section>

      <style>{`
        .pd-root { display: flex; flex-direction: column; gap: 28px; }

        /* Greeting */
        .pd-greeting {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .pd-greeting-sub { font-size: 0.85rem; color: var(--text-3); margin: 0 0 2px; }
        .pd-greeting-title { font-size: 1.75rem; font-weight: 800; color: var(--text-1); margin: 0; }
        .pd-join-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--brand); color: #fff;
          padding: 10px 20px; border-radius: 10px;
          font-size: 0.9rem; font-weight: 700; text-decoration: none;
          transition: background 0.15s, transform 0.12s;
        }
        .pd-join-btn:hover { background: var(--brand-dark); transform: translateY(-1px); color: #fff; }
        .pd-join-btn svg { width: 16px; height: 16px; }

        /* Stats */
        .pd-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .pd-stat-card {
          background: var(--surface); border-radius: var(--radius);
          padding: 20px 22px; box-shadow: var(--shadow);
          border: 1px solid var(--border);
          display: flex; align-items: flex-start; gap: 14px;
        }
        .pd-stat-icon { font-size: 1.8rem; }
        .pd-stat-body { min-width: 0; }
        .pd-stat-value { font-size: 2rem; font-weight: 800; color: var(--text-1); margin: 0; line-height: 1; }
        .pd-stat-label { font-size: 0.82rem; font-weight: 700; color: var(--text-2); margin: 4px 0 2px; }
        .pd-stat-sub { font-size: 0.74rem; color: var(--text-3); margin: 0; }

        /* Section */
        .pd-section { display: flex; flex-direction: column; gap: 14px; }
        .pd-section-head { display: flex; align-items: center; justify-content: space-between; }
        .pd-section-title { font-size: 1.05rem; font-weight: 700; color: var(--text-1); margin: 0; }
        .pd-see-all { font-size: 0.82rem; font-weight: 600; color: var(--brand); text-decoration: none; }
        .pd-see-all:hover { text-decoration: underline; }

        /* Quick actions */
        .pd-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .pd-action-card {
          background: var(--qa-bg, #f0f2ff);
          border: 1.5px solid transparent;
          border-radius: var(--radius);
          padding: 18px 16px; text-decoration: none;
          display: flex; flex-direction: column; gap: 10px;
          transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
        }
        .pd-action-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          border-color: var(--qa-accent);
        }
        .pd-action-card svg { width: 14px; height: 14px; color: var(--qa-accent); margin-top: auto; }
        .pd-action-icon { font-size: 1.5rem; }
        .pd-action-label { font-size: 0.85rem; font-weight: 700; color: var(--text-1); }

        /* Tokens */
        .pd-token-list { display: flex; flex-direction: column; gap: 10px; }
        .pd-empty {
          color: var(--text-3); font-size: 0.9rem; padding: 16px 0;
        }
        .pd-empty-card {
          background: var(--surface); border: 1.5px dashed var(--border);
          border-radius: var(--radius); padding: 36px 24px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          text-align: center;
        }
        .pd-empty-icon { font-size: 2.5rem; }
        .pd-empty-text { font-size: 0.9rem; color: var(--text-3); margin: 0; }
        .pd-empty-btn {
          background: var(--brand); color: #fff;
          padding: 9px 18px; border-radius: 8px;
          font-size: 0.85rem; font-weight: 700; text-decoration: none;
          margin-top: 4px; transition: background 0.15s;
        }
        .pd-empty-btn:hover { background: var(--brand-dark); color: #fff; }

        @media (max-width: 900px) {
          .pd-stats { grid-template-columns: 1fr 1fr; }
          .pd-actions { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .pd-stats { grid-template-columns: 1fr; }
          .pd-actions { grid-template-columns: 1fr 1fr; }
          .pd-greeting-title { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}

function TokenRow({ token }) {
  const statusColor = {
    waiting: { bg: "#fef3c7", color: "#b45309" },
    serving: { bg: "#dcfce7", color: "#15803d" },
  }[token.status] || { bg: "#f1f5f9", color: "#475569" };
  const navigate = useNavigate();

  return (
    <div className="tr-row" onClick={()=>navigate(`/dashboard/my-queue`)}>
      <div className="tr-num">#{token.token_number}</div>
      <div className="tr-info">
        <p className="tr-service">{token.service_name || "Service"}</p>
        <p className="tr-location">{token.location_name || "Location"}</p>
      </div>
      <span className="tr-badge" style={{ background: statusColor.bg, color: statusColor.color }}>
        {token.status}
      </span>
      <style>{`
        .tr-row {
          background: #fff; border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 18px;
          display: flex; align-items: center; gap: 14px;
        }
        .tr-num {
          font-size: 1.1rem; font-weight: 800;
          color: var(--brand); min-width: 40px;
        }
        .tr-info { flex: 1; min-width: 0; }
        .tr-service { font-size: 0.9rem; font-weight: 700; color: var(--text-1); margin: 0; }
        .tr-location { font-size: 0.78rem; color: var(--text-3); margin: 2px 0 0; }
        .tr-badge {
          font-size: 0.72rem; font-weight: 700; padding: 3px 9px;
          border-radius: 20px; text-transform: capitalize;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}