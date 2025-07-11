import { ChangeEvent } from "react";

interface ChatProps {
  message: string;
  allMessages: Message[];
  setMessage: (event: ChangeEvent<HTMLInputElement>) => void;
  sendMessage: () => void;
}

export default function Chat({
  message,
  allMessages,
  setMessage,
  sendMessage,
}: ChatProps) {
  const shouldShowMeta = (curr: Message, prev?: Message): boolean => {
    if (!prev) return true;

    const currDate = new Date(curr.timestamp);
    const prevDate = new Date(prev.timestamp);

    const sameSender = curr.sender === prev.sender;
    const sameHour =
      currDate.getFullYear() === prevDate.getFullYear() &&
      currDate.getMonth() === prevDate.getMonth() &&
      currDate.getDate() === prevDate.getDate() &&
      currDate.getHours() === prevDate.getHours();

    return !(sameSender && sameHour);
  };

  const formatTimestamp = (ts: number): string => {
    const date = new Date(ts);
    return `${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} • ${date.toLocaleDateString()}`;
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[#1e1e1e] rounded-md overflow-hidden text-white">
        <ul className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
          {allMessages.map((msg, idx) => {
            const showMeta = shouldShowMeta(msg, allMessages[idx - 1]);
            return (
              <li key={idx} className="flex flex-col gap-1">
                {showMeta && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <span className="font-medium text-white">{msg.sender}</span>
                    <span className="text-gray-500 text-xs">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                )}
                <div className="bg-[#2a2d2e] px-4 py-2 rounded-md max-w-[85%] w-fit text-[#EDEDED]">
                  {msg.message}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="p-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={setMessage}
            className="flex-1 bg-[#1e1e1e] border border-gray-600 text-sm px-3 py-2 rounded-md outline-none focus:ring-1 focus:ring-[#3b82f6] placeholder:text-gray-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            className="bg-[#3b82f6] text-white text-sm px-4 py-2 rounded-md cursor-pointer hover:bg-[#2563eb] transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
