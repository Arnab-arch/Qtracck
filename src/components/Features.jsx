
import ai from "../assets/images/IT Support (1).png";
import image2 from "../assets/images/Busy 1.png";
import image3 from "../assets/images/navigation.png";
import image4 from "../assets/images/User Testing 2.png";
import image5 from "../assets/images/QR Code.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import gsap from "gsap";
import { useRef } from "react";

export default function Features() {
  const swiperRef = useRef(null);

  const features = [
    {
      title: "Instant Token Booking",
      disc: "Get a digital token in seconds and avoid standing in long lines.",
      icon: <img src={ai} className="feature-img" alt="Instant Token Booking" />,
    },
    {
      title: "Live Wait Time Updates",
      disc: "See real-time queue status and estimated waiting time before you leave.",
      icon: <img src={image2} className="feature-img" alt="Live Wait Time Updates" />,
    },
    {
      title: "Nearby Locations Finder",
      disc: "Find nearby hospitals, offices, or services with the least crowd.",
      icon: <img src={image3} className="feature-img" alt="Nearby Locations Finder" />,
    },
    {
      title: "Smart Counter Management",
      disc: "Staff can manage counters, prioritize users, and reduce overload quickly.",
      icon: <img src={image4} className="feature-img" alt="Smart Counter Management" />,
    },
    {
      title: "Tokenless QR Check-in",
      disc: "Visitors join queues instantly — no forms required.",
      icon: <img src={image5} className="feature-img" alt="Tokenless QR Check-in" />,
    },
  ];

  const animateSlide = (swiper) => {
    if (!swiper) return;

   
    const realIndex = swiper.realIndex;

   
    const slideEl = swiper.slides[swiper.activeIndex];
    if (!slideEl) return;

    const card = slideEl.querySelector(".feature-card");
    if (!card) return;

    const heading = card.querySelector(".feature-heading");
    const desc = card.querySelector(".feature-disc");
    const img = card.querySelector(".feature-img");

   
    gsap.killTweensOf([card, heading, desc, img]);

  
    gsap.set([card, heading, desc, img], { clearProps: "all" });

   
    const tl = gsap.timeline();

    tl.fromTo(
      card,
      { opacity: 0, y: 40, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" }
    )
      .fromTo(
        heading,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
        "-=0.3"
      )
      .fromTo(
        desc,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
        "-=0.3"
      )
      .fromTo(
        img,
        { opacity: 0, x: 40, scale: 0.96 },
        { opacity: 1, x: 0, scale: 1, duration: 0.55, ease: "power3.out" },
        "-=0.35"
      );
  };

  return (
    <section className="features-section">
      <div className="features-inner">
        <h1 className="features-title">Features</h1>
      </div>

      <Swiper
       
  modules={[Navigation, Pagination]}
  className="feature-swiper"
  pagination={{ clickable: true }}
  navigation
  loop={true}
  centeredSlides={true}
  spaceBetween={20}
  slidesPerView={1}
  breakpoints={{
    0: { slidesPerView: 1 },
    576: { slidesPerView: 1.2 },
    768: { slidesPerView: 2 },
    992: { slidesPerView: 2.2 },
  }}

        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setTimeout(() => animateSlide(swiper), 150); 
        }}
        onSlideChange={(swiper) => {
          animateSlide(swiper); 
        }}
      >
        {features.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="feature-card">
              <div className="feature-left">
                <h3 className="feature-heading">{item.title}</h3>
                <p className="feature-disc">{item.disc}</p>
              </div>

              <div className="feature-right">{item.icon}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}