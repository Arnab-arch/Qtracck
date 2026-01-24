import { useState } from "react";
import { Link } from "react-router-dom";

export default function FaqCTA() {
  const faqs = [
    {
      q: "Is QTrack free to use?",
      a: "Yes. This is a project version built for real-life use cases and demo purposes.",
    },
    {
      q: "Do users need to download an app?",
      a: "No. Users can join queues directly from the website using a simple token flow.",
    },
    {
      q: "How does live wait-time work?",
      a: "Wait time is calculated based on current queue progress, counter speed, and service rate.",
    },
    {
      q: "Can it work for hospitals and government offices?",
      a: "Yes. QTrack is designed for high-crowd places like hospitals, banks, and public service centers.",
    },
    {
      q: "Is it easy for elderly people to use?",
      a: "Yes. The UI focuses on clear numbers, large text, and simple actions — no confusing charts.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  function toggleFAQ(index) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section className="faqcta-section">
      <div className="faqcta-inner">

        {/* LEFT SIDE */}
        <div className="faqcta-left">
     

          <h2 className="faqcta-title">
            Still have questions? <span>Let’s make waiting disappear.</span>
          </h2>

          <p className="faqcta-subtitle">
            Everything you need to manage queues smarter — simple setup, clear updates,
            and smooth service for everyone.
          </p>

          <div className="faqcta-buttons">
            <Link to="/join" className="btn btn-primary rounded-pill px-5 btn-faq-join">
              Join Queue
            </Link>

            <Link to="/dashboard" className="btn btn-outline-dark rounded-pill px-5 btn-faq-manage">
              Manage Queue
            </Link>
          </div>

          <p className="faqcta-foot">
            Setup takes less than <b>2 minutes</b> ✅
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="faqcta-right">
          <div className="faq-box">
            {faqs.map((item, index) => (
              <div
                className={`faq-item ${openIndex === index ? "open" : ""}`}
                key={index}
              >
                <button className="faq-question" onClick={() => toggleFAQ(index)}>
                  <span>{item.q}</span>
                  <span className="faq-icon">{openIndex === index ? "–" : "+"}</span>
                </button>

                {openIndex === index && (
                  <p className="faq-answer">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}