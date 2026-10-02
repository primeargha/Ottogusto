"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuth0 } from "@auth0/auth0-react";
import { getProfile } from "@/services/authService";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "./ui/modal";
import Typography from "./og-components/Typography";
import { OGButton } from "./og-components/OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useMedia } from "@/hooks/useMedia";

/**
 * Handles email-based customer onboarding via invite links
 * Extracts email from ?onboard= param and auto-authenticates users
 */
type Props = {};

const EmailLinkOnboarding = (props: Props) => {
  const { getAccessTokenWithPopup, user } = useAuth0();
  const isMobile = useMedia("(max-width: 639px)");
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getLabel } = useBranding();
  const { setAddresses, isAuthenticated, setAccessToken, setAuthUser } = useAuthStore();
  const [ShowOnboardingModal, setShowOnboardingModal] = useState(false);

  // Extract email from URL parameter
  const onboardEmail = searchParams?.get("onboard");

  // Validate email format
  const isValidEmail = (email?: string | null): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email as string);
  };

  // Authenticate user with pre-filled email
  const showAuth0Modal = async (email: string) => {
    try {
      // Clear the URL onboard parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("onboard");
      router.replace(url.pathname + url.search, { scroll: false });

      // Open Auth0 popup with prefilled email and signup screen
      const accessToken = await getAccessTokenWithPopup({
        authorizationParams: {
          login_hint: email,
          screen_hint: "signup",
          prompt: "login",
        },
      });

      if (accessToken) {
        setAccessToken(accessToken);
        const AuthUserObject = {
          accessToken: accessToken,
          ...user,
        };

        const response = await getProfile(AuthUserObject);
        setAuthUser({
          ...response.data,
        });

        if (!response.data.hasLoggedIn) {
          const locale = {
            "language-country": "en-BE",
          };
          // mobile screeen then /profile
          if (isMobile) {
            router.push(getRouteLocaleString(Routes.profileInfo, locale));
            // router.navigate("/profile");
          } else {
            router.push(getRouteLocaleString(Routes.profileInfo, locale));
            // router.navigate("/profile/info");
          }
        }
      }
    } catch (error) {
      console.error("Error during email link onboarding:", error);
    }
  };
  const loginSignUp = async (email: string) => {
    if (typeof window !== undefined) {
      localStorage.clear();
      sessionStorage.clear();
    }
    setShowOnboardingModal(true);
  };

  // Initiate onboarding if valid email in URL
  useEffect(() => {
    if (isValidEmail(onboardEmail)) {
      loginSignUp(onboardEmail!);
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop page scrolling when modal is visible
  useEffect(() => {
    if (ShowOnboardingModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [ShowOnboardingModal]);

  // http://dev.ottogusto.com/?onboard=existingusermail@domain.com
  // https://elle-semicylindrical-denunciatorily.ngrok-free.dev/?onboard=existingusermail@domain.com

  // return <></>
  return (
    <Modal
      isOpen={ShowOnboardingModal}
      onClose={() => {
        // setShowOnboardingModal(false);
      }}
      size="md"
      className="border-0"
    >
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Typography type="h2" className={`justify-start text-color-text-body body-bold-lg`}>
            {getLabel("onboarding_title")}
          </Typography>
          {/* <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton> */}
        </ModalHeader>
        <ModalBody>
          <Typography type="h3">{getLabel("onboarding_body")}</Typography>
        </ModalBody>
        <ModalFooter>
          <OGButton
            onClick={() => {
              setShowOnboardingModal(false);
              showAuth0Modal(onboardEmail!);
            }}
          >
            {getLabel("onboarding_button")}
          </OGButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EmailLinkOnboarding;
