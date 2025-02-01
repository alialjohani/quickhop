/**
 * Button.tsx
 *
 * Custom component button to be used.
 */

import React from "react";

type PropsType = {
  label: string;
  classes?: string;
  onClick?: (param?: any) => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  label,
  classes = "btn btn-outline-secondary",
  onClick,
  ...rest
}: PropsType): JSX.Element => {
  return (
    <button type="button" className={classes} onClick={onClick} {...rest}>
      {label}
    </button>
  );
};

export default React.memo(Button);
