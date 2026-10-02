import { useGetReturnDetailById } from "@/hooks/orders";
import ReturnDetails from "@/screens/profile/ReturnDetails";
import { getReturnDetailById } from "@/services/cart";

type Props = {
  params: {
    "language-country"?: string;
    orderId?: string;
    emailId?: string;
  };
  searchParams?: any;
};

const Page = async (props: Props) => {
  const { params, searchParams } = props;
  const { orderId = "", emailId = "" } = params;
  const returnData = await getReturnDetailById(orderId, emailId);
  return <ReturnDetails data={returnData} />;
};

export default Page;
