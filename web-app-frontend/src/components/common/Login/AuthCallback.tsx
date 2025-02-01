/**
 * AuthCallback.tsx
 * Used specifically for AWS Cognito login which is utilized for Recruiter login.
 */
import { useEffect } from "react";
import { useExchangeCodeForTokensMutation } from "../../../app/slices/apiAwsAuthSlice";
import { useNavigate } from "react-router-dom";
import HomeNavbar from "../../homeComponents/HomeNavbar";
import { useGetUserIdQuery } from "../../../app/slices/apiSlice";
import { useAppDispatch } from "../../../app/store/store";
import { setUser } from "../../../app/slices/authSlice";
import useSpinner from "../../../hooks/useSpinner";

export const AuthCallback = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [exchangeCodeForTokens, { isSuccess }] =
    useExchangeCodeForTokensMutation();

  const { data: userRes, isLoading } = useGetUserIdQuery(undefined, {
    skip: !isSuccess, // Fetch only when isSuccess is true
    refetchOnMountOrArgChange: true, // Re-fetches every time the component mounts
    refetchOnFocus: true, // Re-fetches when the page regains focus
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    let timeout: NodeJS.Timeout;
    if (code) {
      timeout = setTimeout(() => {
        exchangeCodeForTokens({ code });
      }, 1000);
    }

    return () => {
      clearTimeout(timeout); // Cleanup the timeout on unmount
    };
  }, [exchangeCodeForTokens]);

  // Set user id
  useEffect(() => {
    if (userRes) {
      dispatch(setUser({ id: userRes.data.id, email: userRes.data.email }));
    }
  }, [userRes, dispatch]);

  // Redirect to target page once the exchange is successful
  useEffect(() => {
    // console.log(">>> AuthCallback/useEffect");
    if (isSuccess && userRes) {
      // console.log(">>> AuthCallback/useEffect, isSuccess");
      navigate("/recruiter");
    }
  }, [isSuccess, navigate, userRes]);

  useSpinner([isLoading]);

  return (
    <>
      <HomeNavbar />
      <div></div>
    </>
  );
};
