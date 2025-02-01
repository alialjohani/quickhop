import React from "react";
import "./ItemSection.scss";

interface PropsType {
  title: string;
  imageSrc: string;
  content: string;
  imagePosition?: string;
  textColor?: string;
}

const ItemSection = ({
  title,
  imageSrc,
  content,
  imagePosition = "left",
  textColor,
}: PropsType) => {
  const imageOrder = imagePosition === "left" ? "order-md-1" : "order-md-2";
  const contentOrder =
    imageOrder === "order-md-1" ? "order-md-2" : "order-md-1";
  const fontColor = textColor === "light" ? "light" : "primary";
  return (
    <div className="container my-5">
      <div className="row align-items-center g-5">
        {/* Left/Right Image */}
        <div
          className={`col-md-6 ${imageOrder} image-container d-flex justify-content-center align-items-center`}
        >
          <img
            src={imageSrc}
            className="img-fluid rounded border"
            alt={title}
          />
        </div>

        {/* Text Content */}
        <div className={`col-md-6 ${contentOrder}`}>
          <h2 className={`text-${fontColor}`}>{title}</h2>
          <hr className={`text-${fontColor}`} />
          <p className={`text-${textColor} fs-5`}>{content}</p>
        </div>
      </div>
    </div>
  );
};

export default ItemSection;
