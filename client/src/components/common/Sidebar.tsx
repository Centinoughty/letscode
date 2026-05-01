"use client";

import { Grid2X2, Folder, Code2, Users, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { mont } from "@/styles/font";

interface SidebarItem {
  name: string;
  url: string;
  icon: any;
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", url: "/dashboard", icon: Grid2X2 },
  { name: "Workspaces", url: "/workspaces", icon: Folder },
  { name: "Files", url: "/files", icon: Code2 },
  { name: "Team", url: "/team", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={`h-screen w-64 flex flex-col justify-between ${mont.className} border-r border-gray-200 bg-white px-4 py-5`}
    >
      <div>
        <div className="mb-8 px-2">
          <h1 className="text-xl font-semibold text-primary">letscode</h1>
        </div>

        <p className="px-2 mb-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
          Project Explorer
        </p>

        <nav className="space-y-1">
          {sidebarItems.map((item, idx) => {
            const isActive = pathname === item.url;
            const Icon = item.icon;

            return (
              <Link
                key={idx}
                href={item.url}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gray-200 text-primary border-r-2 border-primary"
                    : "text-gray-600 hover:bg-gray-100",
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 px-2">
          <button className="w-full flex items-center justify-center gap-2 border border-gray-200 py-2 text-sm text-primary font-medium rounded-full hover:bg-gray-100 transition">
            <Plus size={16} />
            New Workspace
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
