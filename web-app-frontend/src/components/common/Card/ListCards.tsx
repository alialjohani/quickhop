import React from "react";

interface PropsType {
  elements: JSX.Element[];
}

const ListCards = ({ elements }: PropsType) => {
  return (
    <div className="row align-items-center">
      {elements.map((element, index) => (
        <div key={index} className="col-md-4 col-sm-6 mt-3">
          {element}
        </div>
      ))}
    </div>
  );
};

export default ListCards;
