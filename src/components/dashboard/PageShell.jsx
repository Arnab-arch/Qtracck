import { Link } from "react-router-dom";

export default function PageShell({ title, icon, description, children, actions }) {
  return (
    <div className="ps-root">
      <div className="ps-header">
        <div className="ps-header-left">
          {icon && <span className="ps-header-icon">{icon}</span>}
          <div>
            <h1 className="ps-title">{title}</h1>
            {description && <p className="ps-desc">{description}</p>}
          </div>
        </div>
        {actions && <div className="ps-actions">{actions}</div>}
      </div>
      <div className="ps-body">{children}</div>

      <style>{`
        .ps-root { display: flex; flex-direction: column; gap: 24px; }
        .ps-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
          padding-bottom: 20px;
          border-bottom: 2px solid var(--border);
        }
        .ps-header-left { display: flex; align-items: center; gap: 12px; }
        .ps-header-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: var(--bg); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; flex-shrink: 0;
        }
        .ps-title { font-size: 1.35rem; font-weight: 800; color: var(--text-1); margin: 0 0 4px; }
        .ps-desc { font-size: 0.85rem; color: var(--text-3); margin: 0; }
        .ps-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .ps-body { min-height: 200px; }
      `}</style>
    </div>
  );
}

export function ComingSoon({ title, icon, desc }) {
  return (
    <PageShell title={title} icon={icon} description={desc}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 12, padding: "60px 24px",
        background: "#fff", borderRadius: 14, border: "1.5px dashed #e2e8f0",
        textAlign: "center"
      }}>
        <span style={{ fontSize: "3rem" }}>🚧</span>
        <p style={{ fontSize: "1rem", fontWeight: 700, color: "#475569", margin: 0 }}>Page under construction</p>
        <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: 0 }}>This page will be built in the next step.</p>
      </div>
    </PageShell>
  );
}