"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getUser, isAuthChecked } = useAuthStore();
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current || isAuthChecked) {
      return;
    }

    hasBootstrapped.current = true;
    void getUser();
  }, [getUser, isAuthChecked]);

  return <>{children}</>;
}
