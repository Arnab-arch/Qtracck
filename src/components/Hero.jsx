import { Link } from "react-router-dom";
import image1 from "../assets/images/undraw_my-location_dcug.svg";

import image3 from "../assets/images/undraw_wait-in-line_fbdq.svg";
import image4 from "../assets/images/hero.png";

export default function Hero() {
  return (
    <section className="Hero">
      <div className="content">

        <div className="content-header">
          <h1>Smart Queues</h1>
          <h2>Minimal Waiting</h2>
        
          <p>
            Queue Management Simplified <br />
            Manage lines and eliminate wait times
          </p>
        </div>

        <div className="CTA">
          <Link to="/join" className="btn btn-outline-primary rounded-pill px-4">
            Join Queue
          </Link>
          <Link to="/dashboard" className="btn btn-primary rounded-pill px-4">
            Manage Queue
          </Link>
        </div>

        {/* IMAGES */}
        <div className="images">
          <img src={image1} className="image-main-1" alt="" />
          
          <img src={image3} className="image-main-3" alt="" />
          <img src={image4} className="image-main-4" alt="Hero visual" />
        </div>

      </div>
    </section>
  );
}