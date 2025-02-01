import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { closeModal } from "../../../app/slices/modalSlice";
import Button from "../Form/Button";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { login, setUser } from "../../../app/slices/authSlice";
import {
  GOOGLE_CLIENT_ID,
  NOTIFICATION_STYLE,
  USERS,
} from "../../../common/constants";
import { useAppDispatch } from "../../../app/store/store";
import useNotifyAndRoute from "../../../hooks/useNotifyAndRoute";
import { useLazyGetJobSeekerIdQuery } from "../../../app/slices/apiSlice";

const JobSeekerLogin = () => {
  const [isTokenSuccess, setIsTokenSuccess] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notifyAndRoute = useNotifyAndRoute();

  const closeModalCB = useCallback(() => {
    dispatch(closeModal());
  }, []);

  const [triggerGetId, { data: userDataId, error: userDataIdError }] =
    useLazyGetJobSeekerIdQuery();

  // const { data: userRes } = useGetJobSeekerIdQuery(undefined, {
  //   skip: !isTokenSuccess,
  //   refetchOnMountOrArgChange: true, // Ensure the data is always up-to-date
  //   refetchOnFocus: true,
  // });

  // after data is fetched from backend, set user id and route job seeker
  useEffect(() => {
    if (userDataIdError) {
      console.error("userDataIdError: ", userDataIdError);
    } else if (userDataId?.data.email) {
      // console.log(
      //   ">>>> JobSeekerLogin userRes.data.email= ",
      //   userDataId.data.email,
      // );
      dispatch(
        setUser({ id: userDataId.data.id, email: userDataId.data.email }),
      ); // Set user id
      closeModalCB();
      navigate("/job-seeker");
    }
  }, [userDataId?.data.email, userDataIdError, dispatch]);

  // after token has being set, call the backend to get the id of the user from DB
  useEffect(() => {
    if (isTokenSuccess) {
      try {
        triggerGetId().unwrap();
      } catch (error) {
        handleError(`Error with triggerGetId: ${JSON.stringify(error)}`);
      }
    }
  }, [isTokenSuccess, triggerGetId]);

  const handleError = (error?: string) => {
    console.error(error);
    notifyAndRoute(
      "You are not able to login to the system.",
      NOTIFICATION_STYLE.ERROR,
      "/",
    );
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="text-center d-flex justify-content-center gap-5 pt-5 pb-5">
        <Button
          label="Close"
          classes="btn btn-outline-secondary"
          onClick={closeModalCB}
        />

        <span className="google-login-wrapper">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              try {
                // console.log("Login Success:", credentialResponse);
                dispatch(
                  login({
                    token: credentialResponse.credential ?? "",
                    userType: USERS.JOB_SEEKER,
                  }),
                );
                setIsTokenSuccess(true);
              } catch (error) {
                handleError(
                  `Error with GoogleLogin (dispatch/login): ${JSON.stringify(error)}`,
                );
              }
            }}
            onError={() => {
              handleError(`Error with GoogleLogin`);
            }}
          />
        </span>
      </div>
    </GoogleOAuthProvider>
  );
};

export default JobSeekerLogin;
