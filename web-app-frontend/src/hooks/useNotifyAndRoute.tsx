import { useAppDispatch } from "../app/store/store";
import { showNotification } from "../app/slices/notificationSlice";
import { NOTIFICATION_STYLE } from "../common/constants";
import { useNavigate } from "react-router-dom";
import useScrollToTop from "./useScrollToTop";

const useNotifyAndRoute = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();
  const notifyAndRoute = (
    message: string,
    style: NOTIFICATION_STYLE,
    url?: string,
  ) => {
    if (message === "") {
      message =
        "An error occurred while connecting to the server. Please try again later.";
    }
    dispatch(
      showNotification({
        isOpen: true,
        message,
        style,
      }),
    );
    // setTimeout(() => {
    //     dispatch(closeNotification({ isOpen: false }))
    // }, 1000)
    if (url) {
      navigate(url);
      scrollToTop();
    }
  };

  return notifyAndRoute;
};

export default useNotifyAndRoute;
