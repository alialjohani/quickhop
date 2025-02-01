import React from "react";

interface PropsType {
  children: React.ReactNode;
  classes?: string;
  onSubmit?: (e: React.BaseSyntheticEvent) => Promise<void>;
  noBorder?: boolean;
}

const Form = ({ children, onSubmit, classes, noBorder = false }: PropsType) => {
  return (
    <form
      className={`needs-validation ${classes} ${noBorder ? "" : "border border-light"} p-3 mb-3`}
      onSubmit={onSubmit}
      noValidate
    >
      {children}
    </form>
  );
};

export default Form;
