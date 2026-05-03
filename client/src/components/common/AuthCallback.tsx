"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithGoogle } = useAuthStore();

  const hasProcessed = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      router.push("/login");
      return;
    }

    if (code && !hasProcessed.current) {
      hasProcessed.current = true;

      loginWithGoogle(code).then(() => {
        const state = useAuthStore.getState();
        if (state.isAuthenticated) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      });
    }
  }, [searchParams, loginWithGoogle, router]);

  return (
    <div className="h-screen flex justify-center items-center">
      <p>Loading...</p>
    </div>
  );
}
