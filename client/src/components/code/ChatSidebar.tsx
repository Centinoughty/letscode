"use client";

import { useRef, useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { SendHorizontal } from "lucide-react";
import { Socket } from "socket.io-client";
import Image from "next/image";

interface Message {
  id: string;
  text: string;
  sender: {
    socketId: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
}

interface MessageGroup {
  sender: {
    socketId: string;
    name: string;
    avatar: string;
  };
  messages: Message[];
}

interface ChatSidebarProps {
  codeId: string;
  socket: Socket | null;
}

const MAX_MESSAGE_LENGTH = 500;

export default function ChatSidebar({ codeId, socket }: ChatSidebarProps) {
  const [message, setMessage] = useState<string>("");
  const [groupedMessages, setGroupedMessages] = useState<MessageGroup[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [groupedMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (incMessage: Message) => {
      setGroupedMessages((prev) => {
        const lastGroup = prev[prev.length - 1];

        if (
          lastGroup &&
          lastGroup.sender.socketId === incMessage.sender.socketId
        ) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastGroup,
              messages: [...lastGroup.messages, incMessage],
            },
          ];
        }

        return [
          ...prev,
          {
            sender: incMessage.sender,
            messages: [incMessage],
          },
        ];
      });
    };

    socket.on("chat:message", handleIncomingMessage);

    return () => {
      socket.off("chat:message", handleIncomingMessage);
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (!socket || !message.trim() || message.length > MAX_MESSAGE_LENGTH)
      return;

    socket.emit("chat:message", {
      roomId: codeId,
      message: message.trim(),
    });

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <aside className="h-full flex flex-col justify-between border-l border-gray-200 overflow-hidden">
      <div className="p-3 border-b border-gray-200">
        <h2 className="font-medium">Chat</h2>
      </div>

      {groupedMessages.length > 0 ? (
        <>
          <div className="p-2 flex-1 flex flex-col gap-3 overflow-y-auto">
            {groupedMessages.map((group, groupIdx) => (
              <div key={groupIdx} className="flex gap-2">
                <div className="relative w-8 h-8 flex">
                  <Image
                    src={group.sender.avatar}
                    alt={group.sender.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="80px"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  {group.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="px-3 py-2 w-fit max-w-xs text-sm break-all bg-gray-200 rounded-md"
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        </>
      ) : (
        <>
          <div className="p-2 flex-1 flex justify-center items-center">
            <p className="text-gray-500">New messages will appear here</p>
          </div>
        </>
      )}

      <div className="p-2 flex justify-between gap-2 border-t border-gray-200">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Type in your message..."
            value={message}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full text-sm tracking-wide"
          />
        </div>

        <Button
          label=""
          icon={SendHorizontal}
          onClick={handleSendMessage}
          disabled={!message.trim() || message.length > MAX_MESSAGE_LENGTH}
          className="rounded-md aspect-square"
        />
      </div>
    </aside>
  );
}
