"use client";

import { ArrowLeft, Play, Users } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import ProfileButton from "../common/ProfileButton";
import Input from "../ui/Input";
import Button from "../ui/Button";
import CollaboratorModal from "../modal/CollaboratorModal";
import { Collaborator } from "@/types/Collaborator";

interface HeaderProps {
  codeId: string;
  name: string;
  language: string;
  users: Collaborator[];
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onRun?: () => void;
}

export default function EditorHeader({
  codeId,
  name,
  language,
  users,
  onChange,
  onBlur,
  onRun,
}: HeaderProps) {
  const [isAddCollabOpen, setIsAddCollabOpen] = useState<boolean>(false);

  return (
    <>
      <header className="px-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <ArrowLeft size={18} className="" />
          </Link>

          <div className="flex items-end gap-2 text-sm">
            <Input
              type="text"
              value={name}
              onChange={onChange}
              onBlur={onBlur}
            />

            <span className="px-2 py-1 text-xs text-gray-200 bg-zinc-800 rounded">
              {language.toLowerCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            label=""
            icon={Users}
            iconClass="text-gray-600"
            className="rounded-full bg-gray-200/75! hover:bg-gray-300! duration-200"
            onClick={() => setIsAddCollabOpen(true)}
          />

          <Button
            label="Run"
            icon={Play}
            className="rounded-md"
            onClick={onRun}
          />

          <ProfileButton />
        </div>
      </header>

      <CollaboratorModal
        codeId={codeId}
        collaborators={users}
        isOpen={isAddCollabOpen}
        setIsOpen={setIsAddCollabOpen}
      />
    </>
  );
}
