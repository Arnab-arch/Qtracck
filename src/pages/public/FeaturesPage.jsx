import {
  ShieldCheck,
  Clock3,
  Users,
  BarChart3,
  Smartphone,
  Bell,
} from "lucide-react";
import {useAuth}from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";


export default function FeaturesPage() {
    const { user } = useAuth();
  const features = [
    {
      icon: <Users size={28} />,
      title: "Smart Queue Management",
      description:
        "Create, manage, and monitor queues effortlessly with real-time updates.",
    },
    {
      icon: <Clock3 size={28} />,
      title: "Live Token Tracking",
      description:
        "Track your token position instantly without physically waiting in line.",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Role-Based Access",
      description:
        "Separate experiences for staff and patients with secure access control.",
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Analytics Dashboard",
      description:
        "Gain insights into queue performance, waiting times, and service efficiency.",
    },
    {
      icon: <Smartphone size={28} />,
      title: "Mobile Friendly",
      description:
        "Use QTrack seamlessly across desktops, tablets, and smartphones.",
    },
    {
      icon: <Bell size={28} />,
      title: "Instant Notifications",
      description:
        "Get notified when your turn is approaching and avoid unnecessary waiting.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-600 font-medium text-sm">
          Why Choose QTrack?
        </span>

        <h1 className="mt-6 text-5xl font-bold text-slate-900 leading-tight">
          Smarter Queue Management
          <span className="block text-indigo-600">
            For Everyone
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-3xl mx-auto">
          QTrack transforms traditional waiting lines into a seamless
          digital experience. Reduce wait times, improve efficiency,
          and enhance customer satisfaction.
        </p>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature, index) => (
            <div
              key={index}
              className="
                bg-white
                rounded-3xl
                p-8
                border
                border-slate-200
                hover:border-indigo-300
                hover:shadow-xl
                transition-all
                duration-300
                group
              "
            >
              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-indigo-100
                  text-indigo-600
                  flex
                  items-center
                  justify-center
                  group-hover:scale-110
                  transition
                "
              >
                {feature.icon}
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900">
                {feature.title}
              </h3>

              <p className="mt-3 text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-16">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

            <div>
              <h2 className="text-4xl font-bold text-indigo-600">
                10K+
              </h2>
              <p className="mt-2 text-slate-600">
                Tokens Managed
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-indigo-600">
                500+
              </h2>
              <p className="mt-2 text-slate-600">
                Active Queues
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-indigo-600">
                95%
              </h2>
              <p className="mt-2 text-slate-600">
                Reduced Waiting Time
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-indigo-600">
                24/7
              </h2>
              <p className="mt-2 text-slate-600">
                Queue Access
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div
          className="
            rounded-3xl
            bg-gradient-to-r
            from-indigo-600
            to-purple-600
            text-white
            p-12
            text-center
          "
        >
          <h2 className="text-4xl font-bold">
            Ready to Skip the Long Lines?
          </h2>

          <p className="mt-4 text-indigo-100 max-w-2xl mx-auto">
            Join QTrack today and experience a smarter, faster,
            and more convenient way to manage queues.
          </p>

          <Link
  to={user ? "/dashboard" : "/login"}
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