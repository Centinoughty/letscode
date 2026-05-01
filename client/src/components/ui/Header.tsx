"use client";

import { Bell, Search, Settings } from "lucide-react";
import Input from "./Input";
import Image from "next/image";
import Button from "./Button";
import { useAuthStore } from "@/store/useAuthStore";

export default function Header() {
  const { user } = useAuthStore();

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
          <Button label="+ Code" className="rounded-lg" />

          <Button label="+ Workspace" className="rounded-lg" />

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
    </>
  );
}
