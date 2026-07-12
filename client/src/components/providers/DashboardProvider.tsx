"use client";

import { useCodeStore } from "@/store/useCodeStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { ReactNode, useEffect } from "react";

export default function DashboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { fetchCodes } = useCodeStore();
  const { fetchWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    fetchCodes();
    fetchWorkspaces();
  }, [fetchCodes, fetchWorkspaces]);

  return <>{children}</>;
}
