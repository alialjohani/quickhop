import React from "react";
import image1 from "../../../../public/assets/carousel/AI_Powered_Hiring.jpg";
import image2 from "../../../../public/assets/carousel/Detailed_AI_Feedback.jpg";
import image3 from "../../../../public/assets/carousel/Seamless_Interviews_with_AI.jpg";
import CarouselSection from "./CarouselSection";
import Carouseltem from "./Carouseltem";

const Carousel = () => {
  return (
    <CarouselSection>
      <Carouseltem img={image1} alt="AI Powered Hiring" />
      <Carouseltem img={image2} alt="Detailed AI Feedback" />
      <Carouseltem img={image3} alt="Seamless Interviews with AI" />
    </CarouselSection>
  );
};

export default Carousel;
