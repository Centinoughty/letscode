import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/ui/Header";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 p-2 pt-1 min-w-0 flex flex-col overflow-hidden">
          <Header />

          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
}
