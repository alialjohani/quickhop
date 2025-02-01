import React from "react";
import { useAppDispatch } from "../../../app/store/store";
import { closeModal } from "../../../app/slices/modalSlice";

import "./ModalComponents.scss";

type PropsType = {
  title: string;
  children: JSX.Element;
  isHeaderDark?: boolean;
};

const ModalComponent = ({
  title,
  children,
  isHeaderDark = false,
}: PropsType) => {
  const dispatch = useAppDispatch();
  return (
    <div
      className="modal fade show"
      tabIndex={-1}
      role="dialog"
      style={{ display: "block" }}
    >
      <div className="modal-dialog">
        <div className="modal-content p-0 m-0">
          <div
            className={`modal-header ${isHeaderDark ? "bg-dark text-light" : ""}`}
          >
            <h5 className="modal-title" id="exampleModalLiveLabel">
              {title}
            </h5>
            <button
              onClick={() => dispatch(closeModal())}
              type="button"
              className="btn-close"
            ></button>
          </div>
          <div className="modal-body p-0 m-0">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;
