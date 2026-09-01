import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { tokensAPI } from "../../services/api";

const waitColor = (w) => w <= 15 ? "#16a34a" : w <= 30 ? "#d97706" : "#ea580c";

const TOKEN_STATUS = {
  waiting:   { label: "Waiting",   dot: "#a78bfa", bg: "#f5f3ff", border: "#ddd6fe", color: "#7c3aed" },
  serving:   { label: "Serving",   dot: "#f59e0b", bg: "#fffbeb", border: "#fcd34d", color: "#d97706" },
  completed: { label: "Completed", dot: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a" },
  cancelled: { label: "Cancelled", dot: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", color: "#64748b" },
};

const FILTER_TABS = ["all", "waiting", "serving", "completed", "cancelled"];
const LIVE_STATUSES = ["waiting", "serving"]; // eta only makes sense for these

export default function MyTokensPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [tokens,  setTokens]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [selectedToken, setSelectedToken] = useState(null);

  useEffect(() => {
    tokensAPI.getMyTokens()
      .then((res) => {
        const data = res.data.data ?? res.data.tokens ?? res.data ?? [];
        setTokens(Array.isArray(data) ? data : []);
      })
      .catch(() => setTokens([]))
      .finally(() => setLoading(false));
  }, []);

  const displayed = tokens.filter(t => {
    const matchStatus = filter === "all" || t.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (t.service_name ?? "").toLowerCase().includes(q) ||
      (t.location_name ?? "").toLowerCase().includes(q) ||
      String(t.token_number).includes(q);
    return matchStatus && matchSearch;
  });

  const counts = FILTER_TABS.reduce((acc, f) => {
    acc[f] = f === "all" ? tokens.length : tokens.filter(t => t.status === f).length;
    return acc;
  }, {});

  const activeTokens  = displayed.filter(t => t.status === "waiting" || t.status === "serving");
  const historyTokens = displayed.filter(t => t.status === "completed" || t.status === "cancelled");

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 14, fontWeight: 600, padding: "6px 10px", borderRadius: 8, transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#64748b"; }}
            >
              <ChevronLeftIcon /> Back
            </button>
            <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>My Tokens</h1>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>
                {loading ? "Loading…" : `${tokens.length} token${tokens.length !== 1 ? "s" : ""} total`}
              </p>
            </div>
          </div>
          <Link
            to="/browse-queues"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12, background: "#ede9fe", color: "#7c3aed", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
          >
            <GridIcon /> Browse Queues
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span style={{ position: "absolute", left: 14, color: "#94a3b8", pointerEvents: "none", display: "flex" }}>
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by service, location, or token number…"
            style={{
              width: "100%", padding: "11px 40px", paddingLeft: 40, border: "1.5px solid #e2e8f0",
              borderRadius: 12, fontSize: 14, color: "#0f172a", background: "#fff",
              outline: "none", boxSizing: "border-box", transition: "border-color .15s, box-shadow .15s",
            }}
            onFocus={e => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
          />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 2 }}>
              <CloseIcon />
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FILTER_TABS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: filter === f ? "none" : "1.5px solid #e2e8f0",
                background: filter === f ? "#7c3aed" : "#fff",
                color: filter === f ? "#fff" : "#64748b",
                transition: "all .15s",
                boxShadow: filter === f ? "0 1px 4px rgba(124,58,237,.3)" : "none",
                display: "flex", alignItems: "center", gap: 5,
              }}>
              <span style={{ textTransform: "capitalize" }}>{f === "all" ? "All" : TOKEN_STATUS[f]?.label}</span>
              {counts[f] > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 9, background: filter === f ? "rgba(255,255,255,.3)" : "#f1f5f9",
                  color: filter === f ? "#fff" : "#64748b", fontSize: 10, fontWeight: 800,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
                }}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 60px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 140, borderRadius: 20, background: "linear-gradient(90deg,#f0f2fa 25%,#e4e7f5 50%,#f0f2fa 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease infinite" }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState filter={filter} search={search} onClear={() => { setFilter("all"); setSearch(""); }} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {activeTokens.length > 0 && (
              <section>
                <SectionLabel icon="🟢" text="Active" count={activeTokens.length} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {activeTokens.map((t, i) => (
                    <TokenCard key={t.token_id} token={t} index={i} onClick={() => setSelectedToken(t)} />
                  ))}
                </div>
              </section>
            )}

            {historyTokens.length > 0 && (
              <section>
                <SectionLabel icon="🕑" text="History" count={historyTokens.length} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {historyTokens.map((t, i) => (
                    <TokenCard key={t.token_id} token={t} index={i} muted onClick={() => setSelectedToken(t)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {selectedToken && (
        <TokenEtaModal token={selectedToken} onClose={() => setSelectedToken(null)} />
      )}

      <style>{`
        @keyframes shimmer  { to { background-position: -200% 0; } }
        @keyframes slideUp  { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulse    { 0%,100% { opacity: 1 } 50% { opacity: .6 } }
        @keyframes spin     { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  );
}

function SectionLabel({ icon, text, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: ".07em" }}>{text}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", background: "#f1f5f9", borderRadius: 8, padding: "1px 7px" }}>{count}</span>
      <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
    </div>
  );
}

/* ── Token Card — now reads FLAT fields from the real API ────── */
function TokenCard({ token: t, index, muted, onClick }) {
  const [hovered, setHovered] = useState(false);
  const meta = TOKEN_STATUS[t.status] ?? TOKEN_STATUS.cancelled;
  const isWaiting = t.status === "waiting";
  const isServing = t.status === "serving";
  const isDone = t.status === "completed";
  const isCancelled = t.status === "cancelled";
  const canShowEta = LIVE_STATUSES.includes(t.status);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 18,
        border: `1.5px solid ${hovered && !muted ? meta.border : "#e2e8f0"}`,
        padding: "18px 20px",
        display: "flex",
        alignItems: "stretch",
        gap: 18,
        cursor: "pointer",
        boxShadow: hovered && !muted ? "0 6px 20px rgba(0,0,0,.08)" : "0 1px 3px rgba(0,0,0,.04)",
        transform: hovered && !muted ? "translateY(-2px)" : "none",
        transition: "all .2s ease",
        opacity: muted ? 0.75 : 1,
        animation: `slideUp .3s ease ${index * 0.04}s both`,
      }}
    >
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minWidth: 72, background: meta.bg, borderRadius: 14,
        padding: "12px 8px", flexShrink: 0,
        border: `1px solid ${meta.border}`,
        position: "relative", overflow: "hidden",
      }}>
        {isServing && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: 14,
            background: "rgba(251,191,36,.15)",
            animation: "pulse 1.8s ease-in-out infinite",
          }} />
        )}
        <span style={{ fontSize: 9, fontWeight: 800, color: meta.color, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2, opacity: 0.7 }}>Token</span>
        <span style={{ fontSize: 26, fontWeight: 900, color: meta.color, lineHeight: 1 }}>#{t.token_number}</span>
        {(isWaiting || isServing) && (
          <span style={{
            width: 7, height: 7, borderRadius: "50%", background: meta.dot,
            display: "inline-block", marginTop: 6,
            animation: "pulse 1.5s infinite",
          }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 15, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {t.service_name ?? "Unknown Service"}
            </p>
            {t.location_name && (
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontWeight: 500, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <LocationIcon />
                {t.location_name}
              </p>
            )}
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
            borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
            background: meta.bg, color: meta.color,
            outline: `1px solid ${meta.border}`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, display: "inline-block" }} />
            {meta.label}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {isDone && <StatChip label="Result" value="✓ Done" color="#16a34a" bg="#f0fdf4" />}
          {isCancelled && <StatChip label="Result" value="Cancelled" color="#64748b" bg="#f1f5f9" />}
          {t.queue_date && (
            <StatChip
              label="Queue date"
              value={new Date(t.queue_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              color="#94a3b8" bg="#f8fafc"
            />
          )}
          {canShowEta && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed" }}>Tap for live wait time →</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, color, bg, glow }) {
  return (
    <div style={{
      background: bg, borderRadius: 10, padding: "6px 12px",
      boxShadow: glow ? `0 0 0 2px ${color}33` : "none",
    }}>
      <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color, lineHeight: 1.2, marginTop: 2 }}>{value}</p>
    </div>
  );
}

/* ── ETA Modal — fetches live data on open, guards against done tokens ── */
function TokenEtaModal({ token, onClose }) {
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const meta = TOKEN_STATUS[token.status] ?? TOKEN_STATUS.cancelled;
  const isLive = LIVE_STATUSES.includes(token.status);

  useEffect(() => {
    if (!isLive) {
      setLoading(false);
      return;
    }
    setLoading(true);
    tokensAPI.getETA(token.token_id)
      .then((res) => setEta(res.data.data))
      .catch(() => setErrorMsg("Couldn't load live wait time."))
      .finally(() => setLoading(false));
  }, [token.token_id, isLive]);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 24, padding: 24, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: meta.bg, color: meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13 }}>
              #{token.token_number}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{token.service_name ?? "Token"}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{token.location_name ?? ""}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 4 }}>
            <CloseIcon />
          </button>
        </div>

        {!isLive ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>This token is {meta.label.toLowerCase()}.</p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>Live wait time is only available for active tokens.</p>
          </div>
        ) : loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "24px 0" }}>
            <div style={{ width: 28, height: 28, border: "3px solid #ede9fe", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Fetching live wait time…</p>
          </div>
        ) : errorMsg ? (
          <p style={{ color: "#ea580c", fontSize: 13, textAlign: "center", padding: "16px 0" }}>{errorMsg}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <StatChip label="Position ahead" value={eta.position} color="#7c3aed" bg="#f5f3ff" />
              <StatChip label="Est. wait" value={`~${eta.etaMinutes}m`} color={waitColor(eta.etaMinutes ?? 0)} bg="#fffbeb" />
            </div>
            {eta.avgServiceMinutes != null && (
              <StatChip label="Avg. service time" value={`${eta.avgServiceMinutes} min/person`} color="#64748b" bg="#f8fafc" />
            )}
            {eta.distanceKm != null && (
              <div style={{ display: "flex", gap: 10 }}>
                <StatChip label="Distance" value={`${eta.distanceKm} km`} color="#0ea5e9" bg="#f0f9ff" />
                <StatChip label="Leave in" value={`${eta.leaveInMinutes}m`} color="#d97706" bg="#fffbeb" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ filter, search, onClear }) {
  const hasFilter = filter !== "all" || search;
  return (
    <div style={{ textAlign: "center", padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "#ede9fe", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
        🎫
      </div>
      <p style={{ fontWeight: 800, color: "#0f172a", fontSize: 16, margin: 0 }}>
        {hasFilter ? "No matching tokens" : "No tokens yet"}
      </p>
      <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
        {hasFilter ? "Try adjusting your search or filter." : "Join a queue to see your tokens here."}
      </p>
      {hasFilter ? (
        <button onClick={onClear}
          style={{ marginTop: 8, padding: "10px 20px", borderRadius: 12, background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
          Clear filters
        </button>
      ) : (
        <a href="/browse-queues"
          style={{ marginTop: 8, padding: "10px 20px", borderRadius: 12, background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-block" }}>
          Browse Queues →
        </a>
      )}
    </div>
  );
}

const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
function ChevronLeftIcon() { return <svg {...s}><polyline points="15 18 9 12 15 6"/></svg>; }
function SearchIcon()      { return <svg {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function CloseIcon()       { return <svg {...s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function LocationIcon()    { return <svg {...{...s, width:12, height:12}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function GridIcon()        { return <svg {...s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }