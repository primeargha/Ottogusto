"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box } from "@/components/ui/box";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { OGSelectDropdown, SelectOption } from "@/components/og-components/OGSelectDropdown";
import { OGButton } from "@/components/og-components/OGButton";
// import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Text } from "@/components/ui/text";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useModalStore } from "@/stores/useModalStore";
import SuccessModal from "./SuccessModal";
import { useBranding } from "@/contexts/BrandingContext";
import { useSubmitSupportForReturnMutation, useSubmitSupportMutation } from "@/hooks/support";
import { OGTextArea } from "@/components/og-components/OGTextArea";
import { AuthUserType, useAuthStore } from "@/stores/useAuthStore";
import { useGetAllOrderssupport } from "@/hooks/orders";
import { getRefundForAuthUser, getRefundForGuestUser } from "@/services/support";
import { StarBlock } from "@/screens/shoppingcart/OGcart-card";
import OGReturnOrderCard from "./OGReturnOrderCard";
import Image from "next/image";
import noimage from "@/assets/Frame.svg";
import { resolvePartImageFromSources } from "@/utils/partImageUtils";
import uploadIcon from "@/assets/uploadImagesquare.svg";
import {
  camelToKebab,
  getdaysbetween,
  getImageMimeType,
  getLatestDeliveryDate,
  getRouteLocaleString,
} from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { FILE_UPLOAD_URL } from "@/config/app";
import SkeletonReturnOrderCard from "./SkeletonReturnOrderCard";
import { useOrderStore } from "@/stores/useOrderStore";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { SimplePolicyLink } from "@/components/PolicyViewer";
import { useMedia } from "@/hooks/useMedia";
import { getOrderById } from "@/services/cart";
// PERF: Removed moment — getdaysbetween now uses native Date
import { CustomTooltip } from "@/components/og-components/OGtooltip";
import exclamicon from "@/assets/productdetailsexclamation-icon.svg";
import { useSupportStore } from "@/stores/useSupportStore";
import Typography from "@/components/og-components/Typography";
import Link from "next/link";
import { trackSupportFormSuccess } from "@/utils/gtm";
// Support categories enum values
// const SUPPORT_CATEGORY_VALUES = [
//   "Billing",
//   "PartQuery",
//   "OrderIssue",
//   "Account",
//   "Shipping",
//   "Returns",
//   "Complaints",
//   "Other",
// ];
type Order = {
  id: string;
  status: string;
  // Add more fields if needed later
};

interface RefundItem {
  id?: string;
  partId?: string;
  name?: string;
  price?: number;
  description?: string;
  image?: string;
}

