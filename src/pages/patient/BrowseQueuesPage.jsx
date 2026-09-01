import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { queuesAPI, tokensAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext.jsx";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const STATUS = {
  open: {
    label: "Open", bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e",
    badge: "color:#16a34a;background:#f0fdf4;outline:1px solid #bbf7d0;",
  },
  paused: {
    label: "Paused", bg: "#fff7ed", color: "#c2410c", dot: "#f97316",
    badge: "color:#c2410c;background:#fff7ed;outline:1px solid #fed7aa;",
  },
  closed: {
    label: "Closed", bg: "#f8fafc", color: "#64748b", dot: "#94a3b8",
    badge: "color:#64748b;background:#f1f5f9;outline:1px solid #e2e8f0;",
  },
};
const waitColor = (w) => (w <= 15 ? "#16a34a" : w <= 30 ? "#d97706" : "#ea580c");

export default function BrowseQueuesPage() {
  const { token } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTokens, setActiveTokens] = useState({});

  const joinedRoomsRef = useRef(new Set());

  const fetchQueues = async () => {
    try {
      setLoading(true);
      const res = await queuesAPI.getBrowse({ search, page: 1, limit: 20 });
      setQueues(res.data.data);
    } catch (err) {
      console.log("error in fetching queues", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueues(); }, [search]);

  // ── Join newly-seen queue rooms only (not re-join every render) ──
  useEffect(() => {
    if (!socket || !queues.length) return;
    queues.forEach((q) => {
      if (!joinedRoomsRef.current.has(q.queue_id)) {
        socket.emit("joinQueue", q.queue_id);
        joinedRoomsRef.current.add(q.queue_id);
      }
    });
  }, [socket, queues]);

  // ── Listen for live queue updates (registered once per socket) ──
  useEffect(() => {
    if (!socket) return;

    const handleupdate = (data) => {
      console.log("QUEUE UPDATE RECEIVED:", data);

      if (!data?.token?.queue_id || !data?.eta) {
        console.error("Invalid queue_updated payload:", data);
        return;
      }

      setQueues((prev) =>
        prev.map((q) =>
          q.queue_id === data.token.queue_id
            ? { ...q, waiting: data.eta.waiting, estimatedWaitMinutes: data.eta.etaMinutes }
            : q
        )
      );
    };

    socket.on("queue_updated", handleupdate);
    return () => socket.off("queue_updated", handleupdate);
  }, [socket]);

  // ── Leave every joined room on unmount ──
  useEffect(() => {
    return () => {
      if (!socket) return;
      joinedRoomsRef.current.forEach((qid) => socket.emit("leaveQueue", qid));
      joinedRoomsRef.current.clear();
    };
  }, [socket]);

  const filtered = queues.filter((q) => {
    const s = search.toLowerCase();
    return (
      (q.service_name?.toLowerCase().includes(s) ||
        q.location_name?.toLowerCase().includes(s) ||
        q.city?.toLowerCase().includes(s) ||
        q.state?.toLowerCase().includes(s)) &&
      (filterStatus === "all" || q.status === filterStatus)
    );
  });

  const openModal = async (queue) => {
    const res = await tokensAPI.getETA(queue.queue_id);
    setSelectedQueue({
      ...queue,
      waiting: res.data.data.waiting,
      estimatedWaitMinutes: res.data.data.etaMinutes,
      avgServiceMinutes: res.data.data.avgServiceMinutes,
    });
    setShowModal(true);
  };

  const handleJoined = useCallback((qid, tokenNumber, position, estimatedWait) => {
    setActiveTokens((p) => ({ ...p, [qid]: { tokenNumber, position, estimatedWait } }));
    setShowModal(false);
    setSelectedQueue(null);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 14, fontWeight: 600, padding: "6px 10px", borderRadius: 8, transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#64748b"; }}
            >
              <ChevronLeftIcon /> Back
            </button>
            <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>Browse Queues</h1>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>
                {loading ? "Loading queues…" : `${filtered.length} queue${filtered.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
          </div>
          <Link to="/my-tokens" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12, background: "#ede9fe", color: "#7c3aed", fontWeight: 700, fontSize: 13, textDecoration: "none", transition: "background .15s" }}>
            <TicketIcon /> My Tokens
          </Link>
        </div>
      </header>

      {Object.entries(activeTokens).map(([qid, tkn]) => {
        const q = queues.find((x) => x.queue_id === Number(qid));
        if (!q) return null;
        const isCalling = tkn.position === 1;
        const isDone = tkn.position === 0;
        return (
          <div key={qid} style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px 0" }}>
            <div style={{
              borderRadius: 16, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              background: isDone ? "#f0fdf4" : isCalling ? "#fffbeb" : "#f5f3ff",
              border: `1px solid ${isDone ? "#bbf7d0" : isCalling ? "#fcd34d" : "#ddd6fe"}`,
              animation: isCalling ? "pulse 2s infinite" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: isDone ? "#16a34a" : isCalling ? "#d97706" : "#7c3aed", flexShrink: 0 }}>
                  #{tkn.tokenNumber}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{q.service_name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b", marginTop: 1 }}>
                    {isDone ? "✓ Completed" : isCalling ? "🔔 It's your turn!" : `Position ${tkn.position} · ~${tkn.estimatedWait}m wait`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTokens((p) => { const n = { ...p }; delete n[qid]; return n; })}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 6, flexShrink: 0 }}
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        );
      })}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span style={{ position: "absolute", left: 14, color: "#94a3b8", pointerEvents: "none", display: "flex" }}>
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, department, or location…"
            style={{
              width: "100%", padding: "11px 40px", paddingLeft: 40, border: "1.5px solid #e2e8f0",
              borderRadius: 12, fontSize: 14, color: "#0f172a", background: "#fff",
              outline: "none", boxSizing: "border-box", transition: "border-color .15s, box-shadow .15s",
            }}
            onFocus={e => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 2 }}
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "active", "paused", "closed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              style={{
                padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: filterStatus === f ? "none" : "1.5px solid #e2e8f0",
                background: filterStatus === f ? "#7c3aed" : "#fff",
                color: filterStatus === f ? "#fff" : "#64748b",
                transition: "all .15s",
                boxShadow: filterStatus === f ? "0 1px 4px rgba(124,58,237,.3)" : "none",
              }}
            >
              {f === "all" ? "All" : STATUS[f]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 60px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 220, borderRadius: 20, background: "linear-gradient(90deg,#f0f2fa 25%,#e4e7f5 50%,#f0f2fa 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#ede9fe", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SearchIcon />
            </div>
            <p style={{ fontWeight: 800, color: "#0f172a", fontSize: 16, margin: 0 }}>No queues found</p>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Try adjusting your search or filter.</p>
            <button
              onClick={() => { setSearch(""); setFilterStatus("all"); }}
              style={{ marginTop: 8, padding: "10px 20px", borderRadius: 12, background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {filtered.map((q, i) => (
              <QueueCard
                key={q.queue_id}
                queue={q}
                index={i}
                activeToken={activeTokens[q.queue_id]}
                onJoin={() => openModal(q)}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && selectedQueue && (
        <JoinQueueModal
          queue={selectedQueue}
          token={token}
          onClose={() => { setShowModal(false); setSelectedQueue(null); }}
          onJoined={handleJoined}
        />
      )}

      <style>{`
        @keyframes shimmer  { to { background-position: -200% 0; } }
        @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp  { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes modalPop { from { opacity: 0; transform: scale(.93) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes pulse    { 0%,100% { opacity: 1 } 50% { opacity: .75 } }
        input::placeholder { color: #94a3b8; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

function QueueCard({ queue, index, activeToken, onJoin }) {
  const meta = STATUS[queue.status] ?? STATUS.closed;
  const isDisabled = queue.status !== "open";
  const hasToken = !!activeToken;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0",
        padding: 20, display: "flex", flexDirection: "column", gap: 14,
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,.1)" : "0 1px 4px rgba(0,0,0,.04)",
        transform: hovered && !isDisabled ? "translateY(-3px)" : "none",
        transition: "all .2s ease",
        opacity: isDisabled ? 0.65 : 1,
        animation: `slideUp .3s ease ${index * 0.05}s both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 900, fontSize: 15, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{queue.service_name}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>{queue.city}, {queue.state}</p>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0, ...parseBadge(meta.badge) }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, display: "inline-block" }} />
          {meta.label}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
        <LocationIcon /> {queue.location_name ?? "—"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Waiting", value: queue.waiting ?? 0, color: "#7c3aed" },
          { label: "Est. Wait", value: queue.estimatedWaitMinutes ? `${queue.estimatedWaitMinutes}m` : "—", color: waitColor(queue.estimatedWaitMinutes ?? 0) },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 14px" }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color, lineHeight: 1.1, marginTop: 3 }}>{value}</p>
          </div>
        ))}
      </div>

      {hasToken && (
        <div style={{
          borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 600,
          background: activeToken.position === 0 ? "#f0fdf4" : activeToken.position === 1 ? "#fffbeb" : "#f5f3ff",
          border: `1px solid ${activeToken.position === 0 ? "#bbf7d0" : activeToken.position === 1 ? "#fcd34d" : "#ddd6fe"}`,
          color: activeToken.position === 0 ? "#16a34a" : activeToken.position === 1 ? "#d97706" : "#7c3aed",
          transition: "all .4s ease",
        }}>
          {activeToken.position === 0
            ? `✓ Token #${activeToken.tokenNumber} — Completed`
            : activeToken.position === 1
            ? `🔔 Token #${activeToken.tokenNumber} — You're next!`
            : `🎫 #${activeToken.tokenNumber} · Position ${activeToken.position} · ~${activeToken.estimatedWait}m`}
        </div>
      )}

      <button
        disabled={isDisabled}
        onClick={onJoin}
        style={{
          width: "100%", padding: "11px 0", borderRadius: 12, border: "none",
          fontSize: 14, fontWeight: 700, cursor: isDisabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all .15s",
          background: isDisabled ? "#f1f5f9" : hasToken ? "#ede9fe" : "#7c3aed",
          color: isDisabled ? "#94a3b8" : hasToken ? "#7c3aed" : "#fff",
          boxShadow: (!isDisabled && !hasToken) ? "0 2px 8px rgba(124,58,237,.3)" : "none",
        }}
      >
        {isDisabled
          ? (queue.status === "paused" ? "Queue Paused" : "Queue Closed")
          : hasToken
          ? "Join Again"
          : <><PlusIcon /> Join Queue</>}
      </button>
    </div>
  );
}

function parseBadge(str) {
  const obj = {};
  str.split(";").forEach((part) => {
    const [k, v] = part.split(":").map((s) => s.trim());
    if (k && v) obj[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
  });
  return obj;
}

function JoinQueueModal({ queue, token, onClose, onJoined }) {
  const [manualAddress, setManulAddress] = useState("");
  const [useremail, setUserEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notify, setNotify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");
  const [travelInfo, setTravelinfo] = useState(null);

  const routerlocation = useLocation();
  const { email, user } = useAuth();
  useEffect(() => {
    if (user?.email) setUserEmail(user.email);
  }, [user]);

  const service = routerlocation.state?.service;
  const location = routerlocation.state?.location;

  async function handleGetLocation() {
    setLocLoading(true);
    setLocError("");
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 10000, maximumAge: 0,
        })
      );
      if (!navigator.geolocation) setLocError("Geolocation is not supported by this browser");

      const { latitude: lat, longitude: lon } = pos.coords;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { "User-Agent": "QTrack/1.0" } }
      );
      const data = await res.json();
      setUserLocation({ lat, lon, address: data.display_name || `${lat}, ${lon}` });

      const locres = await axios.post(`${API}/locations/${location.location_id}/distance`, { user_lat: lat, user_lon: lon });
      setTravelinfo(locres.data.data);
    } catch (err) {
      setLocError(err.code === 1 ? "Location access denied. Please allow location access." : "Could not get location. Try again.");
    } finally {
      setLocLoading(false);
    }
  }

  const handlemanuallocation = async () => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualAddress)}&format=json&limit=1`);
    const locdata = await res.json();

    if (!locdata || locdata.length === 0) {
      setLocError("failed to get location");
      return;
    }

    const parsedLat = parseFloat(locdata[0].lat);
    const parsedLon = parseFloat(locdata[0].lon);
    setUserLocation({ lat: parsedLat, lon: parsedLon, address: locdata[0].display_name });
  };

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const travelEta = (() => {
    if (!userLocation || !location?.lat || !location?.lon) return null;
    const dist = haversineKm(userLocation.lat, userLocation.lon, location.lat, location.lon);
    const minutes = Math.round((dist / 30) * 60);
    return { dist: dist.toFixed(1), minutes };
  })();

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await queuesAPI.join(queue.queue_id, {
        email: useremail,
        phone,
        user_lat: userLocation?.lat || null,
        user_lon: userLocation?.lon || null,
        user_address: userLocation?.address || null,
      });
      setJoined({
        tokenNumber: res.data.data.token_number,
        position: res.data.data.token_number,
        estimatedWait: queue.estimatedWaitMinutes,
      });
    } catch (err) {
      if (!token || err.code === "ERR_NETWORK" || err.code === "ERR_CANCELED") {
        setJoined({
          tokenNumber: Math.floor(Math.random() * 80) + 10,
          position: queue.waiting + 1,
          estimatedWait: queue.estimatedWaitMinutes ?? 20,
        });
      } else {
        setError(err.response?.data?.message || "Failed to join. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const field = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: 10, fontSize: 14, color: "#0f172a", outline: "none",
    boxSizing: "border-box", transition: "border-color .15s, box-shadow .15s",
  };

  const focusField = (e) => {
    e.target.style.borderColor = "#7c3aed";
    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,.1)";
  };
  const blurField = (e) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(15,23,42,.5)", backdropFilter: "blur(4px)", animation: "fadeIn .15s ease" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,.18)", overflow: "hidden", animation: "modalPop .25s cubic-bezier(.34,1.56,.64,1)", maxHeight: "90vh", overflowY: "auto" }}
      >
        {joined ? (
          <div style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✓</div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#0f172a" }}>You're in the queue!</p>
            <div>
              <p style={{ margin: 0, fontSize: 52, fontWeight: 900, color: "#7c3aed", lineHeight: 1 }}>#{joined.tokenNumber}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginTop: 4 }}>Your token</p>
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#374151" }}>{queue.service_name}</p>
            <div style={{ width: "100%", background: "#f8fafc", borderRadius: 16, padding: 16, marginTop: 4, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
                <span>Your position</span><span>Est. wait</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: "#7c3aed", lineHeight: 1 }}>#{joined.position}</span>
                <span style={{ fontSize: 32, fontWeight: 900, color: waitColor(joined.estimatedWait), lineHeight: 1 }}>~{joined.estimatedWait}m</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                <span style={{ fontSize: 11, color: "#94a3b8" }}>Updates live as the queue moves</span>
              </div>
            </div>
            <button
              onClick={() => onJoined(queue.queue_id, joined.tokenNumber, joined.position, joined.estimatedWait)}
              style={{ marginTop: 8, width: "100%", padding: "12px 0", borderRadius: 12, background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}
            >
              Track My Position
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "24px 24px 0" }}>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#0f172a" }}>Join {queue.service_name}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{queue.city}, {queue.state} · {queue.location_name}</p>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CloseIcon />
              </button>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#f8fafc", borderRadius: 14, padding: 14, border: "1px solid #e2e8f0" }}>
                {[
                  { label: "Waiting", value: queue.waiting ?? 0, color: "#7c3aed" },
                  { label: "Est. Wait", value: `~${queue.estimatedWaitMinutes}m`, color: waitColor(queue.estimatedWaitMinutes ?? 0) },
                  { label: "Status", value: "Open", color: "#16a34a" },
                ].map(({ label, value, color }, i) => (
                  <div key={label} style={{ textAlign: "center", borderLeft: i > 0 ? "1px solid #e2e8f0" : "none" }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color, marginTop: 3 }}>{value}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input type="email" required placeholder="you@example.com"
                    value={useremail} onChange={e => setUserEmail(e.target.value)}
                    style={field} onFocus={focusField} onBlur={blurField} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Phone <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input type="tel" required placeholder="+91 00000 00000"
                    value={phone} onChange={e => setPhone(e.target.value)}
                    style={field} onFocus={focusField} onBlur={blurField} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Your Location <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional — for travel time estimate)</span>
                  </label>

                  {!userLocation && (
                    <button type="button" onClick={handleGetLocation} disabled={locLoading}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px dashed #7c3aed", background: "rgba(124,58,237,.04)", color: "#7c3aed", fontSize: 13, fontWeight: 700, cursor: locLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: locLoading ? 0.6 : 1 }}
                    >
                      {locLoading ? "📡 Detecting…" : "📍 Use My Current Location"}
                    </button>
                  )}

                  <div style={{ marginTop: 12 }}>
                    <input type="text" placeholder="Enter your address" value={manualAddress} onChange={(e) => setManulAddress(e.target.value)} style={field} />
                    <button type="button" onClick={handlemanuallocation}
                      style={{ marginTop: 8, width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer" }}>
                      Use This Address
                    </button>
                  </div>

                  {locError && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ef4444" }}>{locError}</p>}

                  {userLocation && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 16 }}>✅</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#15803d" }}>Location detected</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#16a34a", wordBreak: "break-word" }}>{userLocation.address}</p>
                        <button type="button" onClick={() => setUserLocation(null)}
                          style={{ marginTop: 4, fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  {travelEta && (
                    <div style={{ marginTop: 8, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>🚗</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#92400e" }}>~{travelEta.minutes} min travel · {travelEta.dist} km away</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#b45309" }}>Straight-line estimate at 30 km/h</p>
                      </div>
                    </div>
                  )}
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "4px 0" }}>
                  <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#7c3aed", cursor: "pointer" }} />
                  <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Notify me when it's almost my turn</span>
                </label>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 500 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={onClose}
                    style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    style={{ flex: 2, padding: "11px 0", borderRadius: 10, border: "none", background: loading ? "#c4b5fd" : "#7c3aed", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "background .15s" }}>
                    {loading ? "Joining…" : "Confirm & Join"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
function SearchIcon() { return <svg {...s}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }
function CloseIcon() { return <svg {...s}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function TicketIcon() { return <svg {...s}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /></svg>; }
function PlusIcon() { return <svg {...s}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function ChevronLeftIcon() { return <svg {...s}><polyline points="15 18 9 12 15 6" /></svg>; }
function LocationIcon() { return <svg {...{ ...s, width: 13, height: 13 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>; }