import { useState } from "react";
import logo from "../assets/images/logo.png";
import { Link, NavLink } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import {
  HomeIcon,
  FeatureIcon,
  InfoIcon,
  DashboardIcon,
  HelpIcon,
} from "./icons";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const {user} = useAuth();

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 relative z-30">
        <div className="flex items-center justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">

            <button
              onClick={() => setMenuOpen(true)}
              className="bg-transparent text-slate-800 hover:text-blue-600 transition"
            >
              <Toggle />
            </button>

            <Logo />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

  {!user ? (
    <>
      <Link
        to="/login"
        className="
          px-8
          py-2.5
          rounded-full
          border
          border-gray-300
          text-blue-600
          font-medium
          hover:bg-blue-50
          transition
        "
      >
        Join Queue
      </Link>

      <Link
        to="/dashboard"
        className="
          px-8
          py-2.5
          rounded-full
          bg-[#5D5FEF]
          text-white
          font-medium
          hover:bg-[#4f46e5]
          transition
        "
      >
        Manage Queue
      </Link>
    </>
  ) : (
    <div className="relative">
      <button>
        <FaUserCircle size={36} />
      </button>
    </div>
  )}

</div>
        </div>
      </header>

      {/* BACKDROP */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          top-0
          left-0
          h-screen
          w-[340px]
          bg-white
          z-50
          shadow-[0_20px_50px_rgba(0,0,0,0.12)]
          transition-transform
          duration-300
          ${
            menuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">

          <div className="flex items-center gap-3">

            <img
              src={logo}
              alt="QTrack Logo"
              className="w-9 h-9 rounded-lg"
            />

            <div>
              <h6 className="font-semibold text-slate-900">
                QTrack
              </h6>

              <p className="text-sm text-gray-500">
                Smart Queue Management
              </p>
            </div>
          </div>

          <button
            onClick={closeMenu}
            className="text-3xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="p-4">

          <nav className="flex flex-col gap-3">

            <CustomNavLink
              to="/"
              icon={<HomeIcon />}
              label="Home"
              onClick={closeMenu}
            />

            <CustomNavLink
              to="/features"
              icon={<FeatureIcon />}
              label="Features"
              onClick={closeMenu}
            />

            <CustomNavLink
              to="/how-it-works"
              icon={<InfoIcon />}
              label="How It Works"
              onClick={closeMenu}
            />

            <CustomNavLink
              to="/dashboard"
              icon={<DashboardIcon />}
              label="Dashboard"
              onClick={closeMenu}
            />

            <hr className="my-3 border-gray-200" />

            <CustomNavLink
              to="/help"
              icon={<HelpIcon />}
              label="Help"
              onClick={closeMenu}
            />

          </nav>
        </div>
      </aside>
    </>
  );
}


function CustomNavLink({
  to,
  icon,
  label,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `
        flex
        items-center
        gap-3
        px-4
        py-3
        rounded-xl
        text-[16px]
        font-medium
        transition-all
        ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-slate-900 hover:bg-blue-50 hover:text-blue-600"
        }
      `
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function Logo() {
  return (
    <Link
      to="/"
      className="
        inline-flex
        items-center
        p-1.5
        rounded-xl
        transition-all
        hover:bg-blue-50
        hover:scale-105
      "
    >
      <img
        src={logo}
        alt="QTrack Logo"
        className="w-[52px] h-auto rounded-lg"
      />
    </Link>
  );
}

/* HAMBURGER */
function Toggle() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect
        y="4"
        width="24"
        height="2"
        rx="1"
        fill="currentColor"
      />
      <rect
        y="11"
        width="24"
        height="2"
        rx="1"
        fill="currentColor"
      />
      <rect
        y="18"
        width="24"
        height="2"
        rx="1"
        fill="currentColor"
      />
    </svg>
  );
}