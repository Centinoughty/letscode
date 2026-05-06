import { ReactNode } from "react";
import { ProtectedLayout } from "@/components/common/ProtectedLayout";

export default function CodeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProtectedLayout>{children}</ProtectedLayout>
    </>
  );
}
