
import { Link } from "react-router-dom";
import image1 from "../assets/images/undraw_my-location_dcug.svg";
import image3 from "../assets/images/undraw_wait-in-line_fbdq.svg";
import image4 from "../assets/images/hero.png";

export default function Hero() {
  return (
    <section className="Hero">
      <div className="Hero-inner">
        <div className="content">

          {/* LEFT TEXT SIDE */}
          <div className="text-content">
            <div className="content-header">
              <h1>Smart Queues</h1>
              <h2>Minimal Waiting</h2>

              <p>
                Queue Management Simplified <br />
                Manage lines and eliminate wait times
              </p>
            </div>

            <div className="CTA">
              <Link to="/join" className="btn btn-outline-primary btn-lg rounded-pill px-5">
                Join Queue
              </Link>
              <Link to="/dashboard" className="btn btn-primary btn-lg rounded-pill px-5">
                Manage Queue
              </Link>
            </div>

            <div className="trusted-by">
              <span>Trusted by</span>
              <div className="trusted-logos">
                <div className="logo-circle">🏥</div>
                <div className="logo-circle">🏦</div>
                <div className="logo-circle">🏛️</div>
                <div className="logo-circle">🎓</div>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE SIDE */}
          <div className="images">
            <img src={image1} className="image-main-1" alt="" />
            <img src={image3} className="image-main-3" alt="" />

            <div className="hero-main">
              <img src={image4} className="image-main-4" alt="Hero visual" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
