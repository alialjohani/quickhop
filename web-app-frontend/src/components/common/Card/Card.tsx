import React from "react";
import { Dictionary } from "../../../common/types";

interface PropsType {
  header: JSX.Element;
  bodyCard: Dictionary[];
  footerLeft?: JSX.Element;
  footerRight_Left?: JSX.Element;
  footerRight_Right?: JSX.Element;
  isSeparatedLine?: boolean;
}

const Card = ({
  header,
  bodyCard,
  footerLeft,
  footerRight_Left,
  footerRight_Right,
  isSeparatedLine,
}: PropsType) => {
  return (
    <div className="card h-100 w-100 mb-5">
      <div className="card-header bg-dark">
        <span>{header}</span>
      </div>
      <div className="card-body">
        {bodyCard.map((element, index) =>
          Object.entries(element).map(([key, value]) => {
            let component = (
              <div key={key} className="d-flex flex-wrap">
                <span className="text-muted w-50 w-md-100 ">{key}</span>
                <span className="text-dark flex-grow-1 text-start text-wrap">
                  {value}
                </span>
              </div>
            );
            // Using div to present as a block
            if (isSeparatedLine) {
              component = (
                <>
                  <div className="text-muted">{key}</div>
                  <div className="text-dark">{value}</div>
                </>
              );
            }
            return (
              <h5 key={index} className="card-title">
                {component}
              </h5>
            );
          }),
        )}
        <div className="card-footer">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>{footerLeft}</div>
            <div className="d-flex justify-content-between flex-wrap">
              {footerRight_Left}
              {footerRight_Right}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
