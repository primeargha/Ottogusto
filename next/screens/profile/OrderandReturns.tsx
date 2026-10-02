"use client";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import BackIcon from "@/components/icons/BackIcon";
import { useBranding } from "@/contexts/BrandingContext";
import { useGetAllOrdersPagination } from "@/hooks/orders";
import type { GetOrderListItem, OrderItem } from "@/type";
import { useAuthStore } from "@/stores/useAuthStore";
import InfiniteScroll from "react-infinite-scroll-component";
import OrderBoxSkeleton from "@/screens/profile/OrderBoxSkeleton";
import OrdersBox from "@/screens/profile/OrdersBox";
import NoResultOrderList from "../products/NoResultOrderList";
import { currencyFormat } from "@/helpers/UtilityHelper";
// import { useProductThemeSB } from "@/components/ThemeChange/useThemeChangeSB";
import { useTheme } from "@/hooks/useThemeConfig";
import { Spinner } from "@/components/ui/spinner";
import Productnavigation from "../productdetails/productnavigation";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import Typography from "@/components/og-components/Typography";
import { formatDateByLocale } from "@/utils/formatDate";

export default function OrderandReturns() {
  const router = useRouter();
  const { getLabel, getLocale } = useBranding();
  const { data, fetchNextPage, isPending } = useGetAllOrdersPagination();
  const { authUser } = useAuthStore();
  const localeCODE = getLocale();
  // @ts-ignore
  const emailId = authUser?.email;
  const orders = data?.pages.flatMap((page) => page.data) || [];
  const theme = useTheme();
  // const { overlayOrderListBeige200_seafoamL1 } = useProductThemeSB();
  //
  return (
    <Box
      className={`relative h-auto w-full pb-[40px] base:mt-5 base:pl-3 base:pr-3 gtsm:pr-3 md:pl-0 gtlg:mt-[94px] between-640-767:mt-[78px] between-768-1023:mt-[94px] between-728-767:mt-[78px]`}
    >
      <Box className="flex w-full items-start justify-center">
        <Box
          //@ts-ignore
          onPress={() => router.back()}
          className="mb-4 flex flex-row items-center bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent gtsm:hidden"
        >
          <Productnavigation />
          <Typography className="ml-1 mt-[2px] text-color-text-body body-medium-md">
            {getLabel("back")}
          </Typography>
        </Box>
      </Box>
      {/* sprint-21 related changes shadow-[0px_8px_26px_10px_rgba(0,0,0,0.10)] */}
      <Card className="h-full w-full items-center overflow-hidden rounded-[6px] border border-color-border-default bg-color-background-default p-0">
        <Box className="w-full px-5 pt-6">
          <Box className="flex w-full flex-row items-center justify-between">
            <Box className="flex w-full flex-col">
              <Box>
                <Text className="break-words text-color-text-body body-bold-lg">
                  {getLabel("orders_and_returns_head")}
                </Text>
                <Text className="break-words pb-[12px] text-color-text-body body-regular-sm">
                  {getLabel("manage_orders_subtext")}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="relative h-full w-full">
          {/* <Box
            className={`via-[--arrow-bg]/70 pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[80px] rounded-b-lg bg-gradient-to-t from-color-background-l1 to-transparent`}
          /> */}
          {orders?.length > 0 ? (
            <>
              <div
                id="scrollableDiv"
                className="h-full w-full overflow-y-auto border-t pb-[20px] scrollbar-hide"
              >
                <InfiniteScroll
                  dataLength={orders.length}
                  next={fetchNextPage}
                  hasMore={data?.pages[data?.pages?.length - 1]?.continuationToken ? true : false}
                  loader={<OrderBoxSkeleton />}
                  scrollableTarget="scrollableDiv"
                  className="custom-scrollbar pb-[100px] pt-6 base:px-5 gtlg:px-6"
                  // endMessage={
                  //   <Box className="flex h-full w-full items-center justify-center gap-3 border-t">
                  //     {/* <Text className="pt-4 font-Overpass text-[24px] font-medium leading-[24px] text-gray-500 md:text-[24px]">
                  //       {getLabel("no_more_orders")}
                  //     </Text> */}
                  //   </Box>
                  // }
                >
                  {orders?.map((order: GetOrderListItem, index: number) => {
                    // const formattedDate = new Date(order.createDate ?? "").toLocaleDateString(
                    //   "en-US",
                    //   {
                    //     year: "numeric",
                    //     month: "long",
                    //     day: "numeric",
                    //   },
                    // );
                    return (
                      <OrdersBox
                        key={order.id || index}
                        orderdate={formatDateByLocale(order.createDate ?? "", localeCODE)}
                        ordernumber={Number(order?.id)}
                        items={(order?.items as any[]).filter(
                          (item: OrderItem) => item.type === "Part",
                        )}
                        orderTotal={currencyFormat(
                          Number((order.totalPriceIncVat ?? 0).toFixed(2)),
                          localeCODE,
                        )}
                        orderStatus={order.status ?? ""}
                        orderId={order.id ?? ""}
                        emailId={emailId}
                        tracking={order.tracking}
                      />
                    );
                  })}
                </InfiniteScroll>
              </div>
            </>
          ) : (
            <Box className="custom-scrollbar h-full w-full overflow-y-auto border-t pb-[20px]">
              {" "}
              {isPending ? (
                <Box className="h-[80dvh] w-full content-center items-center justify-center">
                  {/* {JSON.stringify(theme.getValue("Color/Piston/500"))} */}
                  <Spinner
                    size="large"
                    // color="#0a4932"
                    color={theme.getValue("Color/Piston/700")}
                  />
                  <Box className={"mt-4 h-4"}>Loading...</Box>
                </Box>
              ) : (
                <NoResultOrderList />
              )}
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
}
