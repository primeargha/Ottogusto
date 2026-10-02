import { Box } from "@/components/ui/box";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { OGCheckboxInput } from "@/components/og-components/OGCheckboxInput";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { useBranding } from "@/contexts/BrandingContext";
import { OGButton } from "@/components/og-components/OGButton";
import { useRouter } from "next/navigation";
import { useCheckoutHref } from "@/hooks/useVehicleAwareCartHref";
import { useRedirectData } from "@/utils/useRedirectData";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { getProfile } from "@/services/authService";
import { useMedia } from "@/hooks/useMedia";

const Shoppingcartemail = () => {
  const { getLabel } = useBranding();
  const isMobile = useMedia("(max-width: 639px)");
  const router = useRouter();
  const checkoutHref = useCheckoutHref();
  const { setRedirectData } = useRedirectData();
  const { getAccessTokenWithPopup, user } = useAuth0();
  const { setAccessToken, setAuthUser } = useAuthStore();
  const emailSchema = z.object({
    email: z.string().min(1, getLabel("email_required")).email(getLabel("cart_email_invalid")),
    emailConsent: z.boolean().optional(),
  });

  type EmailAddressData = z.infer<typeof emailSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm<EmailAddressData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      emailConsent: false,
    },
    mode: "onChange",
  });

  const handleLogin = async () => {
    // Validate email before proceeding
    await handleSubmit(async (data) => {
      const accessToken = await getAccessTokenWithPopup({
        authorizationParams: { login_hint: data.email.trim().toLowerCase() },
      });

      if (accessToken) {
        setAccessToken(accessToken);
        // Call your API
        const AuthUserObject = {
          accessToken: accessToken,
          ...user,
        };

        const response = await getProfile(AuthUserObject);
        setAuthUser({
          //@ts-ignore
          ...response.data,
          // businessAccount: true, // TODO: Remove this field
        });
        const { restoreAccountCartOnLogin } = await import("@/utils/restoreServerCart");
        await restoreAccountCartOnLogin(response.data);
        setRedirectData(checkoutHref, {
          email: data.email,
        });
        router.push(checkoutHref);
      }
    })();
  };

  const handleGuestCheckout = async () => {
    // Validate email before proceeding
    await handleSubmit((data) => {
      setRedirectData(checkoutHref, {
        email: data.email,
      });
      router.push(checkoutHref);
    })();
  };

  return (
    <Box
      className={` ${isMobile ? "fixed bottom-0 right-0" : "rounded-md"} flex w-full flex-col border border-color-border-emphasis bg-color-background-emphasis card-padding-default card-gap-default`}
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value, onBlur } }) => (
          <OGTextInput
            title={getLabel("cart_email_placeholder")}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={getLabel("cart_email_placeholder")}
            state={errors.email ? "error" : "default"}
            isReadOnly={false}
            error={errors.email?.message}
            autoFocus={!isMobile}
            mandatory={true}
          />
        )}
      />

      {/* Checkbox - still needs immediate handling since it has no blur event */}
      <Controller
        control={control}
        name="emailConsent"
        render={({ field: { onChange, value, onBlur } }) => (
          //@ts-ignore
          <OGCheckboxInput
            selected={value === true ? "yes" : "no"}
            state={"default"}
            label={getLabel("email_agree_terms")}
            onChange={(isSelected) => {
              onChange(isSelected);
              // handleSubmit(onSubmit)();
            }}
            onBlur={() => {
              onBlur();
              // handleSubmit(onSubmit)();
            }}
            isInvalid={!!errors.emailConsent}
            error={errors.emailConsent?.message}
          />
        )}
      />

      {/* <OGCheckboxInput label="receive email reagrding gifts" /> */}
      <Box className="flex w-full gap-space-xs base:flex-row gtsm:flex-col">
        <OGButton
          type="primary"
          size="medium"
          className="w-full base:order-2 gtsm:order-1"
          onClick={handleLogin}
          // disabled={!!errors.email || !dirtyFields.email}
        >
          {getLabel("cart_cta_SignUp_SignIn_Pay")}
        </OGButton>
        <OGButton
          type="ghost"
          size="medium"
          className="w-full base:order-1 gtsm:order-2"
          onClick={handleGuestCheckout}
          // disabled={!!errors.email || !dirtyFields.email}
        >
          {getLabel("checkout_continue_guest")}
        </OGButton>
      </Box>
    </Box>
  );
};

export default Shoppingcartemail;
