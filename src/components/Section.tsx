"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const Section = () => {
  const handleScroll = () => {
    window.scrollBy({ top: 540, behavior: "smooth" });
  };

  return (
    <div className="mx-auto p-3">
      <section className="bg-white md:px-16 md:py-10 py-2 rounded-xl shadow-md">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop={true}
          className="w-full h-[600px] rounded-2xl overflow-hidden"
        >
          <SwiperSlide>
            <div className="relative w-full h-full">
             
              <div className="absolute inset-0 bg-white bg-opacity-30 flex flex-col justify-center items-center text-center text-green-400 p-4">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fadeInUp">
                  LET'S MAKE A{" "}
                  <span className="text-green-400">BETTER PLANET</span>
                </h1>
                <p className="text-lg md:text-xl mb-3 animate-fadeInUp delay-200">
                  Discover our range of trendy and affordable plants.
                </p>
                <p className="text-base md:text-lg mb-6 animate-fadeInUp delay-300">
                  Greenery not only beautifies your space, it improves your health and purifies the air.
                  Join our mission to bring nature closer to everyone’s home.
                </p>
                <button
                  onClick={handleScroll}
                  className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition duration-300 animate-fadeInUp delay-400"
                >
                  SHOP NOW
                </button>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative w-full h-full">
              <img
                src="https://source.unsplash.com/1600x900/?forest,green"
                alt="Green Forest"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-white bg-opacity-40 flex flex-col justify-center items-center text-center text-green-400 p-4">
                <h2 className="text-4xl font-bold mb-3">Go Green, Live Clean</h2>
                <p className="text-lg mb-2">
                  Join us in creating a cleaner earth. Every plant you grow contributes to a better future.
                </p>
                <p className="text-base md:text-lg mb-5">
                  Our eco-friendly collection is perfect for your home, office, or gift-giving.
                  Let’s embrace sustainability and take action together.
                </p>
                <button className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition duration-300 animate-fadeInUp delay-400">
                  Learn More
                </button>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>
    </div>
  );
};

export default Section;
