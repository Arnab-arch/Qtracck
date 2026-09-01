import HowItWorks from "../../components/HowItWorks.jsx";
import Features from "../../components/Features.jsx";
import Header from "../../components/Header.jsx";
import Hero from "../../components/Hero.jsx"
import DashboardPreview from "../../components/DashboardPreview.jsx"
import UseCases from "../../components/UseCases.jsx";
import Testimonials from "../../components/Testimonials.jsx";
import FaqCTA from "../../components/CTA.jsx";
export default function Landing() {
  return (
   <div className="Landing">
    <Header/>
    <Hero/>  
    <Features/>
    <HowItWorks/>
    <DashboardPreview/>
    <UseCases/>
    <Testimonials/>
    < FaqCTA/>
   </div>
  );
}
