"use client";

import MySavedCar from "@/screens/garage-bay/MySavedCar";
import { useSearchParams } from "next/navigation";

export default function MySavedCarPage() {
  const params = useSearchParams();
  const cardId = params?.get("id");
  return <MySavedCar cardId={cardId as string} />;
}
