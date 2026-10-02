"use client";
import { useAuthStore } from "@/stores/useAuthStore";
import useRouter from "@unitools/router";
import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";
import { getProfile } from "@/services/authService";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
import { restoreAccountCartOnLogin } from "@/utils/restoreServerCart";
type Props = {};

const RedirectManager = (props: Props) => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const {
    isAuthenticated,
    redirectToAfterLogin,
    resetRedirectToAfterLogin,
    setAccessToken,
    setAuthUser,
    openLoginModal,
    showLoginModal,
  } = useAuthStore();
  const { getAccessTokenWithPopup, getIdTokenClaims, user } = useAuth0();

  const loginCallback = async () => {
    if (!isAuthenticated && showLoginModal) {
      try {
        // let accessToken = await getAccessTokenSilently();
        let accessToken = await getAccessTokenWithPopup();
        const idToken = await getIdTokenClaims();
        // accessToken = idToken?.__raw;

        // Reset the state if accessToken is not available or Unauthorized
        if (!accessToken) {
          resetRedirectToAfterLogin();
          return;
        }

        setAccessToken(accessToken);
        // Call your API
        const AuthUserObject = {
          accessToken: accessToken,
          ...user,
        };

        const response = await getProfile(AuthUserObject);
        setAuthUser({
          ...response.data,
          // businessAccount: true, // TODO: Remove this field
        });
        queryClient.setQueryData(queryKeys.profile.formation(), response);

        await restoreAccountCartOnLogin(response.data);

        if (redirectToAfterLogin) {
          // Return the user to the page they were on before clicking Login/Register.
          router.push(redirectToAfterLogin);
          resetRedirectToAfterLogin();
        } else if (!response.data.hasLoggedIn) {
          // Brand-new account with no captured origin page falls back to the Homepage.
          router.push(getRouteLocaleString(Routes.pitStop, params));
        }
      } catch (error) {
        console.error("Error fetching data from API:", formatHttpClientError(error));
        resetRedirectToAfterLogin();
      }
    }
  };

  useEffect(() => {
    loginCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, showLoginModal]);

  return null;
};

export default RedirectManager;
