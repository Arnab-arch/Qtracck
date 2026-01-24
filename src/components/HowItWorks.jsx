import step1 from "../assets/images/step1.png";
import step2 from "../assets/images/step2.png";
import step3 from "../assets/images/step3.png";
import step4 from "../assets/images/step4.png";






export default function HowItWorks(){

    return(
        <section className="HowItWorks">
             <div className="title">
                <h1 className="heading-how">Made for busy places. Easy for everyone.</h1>
                <p className="subtitles">Find a location, book your token, track live wait time, and get notified right before your turn.</p>
            </div>
            <div className="cards-wrapper">
                <div className="step1">
                    <img className="image-wrap img-1" src={step1}/>
                
                 <div className="card1">
                    <h2 className="heading-section">Find Nearby Location</h2>
                    
                 <p className="sub-text">Search hospitals, banks, or government offices near you and pick the least crowded one.</p>
                 </div>
                </div>
                <div className="step2">
                    <img className="image-wrap img-2"src={step2}/>
                <div className="card1">
                    <h2 className="heading-section">Find Nearby Location</h2><p className="sub-text">Book your token instantly using your phone—no standing in physical lines.</p>
                    </div>
                    </div>
                <div className="step3">
                    <img className="image-wrap img-3"src={step3}/>
                <div className="card1">
                    <h2 className="heading-section">Find Nearby Location</h2><p className="sub-text">See your real-time position, counter updates, and estimated waiting time.</p>
                    </div>
                    </div>
                <div className="step4">
                    <img className="image-wrap img-4"src={step4}/>
                <div className="card1">
                    <h2 className="heading-section">Get Served On Time</h2><p className="sub-text">Get notified when it’s almost your turn so you don’t waste your day waiting.</p>
                    </div>
                    </div>
                
                
            </div>
           
          
            
      
        </section>
      
           

    );
}