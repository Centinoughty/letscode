"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isAuthChecked } = useAuthStore();

  useEffect(() => {
    if (isAuthChecked && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isAuthChecked, isLoading, router]);

  if (!isAuthChecked || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
