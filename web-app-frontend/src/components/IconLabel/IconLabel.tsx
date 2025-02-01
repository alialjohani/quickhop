import React from "react";

interface PramsType {
  title: string;
  status?: string;
  phoneCall?: boolean;
  onClick?: () => void;
}

const IconLabel = ({ title, status, phoneCall, onClick }: PramsType) => {
  return (
    <span className="d-flex align-items-center">
      {status && (
        <i
          className={`bi bi-circle-fill me-4 ${status}`}
          style={{ marginTop: "-5px" }}
        ></i>
      )}
      {phoneCall && (
        <i
          className="text-light bi bi-telephone me-4"
          style={{ cursor: "pointer" }}
          onClick={onClick}
        ></i>
      )}
      <h6 className="mb-0 text-light">{title}</h6>
    </span>
  );
};

export default IconLabel;
