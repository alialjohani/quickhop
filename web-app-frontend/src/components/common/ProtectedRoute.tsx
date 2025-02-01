// components/ProtectedRoute.tsx
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { store } from "../../app/store/store";
import { useAppDispatch, useAppSeclector } from "../../app/store/store";
import { authSelector } from "../../app/slices/authSlice";
import { USERS } from "../../common/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: USERS;
}

const CHECKING_TOKEN_TIME = 600000; // 10 minutes

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, userType, token } = useAppSeclector(authSelector);
  // console.log(">>> ProtectedRoute, isAuthenticated= ", isAuthenticated);
  // console.log(">>> ProtectedRoute, userType= ", userType);
  useEffect(() => {
    const intervalId = setInterval(() => {
      store.dispatch({ type: "CHECK_TOKEN" }); // Dispatch the custom action
    }, CHECKING_TOKEN_TIME);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [token, dispatch]);

  if (!isAuthenticated || userType !== requiredRole) {
    ///>>> route, notificate
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
