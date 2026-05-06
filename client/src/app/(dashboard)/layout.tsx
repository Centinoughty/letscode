import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import { ReactNode } from "react";
import { ProtectedLayout } from "@/components/common/ProtectedLayout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProtectedLayout>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />

          <div className="flex-1 p-2 pt-1 min-w-0 flex flex-col overflow-hidden">
            <Header />

            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </div>
        </div>
      </ProtectedLayout>
    </>
  );
}
