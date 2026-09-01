import { Link } from "react-router-dom";
import {
  UserPlus,
  Search,
  Ticket,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <UserPlus size={28} />,
      title: "Create an Account",
      description:
        "Sign up as a patient or staff member and access QTrack's smart queue system.",
    },
    {
      icon: <Search size={28} />,
      title: "Browse Queues",
      description:
        "View available queues and choose the service you need.",
    },
    {
      icon: <Ticket size={28} />,
      title: "Join a Queue",
      description:
        "Get a digital token instantly without physically standing in line.",
    },
    {
      icon: <Activity size={28} />,
      title: "Track Progress",
      description:
        "Monitor your queue position and estimated waiting time in real time.",
    },
    {
      icon: <CheckCircle2 size={28} />,
      title: "Get Served",
      description:
        "Arrive when your turn is near and enjoy a faster experience.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">

        <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium">
          Simple Process
        </span>

        <h1 className="mt-6 text-5xl font-bold text-slate-900">
          How QTrack Works
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-3xl mx-auto">
          Skip the confusion and long waiting lines.
          QTrack helps users join, track, and manage queues
          in just a few simple steps.
        </p>

      </section>

      {/* Timeline */}
      <section className="max-w-6xl mx-auto px-6 pb-24">

        <div className="relative">

          {/* Center Line */}
          <div className="absolute left-1/2 top-0 h-full w-1 bg-indigo-100 hidden md:block -translate-x-1/2"></div>

          <div className="space-y-12">

            {steps.map((step, index) => (
              <div
                key={index}
                className={`
                  flex items-center
                  ${
                    index % 2 === 0
                      ? "md:flex-row"
                      : "md:flex-row-reverse"
                  }
                  flex-col
                  gap-8
                `}
              >
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 w-full md:w-[45%]">

                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    {step.icon}
                  </div>

                  <h3 className="mt-6 text-2xl font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-slate-600">
                    {step.description}
                  </p>

                </div>

                {/* Step Number */}
                <div className="relative z-10 hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl">
                  {index + 1}
                </div>

                <div className="hidden md:block w-[45%]" />
              </div>
            ))}

          </div>
        </div>

      </section>

      {/* Flow Diagram */}
      <section className="bg-white border-y border-slate-200">

        <div className="max-w-6xl mx-auto px-6 py-20">

          <h2 className="text-center text-3xl font-bold text-slate-900">
            Queue Journey
          </h2>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-4">

            <FlowBox text="Register" />
            <Arrow />
            <FlowBox text="Browse" />
            <Arrow />
            <FlowBox text="Join Queue" />
            <Arrow />
            <FlowBox text="Track Status" />
            <Arrow />
            <FlowBox text="Get Served" />

          </div>
        </div>

      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">

        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-12 text-center">

          <h2 className="text-4xl font-bold">
            Ready to Experience QTrack?
          </h2>

          <p className="mt-4 text-indigo-100 max-w-2xl mx-auto">
            Join today and manage your waiting time smarter.
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
            Get Started
          </Link>

        </div>

      </section>

    </div>
  );
}

function FlowBox({ text }) {
  return (
    <div className="px-6 py-4 bg-indigo-50 text-indigo-600 rounded-xl font-semibold">
      {text}
    </div>
  );
}

function Arrow() {
  return (
    <span className="text-2xl text-slate-400">
      →
    </span>
  );
}