import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "patient" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("1: submit started");

    setError("");
    console.log("2: before validation");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
     console.log("3: validation passed");

    try {
       console.log("4: before register api");
      await register({
  name: form.name,
  email: form.email,
  password: form.password,
  role: form.role,
  
});
      navigate("/queues");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"][strength];

  return (
    <div className="rp-page">

      <div className="rp-card">

        {/* ── LEFT: FORM ── */}
        <div className="rp-left">

          <Link to="/" className="rp-logo-link">
            <img src={logo} alt="QTrack" className="rp-logo" />
            <span className="rp-brand">QTrack</span>
          </Link>

          <div>
            <h1 className="rp-title">Create your account</h1>
            <p className="rp-sub">Join QTrack — it takes less than a minute</p>
          </div>

          {error && (
            <div className="rp-error">
              <ErrorIcon />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="rp-form">

            {/* Name */}
            <div className="rp-field">
              <label htmlFor="rp-name" className="rp-label">Full name</label>
              <input
                id="rp-name"
                type="text"
                className="rp-input"
                placeholder="Arjun Sharma"
                value={form.name}
                onChange={set("name")}
                autoComplete="name"
                required
              />
            </div>

            {/* Email */}
            <div className="rp-field">
              <label htmlFor="rp-email" className="rp-label">Email address</label>
              <input
                id="rp-email"
                type="email"
                className="rp-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
                required
              />
            </div>

            {/* Role toggle */}
            <div className="rp-field">
              <label className="rp-label">I am joining as</label>
              <div className="rp-role-row">
                {[
                  { value: "patient", label: "Patient", icon: <PatientIcon /> },
                  { value: "staff",   label: "Staff",   icon: <StaffIcon />   },
                   { value: "admin",   label: "admin",   icon: <StaffIcon />   },
                ].map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    className={`rp-role-btn${form.role === r.value ? " rp-role-btn--active" : ""}`}
                    onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                  >
                    {r.icon}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="rp-field">
              <label htmlFor="rp-pass" className="rp-label">Password</label>
              <div className="rp-pass-wrap">
                <input
                  id="rp-pass"
                  type={showPass ? "text" : "password"}
                  className="rp-input"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                  required
                />
                <button type="button" className="rp-eye" onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                  {showPass ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="rp-strength">
                  <div className="rp-strength-bar">
                    {[1,2,3,4].map((i) => (
                      <div
                        key={i}
                        className="rp-strength-seg"
                        style={{ background: i <= strength ? strengthColor : "#e2e8f0" }}
                      />
                    ))}
                  </div>
                  <span className="rp-strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="rp-field">
              <label htmlFor="rp-confirm" className="rp-label">Confirm password</label>
              <div className="rp-pass-wrap">
                <input
                  id="rp-confirm"
                  type={showConfirm ? "text" : "password"}
                  className={`rp-input${form.confirm && form.confirm !== form.password ? " rp-input--err" : ""}`}
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  autoComplete="new-password"
                  required
                />

                <button type="button" className="rp-eye" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm">
                  {showConfirm ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="rp-match-err">Passwords don't match</p>
              )}
            </div>

            <button type="submit" className="rp-btn" disabled={loading}>
              {loading ? <><span className="rp-spinner" /> Creating account…</> : "Create account"}
            </button>

          </form>

          <p className="rp-login-text">
            Already have an account?{" "}
            <Link to="/login" className="rp-login-link">Sign in</Link>
          </p>

        </div>

        {/* ── RIGHT: DECORATIVE PANEL ── */}
        <div className="rp-right">
          <div className="rp-right-inner">

            <p className="rp-right-label">Why QTrack?</p>
            <h2 className="rp-right-title">Skip the wait.<br />Join smarter.</h2>

            {[
              { icon: "🎫", title: "Instant token",    desc: "Get your queue number in seconds — no forms, no fuss." },
              { icon: "⏱️", title: "Live wait times",  desc: "Know exactly how long until your turn, in real time." },
              { icon: "🔔", title: "Turn alerts",      desc: "Get notified when you're next — walk in right on time." },
              { icon: "📊", title: "Staff dashboard",  desc: "Manage your queue, call patients, and track completions." },
            ].map((item) => (
              <div className="rp-feature" key={item.title}>
                <div className="rp-feature-icon">{item.icon}</div>
                <div>
                  <p className="rp-feature-title">{item.title}</p>
                  <p className="rp-feature-desc">{item.desc}</p>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>

      <style>{`
        .rp-page {
          min-height: 100vh;
          background: #727EFD;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
        }
        .rp-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 920px;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.18);
        }

        /* LEFT */
        .rp-left {
          padding: 44px 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }
        .rp-logo-link { display:inline-flex; align-items:center; gap:10px; text-decoration:none; }
        .rp-logo      { width:38px; height:38px; object-fit:contain; border-radius:8px; }
        .rp-brand     { font-size:1rem; font-weight:700; color:#727EFD; }
        .rp-title     { font-size:1.6rem; font-weight:800; color:#0f172a; margin:0; }
        .rp-sub       { font-size:0.9rem; color:#64748b; margin:4px 0 0; }

        .rp-error {
          display:flex; align-items:center; gap:8px;
          background:#fef2f2; border:1px solid #fecaca;
          color:#dc2626; font-size:0.85rem;
          padding:9px 13px; border-radius:10px;
        }

        .rp-form  { display:flex; flex-direction:column; gap:14px; }
        .rp-field { display:flex; flex-direction:column; gap:5px; }
        .rp-label {
          font-size:0.72rem; font-weight:600; color:#374151;
          letter-spacing:0.05em; text-transform:uppercase;
        }
        .rp-input {
          width:100%; padding:10px 13px;
          border:1.5px solid #e2e8f0; border-radius:9px;
          font-size:0.9rem; color:#0f172a; background:#f8fafc;
          outline:none; transition:border-color .15s, box-shadow .15s;
          box-sizing:border-box;
        }
        .rp-input::placeholder { color:#94a3b8; }
        .rp-input:focus {
          border-color:#727EFD; background:#fff;
          box-shadow:0 0 0 3px rgba(114,126,253,.12);
        }
        .rp-input--err { border-color:#fca5a5; }

        /* Role toggle */
        .rp-role-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .rp-role-btn {
          padding:10px 14px; border-radius:9px;
          border:1.5px solid #e2e8f0; background:#f8fafc;
          font-size:0.875rem; font-weight:600; color:#64748b;
          cursor:pointer; display:flex; align-items:center;
          justify-content:center; gap:7px; transition:all .15s;
        }
        .rp-role-btn:hover { border-color:#727EFD; color:#727EFD; }
        .rp-role-btn--active {
          border-color:#727EFD; background:rgba(114,126,253,.08);
          color:#727EFD;
        }

        /* Pass wrap */
        .rp-pass-wrap { position:relative; }
        .rp-pass-wrap .rp-input { padding-right:42px; }
        .rp-eye {
          position:absolute; right:11px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; color:#94a3b8;
          padding:0; display:flex; align-items:center;
        }
        .rp-eye:hover { color:#727EFD; }

        /* Strength bar */
        .rp-strength { display:flex; align-items:center; gap:8px; margin-top:4px; }
        .rp-strength-bar { display:flex; gap:4px; flex:1; }
        .rp-strength-seg { height:4px; flex:1; border-radius:4px; transition:background .25s; }
        .rp-strength-label { font-size:0.75rem; font-weight:600; min-width:40px; }

        .rp-match-err { font-size:0.75rem; color:#ef4444; margin:2px 0 0; }

        /* Submit btn */
        .rp-btn {
          width:100%; padding:12px; background:#FEB600;
          border:none; border-radius:9px;
          font-size:0.9rem; font-weight:700; color:#111827;
          cursor:pointer; display:flex; align-items:center;
          justify-content:center; gap:8px; margin-top:2px;
          transition:background .15s, transform .12s;
        }
        .rp-btn:hover:not(:disabled) { background:#e5a500; transform:translateY(-1px); }
        .rp-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .rp-spinner {
          width:15px; height:15px;
          border:2px solid rgba(0,0,0,.2); border-top-color:#111;
          border-radius:50%; animation:rpspin .65s linear infinite;
        }
        @keyframes rpspin { to { transform:rotate(360deg); } }

        .rp-login-text { font-size:0.85rem; color:#64748b; text-align:center; margin:0; }
        .rp-login-link { color:#727EFD; font-weight:600; text-decoration:none; }
        .rp-login-link:hover { text-decoration:underline; }

        /* RIGHT */
        .rp-right {
          background:#727EFD;
          display:flex; align-items:center; justify-content:center;
          padding:44px 32px;
        }
        .rp-right-inner { width:100%; display:flex; flex-direction:column; gap:14px; }
        .rp-right-label {
          font-size:0.7rem; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:rgba(255,255,255,.65); margin:0;
        }
        .rp-right-title {
          font-size:1.4rem; font-weight:800; color:#fff; line-height:1.2; margin:0 0 6px;
        }

        .rp-feature {
          display:flex; align-items:flex-start; gap:12px;
          background:rgba(255,255,255,.13);
          border:1px solid rgba(255,255,255,.2);
          border-radius:12px; padding:13px 14px;
        }
        .rp-feature-icon  { font-size:1.25rem; flex-shrink:0; margin-top:1px; }
        .rp-feature-title { font-size:0.875rem; font-weight:700; color:#fff; margin:0 0 2px; }
        .rp-feature-desc  { font-size:0.78rem; color:rgba(255,255,255,.7); margin:0; line-height:1.5; }

        /* Responsive */
        @media (max-width:720px) {
          .rp-card { grid-template-columns:1fr; }
          .rp-right { display:none; }
          .rp-left  { padding:32px 22px; }
        }
      `}</style>
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
    </svg>
  );
}
function PatientIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function StaffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function EyeOn() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}