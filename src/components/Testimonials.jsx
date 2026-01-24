import { useEffect, useRef, useState } from "react";

export default function Testimonials() {
  const sectionRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const testimonials = [
    {
      name: "Riya Sharma",
      role: "Hospital Visitor",
      text: "QTrack saved me from standing for 2 hours. I got notified and reached exactly on time.",
      rating: 5,
      emoji: "🧑‍⚕️",
    },
    {
      name: "Aman Verma",
      role: "Bank Customer",
      text: "Finally a simple queue system. The wait time updates are super accurate and easy to follow.",
      rating: 5,
      emoji: "🏦",
    },
    {
      name: "Neha Gupta",
      role: "Govt Office Visitor",
      text: "I joined the queue from home. No crowd, no confusion, just smooth service.",
      rating: 5,
      emoji: "🏛️",
    },
    {
      name: "Rahul Singh",
      role: "University Admin Desk",
      text: "Queue control became 10x easier. Students don’t pile up anymore.",
      rating: 5,
      emoji: "🎓",
    },
    {
      name: "Sana Khan",
      role: "Clinic Reception",
      text: "The counter control feature is amazing. We handle rush hours without stress now.",
      rating: 5,
      emoji: "🏥",
    },
  ];

  // ✅ Start animation only when in viewport
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsRunning(entry.isIntersecting);
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // ✅ Duplicate list for seamless infinite scroll
  const loopData = [...testimonials, ...testimonials];

  return (
    <section className="testimonials-section" ref={sectionRef}>
      <div className="testimonials-inner">
        <p className="testimonials-tag">TESTIMONIALS</p>
        <h2 className="testimonials-title">
          People love how <span>simple</span> QTrack feels.
        </h2>
        <p className="testimonials-subtitle">
          Designed for everyone — including elderly visitors who need clarity, not charts.
        </p>

        <div className="testimonial-marquee">
          <div className={`testimonial-track ${isRunning ? "run" : "pause"}`}>
            {loopData.map((t, index) => (
              <div className="testimonial-card" key={index}>
                <div className="testimonial-top">
                  <div className="testimonial-avatar">{t.emoji}</div>

                  <div className="testimonial-user">
                    <h4>{t.name}</h4>
                    <p>{t.role}</p>
                  </div>

                  <div className="testimonial-rating">
                    {"★".repeat(t.rating)}
                  </div>
                </div>

                <p className="testimonial-text">“{t.text}”</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
