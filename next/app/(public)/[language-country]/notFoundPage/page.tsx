"use client";
import { Box } from "@/components/ui/box";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useRouter, useSearchParams } from "next/navigation";
import { Routes } from "@/config/routes";
import { Pressable } from "@/components/ui/pressable";
import Typography from "@/components/og-components/Typography";
import NotFoundclient from "@/screens/not-found-client";

export default function NotFoundPage() {
  const router = useRouter();
  const params = useSearchParams();
  // return <h1>Testing.....</h1>
  return <NotFoundclient />;
  return (
    <Box className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white">
      <Box className="flex w-full items-center justify-center p-6 text-center">
        <Typography type="h1" className="drop-shadow-lg h1">
          404
        </Typography>
        <Typography type="h1" className="drop-shadow-lg h1">
          404
        </Typography>
        <Box className="mt-4 text-gray-300 body-bold-lg">Oops! Page not found</Box>
        <Box className="mt-2 text-gray-400">
          The page you are looking for doesn’t exist or has been moved.
        </Box>
        <Box className="mt-6 w-full max-w-[250px] cursor-pointer rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition hover:scale-105 hover:bg-indigo-500">
          Go Back Home
        </Box>
      </Box>
    </Box>
  );
}
