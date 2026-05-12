"use client";

import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { ChangeEvent } from "react";
import ProfileButton from "../common/ProfileButton";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface HeaderProps {
  name: string;
  language: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
}

export default function EditorHeader({
  name,
  language,
  onChange,
  onBlur,
}: HeaderProps) {
  return (
    <header className="px-4 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <ArrowLeft size={18} className="" />
        </Link>

        <div className="flex items-end gap-2 text-sm">
          <Input type="text" value={name} onChange={onChange} onBlur={onBlur} />

          <span className="px-2 py-1 text-xs text-gray-200 bg-zinc-800 rounded">
            {language.toLowerCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button label="Run" icon={Play} className="rounded-md" />

        <ProfileButton />
      </div>
    </header>
  );
}
