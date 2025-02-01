import { Middleware } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

import { logout } from "../slices/authSlice";

// Define the expected structure of the JWT payload
interface JWTPayload {
  exp: number; // Expiration time in seconds since the Unix epoch
}

const checkTokenMiddleware: Middleware<object> =
  (store) => (next) => (action) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      // Decode the token and check expiration
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
      // console.log(">>> decoded= ", decoded);
      // console.log(">>> decoded.exp= ", decoded.exp);
      if (decoded.exp < currentTime) {
        // Token is expired; log out the user
        store.dispatch(logout());
      }
    }

    return next(action);
  };

export default checkTokenMiddleware;
