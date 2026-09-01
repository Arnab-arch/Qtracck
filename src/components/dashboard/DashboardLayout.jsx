import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";


const NAV = {
  visitor: [
    { to: "/dashboard",          icon: <GridIcon />,      label: "Dashboard"   },
    { to: "/dashboard/locations",icon: <MapPinIcon />,    label: "Locations"   },
    { to: "/dashboard/services", icon: <LayersIcon />,    label: "Services"    },
    { to: "/dashboard/join",     icon: <PlusCircleIcon />,label: "Join Queue"  },
    { to: "/dashboard/my-queue", icon: <ClockIcon />,     label: "My Queue"    },
    { to: "/dashboard/my-tokens",icon: <TicketIcon />,    label: "My Tokens"   },
    { to: "/dashboard/profile",  icon: <UserIcon />,      label: "Profile"     },
  ],
  staff: [
    { to: "/dashboard",                  icon: <GridIcon />,      label: "Dashboard"         },
    { to: "/dashboard/manage-locations", icon: <MapPinIcon />,    label: "Manage Locations"  },
    { to: "/dashboard/manage-services",  icon: <LayersIcon />,    label: "Manage Services"   },
    { to: "/dashboard/manage-queues",    icon: <ClockIcon />,     label: "Manage Queues"     },
    { to: "/dashboard/manage-tokens",    icon: <TicketIcon />,    label: "Manage Tokens"     },
    { to: "/dashboard/analytics",        icon: <BarChartIcon />,  label: "Analytics"         },
    { to: "/dashboard/profile",          icon: <UserIcon />,      label: "Profile"           },
  ],
  admin: [
    { to: "/dashboard",                  icon: <GridIcon />,      label: "Dashboard"         },
    { to: "/dashboard/manage-locations", icon: <MapPinIcon />,    label: "Manage Locations"  },
    { to: "/dashboard/manage-services",  icon: <LayersIcon />,    label: "Manage Services"   },
    { to: "/dashboard/manage-queues",    icon: <ClockIcon />,     label: "Manage Queues"     },
    { to: "/dashboard/manage-tokens",    icon: <TicketIcon />,    label: "Manage Tokens"     },
    { to: "/dashboard/analytics",        icon: <BarChartIcon />,  label: "Analytics"         },
    { to: "/dashboard/profile",          icon: <UserIcon />,      label: "Profile"           },
  ],
};


const ROLE_BADGE = {
  visitor: { label: "Patient",       bg: "#e0f2fe", color: "#0369a1" },
  staff:   { label: "Staff",         bg: "#fef3c7", color: "#b45309" },
  admin:   { label: "Administrator", bg: "#f3e8ff", color: "#7e22ce" },
};


