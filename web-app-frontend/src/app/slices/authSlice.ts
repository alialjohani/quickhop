import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { USERS } from "../../common/constants";
import { RootState } from "../store/store";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userType: USERS | null;
  userId: number;
  email: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  userType: null,
  userId: 0,
  email: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ token: string; userType: USERS }>,
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.userType = action.payload.userType;
      // console.log(">>>> state.isAuthenticated: ", state.isAuthenticated);
      // console.log(">>>> state.token: ", state.token);
      // console.log(">>>> state.userType: ", state.userType);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.userType = null;
      state.userId = 0;
      state.email = "";
      // console.log(">>> logout state.isAuthenticated ", state.isAuthenticated);
      // console.log(">>> logout state.token ", state.token);
      // console.log(">>> logout state.userType ", state.userType);
      // console.log(">>> logout state.userId ", state.userId);
      // console.log(">>> logout state.email ", state.email);
    },
    setUser: (state, action: PayloadAction<{ id: number; email: string }>) => {
      state.userId = action.payload.id;
      state.email = action.payload.email;
      // console.log(">>>> setUser state.userId: ", state.userId);
      // console.log(">>>>  setUser state.email: ", state.email);
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;

export const authSelector = (state: RootState) => state.auth;
export const authUserIdSelector = (state: RootState) => state.auth.userId;
