import React from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

interface PropsType {
  url: string;
  label?: string;
}

const CancelButton = ({ url, label }: PropsType) => {
  const navigate = useNavigate();
  const labelText = label ? label : "Cancel";
  return (
    <Button
      label={labelText}
      classes="btn btn-secondary me-3"
      onClick={() => navigate(url)}
    />
  );
};

export default CancelButton;
