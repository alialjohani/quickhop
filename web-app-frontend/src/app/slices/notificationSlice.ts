import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NOTIFICATION_STYLE } from "../../common/constants";
import { RootState } from "../store/store";

interface InitialStateType {
  isOpen: boolean;
  message: string;
  style: NOTIFICATION_STYLE;
}

const initialState: InitialStateType = {
  isOpen: false,
  message: "",
  style: NOTIFICATION_STYLE.SUCCESS,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (state, actions: PayloadAction<InitialStateType>) => {
      state.isOpen = actions.payload.isOpen;
      state.message = actions.payload.message;
      state.style = actions.payload.style;
    },
    closeNotification: (state, actions: PayloadAction<{ isOpen: boolean }>) => {
      state.isOpen = actions.payload.isOpen;
    },
  },
});

export default notificationSlice.reducer;
export const { showNotification, closeNotification } =
  notificationSlice.actions;
export const notificationSlector = (state: RootState) => state.notification;
