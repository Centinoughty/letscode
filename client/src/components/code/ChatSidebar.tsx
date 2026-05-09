"use client";

import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Send } from "lucide-react";

export default function ChatSidebar() {
  const [message, setMessage] = useState<string>("");

  return (
    <aside className="h-full flex justify-between flex-col border-l border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <h2 className="font-medium">Chat</h2>
      </div>

      <div className="p-4 border-t border-gray-200">
        <Input
          type="text"
          placeholder="Type in your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="text-sm tracking-wide"
        />
      </div>
    </aside>
  );
}
