/**
 * Notification.tsx
 *
 * General notification messages to be displayed for users2.
 */
import React from "react";
import "./Notification.scss";
import { useAppDispatch, useAppSeclector } from "../../../app/store/store";
import {
  closeNotification,
  notificationSlector,
} from "../../../app/slices/notificationSlice";

const Notification = () => {
  const notification = useAppSeclector(notificationSlector);
  const dispatch = useAppDispatch();
  return (
    <>
      {notification.isOpen && (
        <div className={`notification notification-${notification.style}`}>
          <span>{notification.message}</span>
          <button
            className="btn-close"
            aria-label="Close"
            onClick={() => dispatch(closeNotification({ isOpen: false }))}
          ></button>
        </div>
      )}
    </>
  );
};

export default Notification;
