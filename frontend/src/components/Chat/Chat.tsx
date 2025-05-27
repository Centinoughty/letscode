import { ChangeEvent } from "react";

interface CardProps {
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
}: CardProps) {
  return (
    <>
      <div className="bg-[var(--editor)] overflow-y-scroll text-white rounded-md">
        {allMessages.map((message, idx) => (
          <li key={idx}>
            <p>{message.sender}</p>
            <p>{message.message}</p>
          </li>
        ))}
        <div>
          <input
            type="text"
            placeholder="Message..."
            value={message}
            onChange={setMessage}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </>
  );
}
