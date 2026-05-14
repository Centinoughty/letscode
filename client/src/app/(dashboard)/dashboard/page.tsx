"use client";

import NodeCard from "@/components/card/NodeCard";
import { useAuthStore } from "@/store/useAuthStore";
import { useCodeStore } from "@/store/useCodeStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { mont } from "@/styles/font";
import { formatDate } from "@/util/formatDate";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { codes, fetchCodes, editCode, deleteCode } = useCodeStore();
  const { workspaces, fetchWorkspaces, editWorkspace, deleteWorkspace } =
    useWorkspaceStore();

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
            Here&apos;s an overview of your recent activity and projects.
          </p>
        </div>

        <div>
          <h2 className="font-medium text-xl">My Files</h2>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {codes.map((item) => (
              <NodeCard
                id={item.id}
                key={item.id}
                name={item.name}
                language={item.language}
                type="FILE"
                lastEdited={formatDate(item.updatedAt)}
                collaborators={item.collaborators}
                isOwned={
                  !item.collaborators.some(
                    (collab) => collab.user.email === user?.email,
                  )
                }
                onEdit={(newName) => editCode(item.id, newName)}
                onDelete={() => deleteCode(item.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-medium text-xl">Workspaces</h2>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {workspaces.map((item) => (
              <NodeCard
                id={item.id}
                key={item.id}
                name={item.name}
                type="WORKSPACE"
                lastEdited={formatDate(item.updatedAt)}
                collaborators={item.collaborators}
                isOwned={
                  !item.collaborators.some(
                    (collab) => collab.user.email === user?.email,
                  )
                }
                onEdit={(newName) => editWorkspace(item.id, newName)}
                onDelete={() => deleteWorkspace(item.id)}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
