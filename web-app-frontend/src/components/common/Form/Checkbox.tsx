import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface PropsType {
  id: string;
  label: string;
  registerObject?: UseFormRegisterReturn;
  onClick?: () => void;
}

const Checkbox = ({ id, label, registerObject, onClick }: PropsType) => {
  return (
    <div className="form-check mb-2">
      <input
        className="form-check-input"
        type="checkbox"
        value=""
        id={id}
        {...registerObject}
        onClick={onClick}
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
