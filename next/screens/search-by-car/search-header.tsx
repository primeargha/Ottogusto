"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box } from "@/components/ui/box";

export default function SearchByCarHeader({
  handleClose,
  showBackArrow = true,
}: {
  handleClose: () => void;
  showBackArrow?: boolean;
}) {
  const router = useRouter();

  return (
    // <Box className="fixed left-0 top-0 z-50 w-full bg-[--Neutral-Chrome-50] base:h-[68px] gtsm:flex md:h-[72px]">
    <Box className="border-[--Text-Tarmac]/10 fixed left-0 top-0 z-50 w-full base:h-[68px] base:border-b base:bg-[--Brand-Pure-White] gtsm:flex gtsm:border-0 gtsm:bg-[--Neutral-Chrome-50] md:h-[72px]">
      <Box className="flex h-full w-full flex-row items-center justify-between">
        {/* Back Arrow */}
        {showBackArrow ? (
          <button
            aria-label="Back"
            onClick={() => router.back()}
            className="ml-4 mt-2 rounded-md p-2 text-2xl text-gray-500 transition hover:bg-gray-200 hover:text-black focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M5.33301 15.9998H26.6663"
                stroke="#0C271D"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M11.9996 22.6667C11.9996 22.6667 5.33303 17.7568 5.33301 16C5.33299 14.2432 11.9997 9.33337 11.9997 9.33337"
                stroke="#0C271D"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        ) : (
          <span className="ml-4" />
        )}
        {/* Close (X) */}
        <button
          aria-label="Close"
          onClick={handleClose}
          className="mr-4 mt-2 rounded-md text-2xl transition hover:bg-gray-200 hover:text-black focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
          >
            <path
              d="M26 14L14 25.9992M26 26L14 14.0008"
              stroke="#B7B7B7"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M1 20C1 11.0433 1 6.56498 3.78248 3.78248C6.56498 1 11.0433 1 20 1C28.9566 1 33.435 1 36.2176 3.78248C39 6.56498 39 11.0433 39 20C39 28.9566 39 33.435 36.2176 36.2176C33.435 39 28.9566 39 20 39C11.0433 39 6.56498 39 3.78248 36.2176C1 33.435 1 28.9566 1 20Z"
              stroke="#B7B7B7"
              stroke-width="1.5"
            />
          </svg>
        </button>
      </Box>
    </Box>
  );
}
