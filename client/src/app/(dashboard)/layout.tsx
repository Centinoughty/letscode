import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/ui/Header";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex">
        <Sidebar />

        <div className="p-2 pt-1 w-full">
          <Header />
          {children}
        </div>
      </div>
    </>
  );
}
