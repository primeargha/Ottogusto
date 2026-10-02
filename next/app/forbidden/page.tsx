import ForbiddenClient from "@/screens/forbidden-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Denied | Otto Gusto",
  description: "You do not have permission to access this page.",
};

export default function ForbiddenPage() {
  return <ForbiddenClient />;
}
