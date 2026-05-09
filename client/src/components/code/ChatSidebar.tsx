"use client";

import Input from "../ui/Input";

export default function ChatSidebar() {
  return (
    <aside className="h-full flex justify-between flex-col bg-zinc-900">
      <div className="border-b border-zinc-800 p-4">
        <h2 className="font-medium text-white">Chat</h2>
      </div>

      <div className="border-t border-zinc-800 p-4">
        <Input type="text" className="text-white tracking-wide" />
      </div>
    </aside>
  );
}