export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role || "visitor";
  const navItems = NAV[role] || NAV.visitor;
  const badge = ROLE_BADGE[role] || ROLE_BADGE.visitor;
  
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dl-root">

      {mobileOpen && (
        <div className="dl-overlay" onClick={() => setMobileOpen(false)} />
      )}

     
      <aside className={`dl-sidebar ${sidebarOpen ? "dl-sidebar--open" : "dl-sidebar--collapsed"} ${mobileOpen ? "dl-sidebar--mobile-open" : ""}`}>

        
        <div className="dl-brand">
          <img src={logo} alt="QTrack" className="dl-logo" />
          {sidebarOpen && <span className="dl-brand-name">QTrack</span>}
        </div>

       
        <nav className="dl-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `dl-nav-item ${isActive ? "dl-nav-item--active" : ""}`
              }
              title={!sidebarOpen ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <span className="dl-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="dl-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        
        <div className="dl-user-card">
          <div className="dl-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {sidebarOpen && (
            <div className="dl-user-info">
              <p className="dl-user-name">{user?.name || "User"}</p>
              <span className="dl-role-badge" style={{ background: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            </div>
          )}
        </div>
      </aside>

      
      <div className="dl-main">

    
        <header className="dl-topbar">
          <div className="dl-topbar-left">
            {/* Mobile hamburger */}
            <button className="dl-hamburger dl-hamburger--mobile" onClick={() => setMobileOpen(!mobileOpen)}>
              <HamburgerIcon />
            </button>
            {/* Desktop collapse */}
            <button className="dl-hamburger dl-hamburger--desktop" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <HamburgerIcon />
            </button>
            <div className="dl-topbar-search-wrapper">
  
</div>
          </div>

          <div className="dl-topbar-right">
            <button className="dl-topbar-btn" title="Notifications">
              <BellIcon />
              <span className="dl-notif-dot" />
            </button>
            <button className="dl-topbar-btn dl-logout-btn" onClick={handleLogout} title="Log out">
              <LogoutIcon />
              <span className="dl-logout-label">Log out</span>
            </button>
          </div>
        </header>

      
        <main className="dl-content">
          {children}
        </main>
      </div>

      <style>{`
        /* ── TOKENS ── */
        :root {
          --brand:       #727EFD;
          --brand-dark:  #5a67f2;
          --gold:        #FEB600;
          --sidebar-w:   248px;
          --sidebar-c:   72px;
          --topbar-h:    64px;
          --bg:          #f0f2ff;
          --surface:     #ffffff;
          --border:      #e8eaf6;
          --text-1:      #0f172a;
          --text-2:      #475569;
          --text-3:      #94a3b8;
          --radius:      14px;
          --shadow:      0 2px 12px rgba(114,126,253,0.10);
        }

        /* ── RESET / SHELL ── */
        *, *::before, *::after { box-sizing: border-box; }
        .dl-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* ── SIDEBAR ── */
        .dl-sidebar {
          position: fixed; left: 0; top: 0; bottom: 0;
          width: var(--sidebar-w);
          background: var(--brand);
          display: flex; flex-direction: column;
          transition: width 0.25s cubic-bezier(.4,0,.2,1);
          z-index: 100;
          overflow: hidden;
        }
        .dl-sidebar--collapsed { width: var(--sidebar-c); }
        .dl-sidebar--collapsed .dl-brand-name,
        .dl-sidebar--collapsed .dl-nav-label,
        .dl-sidebar--collapsed .dl-user-info { display: none; }

        /* Brand */
        .dl-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          flex-shrink: 0;
        }
        .dl-logo {
          width: 36px; height: 36px; object-fit: contain;
          border-radius: 8px; flex-shrink: 0;
          background: rgba(255,255,255,0.15);
        }
        .dl-brand-name {
          font-size: 1.1rem; font-weight: 800;
          color: #fff; letter-spacing: -0.02em;
          white-space: nowrap;
        }

        /* Nav */
        .dl-nav {
          flex: 1; padding: 12px 10px;
          display: flex; flex-direction: column; gap: 2px;
          overflow-y: auto; overflow-x: hidden;
        }
        .dl-nav::-webkit-scrollbar { width: 0; }
        .dl-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          text-decoration: none;
          color: rgba(255,255,255,0.75);
          font-size: 0.88rem; font-weight: 500;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .dl-nav-item:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
        }
        .dl-nav-item--active {
          background: rgba(255,255,255,0.18);
          color: #fff;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .dl-nav-icon {
          width: 20px; height: 20px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .dl-nav-icon svg { width: 18px; height: 18px; }
        .dl-nav-label { overflow: hidden; text-overflow: ellipsis; }

        /* User card */
        .dl-user-card {
          padding: 12px 14px 16px;
          border-top: 1px solid rgba(255,255,255,0.12);
          display: flex; align-items: center; gap: 10px;
          flex-shrink: 0;
        }
        .dl-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--gold); color: #111827;
          font-size: 0.85rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .dl-user-info { min-width: 0; }
        .dl-user-name {
          font-size: 0.82rem; font-weight: 700; color: #fff;
          margin: 0 0 3px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .dl-role-badge {
          font-size: 0.65rem; font-weight: 700;
          padding: 2px 7px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.04em;
          white-space: nowrap;
        }

        /* ── MAIN ── */
        .dl-main {
          margin-left: var(--sidebar-w);
          flex: 1; min-width: 0;
          display: flex; flex-direction: column;
          transition: margin-left 0.25s cubic-bezier(.4,0,.2,1);
        }
        .dl-sidebar--collapsed ~ .dl-main { margin-left: var(--sidebar-c); }

        /* Topbar */
        .dl-topbar {
          height: var(--topbar-h);
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 24px; gap: 12px;
          position: sticky; top: 0; z-index: 50;
          box-shadow: var(--shadow);
        }
        .dl-topbar-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
        .dl-topbar-right { display: flex; align-items: center; gap: 6px; }

        .dl-hamburger {
          background: none; border: none; cursor: pointer;
          color: var(--text-2); padding: 6px;
          border-radius: 8px; display: flex;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .dl-hamburger:hover { background: var(--bg); color: var(--brand); }
        .dl-hamburger--mobile { display: none; }
        .dl-hamburger--desktop { display: flex; }

        .dl-topbar-search {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg); border-radius: 10px;
          padding: 8px 12px; flex: 1; max-width: 340px;
          border: 1.5px solid transparent;
          transition: border-color 0.15s;
        }
        .dl-topbar-search:focus-within { border-color: var(--brand); }
        .dl-topbar-search svg { color: var(--text-3); flex-shrink: 0; }
        .dl-search-input {
          border: none; outline: none; background: none;
          font-size: 0.875rem; color: var(--text-1); width: 100%;
        }
        .dl-search-input::placeholder { color: var(--text-3); }

        .dl-topbar-btn {
          background: none; border: none; cursor: pointer;
          color: var(--text-2); padding: 8px;
          border-radius: 10px; display: flex; align-items: center; gap: 6px;
          font-size: 0.82rem; font-weight: 600;
          transition: background 0.15s, color 0.15s;
          position: relative;
        }
        .dl-topbar-btn:hover { background: var(--bg); color: var(--brand); }
        .dl-notif-dot {
          position: absolute; top: 7px; right: 7px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #ef4444; border: 2px solid #fff;
        }
        .dl-logout-btn { color: var(--text-2); }
        .dl-logout-btn:hover { background: #fef2f2; color: #ef4444; }
        .dl-logout-label { display: none; }

        /* Content */
        .dl-content { flex: 1; padding: 28px 28px 40px; overflow-x: hidden; }

        /* ── OVERLAY ── */
        .dl-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 99;
          background: rgba(0,0,0,0.45);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .dl-sidebar {
            transform: translateX(-100%);
            width: var(--sidebar-w) !important;
          }
          .dl-sidebar--mobile-open { transform: translateX(0); }
          .dl-main { margin-left: 0 !important; }
          .dl-hamburger--mobile { display: flex; }
          .dl-hamburger--desktop { display: none; }
          .dl-overlay { display: block; }
          .dl-logout-label { display: block; }
          .dl-content { padding: 20px 16px 32px; }
        }
        @media (min-width: 1200px) {
          .dl-logout-label { display: block; }
        }
      `}</style>
    </div>
  );
}

/* ─── SVG ICON SET ────────────────────────────────────────────────────────── */
function GridIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function MapPinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function LayersIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
}
function PlusCircleIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
}
function ClockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function TicketIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 1 0 0-4V7a2 2 0 0 1 2-2z"/></svg>;
}
function UserIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function BarChartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
}
function HamburgerIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function BellIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function LogoutIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}