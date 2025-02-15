import React, { ReactNode } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";

import "./Input.scss";
import AiFeedbackMessage from "./AiFeedbackMessage";

interface PropsType {
  label: string;
  type?: string;
  id: string;
  registerObject?: UseFormRegisterReturn;
  errorMessage: string | undefined;
  maxLength?: number;
  isTextArea?: boolean;
  disabled?: boolean;
  isMandatory?: boolean;
  aiFeedbackMessage?: string;
}

const Input = ({
  label,
  type = "text",
  id,
  registerObject,
  errorMessage,
  maxLength,
  disabled,
  isTextArea = false,
  aiFeedbackMessage,
  isMandatory = false,
}: PropsType): ReactNode => {
  return (
    <div className="mb-2">
      <div className="row">
        <label htmlFor={id} className="col-sm-6 col-form-label">
          {label} {isMandatory ? <span className="text-danger">*</span> : ""}
        </label>
        <div className="col-sm-12">
          {isTextArea ? (
            <textarea
              className={`form-control ${errorMessage ? "is-invalid" : ""} `}
              placeholder={label}
              id={id}
              {...registerObject}
              style={{ height: "200px" }}
              maxLength={maxLength}
              disabled={disabled}
            ></textarea>
          ) : (
            <input
              type={type}
              className={`form-control ${errorMessage ? "is-invalid" : ""} ${aiFeedbackMessage ? "ai-feedback" : ""} `}
              id={id}
              placeholder={label}
              {...registerObject}
              maxLength={maxLength}
              disabled={disabled}
            />
          )}
          {aiFeedbackMessage && (
            <AiFeedbackMessage message={aiFeedbackMessage} />
          )}
          {errorMessage && <ErrorMessage message={errorMessage} />}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Input);
