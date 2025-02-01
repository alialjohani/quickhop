import React from "react";
import { FormViewDataType } from "../../../common/types";
import CancelButton from "../Form/CancelButton";

interface PropsType {
  data: FormViewDataType[];
  cancelUrlNavigate?: string;
}

const FormView = ({ data, cancelUrlNavigate }: PropsType) => {
  return (
    <div className="container mt-4 pb-4">
      {data.map((d, index) => (
        <div key={index}>
          <div className="row">
            <div className="col-md-4 text-muted text-end fw-bold">
              {d.label}
            </div>
            <div className="col-md-8">{d.value}</div>
          </div>
          <hr />
        </div>
      ))}
      {cancelUrlNavigate && (
        <div className="d-flex justify-content-end">
          <CancelButton url={cancelUrlNavigate} label="Go Back" />
        </div>
      )}
    </div>
  );
};

export default FormView;
