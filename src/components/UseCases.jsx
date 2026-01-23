export default function UseCases() {
  const useCases = [
    {
      title: "Hospitals",
      desc: "Reduce patient crowd, manage OPD lines, and notify visitors when it’s their turn.",
      icon: "🏥",
      tag: "Healthcare",
    },
    {
      title: "Banks",
      desc: "Smooth token-based service for deposits, withdrawals, and customer support desks.",
      icon: "🏦",
      tag: "Finance",
    },
    {
      title: "Government Offices",
      desc: "Avoid long waiting lines in offices like passport, driving license, and public services.",
      icon: "🏛️",
      tag: "Public Services",
    },
    {
      title: "Colleges & Universities",
      desc: "Manage admin counters, fee lines, and student support desks efficiently.",
      icon: "🎓",
      tag: "Education",
    },
    {
      title: "Salons & Clinics",
      desc: "Let customers check wait time before leaving home and reduce overcrowding.",
      icon: "💇",
      tag: "Appointments",
    },
    {
      title: "Service Centers",
      desc: "Manage repair queues, pickup timing, and counter load for faster processing.",
      icon: "🧾",
      tag: "Support",
    },
  ];

  return (
    <section className="usecases-section">
      <div className="usecases-inner">
        <p className="usecases-tag">USE CASES</p>
        <h2 className="usecases-title">
          Built for places where <span>waiting hurts.</span>
        </h2>
        <p className="usecases-subtitle">
          QTrack works across real-world industries where crowd control and time-saving matter.
        </p>

        <div className="usecases-grid">
          {useCases.map((item, index) => (
            <div className="usecase-card" key={index}>
              <div className="usecase-top">
                <div className="usecase-icon">{item.icon}</div>
                <span className="usecase-chip">{item.tag}</span>
              </div>

              <h3 className="usecase-heading">{item.title}</h3>
              <p className="usecase-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}