interface RefundData {
  items?: RefundItem[] | null;
  customerId?: string;
}
const isValidIBAN = (iban: string) => {
  // Basic IBAN format validation
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
  return ibanRegex.test(iban.replace(/\s/g, "").toUpperCase());
};
export default function SupportForm({
  category,
  supportCategories,
}: {
  category?: string;
  supportCategories?: string[];
}) {
  // debugger;
  // const categoriesMaster = {
  //   "1": "Billing Issue",
  //   "2": "Part Related Query",
  //   "3": "Order Issue",
  //   "4": "Account Management",
  //   "5": "Shipping and Delivery",
  //   "6": "Create a Return",
  //   "7": "Return Query",
  //   "8": "Complaints",
  //   "9": "Other",
  // };
  const searchParams = useSearchParams();
  const params = useParams();

  const router = useRouter();
  const { saveCurrentFormState, getSavedFormData, resetCurrentFormState } = useSupportStore();
  const isMobile = useMedia("(max-width: 639px)");
  let categoryId = searchParams?.get("categoryId") || "";
  const orderId = searchParams?.get("orderId") || "";
  const guestEmail = searchParams?.get("email") || "";

  // Handle Verify VIN parameters
  const productTitle = searchParams?.get("productTitle") || "";
  const sourceLanguage = searchParams?.get("language") || "";
  const source = searchParams?.get("source") || "";

  const { openModal } = useModalStore();
  const { getLabel } = useBranding();
  const { authUser, isAuthenticated } = useAuthStore();

  const { setOrderId, resetOrder, orderId: bkorderId } = useOrderStore();
  const [loadingItemsForOrderId, setLoadingItemsForOrderId] = useState<boolean>(false);
  // const { data: config, isLoading: isConfigLoading } = useGetConfigQuery(); // now using SSR

  const toast = useToast();
  // Redirect authenticated users if they have orderId or email in URL params
  useLayoutEffect(() => {
    if (isAuthenticated && (orderId || guestEmail)) {
      // Preserve query parameters when redirecting
      const currentSearchParams = new URLSearchParams(window.location.search);
      const supportUrl = getRouteLocaleString(Routes.support, params);
      const redirectUrl = currentSearchParams.toString()
        ? `${supportUrl}?${currentSearchParams.toString()}`
        : supportUrl;
      router.push(redirectUrl);
    }
  }, [isAuthenticated, orderId, guestEmail, router, params]);

  //   check for uploadicon css
  let imguploadiconClass = "";
  let Device = "Desktop";
  if (Device === "Mobile") {
    imguploadiconClass = "h-[13.33px] w-[13.33px]";
  }
  if (Device === "Desktop") {
    imguploadiconClass = "h-[20px] w-[20px]";
  }

  const [refundData, setRefundData] = useState<RefundData | null>(null);
  // const [items, setItems] = useState<
  //   Array<{
  //     description: string | null;
  //     image: string | null;
  //     id: string | null;
  //     partId: string | null;
  //     name: string | null;
  //     price: number | null;
  //     reason: string;
  //     status: string;
  //     comment: string | null;
  //     images: { name: string; data: string; mimeType: string }[];
  //   }>
  // >([]);
  // Generate support categories array
  // const SUPPORT_CATEGORIES: { label: string; value: string; id: string }[] = !supportCategories
  //   ? []
  //   : isAuthenticated || orderId !== ""
  //     ? supportCategories?.map((value: string, index: number) => ({
  //         label: getLabel(`support_label_${value}`),
  //         value: value,
  //         id: (index + 1).toString(),
  //       }))
  //     : !isAuthenticated &&
  //       orderId === "" &&
  //       supportCategories
  //         ?.filter((value: string) => value !== "Return")
  //         ?.map((value: string, index: number) => ({
  //           label: getLabel(`support_label_${value}`),
  //           value: value,
  //           id: (index + 1).toString(),
  //         }));
  const SUPPORT_CATEGORIES: { label: string; value: string; id: string }[] = !supportCategories
    ? []
    : (isAuthenticated || orderId !== "") && supportCategories
      ? supportCategories.map((value: string, index: number) => ({
          label: getLabel(`support_label_${value}`),
          value: value,
          id: (index + 1).toString(),
        }))
      : !isAuthenticated && orderId === "" && supportCategories
        ? supportCategories
            .filter((value: string) => value !== "Return")
            .map((value: string, index: number) => ({
              label: getLabel(`support_label_${value}`),
              value: value,
              id: (index + 1).toString(),
            }))
        : [];

  // Find the matching category by ID
  // debugger;
  const defaultCategory: any =
    categoryId || category
      ? SUPPORT_CATEGORIES.find(
          (cat: { label: string; value: string; id: string }) =>
            cat.id === categoryId ||
            //@ts-ignore
            camelToKebab(cat.value).match(new RegExp(category as any, "ig")),
        )
      : orderId || bkorderId
        ? SUPPORT_CATEGORIES.find(
            (cat: { label: string; value: string; id: string }) => cat.value === "Return",
          )
        : undefined;
  const defaultOrder = !isAuthenticated ? orderId || "" : bkorderId;

  // Prefill name and email if authenticated
  const getPrefilledFirstName = () => {
    if (isAuthenticated && "firstName" in authUser && authUser.firstName) {
      return authUser.firstName;
    }
    return "";
  };

  const getPrefilledLastName = () => {
    if (isAuthenticated && "lastName" in authUser && authUser.lastName) {
      return authUser.lastName;
    }
    return "";
  };

  const getPrefilledEmail = () => {
    if (isAuthenticated && "email" in authUser && authUser.email) {
      return authUser.email;
    }
    return guestEmail;
  };

  // Helper function to check if authenticated user has lastName
  const hasLastName = () => {
    return isAuthenticated && "lastName" in authUser && authUser.lastName;
  };

  // Helper function to check if authenticated user has firstName
  const hasFirstName = () => {
    return isAuthenticated && "firstName" in authUser && authUser.firstName;
  };

  // Helper function to check if authenticated user has email
  const hasEmail = () => {
    return (isAuthenticated && "email" in authUser && authUser.email) || !!guestEmail;
  };

  // Generate language-specific message for Verify VIN
  const generateVerifyVinMessage = (productTitle: string, language: string) => {
    const decodedTitle = decodeURIComponent(productTitle);

    // Get the base message from labels
    const baseMessage = getLabel("compatibility_verify_vin_prefill_message");

    // Replace {productTitle} placeholder with actual product title
    return baseMessage.replace("{productTitle}", decodedTitle);
  };
  // Form validation schema
  function createSupportFormSchema() {
    return z
      .object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email("Invalid email address"),
        supportCategory: z
          .object({
            label: z.string().optional(),
            value: z.string().optional(),
            id: z.string().optional(),
          })
          .nullable()
          .refine((val) => val !== null, {
            message: "Support category is required",
          }),
        invoiceNumber: z.string().optional(),
        orderReturns: z
          .union([
            z.object({
              label: z.string(),
              value: z.string(),
            }),
            z.string(),
          ])
          .optional()
          .nullable(),
        vin:
          source === "verify-vin" || category === "part-query"
            ? z
                .string()
                .length(17, getLabel("vin_length_error"))
                .regex(/^[A-HJ-NPR-Z0-9]{17}$/, getLabel("vin_invalid_characters"))
            : z.string().optional(),
        // bankAccountName: z.string().optional(),
        // IBAN: z
        //   .string()
        //   .optional()
        //   .refine(
        //     (val) => {
        //       if (!val) return true;
        //       return isValidIBAN(val);
        //     },
        //     {
        //       message: "Please enter a valid IBAN format",
        //     },
        //   ),
        comments:
          source === "verify-vin"
            ? z.string().min(1, "Please provide details about your compatibility query")
            : z.string().optional(),
        files: z
          .array(
            z.object({
              name: z.string(),
              data: z.string(),
              mimeType: z.string(),
            }),
          )
          .max(3, "Maximum 3 images allowed")
          .refine(
            (files) => {
              // Check if any file is larger than 5MB
              return files.every((file) => {
                // Calculate size of base64 string in bytes
                const sizeInBytes = Math.ceil((file.data.length * 3) / 4);
                const sizeInMB = sizeInBytes / (1024 * 1024);
                return sizeInMB <= 5;
              });
            },
            {
              message: "Each file must be less than 5MB",
            },
          ),
        selectedItems: z
          .array(
            z.object({
              description: z.string().nullable(),
              image: z.string().nullable(),
              id: z.string().nullable(),
              partId: z.string().nullable(),
              name: z.string().nullable(),
              price: z.number().nullable(),
              reason: z.string().min(1, getLabel("return_reason")),
              status: z.string(),
              comment: z.string().nullable(),
              images: z
                .array(
                  z.object({
                    name: z.string(),
                    data: z.string(),
                    mimeType: z.string(),
                  }),
                )
                .max(3, "Maximum 3 images allowed per item")
                .refine(
                  (images) => {
                    // Check if any image is larger than 5MB
                    return images.every((img) => {
                      // Calculate size of base64 string in bytes
                      const sizeInBytes = Math.ceil((img.data.length * 3) / 4);
                      const sizeInMB = sizeInBytes / (1024 * 1024);
                      return sizeInMB <= 5;
                    });
                  },
                  {
                    message: "Each image must be less than 5MB",
                  },
                ),
            }),
          )
          .superRefine((items, ctx) => {
            items.forEach((item, idx) => {
              if (
                ["WrongItem", "Damaged"].includes(item.reason) &&
                (!item.images || item.images.length === 0)
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message:
                    item.reason === "WrongItem"
                      ? getLabel("upload_image_received")
                      : getLabel("damaged_received_part"),
                  path: [idx, "images"],
                });
              }
            });
          })
          .refine(
            (items) => {
              const currentCategory = selectedCategory?.value;
              if (currentCategory === "Return") {
                // Check if any item has empty reason
                const hasEmptyReason = items.some(
                  (item) => !item.reason || item.reason.trim() === "",
                );
                if (hasEmptyReason) {
                  return false;
                }
                // Filter out DoNotReturn items and check if any valid items remain
                const validItems = items.filter((item) => item.reason !== "DoNotReturn");
                return validItems.length > 0;
              }
              return true;
            },
            {
              message:
                "All items must have a return reason and at least one item must be selected for return",
              path: ["selectedItems"],
            },
          ),
      })
      .refine(
        (data) => {
          // Order number required if category is Billing
          if (data.supportCategory?.value === "Billing") {
            return (
              data.orderReturns &&
              (typeof data.orderReturns === "string" ? data.orderReturns.trim().length > 0 : true)
            );
          }
          return true;
        },
        {
          message: "Order number is required for Billing Issues",
          path: ["orderReturns"],
        },
      )
      .refine(
        (data) => {
          // VIN required if category is PartQuery
          if (data.supportCategory?.value === "PartQuery") {
            return data.vin && data.vin.trim().length > 0;
          }
          return true;
        },
        {
          message: "VIN is required for Part Related Query",
          path: ["vin"],
        },
      )
      .refine(
        (data) => {
          // orderReturns required if category is Returns, OrderIssue, Shipping (but NOT Complaints)
          const categoriesRequiringOrder = ["Return", "OrderIssue", "Shipping", "ReturnQuery"];
          if (categoriesRequiringOrder.includes(data.supportCategory?.value || "")) {
            if (isAuthenticated) {
              return data.orderReturns;
            } else {
              return (
                data.orderReturns &&
                typeof data.orderReturns === "string" &&
                data.orderReturns.trim().length > 0
              );
            }
          }
          return true;
        },
        {
          message: "Order Number is required",
          path: ["orderReturns"],
        },
      );
    // .refine(
    //   (data) => {
    //     // Bank Account Name required if category is Returns
    //     if (data.supportCategory?.value === "Return") {
    //       return data.bankAccountName && data.bankAccountName.trim().length > 0;
    //     }
    //     return true;
    //   },
    //   {
    //     message: "Bank Account Name is required for Returns and Refunds",
    //     path: ["bankAccountName"],
    //   },
    // )
    // .refine(
    //   (data) => {
    //     // IBAN required if category is Returns
    //     if (data.supportCategory?.value === "Return") {
    //       return data.IBAN && data.IBAN.trim().length > 0;
    //     }
    //     return true;
    //   },
    //   {
    //     message: "IBAN is required for Returns and Refunds",
    //     path: ["IBAN"],
    //   },
    // );
  }

  const supportFormSchema = createSupportFormSchema();
  type SupportFormData = z.infer<typeof supportFormSchema>;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
    setValue,
    setError,
    getValues,
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    mode: "onChange",
    defaultValues: {
      firstName: getSavedFormData().firstName || getPrefilledFirstName(),
      lastName: getSavedFormData().lastName || getPrefilledLastName(),
      email: getSavedFormData().email || getPrefilledEmail(),
      supportCategory: getSavedFormData().supportCategory || defaultCategory,
      orderReturns: getSavedFormData().orderReturns || defaultOrder,
      vin: getSavedFormData().vin || "",
      invoiceNumber: getSavedFormData().invoiceNumber || "",
      comments:
        getSavedFormData().comments ||
        (source === "verify-vin" && productTitle && sourceLanguage
          ? generateVerifyVinMessage(productTitle, sourceLanguage)
          : ""),
      files: getSavedFormData().files || [],
      selectedItems: getSavedFormData().selectedItems || [],
    },
  });

  const selectedCategory = watch("supportCategory") as SupportFormData["supportCategory"];

  const handlreturnpolicy = () => {
    const routeName = getRouteLocaleString(Routes.returnPolicy, params);
    window.open(routeName, "_blank");
  };

  useEffect(() => {
    if (bkorderId && watch("orderReturns") === bkorderId) {
      resetOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bkorderId]);
  // Handling order returns for guest and auth user
  useEffect(() => {
    // Only fetch refund data for Return category
    if (selectedCategory?.value === "Return") {
      if (!isAuthenticated && watch("orderReturns")) {
        setLoadingItemsForOrderId(true);
        getRefundForGuestUser(watch("orderReturns") as string, watch("email") as string)
          .then((data) => {
            // @ts-ignore
            setRefundData(data?.data);
            setLoadingItemsForOrderId(false);
          })
          .catch((error) => {
            console.error("guest user order returns error:", error?.response?.data?.detail);
            setLoadingItemsForOrderId(false);
            setError("orderReturns", {
              type: "manual",
              message: error?.response?.data?.detail || "Invalid order number",
            });
          });
      } else {
        const orderReturnsValue = watch("orderReturns");
        if (orderReturnsValue && isAuthenticated) {
          getOrderById(
            typeof orderReturnsValue === "object" ? orderReturnsValue.value : orderReturnsValue,
            // @ts-ignore
            authUser.email,
          )
            .then((res) => {
              // const { tracking } = res ?? {};
              const tracking = (res as any)?.tracking;
              const latestdelivery = getLatestDeliveryDate(tracking);
              const difference = getdaysbetween(latestdelivery as string, new Date());
              if (difference < 14) {
                setLoadingItemsForOrderId(true);
                getRefundForAuthUser(
                  typeof orderReturnsValue === "object"
                    ? orderReturnsValue.value
                    : orderReturnsValue,
                )
                  .then((data) => {
                    setRefundData(data?.data as null | RefundData);
                    setLoadingItemsForOrderId(false);
                  })
                  .catch((error) => {
                    setLoadingItemsForOrderId(false);
                  });
              } else {
                let tempdata = [...data];
                let modifydata = tempdata?.map((item) => ({
                  ...item,
                  disabled: item.disabled
                    ? true
                    : item.value ===
                      (typeof orderReturnsValue === "object"
                        ? orderReturnsValue.value
                        : orderReturnsValue),
                }));
                setdata(modifydata);
                setLoadingItemsForOrderId(false);
                setError("orderReturns", {
                  type: "manual",
                  message: "Return window has expired for this order",
                });
                setRefundData(null);
                //setValue("orderReturns", "");
              }

              // setRefundData(data);
              // setLoadingItemsForOrderId(false);
            })
            .catch((error) => {
              //setLoadingItemsForOrderId(false);
            });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("orderReturns"), isAuthenticated, selectedCategory?.value]);

  useEffect(() => {
    console.clear();
  }, [category]);

  // Update form values if user logs in after mount or if URL params change
  React.useEffect(() => {
    if (isAuthenticated) {
      setValue("firstName", getPrefilledFirstName());
      setValue("lastName", getPrefilledLastName());
      setValue("email", getPrefilledEmail());
    } else if (guestEmail) {
      setValue("email", guestEmail);
    }
    // Only set orderReturns for guest users
    if (orderId && !isAuthenticated) {
      setValue("orderReturns", orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authUser, guestEmail, orderId]);

  // Helper function to get prefilled values for authenticated users (firstName, lastName, email only)
  const getPrefilledValuesToPreserve = () => {
    // Only preserve for authenticated users
    if (isAuthenticated) {
      return {
        firstName: getPrefilledFirstName() || "",
        lastName: getPrefilledLastName() || "",
        email: getPrefilledEmail() || "",
      };
    }
    return {
      firstName: "",
      lastName: "",
      email: "",
    };
  };

  const { mutate: submitSupport, isPending: isSubmittingSupport } = useSubmitSupportMutation({
    onSuccess: () => {
      trackSupportFormSuccess();
      openModal();
      resetCurrentFormState();

      // Clear order number from store
      resetOrder();

      // Preserve only firstName, lastName, email for authenticated users
      const prefilledValues = getPrefilledValuesToPreserve();

      // Reset form - preserve prefilled values for authenticated users, clear everything else
      reset({
        firstName: prefilledValues.firstName,
        lastName: prefilledValues.lastName,
        email: prefilledValues.email,
        supportCategory: { value: "", label: "" },
        orderReturns: "",
        vin: "",
        invoiceNumber: "",
        comments: "",
        files: [],
        selectedItems: [],
        // bankAccountName: "",
        // IBAN: "",
      });
    },
  });

  const { mutate: submitForReturn, isPending: isSubmittingForReturn } =
    useSubmitSupportForReturnMutation({
      onSuccess: () => {
        openModal();
        resetCurrentFormState();

        // Clear order number from store
        resetOrder();

        // Preserve only firstName, lastName, email for authenticated users
        const prefilledValues = getPrefilledValuesToPreserve();

        // Reset form - preserve prefilled values for authenticated users, clear everything else
        reset({
          firstName: prefilledValues.firstName,
          lastName: prefilledValues.lastName,
          email: prefilledValues.email,
          supportCategory: { value: "", label: "" },
          orderReturns: "",
          vin: "",
          invoiceNumber: "",
          comments: "",
          files: [],
          selectedItems: [],
          // bankAccountName: "",
          // IBAN: "",
        });
      },
    });

  const { data: allTheOrders, isLoading, isError } = useGetAllOrderssupport(isAuthenticated);

  const [data, setdata] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (allTheOrders !== undefined && allTheOrders?.length > 0) {
      let filterOrders =
        category === "return"
          ? allTheOrders?.filter(
              (order: any) =>
                order.status === "Delivered" ||
                order.status === "Invoiced" ||
                order.status.toLowerCase().includes("refund") ||
                order.status.toLowerCase().includes("return"),
            )
          : allTheOrders;
      setdata(
        filterOrders?.map((order: any) => ({
          label: order.id,
          value: order.id,
          disabled: false,
        })) ?? [],
      );
    }
  }, [allTheOrders, category]);

  // Clear VIN when category changes away from PartQuery
  React.useEffect(() => {
    if (selectedCategory?.value !== "PartQuery") {
      setValue("vin", "");
    }
  }, [selectedCategory, setValue]);

  // Clear invoice number when category changes away from Billing
  React.useEffect(() => {
    if (selectedCategory) {
      // Preserve query parameters when updating URL
      const currentSearchParams = new URLSearchParams(window.location.search);
      const newURL = `/${params ? params["language-country"] : ""}/support/${camelToKebab(selectedCategory.value)}`;
      const finalURL = currentSearchParams.toString()
        ? `${newURL}?${currentSearchParams.toString()}`
        : newURL;
      router.replace(finalURL);
    }
    if (selectedCategory?.value !== "Billing") {
      setValue("invoiceNumber", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, setValue]);

  // Clear return-related fields when category changes away from Return
  React.useEffect(() => {
    if (selectedCategory?.value !== "Return") {
      setValue("selectedItems", []);
      // setValue("bankAccountName", "");
      // setValue("IBAN", "");
      setRefundData(null);
    }
    // Clear order number when switching away from categories that require it (except Return)
    const categoriesRequiringOrder = ["OrderIssue", "Shipping", "Complaints"];
    if (
      selectedCategory?.value &&
      !["Return", ...categoriesRequiringOrder].includes(selectedCategory.value)
    ) {
      setValue("orderReturns", "");
    }
  }, [selectedCategory, setValue]);
  // Update items when refundData changes
  useEffect(() => {
    if (refundData?.items) {
      const initialItems = refundData.items?.map((item: RefundItem) => ({
        description: item.description || null,
        image: item.image || null,
        id: item.id || null,
        partId: item.partId || null,
        name: item.name || null,
        price: item.price || null,
        reason: "DoNotReturn",
        status: "Pending",
        comment: null,
        images: [],
      }));
      setValue("selectedItems", initialItems);
    }
  }, [refundData, setValue]);

  const handleItemReasonChange = (index: number, reason: string) => {
    const currentItems: any = watch("selectedItems") as SupportFormData["selectedItems"];
    const newItems = [...currentItems];
    newItems[index] = {
      ...newItems[index],
      reason,
    };
    setValue("selectedItems", newItems, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleItemImagesChange = (
    index: number,
    images: { name: string; data: string; mimeType: string }[],
  ) => {
    const currentItems = watch("selectedItems") as SupportFormData["selectedItems"];

    const newItems: any[] = [...currentItems];
    newItems[index] = {
      ...newItems[index],
      images,
    };
    setValue("selectedItems", newItems, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentFiles = watch("files") || [];
    let newFiles = [...currentFiles];

    for (let i = 0; i < files.length; i++) {
      if (newFiles.length >= 3) {
        toast.show({
          placement: "bottom right",
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="error">
                {/* @ts-ignore */}
                <ToastTitle size="sm" className="string">
                  Maximum 3 images allowed
                </ToastTitle>
              </Toast>
            );
          },
        });
        break;
      }

      const file: any = files[i];
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > 5) {
        toast.show({
          placement: "bottom right",
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="error">
                {/* @ts-ignore */}
                <ToastTitle>Each image must be less than 5MB</ToastTitle>
              </Toast>
            );
          },
        });
        continue;
      }

      const base64 = await fileToBase64(file as File);
      newFiles.push({
        name: file?.name ?? "",
        data: base64,
        mimeType: getImageMimeType(file?.name ?? "") || "image/jpeg",
      });

      if (newFiles.length >= 3) break;
    }

    setValue("files", newFiles, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    event.target.value = "";
  };

  // Helper: Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Remove file by index
  const handleRemoveFile = (idx: number) => {
    const currentFiles = watch("files") || [];
    const newFiles = [...currentFiles];
    newFiles.splice(idx, 1);
    setValue("files", newFiles, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const {
    mutate: submitSupportMail,
    isPending: isSubmittingSupportPending,

    reset: resetMutation,
  } = useSubmitSupportMutation({
    onSuccess: () => {
      trackSupportFormSuccess();
      resetMutation();
    },
  });

  const onSubmit = (data: any) => {
    if (isSubmittingSupport) return;
    // Remove VIN from data if not Part Related Query
    const submissionData = {
      ...data,
      vin: data.supportCategory.value === "PartQuery" ? data.vin : undefined,
      invoiceNumber: data.supportCategory.value === "Billing" ? data.invoiceNumber : undefined,
    };

    if (selectedCategory?.value === "Return") {
      const orderValue =
        typeof submissionData.orderReturns === "object"
          ? submissionData.orderReturns.value
          : submissionData.orderReturns;
      const payload: any = {
        id: orderValue,
        orderId: orderValue,
        firstName: submissionData.firstName,
        lastName: submissionData.lastName,
        email: submissionData.email,
        message: submissionData.comments,
        customerId:
          (authUser && "id" in authUser ? authUser.id : undefined) || refundData?.customerId,
        // accountName: submissionData.bankAccountName,
        // iban: submissionData.IBAN,
        items: submissionData.selectedItems?.map((item) => ({
          description: item.description,
          image: item.image,
          id: item.id,
          partId: item.partId,
          name: item.name,
          price: item.price,
          reason: item.reason,
          status: item.status,
          comment: item.comment,
          files: item.images,
        })),
      };
      const supportMailPayload: any = {
        firstName: submissionData.firstName,
        lastName: submissionData.lastName,
        email: submissionData.email,
        category: "Return",
        orderId: orderValue || null,
        message: submissionData.comments,
      };

      submitSupportMail(supportMailPayload);
      submitForReturn(payload);
    } else {
      const orderValue =
        typeof submissionData.orderReturns === "object"
          ? submissionData.orderReturns.value
          : submissionData.orderReturns;

      const payload = {
        firstName: submissionData.firstName,
        lastName: submissionData.lastName,
        email: submissionData.email,
        category: submissionData.supportCategory?.value,
        vin: submissionData.vin || null,
        invoiceNumber: submissionData.invoiceNumber || null,
        orderNumber: orderValue || null,
        orderId: orderValue || null,
        message: submissionData.comments,
        files: submissionData.files,
      };
      submitSupport(payload);
    }
  };

  const linkTextClass = `cursor-pointer text-[14px] font-normal leading-[16px] text-[--Text-Tarmac-Placeholder] underline decoration-solid underline-offset-auto`;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full base:mb-9 gtsm:mb-10 gtlg:mb-10">
        <Box className="flex w-full flex-col gap-3 section-standard">
          <Box className="my-[40px]">
            <Typography type="h1" className="text-center text-color-text-body">
              {getLabel("support_let_us_know_new")}
            </Typography>
          </Box>
          {/* First Name and Last Name row */}
          <Box className="flex w-full flex-col gap-6 gtlg:flex-row">
            <Box className="flex-1">
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, value } }) => (
                  <OGTextInput
                    title={getLabel("first_name")}
                    value={value}
                    onChange={onChange}
                    placeholder={getLabel("your_first_name")}
                    state={
                      hasFirstName()
                        ? "disabled"
                        : errors.firstName
                          ? "error"
                          : value
                            ? "filled"
                            : "default"
                    }
                    error={errors.firstName?.message}
                    mandatory={false}
                    isReadOnly={!!hasFirstName()}
                    isOutline={true}
                  />
                )}
              />
            </Box>

            <Box className="flex-1">
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, value } }) => (
                  <OGTextInput
                    title={getLabel("last_name")}
                    value={value}
                    onChange={onChange}
                    placeholder={getLabel("your_last_name")}
                    state={
                      hasLastName()
                        ? "disabled"
                        : errors.lastName
                          ? "error"
                          : value
                            ? "filled"
                            : "default"
                    }
                    error={errors.lastName?.message}
                    mandatory={false}
                    isReadOnly={!!hasLastName()}
                    isOutline={true}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Email field */}
          <Box className="w-full">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <OGTextInput
                  title={getLabel("email")}
                  value={value}
                  onChange={onChange}
                  placeholder={getLabel("your_email")}
                  state={
                    hasEmail() ? "disabled" : errors.email ? "error" : value ? "filled" : "default"
                  }
                  error={errors.email?.message}
                  mandatory={true}
                  isReadOnly={!!hasEmail()}
                  isOutline={true}
                />
              )}
            />
          </Box>

          {/* Support Category dropdown */}
          <Box className="flex w-full flex-col gap-[6px]">
            <Controller
              control={control}
              name="supportCategory"
              render={({ field: { onChange, value } }) => (
                <OGSelectDropdown
                  title={getLabel("support_category")}
                  value={value?.id}
                  onChange={(newId) => {
                    const newCategory = SUPPORT_CATEGORIES.find(
                      (cat: { id: string }) => cat.id === newId,
                    );
                    const currentFormData: any = getValues();
                    // debugger;
                    saveCurrentFormState(currentFormData);
                    if (newCategory) {
                      onChange(newCategory);
                    }
                  }}
                  //
                  placeholder={getLabel("select")}
                  state={errors.supportCategory ? "error" : value ? "filled" : "default"}
                  error={errors.supportCategory?.message}
                  mandatory={true}
                  options={SUPPORT_CATEGORIES?.filter(
                    (cat) => cat.value !== "GuaranteedVinCheck",
                  ).map((cat: { label: string; value: string; id: string }) => ({
                    label: cat.label,
                    value: cat.id,
                  }))}
                  className="w-full"
                />
              )}
            />
            {selectedCategory?.value === "Return" && (
              <Link
                href={getRouteLocaleString(Routes.returnPolicy, params)}
                className={linkTextClass}
              >
                {getLabel("return_policy")}
              </Link>
              // <SimplePolicyLink policyType="returns" className={linkTextClass}>

              // </SimplePolicyLink>
            )}
          </Box>

          {/* Order number field - only shown when Billing is selected */}
          {selectedCategory?.value === "Billing" && (
            <Box className="w-full">
              {isAuthenticated ? (
                <Controller
                  control={control}
                  name="orderReturns"
                  render={({ field: { onChange, value } }) => {
                    return (
                      <OGSelectDropdown
                        title={getLabel("order_number")}
                        value={typeof value === "string" ? value : value?.value}
                        onChange={(newValue: string | SelectOption) => {
                          if (typeof newValue === "string") {
                            onChange({ label: newValue, value: newValue });
                          } else {
                            onChange(newValue);
                          }
                        }}
                        placeholder={getLabel("select")}
                        state={errors.orderReturns ? "error" : value ? "filled" : "default"}
                        error={errors.orderReturns?.message}
                        mandatory={selectedCategory?.value === "Billing"}
                        options={data}
                        className="w-full"
                      />
                    );
                  }}
                />
              ) : (
                <Controller
                  control={control}
                  name="orderReturns"
                  render={({ field: { onChange, value } }) => {
                    return (
                      <OGTextInput
                        title={getLabel("order_number")}
                        value={typeof value === "string" ? value : ""}
                        onChange={onChange}
                        placeholder={getLabel("your_order_number")}
                        state={errors.orderReturns ? "error" : value ? "filled" : "default"}
                        error={errors.orderReturns?.message}
                        mandatory={selectedCategory?.value === "Billing"}
                        className="w-full"
                        isOutline={true}
                      />
                    );
                  }}
                />
              )}
            </Box>
          )}

          {/* Invoice number field - only shown when Billing is selected */}
          {selectedCategory?.value === "Billing" && (
            <Box className="w-full">
              <Controller
                control={control}
                name="invoiceNumber"
                render={({ field: { onChange, value } }) => (
                  <OGTextInput
                    title={getLabel("invoice_number")}
                    value={value || ""}
                    onChange={onChange}
                    placeholder={getLabel("your_invoice_number")}
                    state={errors.invoiceNumber ? "error" : value ? "filled" : "default"}
                    error={errors.invoiceNumber?.message}
                    mandatory={false}
                    className="w-full"
                    isOutline={true}
                  />
                )}
              />
            </Box>
          )}

          {/* Order number field for OrderIssue, Shipping, Complaints (excluding Billing) */}
          {["OrderIssue", "Shipping", "Complaints", "ReturnQuery"].includes(
            selectedCategory?.value || "",
          ) && (
            <Box className="w-full">
              {isAuthenticated ? (
                <Controller
                  control={control}
                  name="orderReturns"
                  render={({ field: { onChange, value } }) => {
                    return (
                      <OGSelectDropdown
                        title={getLabel("order_number")}
                        value={typeof value === "string" ? value : value?.value}
                        onChange={(newValue: string | SelectOption) => {
                          if (typeof newValue === "string") {
                            onChange({ label: newValue, value: newValue });
                          } else {
                            onChange(newValue);
                          }
                        }}
                        placeholder={getLabel("select")}
                        state={errors.orderReturns ? "error" : value ? "filled" : "default"}
                        error={errors.orderReturns?.message}
                        mandatory={["OrderIssue", "Shipping", "ReturnQuery"].includes(
                          selectedCategory?.value ?? "",
                        )}
                        options={data}
                        className="w-full"
                      />
                    );
                  }}
                />
              ) : (
                <Controller
                  control={control}
                  name="orderReturns"
                  render={({ field: { onChange, value } }) => {
                    return (
                      <OGTextInput
                        title={getLabel("order_number")}
                        value={typeof value === "string" ? value : ""}
                        onChange={onChange}
                        placeholder={getLabel("your_order_number")}
                        state={errors.orderReturns ? "error" : value ? "filled" : "default"}
                        error={errors.orderReturns?.message}
                        mandatory={["OrderIssue", "Shipping", "ReturnQuery"].includes(
                          selectedCategory?.value ?? "",
                        )}
                        className="w-full"
                        isOutline={true}
                      />
                    );
                  }}
                />
              )}
            </Box>
          )}

          {/* Order number field - only shown when Return is selected yes hello */}
          {selectedCategory?.value === "Return" && (
            <Box className="flex w-full flex-col gap-3">
              {isAuthenticated ? (
                <Controller
                  control={control}
                  name="orderReturns"
                  render={({ field: { onChange, value } }) => {
                    return (
                      <OGSelectDropdown
                        title={getLabel("order_number")}
                        value={typeof value === "string" ? value : value?.value}
                        onChange={(newValue: string | SelectOption) => {
                          if (typeof newValue === "string") {
                            onChange({ label: newValue, value: newValue });
                          } else {
                            onChange(newValue);
                          }
                        }}
                        placeholder={getLabel("select")}
                        state={errors.orderReturns ? "error" : value ? "filled" : "default"}
                        error={errors.orderReturns?.message}
                        mandatory={selectedCategory?.value === "Return"}
                        options={data}
                        className="w-full"
                        isDisabled={!!orderId}
                      />
                    );
                  }}
                />
              ) : (
                <Controller
                  control={control}
                  name="orderReturns"
                  render={({ field: { onChange, value } }) => {
                    return (
                      <OGTextInput
                        title={getLabel("order_number")}
                        value={typeof value === "string" ? value : ""}
                        onChange={onChange}
                        placeholder={getLabel("your_order_number")}
                        state={
                          errors.orderReturns
                            ? "error"
                            : orderId
                              ? "disabled"
                              : value
                                ? "filled"
                                : "default"
                        }
                        error={errors.orderReturns?.message}
                        mandatory={selectedCategory?.value === "Return"}
                        className="w-full"
                        isOutline={true}
                        isReadOnly={!!orderId}
                      />
                    );
                  }}
                />
              )}

              {/* <Text className="text-color-text-body body-bold-md">
                {getLabel("share_bank_details")}
              </Text>

              <Controller
                control={control}
                name="bankAccountName"
                render={({ field: { onChange, value } }) => (
                  <OGTextInput
                    title={getLabel("bank_account_name")}
                    value={value || ""}
                    onChange={onChange}
                    placeholder={getLabel("default")}
                    state={errors.bankAccountName ? "error" : value ? "filled" : "default"}
                    error={errors.bankAccountName?.message}
                    mandatory={selectedCategory?.value === "Return"}
                    className="w-full"
                    isOutline={true}
                  />
                )}
              />
              <Controller
                control={control}
                name="IBAN"
                render={({ field: { onChange, value } }) => (
                  <OGTextInput
                    title={getLabel("iban")}
                    value={value || ""}
                    onChange={onChange}
                    placeholder={getLabel("default")}
                    state={errors.IBAN ? "error" : value ? "filled" : "default"}
                    error={errors.IBAN?.message}
                    mandatory={selectedCategory?.value === "Return"}
                    className="w-full"
                    isOutline={true}
                  />
                )}
              /> */}
            </Box>
          )}

          {/* VIN field - only shown when Part Related Query is selected */}
          {selectedCategory?.value === "PartQuery" && (
            <Box className="flex w-full flex-col gap-6">
              <Controller
                control={control}
                name="vin"
                render={({ field: { onChange, value } }) => (
                  <OGTextInput
                    title={getLabel("vin")}
                    value={value || ""}
                    onChange={(val) => {
                      onChange(val.toUpperCase());
                    }}
                    placeholder={getLabel("your_vin")}
                    state={errors.vin ? "error" : value ? "filled" : "default"}
                    error={errors.vin?.message}
                    mandatory={selectedCategory?.value === "PartQuery"}
                    className="w-full"
                    isOutline={true}
                  />
                )}
              />
              <Box className="-mt-4 w-full">
                <Text className="text-color-text-placeholder body-regular-sm">
                  {getLabel("support_form_vin_help_text")}
                </Text>
              </Box>
            </Box>
          )}

          {selectedCategory?.value === "Return" && loadingItemsForOrderId ? (
            <Box className="flex h-auto w-full gap-3">
              {" "}
              <SkeletonReturnOrderCard />
              <SkeletonReturnOrderCard />
            </Box>
          ) : selectedCategory?.value === "Return" &&
            refundData?.items &&
            refundData?.items?.length > 0 ? (
            <>
              <Box className="flex w-full flex-col gap-3">
                <Text className="text-color-text-body body-bold-md">
                  {getLabel("select_the_product")}
                </Text>

                {(watch("selectedItems") || [])?.map((item, index) => {
                  let itemError = undefined as string | undefined;
                  const reason = item.reason;
                  const selectedItemsErrors = errors.selectedItems as any;
                  if (selectedItemsErrors?.[index]?.images?.message) {
                    // Zod image validation error (max 3, size)
                    itemError = selectedItemsErrors[index].images.message;
                  } else if (
                    (reason === "WrongItem" || reason === "Damaged") &&
                    (!item.images || item.images.length === 0)
                  ) {
                    itemError =
                      reason === "WrongItem"
                        ? getLabel("upload_image_received")
                        : getLabel("damaged_received_part");
                  } else if (selectedItemsErrors?.[index]?.reason?.message) {
                    itemError = selectedItemsErrors[index].reason.message;
                  } else if (
                    selectedItemsErrors &&
                    typeof selectedItemsErrors === "object" &&
                    "message" in selectedItemsErrors
                  ) {
                    itemError = selectedItemsErrors.message as string;
                  }

                  const { src: productImageSrc } = resolvePartImageFromSources({
                    imageUrl: item?.image,
                  });
                  const productImage = productImageSrc ?? noimage;
                  return (
                    <OGReturnOrderCard
                      key={item.id || index}
                      property1="Base"
                      imgcomp={
                        typeof productImage === "string"
                          ? productImage
                          : (productImage as { src: string }).src || String(productImage)
                      }
                      partname={item.name || ""}
                      price={item.price?.toString() || "0"}
                      Device="Desktop"
                      description={item.description || ""}
                      // StarBlock={<StarBlock />}
                      item={item}
                      onReasonChange={(reason) => handleItemReasonChange(index, reason)}
                      onImagesChange={(images) => handleItemImagesChange(index, images)}
                      error={itemError}
                    />
                  );
                })}
              </Box>
            </>
          ) : null}

          {/* Comments textarea */}
          <Controller
            control={control}
            name="comments"
            render={({ field: { onChange, value } }) => (
              <OGTextArea
                title={getLabel("comments")}
                value={value ?? ""}
                onChange={onChange}
                placeholder={getLabel("your_comments")}
                state={errors.comments ? "error" : value ? "filled" : "default"}
                error={errors.comments?.message}
                mandatory={false}
                className="w-full"
              />
            )}
          />
          {selectedCategory?.value === "Return" &&
            refundData?.items &&
            refundData?.items?.length > 0 && (
              <Box className="flex w-full flex-row items-center gap-3 bg-[--System-Colors-Info-Extra-Light] px-[9px] py-[6px]">
                {/* <CustomTooltip>
                </CustomTooltip> */}
                <Image src={exclamicon} alt="icon" className="cursor-pointer" />

                <Box className="flex flex-wrap items-start base:flex-col base:gap-1 gtsm:flex-col gtsm:gap-1 gtlg:flex-row gtlg:gap-0">
                  {" "}
                  <span className="flex-wrap text-color-text-body body-bold-sm">
                    {getLabel("return_accepted")}.
                  </span>
                </Box>
              </Box>
            )}

          {/* Upload visible on all other cases of category except "Return", for return this is
          not visible */}
          {selectedCategory?.value !== "Return" && (
            <Box className="flex w-full flex-col gap-3">
              <Box className="flex h-auto w-full justify-start gap-3 base:flex-col gtsm:flex-row md:w-auto gtlg:flex-row">
                {/* button */}
                <label className="min-w-auto flex max-h-[45px] cursor-pointer flex-row flex-nowrap items-center gap-3 rounded-[4px] border border-color-primary-main p-3 base:justify-center gtsm:justify-start gtlg:justify-start">
                  <Image src={uploadIcon} alt="" className={`${imguploadiconClass}`} />
                  <Box className="text-color-primary-main body-regular-sm">
                    {getLabel("upload_file")}
                  </Box>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Show file names with remove icon */}
                {watch("files") && watch("files").length > 0 && (
                  <Box className="flex w-auto items-center gap-3 base:flex-col gtsm:flex-row gtlg:flex-row">
                    {watch("files")?.map((file, idx) => {
                      const filename = file.name || "Filename.JPEG";
                      const dotIndex = filename.lastIndexOf(".");
                      const name = filename.substring(0, dotIndex);
                      const extension = filename.substring(dotIndex);

                      // Use different truncation logic based on screen size
                      const maxLength = isMobile ? 28 : 23;
                      const truncatedName =
                        name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
                      const displayName = truncatedName + extension;

                      return (
                        <Box
                          key={idx}
                          className={`flex flex-row items-center ${isMobile ? "gap-3" : "gap-1"} base:w-full gtlg:w-auto`}
                        >
                          <CustomTooltip content={filename}>
                            <span className="cursor-pointer underline body-regular-sm">
                              {displayName}
                            </span>
                          </CustomTooltip>
                          <span
                            className="mt-2 flex cursor-pointer justify-center text-[18px] font-bold"
                            onClick={() => handleRemoveFile(idx)}
                            aria-label="Remove file"
                          >
                            ✕
                          </span>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {/* Only show JPEG/PNG text if no files */}
                {(!watch("files") || watch("files").length === 0) && (
                  <Text className="flex w-auto flex-none items-center justify-center text-color-text-body body-regular-sm">
                    {getLabel("jpeg_png")}
                  </Text>
                )}
              </Box>

              {/* Show files validation error */}
              {errors.files && (
                <Text className="text-color-system-error-hover body-regular-sm">
                  {errors.files.message}
                </Text>
              )}
            </Box>
          )}

          {/* Submit button */}
          <OGButton
            type="primary"
            disabled={!isValid || isSubmittingSupport}
            onClick={handleSubmit(onSubmit)}
            size="large"
            className="w-full"
          >
            {getLabel("submit")}
          </OGButton>
        </Box>
      </form>
      <SuccessModal />
    </>
  );
}
