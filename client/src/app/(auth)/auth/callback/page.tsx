import { Suspense } from "react";
import AuthCallbackClient from "@/components/common/AuthCallback";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackClient />
    </Suspense>
  );
}
