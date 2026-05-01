"use client";

import NodeCard from "@/components/card/NodeCard";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import { mont } from "@/styles/font";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { codes, workspaces, fetchCodes, fetchWorkspaces } =
    useDashboardStore();

  useEffect(() => {
    fetchCodes();
    fetchWorkspaces();
  }, [fetchCodes, fetchWorkspaces]);

  return (
    <>
      <main className={`p-2 ${mont.className} flex flex-col gap-4`}>
        <div className="mt-4 flex flex-col gap-2">
          <h1 className="font-semibold text-4xl">
            Welcome back, {user?.name?.split(" ")[0] ?? "User"}.
          </h1>
          <p className="  text-gray-400">
            Here's an overview of your recent activity and projects.
          </p>
        </div>

        <div>
          <h2 className="font-medium text-xl">My Files</h2>
          {codes.map((item) => (
            <NodeCard name={item.file.name} NodeType="FILE" />
          ))}
        </div>

        <div>
          <h2 className="font-medium text-xl">Workspaces</h2>
        </div>
      </main>
    </>
  );
}
