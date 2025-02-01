import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import modalSlice from "../slices/modalSlice";
import spinnerSlice from "../slices/spinnerSlice";
import notificationSlice from "../slices/notificationSlice";
import { apiSlice } from "../slices/apiSlice";
import authReducer from "../slices/authSlice";
import checkTokenMiddleware from "./checkTokenMiddleware";
import { apiAwsAuthSlice } from "../slices/apiAwsAuthSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    modal: modalSlice,
    spinner: spinnerSlice,
    notification: notificationSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [apiAwsAuthSlice.reducerPath]: apiAwsAuthSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(apiAwsAuthSlice.middleware)
      .concat(checkTokenMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSeclector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector;
