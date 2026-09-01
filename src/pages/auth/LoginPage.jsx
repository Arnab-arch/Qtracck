import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/queues");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* ── LEFT: FORM ── */}
        <div className="login-left">

          <Link to="/" className="login-logo-link">
            <img src={logo} alt="QTrack" className="login-logo" />
            <span className="login-brand">QTrack</span>
          </Link>

          <div className="login-heading-group">
            <h1 className="login-title">Welcome back</h1>
            <p className="login-sub">Sign in to your QTrack account</p>
          </div>

          {error && (
            <div className="login-error">
              <ErrorIcon />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">

            <div className="login-field">
              <label htmlFor="login-email" className="login-label">Email address</label>
              <input
                id="login-email"
                type="email"
                className={`login-input${error ? " login-input--err" : ""}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="login-pass" className="login-label">Password</label>
                <a href="#" className="login-forgot">Forgot password?</a>
              </div>
              <div className="login-pass-wrap">
                <input
                  id="login-pass"
                  type={showPass ? "text" : "password"}
                  className={`login-input${error ? " login-input--err" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Toggle password"
                >
                  {showPass ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <><span className="login-spinner" /> Signing in…</> : "Sign in"}
            </button>

          </form>

          <p className="login-register-text">
            Don't have an account?{" "}
            <Link to="/register" className="login-register-link">Create one</Link>
          </p>

        </div>

        {/* ── RIGHT: DECORATIVE PANEL ── */}
        <div className="login-right">
          <div className="login-right-inner">
            <p className="login-right-label">Live today</p>
            <h2 className="login-right-title">Queues running<br />right now</h2>

            {[
              { icon: "🫀", name: "Cardiology OPD", meta: "12 waiting · ~24 min", status: "open"   },
              { icon: "🦷", name: "Dental Clinic",  meta: "8 waiting · ~16 min",  status: "busy"   },
              { icon: "🏛️", name: "Registration",   meta: "5 waiting · ~10 min",  status: "open"   },
            ].map((q) => (
              <div className="lq-card" key={q.name}>
                <div className="lq-icon">{q.icon}</div>
                <div className="lq-info">
                  <p className="lq-name">{q.name}</p>
                  <p className="lq-meta">{q.meta}</p>
                </div>
                <span className={`lq-badge lq-badge--${q.status}`}>{q.status}</span>
              </div>
            ))}

            <div className="lq-stats">
              {[["6","Queues live"],["142","Waiting now"],["18m","Avg wait"]].map(([n,l]) => (
                <div className="lq-stat" key={l}>
                  <span className="lq-stat-num">{n}</span>
                  <span className="lq-stat-lbl">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background: #727EFD;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
        }
        .login-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 900px;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.18);
        }
        .login-left {
          padding: 48px 44px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .login-logo-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .login-logo { width: 40px; height: 40px; object-fit: contain; border-radius: 8px; }
        .login-brand { font-size: 1.1rem; font-weight: 700; color: #727EFD; }
        .login-heading-group { display: flex; flex-direction: column; gap: 4px; }
        .login-title { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin: 0; }
        .login-sub   { font-size: 0.95rem; color: #64748b; margin: 0; }
        .login-error {
          display: flex; align-items: center; gap: 8px;
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; font-size: 0.875rem;
          padding: 10px 14px; border-radius: 10px;
        }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .login-field { display: flex; flex-direction: column; gap: 6px; }
        .login-label-row { display: flex; justify-content: space-between; align-items: center; }
        .login-label {
          font-size: 0.78rem; font-weight: 600; color: #374151;
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .login-forgot { font-size: 0.8rem; color: #727EFD; text-decoration: none; }
        .login-forgot:hover { text-decoration: underline; }
        .login-input {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 0.95rem; color: #0f172a; background: #f8fafc;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .login-input::placeholder { color: #94a3b8; }
        .login-input:focus {
          border-color: #727EFD; background: #fff;
          box-shadow: 0 0 0 3px rgba(114,126,253,0.12);
        }
        .login-input--err { border-color: #fca5a5; }
        .login-pass-wrap { position: relative; }
        .login-pass-wrap .login-input { padding-right: 44px; }
        .login-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94a3b8;
          padding: 0; display: flex; align-items: center;
        }
        .login-eye:hover { color: #727EFD; }
        .login-btn {
          width: 100%; padding: 13px; background: #FEB600;
          border: none; border-radius: 10px;
          font-size: 0.95rem; font-weight: 700; color: #111827;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px; margin-top: 4px;
          transition: background 0.15s, transform 0.12s;
        }
        .login-btn:hover:not(:disabled) { background: #e5a500; transform: translateY(-1px); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.2); border-top-color: #111;
          border-radius: 50%; animation: qt-spin 0.65s linear infinite;
        }
        @keyframes qt-spin { to { transform: rotate(360deg); } }
        .login-register-text { font-size: 0.875rem; color: #64748b; text-align: center; margin: 0; }
        .login-register-link { color: #727EFD; font-weight: 600; text-decoration: none; }
        .login-register-link:hover { text-decoration: underline; }

        /* RIGHT PANEL */
        .login-right {
          background: #727EFD;
          display: flex; align-items: center; justify-content: center;
          padding: 44px 36px;
        }
        .login-right-inner { width: 100%; display: flex; flex-direction: column; gap: 12px; }
        .login-right-label {
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.7); margin: 0;
        }
        .login-right-title {
          font-size: 1.5rem; font-weight: 800; color: #fff; line-height: 1.2; margin: 0 0 8px;
        }
        .lq-card {
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.25); border-radius: 12px;
          padding: 12px 14px; display: flex; align-items: center; gap: 10px;
        }
        .lq-icon  { font-size: 1.2rem; width: 32px; text-align: center; flex-shrink: 0; }
        .lq-info  { flex: 1; }
        .lq-name  { font-size: 0.875rem; font-weight: 600; color: #fff; margin: 0; }
        .lq-meta  { font-size: 0.75rem; color: rgba(255,255,255,0.7); margin: 2px 0 0; }
        .lq-badge {
          font-size: 0.68rem; font-weight: 700; padding: 3px 8px;
          border-radius: 20px; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .lq-badge--open   { background: rgba(34,197,94,0.2);  color: #86efac; }
        .lq-badge--busy   { background: rgba(254,182,0,0.2);  color: #FEB600; }
        .lq-badge--closed { background: rgba(239,68,68,0.2);  color: #fca5a5; }
        .lq-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 4px; }
        .lq-stat {
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px; padding: 10px 8px; text-align: center;
          display: flex; flex-direction: column; gap: 2px;
        }
        .lq-stat-num { font-size: 1.25rem; font-weight: 800; color: #FEB600; }
        .lq-stat-lbl { font-size: 0.68rem; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.05em; }

        @media (max-width: 700px) {
          .login-card { grid-template-columns: 1fr; }
          .login-right { display: none; }
          .login-left  { padding: 36px 24px; }
        }
      `}</style>
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
    </svg>
  );
}
function EyeOn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}