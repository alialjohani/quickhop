import React from "react";
import "./CarouselSection.scss";

interface PropsType {
  children: React.ReactElement[];
}

const CarouselSection = ({ children }: PropsType) => {
  return (
    <section className="py-0 px-0 carousel-section">
      <div className="py-2">
        <div
          id="carouselControls"
          className="carousel slide"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            {React.Children.map(children, (child, index) =>
              React.cloneElement(child, { isActive: index === 0 }),
            )}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselControls"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselControls"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CarouselSection;
