import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I join a queue?",
      answer:
        "Browse available queues and click the Join Queue button. A token will be assigned instantly.",
    },
    {
      question: "How can I track my token?",
      answer:
        "Go to Dashboard → My Tokens to view your active tokens and waiting status in real time.",
    },
    {
      question: "Can I leave a queue and join again later?",
      answer:
        "Yes. Depending on queue policies, you can leave and rejoin. A new token may be assigned.",
    },
    {
      question: "Who can create queues?",
      answer:
        "Only Staff and Administrators can create and manage queues.",
    },
    {
      question: "How do notifications work?",
      answer:
        "QTrack notifies users when their turn is approaching, reducing unnecessary waiting.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">

        <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium">
          Support Center
        </span>

        <h1 className="mt-6 text-5xl font-bold text-slate-900">
          Need Help?
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-3xl mx-auto">
          Find answers to common questions and learn how to get the
          most out of QTrack.
        </p>

      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 pb-24">

        <div className="space-y-4">

          {faqs.map((faq, index) => (
            <FaqCard
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}

        </div>

      </section>

      {/* Contact Section */}
      <section className="bg-white border-y border-slate-200">

        <div className="max-w-6xl mx-auto px-6 py-20">

          <h2 className="text-3xl font-bold text-center text-slate-900">
            Still Need Assistance?
          </h2>

          <p className="mt-4 text-center text-slate-600">
            Reach out to our support team anytime.
          </p>

          <div className="mt-12 grid md:grid-cols-2 gap-8">

            {/* Email */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8">

              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Mail size={28} />
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900">
                Email Support
              </h3>

              <p className="mt-3 text-slate-600">
                Contact us for technical issues or account help.
              </p>

              <a
                href="mailto:support@qtrack.com"
                className="mt-4 inline-block text-indigo-600 font-medium"
              >
                support@qtrack.com
              </a>

            </div>

            {/* Phone */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8">

              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Phone size={28} />
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900">
                Phone Support
              </h3>

              <p className="mt-3 text-slate-600">
                Available Monday to Friday, 9 AM – 6 PM.
              </p>

              <a
                href="tel:+919999999999"
                className="mt-4 inline-block text-indigo-600 font-medium"
              >
                +91 99999 99999
              </a>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">

        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-12 text-center">

          <h2 className="text-4xl font-bold">
            Ready to Get Started?
          </h2>

          <p className="mt-4 text-indigo-100 max-w-2xl mx-auto">
            Join QTrack today and experience hassle-free queue management.
          </p>

          <Link
            to="/login"
            className="
              inline-block
              mt-8
              px-8
              py-3
              bg-white
              text-indigo-600
              rounded-xl
              font-semibold
              hover:scale-105
              transition
            "
          >
            Login Now
          </Link>

        </div>

      </section>

    </div>
  );
}

function FaqCard({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

      <button
        onClick={() => setOpen(!open)}
        className="
          w-full
          flex
          items-center
          justify-between
          px-6
          py-5
          text-left
        "
      >
        <span className="font-semibold text-slate-900 flex items-center gap-3">
          <HelpCircle size={20} className="text-indigo-600" />
          {question}
        </span>

        {open ? (
          <ChevronUp size={20} />
        ) : (
          <ChevronDown size={20} />
        )}
      </button>

      {open && (
        <div className="px-6 pb-5 text-slate-600">
          {answer}
        </div>
      )}

    </div>
  );
}