import React, { ReactNode } from "react";

interface PropsType {
  children: ReactNode;
  classes?: string;
}

const GroupButtons = ({ children, classes }: PropsType) => {
  return (
    <div className={classes ? classes : "d-flex justify-content-end mt-4"}>
      {children}
    </div>
  );
};

export default GroupButtons;
