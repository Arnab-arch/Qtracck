import logo from "../assets/images/logo.png";
import { Link, NavLink } from "react-router-dom";

import {
  HomeIcon,
  FeatureIcon,
  InfoIcon,
  DashboardIcon,
  HelpIcon
} from "./icons";

export default function Header() {
  return (
    <header className="header d-flex justify-content-between align-items-center px-4 py-3">

      {/* LEFT SIDE */}
      <div className="d-flex align-items-center gap-3">

        {/* TOGGLE BUTTON */}
        <button
          className="btn btn-light border-0"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mainOffcanvas"
          aria-controls="mainOffcanvas"
        >
          <Toggle />
        </button>

        {/* LOGO */}
        <Logo />
      </div>

      {/* RIGHT SIDE */}
      <div className="d-flex gap-2">
        <Link to="/join" className="btn btn-outline-primary rounded-pill px-4">
          Join Queue
        </Link>

        <Link to="/dashboard" className="btn btn-primary rounded-pill px-4">
          Manage Queue
        </Link>
      </div>

      {/* OFFCANVAS (KEEP IT OUTSIDE FLEX ROW) */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="mainOffcanvas"
        aria-labelledby="mainOffcanvasLabel"
      >
        <div className="offcanvas-header qtrack-offcanvas-header">
          <div className="d-flex align-items-center gap-3">
            <img
              src={logo}
              alt="QTrack Logo"
              className="offcanvas-logo"
            />

            <div className="brand-text">
              <h6 className="mb-0 fw-semibold">QTrack</h6>
              <small className="text-muted">
                Smart Queue Management
              </small>
            </div>
          </div>

          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>

        <div className="offcanvas-body">
          <nav className="sidebar-nav">

            <NavLink to="/" className="nav-item" data-bs-dismiss="offcanvas">
              <HomeIcon />
              <span>Home</span>
            </NavLink>

            <NavLink to="/features" className="nav-item" data-bs-dismiss="offcanvas">
              <FeatureIcon />
              <span>Features</span>
            </NavLink>

            <NavLink to="/how-it-works" className="nav-item" data-bs-dismiss="offcanvas">
              <InfoIcon />
              <span>How It Works</span>
            </NavLink>

            <NavLink to="/dashboard" className="nav-item" data-bs-dismiss="offcanvas">
              <DashboardIcon />
              <span>Dashboard</span>
            </NavLink>

            <hr />

            <NavLink to="/help" className="nav-item" data-bs-dismiss="offcanvas">
              <HelpIcon />
              <span>Help</span>
            </NavLink>

          </nav>
        </div>
      </div>

    </header>
  );
}

/* Hamburger Icon */
function Toggle() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect y="4" width="24" height="2" rx="1" fill="currentColor" />
      <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
      <rect y="18" width="24" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

/* Logo */
function Logo() {
  return (
    <Link to="/" className="logo-link">
      <img src={logo} alt="QTrack Logo" className="logo" />
    </Link>
  );
}
