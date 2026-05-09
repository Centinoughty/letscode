"use client";

import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import ProfileButton from "../common/ProfileButton";

interface HeaderProps {
  name: string;
  language: string;
}

export default function EditorHeader({ name, language }: HeaderProps) {
  return (
    <header className="px-4 flex items-center justify-between bg-black">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <ArrowLeft size={18} className="text-neutral" />
        </Link>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-white">{name}</span>

          <span className="px-2 py-1 text-xs text-gray-200 bg-zinc-800 rounded">
            {language}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-black rounded-md bg-emerald-500 transition hover:bg-emerald-400">
          <Play size={18} />
          Run
        </button>

        <ProfileButton />
      </div>
    </header>
  );
}
