"use client";

import { useState } from "react";
import { Bell, Plus, Search, Settings } from "lucide-react";
import Input from "./Input";
import Button from "./Button";
import CodeModal from "../modal/CodeModal";
import WorkspaceModal from "../modal/WorkspaceModal";
import ProfileButton from "../common/ProfileButton";

export default function Header() {
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
            label="Code"
            icon={Plus}
            className="rounded-sm"
          />

          <Button
            onClick={() => setIsWorkspaceOpen(true)}
            label="Workspace"
            icon={Plus}
            className="rounded-sm"
          />

          <button className="hover:bg-gray-100 transition">
            <Bell size={24} className="text-gray-600" />
          </button>

          <button className="hover:bg-gray-100 transition">
            <Settings size={24} className="text-gray-600" />
          </button>

          <ProfileButton />
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
