import React from "react";

interface PropsType {
  children: React.ReactNode;
}

const Accordion = ({ children }: PropsType) => {
  return (
    <div className="accordion" id="formAccordion">
      {children}
    </div>
  );
};

export default Accordion;
