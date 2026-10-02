import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeJSONStorage } from "@/utils/safeStorage";
import { isCartSessionExpired } from "@/utils/cartSession";
// Lazy accessor to avoid circular dependency: useCartStore → useMmeStore → ... → useAuthStore → useCartStore
const getMmeStore = () => require("./useMmeStore").useMmeStore;
import { Address } from "@/types/profile";
import type { ViewItemListCategoryContext } from "@/utils/gtm";
import type { PartImageItem } from "@/utils/partImageUtils";

export interface CartItem {
  id: string;
  partname?: string;
  price?: number;
  isIOPart?: boolean;
  view?: "Card" | "Mobile" | "list";
  description?: string;
  image?: string;
  product?: { images?: PartImageItem[] };
  showStarBlock?: boolean;
  pricecomp?: React.ReactNode;
  quantity?: number;
  shippingDelivery: boolean;
  shippingPickup: boolean;
  shippingWarehouse: boolean;
  name?: string;
  seo?: {
    name?: string;
    title?: string;
    description?: string;
    schema?: string;
  };
  manufacturer?: string;
  manufacturerId?: string;
  /** PDP title; helps add-to-cart / GTM when only CartItem shape is available */
  title?: string;
  manufacturerType?: string;
  // Defination coming from API
  unitPrice?: string;
  unitPriceIncVat?: string;
  vatPercentage?: string;
  discount?: string;
  discountPercentage?: string;
  status?: string;
  totalPriceExVat?: string;
  totalPriceIncVat?: string;
  compatibilityTested: boolean;
  availability?: string;
  recommendedPriceInclVat?: number;
  oeReference?: string;
  categories?: string[];
  /** Breadcrumb / list-aligned GA4 categories; persisted for view_cart & checkout. */
  itemCategoryContext?: ViewItemListCategoryContext;
}
interface Guestuser {
  firstName: string;
  lastName: string;
  email: string;
  emailconfirm: boolean;
}

