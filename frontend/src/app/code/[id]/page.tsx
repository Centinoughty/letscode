"use client";

import axios from "axios";
import io from "socket.io-client";
import { getAuthToken } from "@/util/security";
import dynamic from "next/dynamic";
import { useParams, usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_SERVER;
const socket = io(SOCKET_SERVER, {
  auth: { token: getAuthToken() },
  transports: ["websocket"],
});

export default function Editor() {
  const pathname = usePathname();
  const { id } = useParams<{ id: string }>();
  const editorRef = useRef<any>(null);

  // -- -- Socket State
  const [code, setCode] = useState<string>("");
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [permission, setPermission] = useState<"read" | "write" | null>(null);
  const [output, setOutput] = useState<string>("");

  // -- -- Chat Messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  // -- -- Add Collaborator
  const [email, setEmail] = useState<string>("");
  const [perms, setPerms] = useState<"read" | "write" | null>(null);

  // -- -- -- SOCKET -- -- --
  useEffect(() => {
    socket.emit("join-room", { roomId: id });

    socket.on("permission-update", ({ permission }) => {
      // console.log(permission)
      setPermission(permission);
    });

    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    socket.on("active-users", ({ count }) => {
      setActiveUsers(count);
    });

    socket.on("send-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("error", (message) => {
      console.log(message);
    });

    return () => {
      socket.emit("leave-room", { roomId: id });
      socket.off("permission-update");
      socket.off("code-update");
      socket.off("active-users");
      socket.off("send-message");
      socket.off("error");
    };
  }, [id]);

  useEffect(() => {
    return () => {
      socket.emit("leave-room", { roomId: id });
    };
  }, [pathname]);

  // -- -- -- FUNCTION TO ADD USER TO CODE -- -- --
  const addUserToCode = async (event: FormEvent) => {
    event.preventDefault();

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/code/${id}/collaborators/add`,
      { user_email: email, access_level: perms },
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );

    console.log(response.data);
  };

  // -- -- -- FUNCTION TO RUN A CODE -- -- --
  const handleRunCode = () => {};

  // -- -- -- FUNCTION TO SAVE A CODE -- -- --
  const handleSaveCode = () => {
    if (permission !== "write") return;

    socket.emit("save-code", { roomId: id });
  };

  // -- -- -- FUNCTION TO SEND A MESSAGE -- -- --
  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("send-message", { roomId: id, message: newMessage });
      setNewMessage("");
    }
  };

  // -- -- -- FUNCTION TO HANDLE CODE MOUNT -- -- --
  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      if (permission !== "write") {
        return;
      }

      const currentCode = editor.getValue();
      setCode(currentCode);

      socket.emit("code-change", { roomId: id, code: currentCode });
    });
  };

  return (
    <>
      <main>
        <form onSubmit={addUserToCode}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="text"
            value={perms ?? ""}
            placeholder="permission"
            onChange={(event) =>
              setPerms(event.target.value as "read" | "write")
            }
          />
          <button type="submit">Add</button>
        </form>

        <div>{activeUsers}</div>

        <MonacoEditor
          height="500px"
          language="cpp"
          value={code}
          onMount={handleEditorMount}
          options={{
            readOnly: permission !== "write",
            fontSize: 14,
            minimap: { enabled: false },
          }}
        />

        <button onClick={handleRunCode}>Run</button>
        <button onClick={handleSaveCode}>Save</button>
        <p>{output}</p>

        <div>
          <ul>
            {messages.map((message, idx) => (
              <li key={idx}>
                {message.username} - {message.message}
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </main>
    </>
  );
}
