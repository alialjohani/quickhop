import React from "react";
import { ClockLoader } from "react-spinners";

const LoadingSpinner = () => {
  return (
    <div
      className="modal fade show d-flex justify-content-center align-items-center"
      tabIndex={-1}
      role="dialog"
      style={{
        display: "block",
        height: "100vh",
      }}
    >
      <ClockLoader color="#ffffff" size={200} />
    </div>
  );
};

export default LoadingSpinner;
