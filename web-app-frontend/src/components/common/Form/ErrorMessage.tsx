import React, { ReactNode } from "react";

type PropsType = {
  message: string | undefined;
};

const ErrorMessage = ({ message }: PropsType): ReactNode => {
  return <div className="invalid-feedback">{message}</div>;
};

export default ErrorMessage;
