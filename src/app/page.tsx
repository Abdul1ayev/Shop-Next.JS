import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";
import Section from "@/components/Section";
import Products_user from "./product/page";
const Page = () => {
  return (
    <div>
      <Navbar />
      <Section/>
      <Products_user />
      <Footer />
    </div>
  );
};

export default Page;
