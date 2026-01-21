import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Header from "../components/Header";
import Hero from "../components/Hero"
export default function Landing() {
  return (
   <div className="Landing">
    <Header/>
    <Hero/>  
    <Features/>
    <HowItWorks/>

   </div>
  );
}
