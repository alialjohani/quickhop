import React from "react";

interface PropsType {
  alt: string;
  img: string;
  isActive?: boolean; // Add an optional `isActive` prop
}

const Carouseltem = ({ alt, img, isActive }: PropsType) => {
  return (
    <div className={`carousel-item ${isActive ? "active" : ""}`}>
      <img src={img} className="d-block w-100" alt={alt} />
    </div>
  );
};

export default Carouseltem;
