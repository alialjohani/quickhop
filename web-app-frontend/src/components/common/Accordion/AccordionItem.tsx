import React from "react";
import { ACCORDION_STATUS } from "../../../common/constants";
import IconLabel from "../../IconLabel/IconLabel";

interface PropsType {
  id: string;
  title: string;
  children: React.ReactNode;
  status?: ACCORDION_STATUS;
}
const AccordionItem = ({
  id,
  title,
  children,
  status = ACCORDION_STATUS.SUCCESS,
}: PropsType) => {
  return (
    <div className="accordion-item mb-3">
      <h2 className="accordion-header bg-primary" id={`heading${id}`}>
        <button
          className="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#${id}`}
          aria-expanded="true"
          aria-controls={id}
        >
          <IconLabel status={status} title={title} />
        </button>
      </h2>
      <div
        id={id}
        className="accordion-collapse collapse show "
        aria-labelledby={`heading${id}`}
      >
        <div className="accordion-body">{children}</div>
      </div>
    </div>
  );
};

export default AccordionItem;
