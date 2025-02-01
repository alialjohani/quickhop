import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../app/slices/authSlice";
import { useAppDispatch } from "../../../app/store/store";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const logoutHandler = () => {
    dispatch(logout());
    navigate("/");
  };
  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link dropdown-toggle text-light"
        role="button"
        onClick={logoutHandler}
      >
        Logout
      </a>
    </li>
  );
};

export default Logout;
