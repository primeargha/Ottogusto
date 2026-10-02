"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check authentication status from localStorage
    const authState = localStorage.getItem("auth-store");
    const isAuth = authState ? JSON.parse(authState).state.isAuthenticated : false;

    if (!isAuth) {
      //   router.replace("/");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } else {
      setIsLoading(false);
    }
  }, [router, isAuthenticated]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
