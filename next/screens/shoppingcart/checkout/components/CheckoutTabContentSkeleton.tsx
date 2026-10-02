import { Box } from "@/components/ui/box";
import { CheckoutDetailsBlockSkeleton } from "./CheckoutDetailsBlockSkeleton";

const FieldSkeleton = () => (
  <Box className="flex w-full flex-col gap-2">
    <Box className="animate-pulse h-4 w-[110px] rounded bg-gray-300" />
    <Box className="animate-pulse h-11 w-full rounded-[4px] bg-gray-200" />
  </Box>
);

const CheckboxRow = () => (
  <Box className="flex flex-row items-center gap-2">
    <Box className="animate-pulse h-4 w-4 rounded bg-gray-300" />
    <Box className="animate-pulse h-4 w-[220px] rounded bg-gray-200" />
  </Box>
);

// Matches the guest/no-saved-address form path (BillingaddressInput / DeliveryaddressInput).
const AddressFormSkeleton = ({ withCheckbox = false }: { withCheckbox?: boolean }) => (
  <Box className="flex w-full flex-col gap-space-md">
    <Box className="animate-pulse h-5 w-[150px] rounded bg-gray-300" />

    {withCheckbox && <CheckboxRow />}

    <Box className="flex w-full flex-col gap-4">
      <Box className="flex w-full flex-col gap-4 base:flex-col gtsm:flex-row gtlg:flex-row">
        <FieldSkeleton />
        <FieldSkeleton />
      </Box>
      <FieldSkeleton />
      <Box className="flex w-full flex-col gap-4 base:flex-col gtsm:flex-row gtlg:flex-row">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </Box>
    </Box>
  </Box>
);

// Matches the saved-address path (SavedBillingAddress2 / SavedDeliveryAddress2) shown
// to authenticated users who already have addresses on file — much shorter than the
// full form, so this keeps the swap-in shift small for the common returning-customer case.
const SavedAddressCardSkeleton = ({ withCheckbox = false }: { withCheckbox?: boolean }) => (
  <Box className="flex w-full flex-col gap-space-md">
    <Box className="animate-pulse h-5 w-[150px] rounded bg-gray-300" />

    {withCheckbox && <CheckboxRow />}

    <Box className="flex w-full flex-col gap-space-sm rounded-[4px] border border-color-border-default p-space-md">
      <Box className="flex w-full flex-row items-center justify-between">
        <Box className="animate-pulse h-4 w-[160px] rounded bg-gray-300" />
        <Box className="animate-pulse h-4 w-[90px] rounded bg-gray-200" />
      </Box>
      <Box className="flex w-full flex-col gap-2">
        <Box className="animate-pulse h-4 w-full max-w-[280px] rounded bg-gray-200" />
        <Box className="animate-pulse h-4 w-full max-w-[220px] rounded bg-gray-200" />
        <Box className="animate-pulse h-4 w-[140px] rounded bg-gray-200" />
      </Box>
    </Box>
  </Box>
);

const VinCheckSkeleton = () => (
  <Box className="flex w-full flex-col gap-2">
    <Box className="animate-pulse h-6 w-[260px] rounded bg-gray-300" />
    <Box className="animate-pulse h-4 w-[320px] rounded bg-gray-200" />
    <Box className="mt-2 flex w-full flex-row gap-3">
      <Box className="animate-pulse h-11 w-full rounded-[4px] bg-gray-200" />
      <Box className="animate-pulse h-11 w-[110px] shrink-0 rounded-[4px] bg-gray-300" />
    </Box>
  </Box>
);

const CollectionPointSkeleton = () => (
  <Box className="flex w-full flex-col gap-6">
    <Box className="animate-pulse h-5 w-[160px] rounded bg-gray-300" />
    <Box className="animate-pulse h-[90px] w-full rounded-md border border-color-border-default bg-gray-100" />
  </Box>
);

interface CheckoutTabContentSkeletonProps {
  variant?: "home" | "warehouse";
  isAuthenticated?: boolean;
}

export function CheckoutTabContentSkeleton({
  variant = "home",
  isAuthenticated = false,
}: CheckoutTabContentSkeletonProps) {
  const AddressSkeleton = isAuthenticated ? SavedAddressCardSkeleton : AddressFormSkeleton;

  return (
    <Box className="flex h-auto w-full flex-col gap-space-lg rounded-[4px] border border-color-border-default base:p-space-sm gtsm:px-space-xl gtsm:py-space-lg">
      {/* Personal / business purchase + contact info */}
      <CheckoutDetailsBlockSkeleton />

      {variant === "warehouse" && <CollectionPointSkeleton />}

      {/* Billing address */}
      <AddressSkeleton />

      {/* Delivery address (home delivery only) */}
      {variant === "home" && <AddressSkeleton withCheckbox />}

      {/* Verify Compatibility With VIN */}
      <VinCheckSkeleton />

      {/* Order & pay button */}
      <Box className="animate-pulse h-[52px] w-full rounded-md bg-gray-300" />
    </Box>
  );
}

export default CheckoutTabContentSkeleton;