interface CartStore {
  cartitems: CartItem[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  cartCount: number;
  contactinfo: Guestuser;
  setcontactinfo: (info: Guestuser) => void;
  setcartCount: (count: number) => void;
  setupdatecart: (items: CartItem[]) => void;
  updateItem: (id: string, quantity: number) => void;
  savedShippingAddresses: Address[];
  savedBillingAddresses: Address[];
  selectedSavedDeliveryAddress: Address | null;
  selectedSavedBillingAddress: Address | null;
  deliveryInstructions: string;
  deliveryTime: string | null | undefined;
  setDeliveryTime: (time: string) => void;
  // Warehouse pickup address (separate from standard delivery address)
  warehouseAddress: Address | null;
  setWarehouseAddress: (address: Address | null) => void;
  // Guest user form data persistence
  guestDeliveryFormData: Partial<Address> | null;
  guestBillingFormData: Partial<Address> | null;
  guestIsSameBilling: boolean | null; // Store guest user's checkbox state
  setGuestDeliveryFormData: (data: Partial<Address> | null) => void;
  setGuestBillingFormData: (data: Partial<Address> | null) => void;
  setGuestIsSameBilling: (value: boolean | null) => void;
  setDeliveryInstructions: (instructions: string) => void;
  formMode: {
    delivery: "add" | "edit" | "hidden";
    billing: "add" | "edit" | "hidden";
  };
  isSameBilling: boolean;
  isSameShipping: boolean;
  isAccordionOpen: boolean;
  isTypeAccordianOpen: boolean;
  setisTypeAccordianOpen: (value: boolean) => void;
  // View state for address list components (View 1 = single selected card, View 2 = all addresses)
  showAllBillingAddresses: boolean;
  showAllDeliveryAddresses: boolean;
  setShowAllBillingAddresses: (value: boolean) => void;
  setShowAllDeliveryAddresses: (value: boolean) => void;
  setSavedShippingAddresses: (addresses: Address[], skipAutoSelect?: boolean) => void;
  setSavedBillingAddresses: (addresses: Address[], skipAutoSelect?: boolean) => void;
  setSelectedSavedDeliveryAddress: (address: Address | null) => void;
  setSelectedSavedBillingAddress: (address: Address | null) => void;
  setFormMode: (mode: {
    delivery: "add" | "edit" | "hidden";
    billing: "add" | "edit" | "hidden";
  }) => void;
  setIsSameBilling: (value: boolean) => void;
  setIsSameShipping: (value: boolean) => void;
  setIsAccordionOpen: (value: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  resetCart: () => void;
  clearCheckoutStates: () => void;
  cartid: string;
  setcartid: (id: string) => void;
  totalprice: number;
  setTotalPrice: (price: number) => void;
  shippingfee: number;
  setShippingFee: (fee: number) => void;
  vatPercentage: number;
  setVatPercentage: (value: number) => void;
  // Shipping method from Calculate API response (e.g. PICKUP, GLS Europe)
  shippingMethod: string;
  setShippingMethod: (method: string) => void;
  // Standard delivery shipping fee (persisted when switching to warehouse pickup)
  standardDeliveryShippingFee: number;
  setStandardDeliveryShippingFee: (fee: number) => void;
  checkoutpending: boolean;
  setcheckoutpending: (pending: boolean) => void;
  paymentmethod: string;
  setpaymentmethod: (method: string) => void;
  // below states for show all items in overviewcard
  showAllItems: boolean;
  setShowAllItems: (value: boolean) => void;
  iscartchanged: boolean;
  setiscartchanged: (value: boolean) => void;
  cartlanguage: string;
  setcartlanguage: (lang: string) => void;
  depositfee: number;
  setdepositfee: (fee: number) => void;
  compatibilityCheckBasic: () => boolean;
  try_again: boolean;
  settry_again: (value: boolean) => void;
  isBusiness: boolean;
  setIsBusiness: (value: boolean) => void;
  guestAddressFormsValid: boolean;
  setGuestAddressFormsValid: (value: boolean) => void;
  showAlert: boolean;
  setShowAlert: (value: boolean) => void;
  cartSessionStartedAt: number | null;
  touchCartSession: () => void;
  expireCartSessionIfNeeded: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartitems: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      cartCount: 0,
      contactinfo: {
        firstName: "",
        lastName: "",
        email: "",
        emailconfirm: false,
      },
      setcontactinfo: (info) => set({ contactinfo: info }),
      iscartchanged: false,
      cartlanguage: "",
      deliveryTime: "",
      setDeliveryTime: (time) => set({ deliveryTime: time }),
      setcartlanguage: (lang) => set({ cartlanguage: lang }),
      setiscartchanged: (value) => set({ iscartchanged: value }),
      setcartCount: (count) => set({ cartCount: count }),
      savedShippingAddresses: [],
      savedBillingAddresses: [],
      isBusiness: false,
      setIsBusiness: (value: boolean) => set({ isBusiness: value }),
      guestAddressFormsValid: true, // Default to true, will be updated by validation
      setGuestAddressFormsValid: (value) => set({ guestAddressFormsValid: value }),
      selectedSavedDeliveryAddress: null,
      selectedSavedBillingAddress: null,
      // Warehouse pickup address (separate from standard delivery address)
      warehouseAddress: null,
      setWarehouseAddress: (address) => set({ warehouseAddress: address }),
      // Guest user form data persistence
      guestDeliveryFormData: null,
      deliveryInstructions: "",
      guestBillingFormData: null,
      guestIsSameBilling: null,
      showAlert: false,
      setShowAlert: (value) => set({ showAlert: value }),
      cartSessionStartedAt: null,
      touchCartSession: () => {
        if (get().cartSessionStartedAt == null) {
          set({ cartSessionStartedAt: Date.now() });
        }
      },
      expireCartSessionIfNeeded: () => {
        const { cartSessionStartedAt } = get();
        if (!isCartSessionExpired(cartSessionStartedAt)) return;
        get().resetCart();
        set({ cartSessionStartedAt: null });
      },
      setGuestDeliveryFormData: (data) => set({ guestDeliveryFormData: data }),
      setGuestBillingFormData: (data) => set({ guestBillingFormData: data }),
      setGuestIsSameBilling: (value) => set({ guestIsSameBilling: value }),
      setDeliveryInstructions: (instructions) => set({ deliveryInstructions: instructions }),
      formMode: {
        delivery: "add",
        billing: "add",
      },
      isSameBilling: true,
      isSameShipping: true,
      isAccordionOpen: false,
      // View state for address list components (View 1 = false, View 2 = true)
      showAllBillingAddresses: false,
      showAllDeliveryAddresses: false,
      setShowAllBillingAddresses: (value) => set({ showAllBillingAddresses: value }),
      setShowAllDeliveryAddresses: (value) => set({ showAllDeliveryAddresses: value }),
      setSavedShippingAddresses: (addresses, skipAutoSelect = false) =>
        set((state) => {
          // Only auto-select if skipAutoSelect is false AND no address is currently selected
          const shouldAutoSelect = !skipAutoSelect && !state.selectedSavedDeliveryAddress;
          const latest =
            shouldAutoSelect && addresses && addresses.length > 0
              ? [...addresses].sort((a, b) => (b.id ?? "").localeCompare(a.id ?? ""))[0] || null
              : state.selectedSavedDeliveryAddress;
          return {
            savedShippingAddresses: addresses,
            selectedSavedDeliveryAddress: latest,
          };
        }),
      isTypeAccordianOpen: true,
      setisTypeAccordianOpen: (value) => set({ isTypeAccordianOpen: value }),
      setSavedBillingAddresses: (addresses, skipAutoSelect = false) =>
        set((state) => {
          // Only auto-select if skipAutoSelect is false AND no address is currently selected
          const shouldAutoSelect = !skipAutoSelect && !state.selectedSavedBillingAddress;
          const latest =
            shouldAutoSelect && addresses && addresses.length > 0
              ? [...addresses].sort((a, b) => (b.id ?? "").localeCompare(a.id ?? ""))[0] || null
              : state.selectedSavedBillingAddress;
          return {
            savedBillingAddresses: addresses,
            selectedSavedBillingAddress: latest,
          };
        }),
      setSelectedSavedDeliveryAddress: (address) => set({ selectedSavedDeliveryAddress: address }),
      setSelectedSavedBillingAddress: (address) =>
        set((state) => ({
          selectedSavedBillingAddress: address,
          // When "same as billing" is checked, keep delivery in sync with billing
          ...(state.isSameShipping && { selectedSavedDeliveryAddress: address }),
        })),
      setFormMode: (mode) => set({ formMode: mode }),
      setIsSameBilling: (value) =>
        set((state) => ({
          isSameBilling: value,
          // Only auto-set billing address when enabling same billing, not when disabling
          ...(value && { selectedSavedBillingAddress: state.selectedSavedDeliveryAddress }),
        })),
      setIsSameShipping: (value) =>
        set((state) => ({
          isSameShipping: value,
          // Only auto-set delivery address when enabling same shipping, not when disabling
          ...(value && { selectedSavedDeliveryAddress: state.selectedSavedBillingAddress }),
        })),
      setIsAccordionOpen: (value) => set({ isAccordionOpen: value }),
      addItem: (item) => {
        get().touchCartSession();
        set((state) => ({
          cartitems: [...state.cartitems, item],
        }));
      },
      updateItem: (id, quantity) =>
        set((state) => ({
          cartitems: state.cartitems?.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        })),
      removeItem: (id) =>
        set((state) => ({
          cartitems: state.cartitems.filter((item) => item.id !== id),
        })),
      clearCart: () => set({ cartitems: [] }),
      cartid: "",
      setcartid: (id: string) => {
        if (id) get().touchCartSession();
        set(() => ({
          cartid: id,
        }));
      },
      totalprice: 0,
      shippingfee: 0,
      setShippingFee: (fee) => set({ shippingfee: fee }),
      vatPercentage: 0,
      setVatPercentage: (value) => set({ vatPercentage: value }),
      shippingMethod: "",
      setShippingMethod: (method) => set({ shippingMethod: method }),
      // Standard delivery shipping fee (persisted when switching to warehouse pickup)
      standardDeliveryShippingFee: 0,
      setStandardDeliveryShippingFee: (fee) => set({ standardDeliveryShippingFee: fee }),
      setTotalPrice: (price) => set({ totalprice: price }),
      checkoutpending: true,
      setcheckoutpending: (pending) => set({ checkoutpending: pending }),
      paymentmethod: "",
      setpaymentmethod: (method) => set({ paymentmethod: method }),
      depositfee: 0,
      setdepositfee: (fee) => set({ depositfee: fee }),
      try_again: false,
      settry_again: (value) => set({ try_again: value }),
      resetCart: () =>
        set({
          cartitems: [],
          cartCount: 0,
          checkoutpending: false,
          try_again: false,
          deliveryInstructions: "",
          showAlert: false,
          savedShippingAddresses: [],
          savedBillingAddresses: [],
          selectedSavedDeliveryAddress: null,
          selectedSavedBillingAddress: null,
          warehouseAddress: null,
          guestDeliveryFormData: null,
          guestBillingFormData: null,
          guestIsSameBilling: null,
          guestAddressFormsValid: true,
          formMode: { delivery: "add", billing: "add" },
          isSameBilling: true,
          isSameShipping: true,
          isAccordionOpen: true,
          cartid: "",
          totalprice: 0,
          shippingfee: 0,
          vatPercentage: 0,
          shippingMethod: "",
          standardDeliveryShippingFee: 0,
          paymentmethod: "",
          iscartchanged: false,
          cartlanguage: "",
          depositfee: 0,
          cartSessionStartedAt: null,
          contactinfo: {
            firstName: "",
            lastName: "",
            email: "",
            emailconfirm: false,
          },
        }),

      // Add method to clear checkout states on page unmount
      clearCheckoutStates: () =>
        set((state) => ({
          selectedSavedDeliveryAddress: null,
          selectedSavedBillingAddress: null,
          warehouseAddress: null,
          guestDeliveryFormData: null,
          guestBillingFormData: null,
          guestIsSameBilling: null,
          guestAddressFormsValid: true,
          formMode: { delivery: "add", billing: "add" },
          isSameBilling: true,
          isSameShipping: true,
          isAccordionOpen: true,
          // Reset view states to View 1 (single selected address)
          showAllBillingAddresses: false,
          showAllDeliveryAddresses: false,
        })),

      // for show all items of overviewcard
      showAllItems: false,
      setShowAllItems: (value) => set({ showAllItems: value }),
      setupdatecart: (items: CartItem[]) => {
        if (items.length > 0) get().touchCartSession();
        set({ cartitems: items });
      },
      compatibilityCheckBasic: () => {
        // const { searchData } = useSearchModalStore.getState();
        const { searchData } = getMmeStore().getState();
        if (!searchData.make?.value) {
          return false;
        }
        return true;
        // API is still pending for compatibility check;
      },
    }),
    {
      name: "cart-storage",
      storage: createSafeJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => () => {
        queueMicrotask(() => {
          useCartStore.getState().expireCartSessionIfNeeded();
          useCartStore.getState().setHasHydrated(true);
        });
      },
    },
  ),
);
