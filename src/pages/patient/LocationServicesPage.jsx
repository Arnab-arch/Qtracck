import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
// import { getServices, getServiceQueues } from "../../services/serviceService";
// import { getLocationById } from "../../services/locationService";
import { locationsAPI, servicesAPI } from "../../services/api";
 import logo from "../../assets/images/logo.png"

export default function LocationServicesPage() {
  const { locationId } = useParams();
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinModal, setJoinModal] = useState(null); // { queueId, serviceName }

  useEffect(() => {
    Promise.all([
    locationsAPI.getById(locationId),
    servicesAPI.getByLocation(locationId)
])
      .then(([locRes, svcRes]) => {
        setLocation(locRes.data.data);
        setServices(svcRes.data.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locationId]);

  return (
    <div className="ls-root">

      {/* ── TOPBAR ── */}
      <header className="ls-topbar">
        <Link to="/" className="ls-logo-link">
          <img src={logo} alt="QTrack" className="ls-logo" />
          <span className="ls-brand">QTrack</span>
        </Link>
        <button className="ls-back-btn" onClick={() => navigate("/locations")}>
          ← All Locations
        </button>
      </header>

      {/* ── LOCATION HERO ── */}
      <div className="ls-hero">
        {loading ? (
          <div className="ls-hero-skeleton" />
        ) : (
          <div className="ls-hero-inner">
            <div className="ls-hero-icon">
              <LocationIcon size={28} />
            </div>
            <div className="ls-hero-info">
              <p className="ls-hero-eyebrow">You are browsing</p>
              <h1 className="ls-hero-name">{location?.name}</h1>
              <div className="ls-hero-meta">
                {location?.address && (
                  <span className="ls-hero-meta-item">
                    <MapIcon /> {location.address}
                  </span>
                )}
                <span className="ls-hero-meta-item">
                  <PinIcon /> {[location?.city, location?.state].filter(Boolean).join(", ")}
                </span>
                {location?.phone && (
                  <span className="ls-hero-meta-item">
                    <PhoneIcon /> {location.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="ls-body">

        <div className="ls-section-header">
          <div>
            <h2 className="ls-section-title">Available Services</h2>
            <p className="ls-section-sub">
              Pick a service to see today's queue and join it instantly.
            </p>
          </div>
          {!loading && (
            <span className="ls-count-badge">
              {services.length} service{services.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="ls-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ls-skeleton" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && services.length === 0 && (
          <div className="ls-empty">
            <div className="ls-empty-icon"><ServicesIcon size={28} /></div>
            <p className="ls-empty-title">No services available</p>
            <p className="ls-empty-sub">This location has no active services yet.</p>
            <button className="ls-empty-btn" onClick={() => navigate("/locations")}>
              ← Back to Locations
            </button>
          </div>
        )}

        {/* Service cards */}
        {!loading && services.length > 0 && (
          <div className="ls-grid">
            {services.map((svc) => (
              <ServiceCard
                key={svc.service_id}
                service={svc}
                onJoin={(queueId) =>
                  setJoinModal({ queueId, serviceName: svc.service_name })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ── JOIN MODAL ── */}
      {joinModal && (
        <JoinQueueModal
          queueId={joinModal.queueId}
          serviceName={joinModal.serviceName}
          onClose={() => setJoinModal(null)}
        />
      )}

      {/* ── STYLES ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ls-root {
          min-height: 100vh;
          background: #f4f5fb;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        /* TOPBAR */
        .ls-topbar {
          position: sticky; top: 0; z-index: 40;
          background: #fff; border-bottom: 1px solid #eaecf5;
          padding: 0 32px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ls-logo-link { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .ls-logo  { width: 34px; height: 34px; object-fit: contain; border-radius: 7px; }
        .ls-brand { font-size: 1.1rem; font-weight: 800; color: #727EFD; }
        .ls-back-btn {
          font-size: 0.82rem; font-weight: 600; color: #727EFD;
          padding: 7px 16px; border-radius: 8px;
          border: 1.5px solid #727EFD; background: none; cursor: pointer;
          transition: all 0.15s;
        }
        .ls-back-btn:hover { background: #727EFD; color: #fff; }

        /* HERO */
        .ls-hero {
          background: #727EFD; padding: 36px 32px 32px;
        }
        .ls-hero-skeleton {
          height: 80px; border-radius: 14px;
          background: rgba(255,255,255,0.15);
          animation: ls-pulse 1.4s ease infinite alternate;
        }
        @keyframes ls-pulse { from { opacity: 0.5; } to { opacity: 1; } }

        .ls-hero-inner {
          max-width: 1060px; margin: 0 auto;
          display: flex; align-items: flex-start; gap: 18px;
        }
        .ls-hero-icon {
          width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0;
          background: rgba(255,255,255,0.18); color: #fff;
          display: flex; align-items: center; justify-content: center;
          margin-top: 2px;
        }
        .ls-hero-eyebrow {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 4px;
        }
        .ls-hero-name {
          font-size: 1.75rem; font-weight: 900; color: #fff; line-height: 1.2;
        }
        .ls-hero-meta {
          display: flex; flex-wrap: wrap; gap: 14px; margin-top: 10px;
        }
        .ls-hero-meta-item {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.8rem; color: rgba(255,255,255,0.8);
        }
        .ls-hero-meta-item svg { flex-shrink: 0; opacity: 0.8; }

        /* BODY */
        .ls-body {
          max-width: 1060px; margin: 0 auto;
          padding: 32px 24px 64px;
          display: flex; flex-direction: column; gap: 20px;
        }
        .ls-section-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .ls-section-title { font-size: 1.15rem; font-weight: 800; color: #0f172a; }
        .ls-section-sub   { font-size: 0.82rem; color: #64748b; margin-top: 3px; }
        .ls-count-badge {
          background: rgba(114,126,253,0.1); color: #727EFD;
          font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 20px;
          white-space: nowrap;
        }

        /* GRID */
        .ls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 16px;
        }

        /* SKELETON */
        .ls-skeleton {
          height: 220px; border-radius: 16px;
          background: linear-gradient(90deg, #f0f2fa 25%, #e4e7f5 50%, #f0f2fa 75%);
          background-size: 200% 100%;
          animation: ls-shimmer 1.4s ease infinite;
        }
        @keyframes ls-shimmer { to { background-position: -200% 0; } }

        /* EMPTY */
        .ls-empty {
          background: #fff; border-radius: 16px;
          border: 1.5px dashed #dde1f0; padding: 56px 24px;
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; text-align: center;
        }
        .ls-empty-icon {
          width: 56px; height: 56px; border-radius: 14px;
          background: rgba(114,126,253,0.1); color: #727EFD;
          display: flex; align-items: center; justify-content: center;
        }
        .ls-empty-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .ls-empty-sub   { font-size: 0.875rem; color: #64748b; }
        .ls-empty-btn {
          margin-top: 4px; padding: 9px 20px; border-radius: 9px;
          background: #727EFD; color: #fff; border: none; cursor: pointer;
          font-size: 0.82rem; font-weight: 700; transition: background 0.15s;
        }
        .ls-empty-btn:hover { background: #5b6de8; }

        /* SERVICE CARD */
        .svc-card {
          background: #fff; border-radius: 16px;
          border: 1px solid #eaecf5;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          display: flex; flex-direction: column;
          transition: box-shadow 0.18s, transform 0.15s;
          overflow: hidden;
        }
        .svc-card:hover {
          box-shadow: 0 8px 28px rgba(114,126,253,0.12);
          transform: translateY(-2px);
        }
        .svc-card-top {
          padding: 20px 20px 16px;
          display: flex; flex-direction: column; gap: 10px; flex: 1;
        }
        .svc-card-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 10px;
        }
        .svc-card-icon {
          width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
          background: rgba(114,126,253,0.1); color: #727EFD;
          display: flex; align-items: center; justify-content: center;
        }
        .svc-card-active-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #22c55e; flex-shrink: 0; margin-top: 6px;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
        }
        .svc-card-name {
          font-size: 1rem; font-weight: 800; color: #0f172a; line-height: 1.3;
          flex: 1;
        }
        .svc-card-desc {
          font-size: 0.82rem; color: #64748b; line-height: 1.5;
        }
        .svc-card-wait {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(254,182,0,0.1); border: 1px solid rgba(254,182,0,0.25);
          border-radius: 8px; padding: 6px 10px;
          font-size: 0.78rem; font-weight: 700; color: #92400e;
          width: fit-content;
        }
        .svc-card-wait svg { color: #FEB600; }

        /* Queue status strip */
        .svc-queue-strip {
          border-top: 1px solid #f1f5f9;
          padding: 14px 20px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .svc-queue-stats {
          display: flex; gap: 16px;
        }
        .svc-queue-stat {
          display: flex; flex-direction: column; align-items: center;
          gap: 1px;
        }
        .svc-queue-stat-val {
          font-size: 1.1rem; font-weight: 900; color: #0f172a; line-height: 1;
        }
        .svc-queue-stat-val--waiting { color: #FEB600; }
        .svc-queue-stat-val--serving { color: #22c55e; }
        .svc-queue-stat-lbl {
          font-size: 0.65rem; font-weight: 600; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .svc-join-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 9px;
          background: #FEB600; border: none; cursor: pointer;
          font-size: 0.8rem; font-weight: 800; color: #111827;
          transition: background 0.15s, transform 0.12s; flex-shrink: 0;
        }
        .svc-join-btn:hover { background: #e5a500; transform: translateY(-1px); }

        /* No queue strip */
        .svc-no-queue {
          border-top: 1px solid #f1f5f9;
          padding: 12px 20px;
          display: flex; align-items: center; gap: 8px;
          font-size: 0.8rem; color: #94a3b8; font-weight: 500;
        }

        /* Queue loading */
        .svc-queue-loading {
          border-top: 1px solid #f1f5f9; padding: 14px 20px;
          display: flex; align-items: center; gap: 8px;
          font-size: 0.8rem; color: #94a3b8;
        }
        .svc-spin {
          width: 13px; height: 13px;
          border: 2px solid #e2e8f0; border-top-color: #727EFD;
          border-radius: 50%; animation: svc-spin 0.65s linear infinite;
          display: inline-block; flex-shrink: 0;
        }
        @keyframes svc-spin { to { transform: rotate(360deg); } }

        /* JOIN MODAL */
        .jm-overlay {
          position: fixed; inset: 0; z-index: 80;
          background: rgba(15,23,42,0.45); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
          animation: jm-fade 0.2s ease;
        }
        @keyframes jm-fade { from { opacity: 0; } to { opacity: 1; } }
        .jm-card {
          background: #fff; border-radius: 20px;
          width: 100%; max-width: 420px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18);
          display: flex; flex-direction: column; gap: 0;
          animation: jm-slide 0.22s ease;
          overflow: hidden;
        }
        @keyframes jm-slide {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .jm-header {
          padding: 24px 24px 0;
          display: flex; align-items: flex-start; justify-content: space-between;
        }
        .jm-title-group { display: flex; flex-direction: column; gap: 4px; }
        .jm-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
        .jm-sub   { font-size: 0.82rem; color: #64748b; }
        .jm-close {
          background: none; border: none; cursor: pointer;
          color: #94a3b8; padding: 4px; border-radius: 6px;
          transition: color 0.15s, background 0.15s; flex-shrink: 0;
        }
        .jm-close:hover { color: #374151; background: #f1f5f9; }
        .jm-body {
          padding: 20px 24px 24px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .jm-info-row {
          display: flex; align-items: center; gap: 10px;
          background: rgba(114,126,253,0.06); border: 1px solid rgba(114,126,253,0.15);
          border-radius: 10px; padding: 12px 14px;
        }
        .jm-info-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          background: rgba(114,126,253,0.12); color: #727EFD;
          display: flex; align-items: center; justify-content: center;
        }
        .jm-info-name { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
        .jm-info-id   { font-size: 0.74rem; color: #64748b; margin-top: 1px; }
        .jm-field { display: flex; flex-direction: column; gap: 6px; }
        .jm-label {
          font-size: 0.74rem; font-weight: 700; color: #374151;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .jm-input {
          padding: 11px 14px; border: 1.5px solid #e2e8f0;
          border-radius: 10px; font-size: 0.93rem; color: #0f172a;
          background: #f8fafc; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .jm-input:focus {
          border-color: #727EFD; background: #fff;
          box-shadow: 0 0 0 3px rgba(114,126,253,0.12);
        }
        .jm-input::placeholder { color: #94a3b8; }
        .jm-footer {
          padding: 0 24px 24px;
          display: flex; gap: 10px;
        }
        .jm-cancel-btn {
          flex: 1; padding: 12px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          background: #fff; color: #64748b;
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          transition: all 0.15s;
        }
        .jm-cancel-btn:hover { border-color: #94a3b8; color: #374151; }
        .jm-confirm-btn {
          flex: 2; padding: 12px;
          background: #FEB600; border: none; border-radius: 10px;
          font-size: 0.875rem; font-weight: 800; color: #111827;
          cursor: pointer; transition: background 0.15s, transform 0.12s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .jm-confirm-btn:hover:not(:disabled) { background: #e5a500; transform: translateY(-1px); }
        .jm-confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* SUCCESS TICKET */
        .jm-ticket {
          margin: 0 24px 24px;
          background: linear-gradient(135deg, #727EFD 0%, #5b6de8 100%);
          border-radius: 14px; padding: 24px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          text-align: center;
        }
        .jm-ticket-label {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.75);
        }
        .jm-ticket-num {
          font-size: 3rem; font-weight: 900; color: #FEB600; line-height: 1;
        }
        .jm-ticket-service {
          font-size: 0.875rem; color: rgba(255,255,255,0.85); font-weight: 500;
        }
        .jm-ticket-done-btn {
          margin-top: 8px; padding: 9px 24px; border-radius: 9px;
          background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
          color: #fff; font-size: 0.82rem; font-weight: 700; cursor: pointer;
          transition: background 0.15s;
        }
        .jm-ticket-done-btn:hover { background: rgba(255,255,255,0.3); }

        /* RESPONSIVE */
        @media (max-width: 640px) {
          .ls-topbar { padding: 0 16px; }
          .ls-hero   { padding: 28px 16px 24px; }
          .ls-hero-name { font-size: 1.35rem; }
          .ls-body   { padding: 24px 16px 48px; }
          .ls-grid   { grid-template-columns: 1fr; }
          .ls-hero-meta { gap: 8px; }
        }
      `}</style>
    </div>
  );
}

// ── Service Card ──────────────────────────────────────────
function ServiceCard({ service, onJoin }) {
  const [queue, setQueue] = useState(null);
  const [queueLoading, setQueueLoading] = useState(true);

  useEffect(() => {
    getServiceQueues(service.service_id)
      .then((res) => {
        const active = (res.data.data ?? []).find((q) => q.status === "active");
        setQueue(active || null);
      })
      .catch(() => setQueue(null))
      .finally(() => setQueueLoading(false));
  }, [service.service_id]);

  return (
    <div className="svc-card">
      <div className="svc-card-top">
        <div className="svc-card-header">
          <div className="svc-card-icon">
            <ServicesIcon size={20} />
          </div>
          <p className="svc-card-name">{service.service_name}</p>
          {queue && <div className="svc-card-active-dot" />}
        </div>

        {service.description && (
          <p className="svc-card-desc">{service.description}</p>
        )}

        <div className="svc-card-wait">
          <ClockIcon size={13} />
          Avg wait: {service.avg_service_time ?? "—"} mins
        </div>
      </div>

      {/* Queue strip */}
      {queueLoading ? (
        <div className="svc-queue-loading">
          <span className="svc-spin" /> Loading queue…
        </div>
      ) : queue ? (
        <div className="svc-queue-strip">
          <div className="svc-queue-stats">
            <div className="svc-queue-stat">
              <span className={`svc-queue-stat-val svc-queue-stat-val--waiting`}>
                {queue.waiting ?? 0}
              </span>
              <span className="svc-queue-stat-lbl">Waiting</span>
            </div>
            <div className="svc-queue-stat">
              <span className={`svc-queue-stat-val svc-queue-stat-val--serving`}>
                {queue.serving ?? 0}
              </span>
              <span className="svc-queue-stat-lbl">Serving</span>
            </div>
            <div className="svc-queue-stat">
              <span className="svc-queue-stat-val">
                {queue.completed ?? 0}
              </span>
              <span className="svc-queue-stat-lbl">Done</span>
            </div>
          </div>
          <button className="svc-join-btn" onClick={() => onJoin(queue.queue_id)}>
            <TicketIcon /> Join
          </button>
        </div>
      ) : (
        <div className="svc-no-queue">
          <SleepIcon /> No active queue today
        </div>
      )}
    </div>
  );
}

// ── Join Queue Modal ──────────────────────────────────────
function JoinQueueModal({ queueId, serviceName, onClose }) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null); // assigned token number

  const handleJoin = async () => {
    setLoading(true);
    try {
      // Replace this with your actual joinQueue API call:
      // const res = await joinQueue({ queue_id: queueId, phone, email }, authToken);
      // setToken(res.data.token_number);

      // Mock for now:
      await new Promise((r) => setTimeout(r, 900));
      setToken(Math.floor(Math.random() * 80) + 1);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="jm-card">
        <div className="jm-header">
          <div className="jm-title-group">
            <p className="jm-title">{token ? "You're in!" : "Join Queue"}</p>
            <p className="jm-sub">
              {token
                ? "Your token has been assigned."
                : "Enter your contact details to get a token."}
            </p>
          </div>
          <button className="jm-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {token ? (
          /* ── SUCCESS TICKET ── */
          <div className="jm-ticket">
            <p className="jm-ticket-label">Your Token Number</p>
            <p className="jm-ticket-num">#{token}</p>
            <p className="jm-ticket-service">{serviceName}</p>
            <button className="jm-ticket-done-btn" onClick={onClose}>
              Done ✓
            </button>
          </div>
        ) : (
          <>
            <div className="jm-body">
              {/* Queue info row */}
              <div className="jm-info-row">
                <div className="jm-info-icon"><ServicesIcon size={17} /></div>
                <div>
                  <p className="jm-info-name">{serviceName}</p>
                  <p className="jm-info-id">Queue #{queueId}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="jm-field">
                <label className="jm-label">Phone number</label>
                <input
                  type="tel"
                  className="jm-input"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="jm-field">
                <label className="jm-label">Email (optional)</label>
                <input
                  type="email"
                  className="jm-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="jm-footer">
              <button className="jm-cancel-btn" onClick={onClose}>Cancel</button>
              <button
                className="jm-confirm-btn"
                onClick={handleJoin}
                disabled={loading || !phone.trim()}
              >
                {loading
                  ? <><span className="svc-spin" /> Getting token…</>
                  : <><TicketIcon /> Get My Token</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── SVG Icons ─────────────────────────────────────────────
const ic = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

function LocationIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...ic}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function ServicesIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...ic}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function ClockIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" {...ic}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function TicketIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" {...ic}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>;
}
function MapIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" {...ic}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
}
function PinIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" {...ic}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function PhoneIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" {...ic}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.06 6.06l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function SleepIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" {...ic}><path d="M17 17H7V7"/><path d="M7 17L17 7"/></svg>;
}
function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" {...ic}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}