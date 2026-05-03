"use client";

import { useState } from "react";
import { Bell, Search, Settings } from "lucide-react";
import Input from "./Input";
import Image from "next/image";
import Button from "./Button";
import { useAuthStore } from "@/store/useAuthStore";
import CodeModal from "../modal/CodeModal";
import WorkspaceModal from "../modal/WorkspaceModal";

export default function Header() {
  const { user } = useAuthStore();

  const [isCodeOpen, setIsCodeOpen] = useState<boolean>(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(false);

  return (
    <>
      <header className="p-2 flex justify-between border-b border-gray-200">
        <div>
          <Input
            icon={Search}
            placeholder="Search code, workspace, etc..."
            className="min-w-sm w-md"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsCodeOpen(true)}
            label="+ Code"
            className="rounded-lg"
          />

          <Button
            onClick={() => setIsWorkspaceOpen(true)}
            label="+ Workspace"
            className="rounded-lg"
          />

          <button className="hover:bg-gray-100 transition">
            <Bell size={24} className="text-gray-600" />
          </button>

          <button className="hover:bg-gray-100 transition">
            <Settings size={24} className="text-gray-600" />
          </button>

          <Image
            src={user?.avatar || "https://i.pravatar.cc/100"}
            alt={user?.name || "pravatar"}
            width={35}
            height={35}
            className="rounded-full"
          />
        </div>
      </header>

      {/* Modal component for Code form */}
      <CodeModal isOpen={isCodeOpen} onClose={() => setIsCodeOpen(false)} />

      {/* Modal component for Workspace form */}
      <WorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
      />
    </>
  );
}
