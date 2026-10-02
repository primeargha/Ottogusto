import { ProfileUpdatePayload } from "@/types/profile";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";
import { saveAccountCartSnapshot } from "@/utils/accountCartSession";
// Lazy accessor to avoid circular dependency: useAuthStore → useCartStore → useMmeStore → ... → config/api → useAuthStore
const getCartStore = () => require("./useCartStore").useCartStore;

interface Address {
  id?: string;
  name?: string; // only for business account(company name)
  street: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  phoneNumber?: string;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
}

export interface AuthUserType {
  data: any;
  addresses: Address[];
  email: string;
  firstName: string | null | undefined;
  id: string;
  lang: string;
  lastName: string;
  companyName?: string;
  phoneNumber: string;
  picture: string | null;
}

interface AuthState {
  showLoginModal: boolean;
  openLoginModal: (redirectUrl?: string) => void;
  isAuthenticated: boolean;
  redirectToAfterLogin: string | undefined;
  resetRedirectToAfterLogin: () => void;

  accessToken: string | null;
  authUser: AuthUserType | {} | ProfileUpdatePayload;

  /** 🔹 Stored separately to avoid re-render flicker */
  profilePicture: string | null;

  setAccessToken: (token: string | null) => void;
  setAuth: (isAuth: boolean) => void;
  setAuthUser: (user: AuthUserType) => void;
  setAddresses: (addresses: Address[]) => void;
  logoutUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      showLoginModal: false,

      openLoginModal: (redirectUrl?: string) => {
        if (redirectUrl) {
          set({ redirectToAfterLogin: redirectUrl, showLoginModal: true });
        } else {
          set({ showLoginModal: true });
        }
      },

      isAuthenticated: false,
      redirectToAfterLogin: undefined,
      accessToken: null,
      authUser: {},
      profilePicture: null,

      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      setAuthUser: (userObj: AuthUserType) => {
        set({
          authUser: userObj,
          profilePicture: userObj?.picture ?? null,
          isAuthenticated: true,
        });
      },

      resetRedirectToAfterLogin: () => {
        set({ showLoginModal: false, redirectToAfterLogin: undefined });
      },

      setAddresses: (addresses: Address[]) => {
        const currentUser = get().authUser as AuthUserType;

        if ("id" in currentUser) {
          set({
            authUser: {
              ...currentUser,
              addresses: addresses,
            },
          });
        }
      },

      setAuth: (isAuth) => set({ isAuthenticated: isAuth }),

      logoutUser: () => {
        const authUser = get().authUser;
        const cart = getCartStore().getState();

        if (cart.cartid) {
          saveAccountCartSnapshot(authUser, cart.cartid, cart.cartSessionStartedAt);
        }

        cart.setIsBusiness(false);
        cart.setSelectedSavedBillingAddress(null);
        cart.setSelectedSavedDeliveryAddress(null);
        cart.setSavedBillingAddresses([]);
        cart.setSavedShippingAddresses([]);
        cart.setGuestBillingFormData(null);
        cart.setGuestDeliveryFormData(null);

        set({
          redirectToAfterLogin: undefined,
          showLoginModal: false,
          isAuthenticated: false,
          authUser: {},
          accessToken: null,
          profilePicture: null,
        });
      },
    }),
    {
      name: "auth-store",
      storage: createSafeJSONStorage(() => localStorage),
    },
  ),
);
