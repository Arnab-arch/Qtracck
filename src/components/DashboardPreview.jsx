import { Link } from "react-router-dom";
import dashboardImg from "../assets/images/hero.png";

export default function DashboardPreview() {
  const highlights = [
    { title: "Live Queue Status", desc: "Track who’s waiting & serving in real-time." },
    { title: "Smart Wait Time", desc: "Accurate ETA updates so users arrive on time." },
    { title: "Nearby Locations", desc: "Find less crowded branches instantly." },
    { title: "Counter Control", desc: "Staff can manage counters and reduce overload." },
  ];

  return (
    <section className="dashboard-section">
      <div className="dashboard-inner">

        {/* LEFT CONTENT */}
        <div className="dashboard-left">
          <p className="dashboard-tag">DASHBOARD PREVIEW</p>

          <h2 className="dashboard-title">
            Dashboard that feels like <span>control.</span>
          </h2>

          <p className="dashboard-subtitle">
            Manage live queues, track wait time, staff efficiency, and nearby crowd levels —
            all from a clean, smart panel.
          </p>

          {/* HIGHLIGHTS */}
          <div className="dashboard-highlights">
            {highlights.map((item, index) => (
              <div className="highlight-card" key={index}>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA BUTTONS */}
          <div className="dashboard-cta">
            <Link to="/dashboard" className="btn btn-primary rounded-pill px-5 btn-dashboard">
              View Dashboard
            </Link>

            <Link to="/demo" className="btn btn-outline-dark rounded-pill px-5 btn-demo">
              Try Demo
            </Link>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="dashboard-right">
          <div className="dashboard-glass">
            <img src={dashboardImg} alt="Dashboard Preview" className="dashboard-img" />
          </div>
        </div>

      </div>
    </section>
  );
}