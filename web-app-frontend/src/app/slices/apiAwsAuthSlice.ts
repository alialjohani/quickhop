// services/authApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { login } from "./authSlice";
import {
  COGNITO_CLIENT_ID,
  COGNITO_DOMAIN,
  COGNITO_REDIRECT_URI,
  USERS,
} from "../../common/constants";

const clientId = COGNITO_CLIENT_ID;
const cognitoDomain = COGNITO_DOMAIN;
const redirectUri = COGNITO_REDIRECT_URI;

export const apiAwsAuthSlice = createApi({
  reducerPath: "awsAuthApi",
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    exchangeCodeForTokens: builder.mutation<
      { access_token: string; refresh_token: string },
      { code: string }
    >({
      query: ({ code }) => {
        const requestBody = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          redirect_uri: redirectUri,
          code: code,
          code_verifier: sessionStorage.getItem("pkce_code_verifier") || "", //localStorage.getItem("pkce_code_verifier") || "",
        }).toString();

        // Log the request body to inspect the data being sent
        // console.log("Request body being sent to Cognito:", requestBody);

        return {
          url: `${cognitoDomain}/oauth2/token`,
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: requestBody,
        };
      },
      async onQueryStarted(_args, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          // Log the token data for debugging
          // console.log(">>>> Token exchange successful:", data);

          // Dispatch authentication action with token
          dispatch(
            login({ token: data.access_token, userType: USERS.RECRUITER }),
          );
        } catch (error) {
          console.error(">>>> Token exchange failed:", error);
        }
      },
    }),
  }),
});

export const { useExchangeCodeForTokensMutation } = apiAwsAuthSlice;
