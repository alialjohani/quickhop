import React, { ChangeEvent } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";
import { SelectOptionType } from "../../../common/types";

interface PropsType {
  label: string;
  id: string;
  registerObject?: UseFormRegisterReturn;
  errorMessage: string | undefined;
  disabled?: boolean;
  options: SelectOptionType[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  initialSelectedValue: string;
}

const Select = ({
  label,
  id,
  registerObject,
  errorMessage,
  disabled,
  options,
  onChange,
  initialSelectedValue,
}: PropsType) => {
  // console.log(">>> options= ", options);
  return (
    <div className="mb-2">
      <div className="row">
        <label htmlFor={id} className="col-sm-6 col-form-label">
          {label}
        </label>
        <div className="col-sm-12">
          <select
            id={id}
            className={`form-control ${errorMessage ? "is-invalid" : ""} `}
            aria-label="Select Country"
            {...registerObject}
            disabled={disabled}
            onChange={onChange}
            value={initialSelectedValue}
          >
            <option value="">Select</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errorMessage && <ErrorMessage message={errorMessage} />}
        </div>
      </div>
    </div>
  );
};

export default Select;
