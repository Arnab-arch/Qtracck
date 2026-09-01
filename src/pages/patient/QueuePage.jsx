import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { queuesAPI, tokensAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const STATUS_META = {
  waiting:     { label: "Waiting",     dot: "#a78bfa", color: "text-violet-600 bg-violet-50 border-violet-200" },
  called:      { label: "Your turn",   dot: "#f59e0b", color: "text-amber-600 bg-amber-50 border-amber-200" },
  in_progress: { label: "In progress", dot: "#6366f1", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  completed:   { label: "Completed",   dot: "#22c55e", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  cancelled:   { label: "Cancelled",   dot: "#94a3b8", color: "text-slate-500 bg-slate-50 border-slate-200" },
  no_show:     { label: "No show",     dot: "#f87171", color: "text-red-500 bg-red-50 border-red-200" },
};
const ACTIVE_STATUSES = ["waiting", "called", "in_progress"];

export default function QueuePage() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { service_id } = useParams();

  const passedService  = routerLocation.state?.service;
  const passedLocation = routerLocation.state?.location;

  const isServiceMode = Boolean(service_id);

  const [queues, setQueues]   = useState([]); // service mode
  const [tokens, setTokens]   = useState([]); // my-queues mode
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [selectedToken , setSelectedToken] = useState(null);
  const [openModal , setOpenModal] = useState(false);

  const [joinedTokens, setJoinedTokens] = useState({}); // { [queue_id]: {tokenNumber, position, estimatedWait} }
  const [joiningId, setJoiningId]       = useState(null);
  const [joinError, setJoinError]       = useState("");

  useEffect(() => {
    if (isServiceMode) loadServiceQueues();
    else loadMyTokens();
  }, [service_id]);

  async function loadServiceQueues() {
    try {
      setLoading(true);
      setError("");
      const res = await queuesAPI.getByService(service_id);
      setQueues(res.data.data || []);
    } catch (err) {
      setError("Failed to load queues for this service.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMyTokens() {
    try {
      setLoading(true);
      setError("");
      const res = await tokensAPI.getMyTokens();
      setTokens(res.data.data || []);
    } catch (err) {
      setError("Failed to load your queues.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(queue) {
    setJoinError("");
    setJoiningId(queue.queue_id);
    try {
      const res = await queuesAPI.join(queue.queue_id, {});
      setJoinedTokens((prev) => ({
        ...prev,
        [queue.queue_id]: {
          tokenNumber:   res.data.tokenNumber   ?? res.data.token?.tokenNumber,
          position:      res.data.position      ?? null,
          estimatedWait: res.data.estimatedWait ?? null,
        },
      }));
    } catch (err) {
      setJoinError(err.response?.data?.message || "Failed to join queue. Try again.");
    } finally {
      setJoiningId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-[3px] border-[#727EFD] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-pink-50 border border-pink-200 text-pink-600 rounded-2xl px-5 py-4 text-sm font-medium">
          {error}
        </div>
      </div>
    );
  }

  // ───────── SERVICE MODE--------------------------
  if (isServiceMode) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-[#727EFD] hover:text-[#5b6de8] transition-colors inline-flex items-center gap-1"
        >
          ← Back to services
        </button>

        <div className="flex items-center gap-4 bg-white rounded-2xl border border-[#eaecf5] shadow-sm p-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl
            bg-gradient-to-br from-[#727EFD] to-[#ec4899] shadow-md shadow-indigo-200 flex-shrink-0">
            🎫
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">
              {passedService?.service_name || "Service Queue"}
            </h1>
            {passedLocation && (
              <p className="text-sm text-slate-500 mt-0.5">{passedLocation.name} · {passedLocation.city}</p>
            )}
          </div>
        </div>

        {joinError && (
          <div className="bg-pink-50 border border-pink-200 text-pink-600 rounded-xl px-4 py-3 text-sm font-medium">
            {joinError}
          </div>
        )}

        {queues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#dde1f0] shadow-sm flex flex-col
            items-center justify-center py-20 text-slate-400">
            <div className="text-4xl mb-3">🎫</div>
            <p className="font-semibold text-slate-500">No open queues for this service right now</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queues.map((queue) => {
              const joined = joinedTokens[queue.queue_id];
              return (
                <div
                  key={queue.queue_id}
                  className="bg-white rounded-2xl border border-[#eaecf5] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-bold text-slate-800">{queue.queue_name || `Queue #${queue.queue_id}`}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {queue.waiting_count ?? 0} waiting
                      {queue.estimated_wait ? ` · ~${queue.estimated_wait} min` : ""}
                    </p>
                  </div>

                  {joined ? (
                    <div className="text-right bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                      <p className="text-xs font-semibold text-emerald-600">✓ Joined</p>
                      <p className="text-lg font-bold text-[#727EFD]">#{joined.tokenNumber}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoin(queue)}
                      disabled={joiningId === queue.queue_id}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#727EFD] to-[#ec4899] text-white font-bold text-sm shadow-md shadow-indigo-200 hover:opacity-90 disabled:opacity-60 transition-opacity flex-shrink-0"
                    >
                      {joiningId === queue.queue_id ? "Joining…" : "Join Queue"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ───────── MY QUEUES MODE:
  const active  = tokens.filter((t) => ACTIVE_STATUSES.includes(t.status));
  const history = tokens.filter((t) => !ACTIVE_STATUSES.includes(t.status));

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#f4f5fb] to-white">
        <div className="max-w-4xl mx-auto p-6 space-y-10">

          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">My Queues</h1>
            <p className="text-sm text-slate-500 mt-1">Your active tokens and queue history</p>
          </div>

          {/* ── Active section ── */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#727EFD] uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#727EFD] animate-pulse" />
                Active
              </span>
              {active.length > 0 && (
                <span className="text-[11px] font-bold text-[#727EFD] bg-[#727EFD]/10 rounded-full px-2 py-0.5">
                  {active.length}
                </span>
              )}
              <div className="flex-1 h-px bg-gradient-to-r from-[#727EFD]/30 to-transparent" />
            </div>

            {active.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-[#dde1f0] py-10 text-center">
                <p className="text-sm text-slate-400">You're not in any queue right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {active.map((t) => (
                  <TokenRow key={t.token_id} token={t} onClick={() => setSelectedToken(t)} />
                ))}
              </div>
            )}
          </section>

          {/* ── History section ── */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5 text-xs font-bold text-pink-500 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                History
              </span>
              {history.length > 0 && (
                <span className="text-[11px] font-bold text-pink-500 bg-pink-50 rounded-full px-2 py-0.5">
                  {history.length}
                </span>
              )}
              <div className="flex-1 h-px bg-gradient-to-r from-pink-300/40 to-transparent" />
            </div>

            {history.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-[#dde1f0] py-10 text-center">
                <p className="text-sm text-slate-400">No past queues yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((t) => (
                  <TokenRow key={t.token_id} token={t} onClick={() => setSelectedToken(t)} muted />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

      {selectedToken && (
        <TokenDetailModal token={selectedToken} onClose={() => setSelectedToken(null)} />
      )}
    </>
  );
}

function TokenRow({ token, onClick, muted }) {
  const meta = STATUS_META[token.status] ?? STATUS_META.completed;
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#eaecf5] shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#727EFD]/40 transition-all cursor-pointer p-4 flex items-center gap-4 ${muted ? "opacity-75" : ""}`}
    >
      {/* Token number badge */}
      <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#727EFD]/10 to-pink-400/10 border border-[#727EFD]/10">
        <span className="text-[9px] font-bold text-[#727EFD]/70 uppercase tracking-wide">Token</span>
        <span className="text-lg font-extrabold text-[#727EFD] leading-none">#{token.token_number}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 truncate">
          {token.queue_name || token.service_name || `Token #${token.token_number}`}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {token.location_name || "\u00A0"}
        </p>
      </div>

      <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap ${meta.color}`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
        {meta.label}
      </span>
    </div>
  );
}

function TokenDetailModal({ token, onClose }) {
  const meta = STATUS_META[token.status] ?? STATUS_META.completed;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#eaecf5] relative overflow-hidden"
      >
        {/* decorative gradient corner */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#727EFD]/15 to-pink-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-5 relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#727EFD] to-pink-400 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-200">
              #{token.token_number}
            </div>
            <h2 className="text-lg font-extrabold text-slate-800">Token Details</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 relative">
          <DetailRow label="Service" value={token.service_name} />
          <DetailRow label="Location" value={token.location_name} />
          <DetailRow label="Queue date" value={token.queue_date} />
          <div className="flex items-center justify-between pt-3 border-t border-[#eaecf5]">
            <span className="text-sm font-semibold text-slate-500">Status</span>
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${meta.color}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
              {meta.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-sm text-slate-800 font-medium">{value || "—"}</span>
    </div>
  );
}