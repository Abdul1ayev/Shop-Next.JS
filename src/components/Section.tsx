"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
const Section = () => {
  return (
    <div className=" mx-auto p-2">
      <section
        className="md:px-16 md:py-10  py-2
"
      >
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          loop={true}
          className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg"
        >
          <SwiperSlide>
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-center text-white p-4">
                <h1 className="text-6xl font-extrabold mb-4 animate-fadeInUp">
                  LETS MAKE A{" "}
                  <span className="text-green-400">BETTER PLANET</span>
                </h1>
                <p className="text-xl mb-6 animate-fadeInUp delay-200">
                  Discover our range of trendy and affordable plants.
                </p>
                <button className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition duration-300 animate-fadeInUp delay-400">
                  SHOP NOW
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
