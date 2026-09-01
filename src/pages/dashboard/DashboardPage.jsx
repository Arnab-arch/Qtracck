import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import logo from "../assets/images/logo.png";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Landing from "../public/Landing";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}


function StatCard({ icon, label, value, accent }) {
  return (
    <div className="db-stat" style={{ "--accent": accent }}>
      <div className="db-stat-icon">{icon}</div>
      <div>
        <p className="db-stat-val">{value}</p>
        <p className="db-stat-label">{label}</p>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

 
  const DEV_MODE = true;
  const mockUser = { name: "Arnab", role: "admin" };
  const [devRole, setDevRole] = useState("admin");
  const currentUser = DEV_MODE ? { ...mockUser, role: devRole } : user;

  const isStaff = currentUser?.role === "staff" || currentUser?.role === "admin";

  // ── State ──
  const [queues,           setQueues]           = useState([]);
  const [myTokens,         setMyTokens]         = useState([]);
  const [statsData,        setStatsData]        = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);

  // Staff: location → service → queue drill-down
  const [locations,          setLocations]          = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [services,           setServices]           = useState([]);
  const [selectedServiceId,  setSelectedServiceId]  = useState("");

  // Patient: browse locations
  const [patientLocations,   setPatientLocations]   = useState([]);
  const [locLoading,         setLocLoading]         = useState(false);


    (async () => {
      try {
        setLoading(true);
        if (isStaff) {
          const qRes = await axios.get(`${API}/queues`, authHeaders(token));
          setQueues(qRes.data.data ?? qRes.data ?? []);
          setStatsData({ total: 124, waiting: 18, served: 106, avgWait: 8 });
        } else {
          // FIX: correct endpoint is /tokens/my-tokens
          const [qRes, tRes] = await Promise.all([
            axios.get(`${API}/queues`,             authHeaders(token)),
            axios.get(`${API}/tokens/my-tokens`,   authHeaders(token)),
          ]);
          setQueues(qRes.data.data   ?? qRes.data ?? []);
          setMyTokens(tRes.data.data ?? tRes.data ?? []);
        }
      } catch {
        // keep empty state
      } finally {
        setLoading(false);
      }
    })();
  }, [token, isStaff]);

 
  useEffect(() => {
    if (!isStaff) return;
    axios.get(`${API}/locations`)
      .then(res => setLocations(res.data.data ?? []))
      .catch(() => {});
  }, [isStaff]);


  useEffect(() => {
    if (!selectedLocationId) return;
    axios.get(`${API}/services?location_id=${selectedLocationId}`)
      .then(res => setServices(res.data.data ?? []))
      .catch(() => {});
  }, [selectedLocationId]);

  // ── Staff: fetch queue when a service is picked ──
  useEffect(() => {
    if (!selectedServiceId) return;
    axios.get(`${API}/queues?service_id=${selectedServiceId}`)
      .then(res => {
        const rows = res.data.data ?? [];
        const active = rows.find(q => q.status === "active");
        if (active) setQueues([active]);
      })
      .catch(() => {});
  }, [selectedServiceId]);

  // ── FIX 3: Patient location browsing (public endpoint, no auth needed) ──
  useEffect(() => {
    if (isStaff) return;
    setLocLoading(true);
    axios.get(`${API}/locations`)
      .then(res => setPatientLocations(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLocLoading(false));
  }, [isStaff]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  const patientNav = [
  
    { to: "/dashboard",           icon: <HomeIcon />,     label: "Dashboard",     key: "home"     },
    { to: "/dashboard/my-queue",  icon: <QueueIcon />,    label: "My Queue",      key: "myqueue"  },
    { to: "/dashboard/my-tokens", icon: <TicketIcon />,   label: "My Tokens",     key: "mytokens" },
    { to: "/dashboard/locations", icon: <LocationIcon />, label: "Locations",     key: "locs"     },
    { to: "/profile",             icon: <UserIcon />,     label: "Profile",       key: "profile"  },
  ];
  const staffNav = [
    { to: "/dashboard",                  icon: <HomeIcon />,   label: "Overview",      key: "home"     },
    { to: "/dashboard/manage-queue",     icon: <QueueIcon />,  label: "Manage Queue",  key: "mqueue"   },
    { to: "/dashboard/manage-tokens",    icon: <TicketIcon />, label: "Manage Tokens", key: "mtokens"  },
    { to: "/profile",                    icon: <UserIcon />,   label: "Profile",       key: "profile"  },
  ];


  const navItems = DEV_MODE
    ? (devRole === "visitor" ? patientNav : staffNav)
    : (isStaff ? staffNav : patientNav);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="db-root">

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className={`db-sidebar${sidebarOpen ? " db-sidebar--open" : ""}`}>
        <div className="db-sidebar-inner">

          <Link to="/" className="db-logo-link" onClick={() => setSidebarOpen(false)}>
            <img src={logo} alt="QTrack" className="db-logo" />
            <span className="db-brand">QTrack</span>
          </Link>

          <div className={`db-role-badge${isStaff ? " db-role-badge--staff" : ""}`}>
            {isStaff ? <StaffIcon /> : <PatientIcon />}
            <span>{isStaff ? (currentUser?.role === "admin" ? "Admin" : "Staff") : "Patient"}</span>
          </div>

          <nav className="db-nav">
            {navItems.map((n) => (
              <NavLink
                key={n.key}
                to={n.to}
                end={n.to === "/dashboard"}
                className={({ isActive }) =>
                  isActive ? "db-nav-link db-nav-link--active" : "db-nav-link"
                }
              >
                <span className="db-nav-icon">{n.icon}</span>
                <span>{n.label}</span>
              </NavLink>
            ))}
          </nav>

          <button className="db-logout-btn" onClick={handleLogout}>
            <LogoutIcon />
            Sign out
          </button>

        </div>
      </aside>

      {sidebarOpen && (
        <div className="db-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <main className="db-main">

        {/* ── TOP BAR ── */}
        <header className="db-topbar">
          <button className="db-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <HamburgerIcon />
          </button>
          <div className="db-topbar-title">
            <h1 className="db-page-title">Dashboard</h1>
          </div>
          <div className="db-topbar-right">
            {DEV_MODE && (
              <select
                value={devRole}
                onChange={(e) => {
                  setDevRole(e.target.value);
                  setSelectedLocationId("");
                  setSelectedServiceId("");
                  setServices([]);
                }}
                style={{
                  padding: "6px 10px", borderRadius: "8px", border: "1px solid #ddd",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  background: "#fff", color: "#374151",
                }}
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="visitor">Patient</option>
              </select>
            )}
            <div className="db-avatar" title={currentUser?.name}>
              {(currentUser?.name?.[0] ?? "U").toUpperCase()}
            </div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div className="db-content">

          {/* Greeting */}
          <div className="db-greeting">
            <div>
              <h2 className="db-greeting-text">
                {greeting}, <span>{currentUser?.name?.split(" ")[0] ?? "there"}</span> 👋
              </h2>
              <p className="db-greeting-sub">
                {isStaff
                  ? "Here's what's happening with your queues today."
                  : "Check your active tokens or browse queues near you."}
              </p>
            </div>
            {!isStaff && (
              <Link to="/dashboard/my-queue" className="db-join-btn">
                <PlusIcon /> Join a Queue
              </Link>
            )}
          </div>

          {/* ── STAFF: Location + Service Selector ── */}
          {isStaff && (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <select
                value={selectedLocationId}
                onChange={e => {
                  setSelectedLocationId(e.target.value);
                  setSelectedServiceId("");
                  setServices([]);
                  setQueues([]);
                }}
                style={selectorStyle}
              >
                <option value="">Select Location</option>
                {locations.map(l => (
                  <option key={l.location_id} value={l.location_id}>{l.name}</option>
                ))}
              </select>

              {selectedLocationId && (
                <select
                  value={selectedServiceId}
                  onChange={e => setSelectedServiceId(e.target.value)}
                  style={selectorStyle}
                >
                  <option value="">Select Service</option>
                  {services.map(s => (
                    <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* ── STATS ROW (staff) ── */}
          {isStaff && statsData && (
            <div className="db-stats-grid">
              <StatCard icon={<PeopleIcon />} label="Total Today"    value={statsData.total}   accent="#727EFD" />
              <StatCard icon={<ClockIcon />}  label="Waiting Now"    value={statsData.waiting} accent="#FEB600" />
              <StatCard icon={<CheckIcon />}  label="Served Today"   value={statsData.served}  accent="#22c55e" />
              <StatCard icon={<TimerIcon />}  label="Avg Wait (min)" value={statsData.avgWait} accent="#f97316" />
            </div>
          )}

          {/* ── PATIENT: MY ACTIVE TOKENS ── */}
          {!isStaff && (
            <section className="db-section">
              <div className="db-section-header">
                <h3 className="db-section-title">My Active Tokens</h3>
                {/* FIX 2: correct link to my-tokens page */}
                <Link to="/dashboard/my-tokens" className="db-see-all">See all →</Link>
              </div>

              {loading ? (
                <div className="db-skeleton-row">
                  {[1, 2].map(i => <div key={i} className="db-skeleton db-skeleton--card" />)}
                </div>
              ) : myTokens.length === 0 ? (
                <div className="db-empty">
                  <div className="db-empty-icon"><TicketIcon /></div>
                  <p className="db-empty-text">No active tokens right now.</p>
                  <Link to="/dashboard/my-queue" className="db-empty-cta">Browse Queues</Link>
                </div>
              ) : (
                <div className="db-token-grid">
                  {myTokens.slice(0, 3).map((t) => (
                    <TokenCard key={t.token_id} token={t} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── QUEUES LIST (both roles) ── */}
          <section className="db-section">
            <div className="db-section-header">
              <h3 className="db-section-title">
                {isStaff ? "Queues You Manage" : "Active Queues"}
              </h3>
              {/* FIX 2: correct links */}
              <Link to={isStaff ? "/dashboard/manage-queue" : "/dashboard/my-queue"} className="db-see-all">
                See all →
              </Link>
            </div>

            {loading ? (
              <div className="db-skeleton-row">
                {[1, 2, 3].map(i => <div key={i} className="db-skeleton db-skeleton--queue" />)}
              </div>
            ) : queues.length === 0 ? (
              <div className="db-empty">
                <div className="db-empty-icon"><QueueIcon /></div>
                <p className="db-empty-text">
                  {isStaff
                    ? selectedLocationId
                      ? "No active queues for this service."
                      : "Select a location and service to view queues."
                    : "No active queues available right now."}
                </p>
                {isStaff && (
                  <Link to="/dashboard/manage-queue" className="db-empty-cta">Manage Queues</Link>
                )}
              </div>
            ) : (
              <div className="db-queue-list">
                {queues.slice(0, 5).map((q) => (
                  <QueueRow key={q.queue_id} queue={q} isStaff={isStaff} />
                ))}
              </div>
            )}
          </section>

          {/* ── FIX 3: PATIENT — Browse Locations ── */}
          {!isStaff && (
            <section className="db-section">
              <div className="db-section-header">
                <h3 className="db-section-title">Locations Near You</h3>
                <Link to="/dashboard/locations" className="db-see-all">See all →</Link>
              </div>

              {locLoading ? (
                <div className="db-skeleton-row">
                  {[1, 2, 3].map(i => <div key={i} className="db-skeleton db-skeleton--queue" />)}
                </div>
              ) : patientLocations.length === 0 ? (
                <div className="db-empty">
                  <div className="db-empty-icon"><LocationIcon /></div>
                  <p className="db-empty-text">No locations found.</p>
                </div>
              ) : (
                <div className="db-loc-grid">
                  {patientLocations.slice(0, 4).map((loc) => (
                    <LocationCard key={loc.location_id} loc={loc} />
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      </main>

      {/* ── STYLES ───────────────────────────────────────────── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .db-root {
          display: flex; min-height: 100vh;
          background: #f4f5fb;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        /* ── SIDEBAR ── */
        .db-sidebar {
          width: 240px; flex-shrink: 0;
          background: #fff; border-right: 1px solid #eaecf5;
          position: sticky; top: 0; height: 100vh;
          overflow-y: auto; z-index: 50;
          transition: transform 0.25s ease;
        }
        .db-sidebar-inner {
          display: flex; flex-direction: column;
          height: 100%; padding: 24px 16px 20px; gap: 20px;
        }
        .db-logo-link {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; padding: 4px 8px; border-radius: 8px;
          transition: background .15s;
        }
        .db-logo-link:hover { background: rgba(114,126,253,.07); }
        .db-logo  { width: 34px; height: 34px; object-fit: contain; border-radius: 7px; }
        .db-brand { font-size: 1.1rem; font-weight: 800; color: #727EFD; }

        .db-role-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(114,126,253,.10); color: #727EFD;
          font-size: 0.72rem; font-weight: 700; letter-spacing: .06em;
          text-transform: uppercase; padding: 5px 11px; border-radius: 20px;
          width: fit-content;
        }
        .db-role-badge--staff { background: rgba(254,182,0,.15); color: #b37e00; }
        .db-role-badge svg { flex-shrink: 0; }

        .db-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .db-nav-link {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 13px; border-radius: 10px;
          text-decoration: none; color: #4b5563;
          font-size: 0.875rem; font-weight: 500;
          transition: background .15s, color .15s;
        }
        .db-nav-link:hover { background: rgba(114,126,253,.07); color: #727EFD; }
        .db-nav-link--active {
          background: rgba(114,126,253,.12); color: #727EFD; font-weight: 700;
        }
        .db-nav-icon { display: flex; align-items: center; opacity: 0.85; }

        .db-logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 13px; border-radius: 10px;
          background: none; border: none; cursor: pointer;
          color: #6b7280; font-size: 0.875rem; font-weight: 500;
          transition: background .15s, color .15s; width: 100%;
        }
        .db-logout-btn:hover { background: #fef2f2; color: #dc2626; }

        /* ── TOPBAR ── */
        .db-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .db-topbar {
          display: flex; align-items: center; gap: 12px;
          background: #fff; border-bottom: 1px solid #eaecf5;
          padding: 0 24px; height: 64px;
          position: sticky; top: 0; z-index: 40;
        }
        .db-hamburger {
          display: none; background: none; border: none;
          cursor: pointer; color: #374151; padding: 4px; border-radius: 6px;
        }
        .db-hamburger:hover { background: #f3f4f6; }
        .db-topbar-title { flex: 1; }
        .db-page-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .db-topbar-right { display: flex; align-items: center; gap: 12px; }
        .db-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: #727EFD; color: #fff;
          font-size: 0.8rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          cursor: default; user-select: none;
        }

        /* ── CONTENT ── */
        .db-content {
          padding: 28px 28px 48px;
          display: flex; flex-direction: column; gap: 32px;
        }

        /* Greeting */
        .db-greeting {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .db-greeting-text { font-size: 1.4rem; font-weight: 800; color: #0f172a; }
        .db-greeting-text span { color: #727EFD; }
        .db-greeting-sub { font-size: 0.875rem; color: #64748b; margin-top: 4px; }
        .db-join-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #727EFD; color: #fff;
          padding: 11px 20px; border-radius: 10px;
          font-size: 0.875rem; font-weight: 700;
          text-decoration: none; white-space: nowrap;
          transition: background .15s, transform .12s;
        }
        .db-join-btn:hover { background: #5b6de8; transform: translateY(-1px); }

        /* Stats */
        .db-stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        .db-stat {
          background: #fff; border-radius: 14px; padding: 18px 20px;
          display: flex; align-items: center; gap: 16px;
          border: 1px solid #eaecf5; box-shadow: 0 1px 4px rgba(0,0,0,.04);
        }
        .db-stat-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          color: var(--accent);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .db-stat-val   { font-size: 1.4rem; font-weight: 800; color: #0f172a; line-height: 1; }
        .db-stat-label { font-size: 0.75rem; color: #64748b; margin-top: 3px; }

        /* Section */
        .db-section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }
        .db-section-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .db-see-all { font-size: 0.8rem; font-weight: 600; color: #727EFD; text-decoration: none; }
        .db-see-all:hover { text-decoration: underline; }

        /* Token cards */
        .db-token-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px;
        }
        .db-token-card {
          background: #fff; border-radius: 14px; padding: 18px 18px 16px;
          border: 1px solid #eaecf5; box-shadow: 0 1px 4px rgba(0,0,0,.04);
          display: flex; flex-direction: column; gap: 10px;
        }
        .db-token-top { display: flex; align-items: center; justify-content: space-between; }
        .db-token-num { font-size: 1.8rem; font-weight: 900; color: #727EFD; line-height: 1; }
        .db-token-status {
          font-size: 0.7rem; font-weight: 700; padding: 3px 9px;
          border-radius: 20px; text-transform: uppercase; letter-spacing: .05em;
        }
        .db-token-status--waiting { background: #fef9c3; color: #854d0e; }
        .db-token-status--serving { background: #dcfce7; color: #166534; }
        .db-token-status--done    { background: #f1f5f9; color: #64748b; }
        .db-token-queue { font-size: 0.8rem; font-weight: 600; color: #374151; }
        .db-token-meta  { font-size: 0.75rem; color: #94a3b8; }

        /* Queue list */
        .db-queue-list { display: flex; flex-direction: column; gap: 10px; }
        .db-queue-row {
          background: #fff; border-radius: 12px; padding: 14px 18px;
          border: 1px solid #eaecf5;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,.03);
          transition: box-shadow .15s; text-decoration: none; color: inherit;
        }
        .db-queue-row:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }
        .db-queue-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .db-queue-dot--active { background: #22c55e; }
        .db-queue-dot--paused { background: #f97316; }
        .db-queue-dot--closed { background: #94a3b8; }
        .db-queue-info { flex: 1; min-width: 0; }
        .db-queue-name { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
        .db-queue-meta { font-size: 0.76rem; color: #64748b; margin-top: 2px; }
        .db-queue-count { font-size: 0.9rem; font-weight: 800; color: #727EFD; white-space: nowrap; }
        .db-queue-arrow { color: #94a3b8; flex-shrink: 0; }
        .db-queue-action {
          padding: 6px 14px; border-radius: 7px;
          font-size: 0.75rem; font-weight: 700;
          background: #FEB600; color: #0f172a;
          border: none; cursor: pointer; transition: background .15s;
        }
        .db-queue-action:hover { background: #e5a500; }

        /* Location cards (patient) */
        .db-loc-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px;
        }
        .db-loc-card {
          background: #fff; border-radius: 14px; padding: 18px;
          border: 1px solid #eaecf5; box-shadow: 0 1px 4px rgba(0,0,0,.04);
          display: flex; flex-direction: column; gap: 8px;
          transition: box-shadow .15s;
        }
        .db-loc-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }
        .db-loc-icon-row { display: flex; align-items: center; gap: 10px; }
        .db-loc-icon-wrap {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(114,126,253,.10); color: #727EFD;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .db-loc-name { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
        .db-loc-addr { font-size: 0.78rem; color: #64748b; line-height: 1.4; }
        .db-loc-city { font-size: 0.75rem; color: #94a3b8; }
        .db-loc-footer { display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
        .db-loc-phone { font-size: 0.75rem; color: #374151; font-weight: 500; }
        .db-loc-map-link {
          font-size: 0.72rem; font-weight: 700; color: #727EFD;
          text-decoration: none; margin-left: auto;
        }
        .db-loc-map-link:hover { text-decoration: underline; }

        /* Empty states */
        .db-empty {
          background: #fff; border-radius: 14px; border: 1.5px dashed #dde1f0;
          padding: 36px 24px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          text-align: center;
        }
        .db-empty-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: rgba(114,126,253,.1); color: #727EFD;
          display: flex; align-items: center; justify-content: center;
        }
        .db-empty-text { font-size: 0.875rem; color: #64748b; }
        .db-empty-cta {
          padding: 8px 18px; border-radius: 8px;
          background: #727EFD; color: #fff;
          font-size: 0.8rem; font-weight: 700;
          text-decoration: none; margin-top: 4px; transition: background .15s;
        }
        .db-empty-cta:hover { background: #5b6de8; }

        /* Skeletons */
        .db-skeleton-row { display: flex; gap: 14px; }
        .db-skeleton {
          background: linear-gradient(90deg, #f0f2fa 25%, #e4e7f5 50%, #f0f2fa 75%);
          background-size: 200% 100%;
          animation: db-shimmer 1.4s ease infinite;
          border-radius: 12px;
        }
        .db-skeleton--card  { height: 110px; flex: 1; }
        .db-skeleton--queue { height: 60px; flex: 1; }
        @keyframes db-shimmer { to { background-position: -200% 0; } }

        .db-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 45; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .db-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .db-sidebar {
            position: fixed; left: 0; top: 0; height: 100vh;
            transform: translateX(-100%); box-shadow: 4px 0 20px rgba(0,0,0,.12);
          }
          .db-sidebar--open { transform: translateX(0); }
          .db-hamburger { display: flex; }
          .db-content { padding: 20px 16px 40px; }
          .db-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .db-greeting-text { font-size: 1.2rem; }
          .db-loc-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .db-stats-grid { grid-template-columns: 1fr 1fr; }
          .db-token-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TokenCard({ token }) {
  const statusClass = {
    waiting:   "db-token-status--waiting",
    serving:   "db-token-status--serving",
    completed: "db-token-status--done",
    no_show:   "db-token-status--done",
  }[token.status] ?? "db-token-status--waiting";

  return (
    <div className="db-token-card">
      <div className="db-token-top">
        <span className="db-token-num">#{token.token_number ?? "—"}</span>
        <span className={`db-token-status ${statusClass}`}>{token.status ?? "waiting"}</span>
      </div>
      <p className="db-token-queue">Queue date: {token.queue_date ?? "—"}</p>
      <p className="db-token-meta">
        {token.status === "waiting"
          ? "Waiting in queue"
          : token.status === "serving"
          ? "You're being served now!"
          : "Completed"}
      </p>
    </div>
  );
}

function QueueRow({ queue, isStaff }) {
  const dotClass = {
    active: "db-queue-dot--active",
    paused: "db-queue-dot--paused",
    closed: "db-queue-dot--closed",
  }[queue.status] ?? "db-queue-dot--active";

  // FIX 2: correct links to manage-queue / my-queue pages
  const href = isStaff
    ? `/dashboard/manage-queue?queue_id=${queue.queue_id}`
    : `/dashboard/my-queue?queue_id=${queue.queue_id}`;

  return (
    <Link to={href} className="db-queue-row">
      <div className={`db-queue-dot ${dotClass}`} />
      <div className="db-queue-info">
        <p className="db-queue-name">{queue.service_name ?? `Queue #${queue.queue_id}`}</p>
        <p className="db-queue-meta">{queue.queue_date ?? "—"}</p>
      </div>
      <span className="db-queue-count">
        {queue.waiting_tokens ?? queue.waiting ?? 0} waiting
      </span>
      {isStaff ? (
        <button className="db-queue-action" onClick={(e) => e.preventDefault()}>
          Manage
        </button>
      ) : (
        <span className="db-queue-arrow"><ChevronRight /></span>
      )}
    </Link>
  );
}

// FIX 3: LocationCard uses OpenStreetMap link
function LocationCard({ loc }) {
  const mapUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    `${loc.address}, ${loc.city}, ${loc.state}`
  )}`;

  return (
    <div className="db-loc-card">
      <div className="db-loc-icon-row">
        <div className="db-loc-icon-wrap"><LocationIcon /></div>
        <p className="db-loc-name">{loc.name}</p>
      </div>
      <p className="db-loc-addr">{loc.address}</p>
      <p className="db-loc-city">{loc.city}, {loc.state}</p>
      <div className="db-loc-footer">
        {loc.phone && <span className="db-loc-phone">📞 {loc.phone}</span>}
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="db-loc-map-link">
          View on Map →
        </a>
      </div>
    </div>
  );
}

const selectorStyle = {
  padding: "10px 14px", borderRadius: "10px",
  border: "1px solid #eaecf5", fontSize: "0.875rem",
  fontWeight: 600, color: "#374151",
  background: "#fff", cursor: "pointer",
  minWidth: "200px", boxShadow: "0 1px 3px rgba(0,0,0,.05)",
};

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const s = {
  width: 18, height: 18, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 2,
  strokeLinecap: "round", strokeLinejoin: "round",
};

function HomeIcon()      { return <svg {...s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function QueueIcon()     { return <svg {...s}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function TicketIcon()    { return <svg {...s}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>; }
function UserIcon()      { return <svg {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function LogoutIcon()    { return <svg {...s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function PlusIcon()      { return <svg {...s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function PeopleIcon()    { return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function ClockIcon()     { return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function CheckIcon()     { return <svg {...s}><polyline points="20 6 9 17 4 12"/></svg>; }
function TimerIcon()     { return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12"/><line x1="15.5" y1="9.5" x2="12" y2="12"/></svg>; }
function PatientIcon()   { return <svg {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function StaffIcon()     { return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function HamburgerIcon() { return <svg {...s}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function ChevronRight()  { return <svg {...s}><polyline points="9 18 15 12 9 6"/></svg>; }
function LocationIcon()  { return <svg {...s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }