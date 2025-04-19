"use client";

import io from "socket.io-client";
import * as Y from "yjs";

import { useParams, usePathname } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState, useRef } from "react";
import { getAuthToken } from "@/util/security";
import axios from "axios";
import { runCode } from "@/lib/code";

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_SERVER;
const socket = io(SOCKET_SERVER, {
  auth: { token: getAuthToken() },
  transports: ["websocket"],
});

export default function Editor() {
  const pathname = usePathname();
  const { id } = useParams<{ id: string }>();

  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);

  const [code, setCode] = useState<string>("");
  const [permission, setPermission] = useState<"read" | "write" | null>(null);
  const [output, setOutput] = useState<string | null>(null);

  const [activeUsers, setActiveUsers] = useState<number>(0);

  // temporary
  const [email, setEmail] = useState<string>("");
  const [perms, setPerms] = useState<"read" | "write" | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  // -- -- FUNCTION CALL TO FETCH CODE FROM BACKEND -- --
  // const { data, loading, error } = useFetch<CodeResponse>(
  //   `api/code/${id}`,
  //   true
  // );

  useEffect(() => {
    if (!id) {
      return;
    }

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("codetext");

    ydocRef.current = ydoc;
    ytextRef.current = ytext;

    const handleLocalChanges = (event: Y.YTextEvent) => {
      console.log(permission);

      if (permission === "write") {
        const update = Y.encodeStateAsUpdate(ydoc);
        socket.emit("yjs-update", { roomId: id, update });
      }
    };

    ytext.observe(handleLocalChanges);

    socket.emit("join-room", { roomId: id });

    socket.on("yjs-init", (update: Uint8Array) => {
      Y.applyUpdate(ydoc, new Uint8Array(update));
      setCode(ytext.toString());
    });

    socket.on("yjs-update", ({ update }) => {
      Y.applyUpdate(ydoc, new Uint8Array(update));
      const newCode = ytext.toString();

      setCode(newCode);
    });

    socket.on("permission-update", ({ permission }) => {
      console.log("dfkhg", permission);
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
      ytext.unobserve(handleLocalChanges);
      ydoc.destroy();

      socket.off("yjs-init");
      socket.off("yjs-update");

      socket.off("code-update");
      socket.off("permission-update");
      socket.off("send-message");
      socket.off("error");
    };
  }, [id, permission]);

  useEffect(() => {
    return () => {
      socket.emit("leave-room", { roomId: id });
    };
  }, [pathname]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (permission !== "write") {
      return;
    }

    const newCode = event.target.value;
    // setCode(newCode);
    // socket.emit("code-change", { roomId: id, code: newCode });

    if (ytextRef.current) {
      const oldLength = ytextRef.current.length;
      ytextRef.current.delete(0, oldLength);
      ytextRef.current.insert(0, newCode);
    }

    setCode(newCode);
  };

  // -- effect change when data updates --
  // useEffect(() => {
  //   if (data?.code) {
  //     setCode(data.code);
  //   }
  // }, [data]);

  const addUserToCode = async (event: FormEvent) => {
    event.preventDefault();

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/code/${id}/collaborators/add`,
      { user_email: email, access_level: perms },
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );

    console.log(response.data);
  };

  const handleRun = async () => {
    const response = await runCode(id, "");
    setOutput(response.output);
  };

  const saveCode = () => {
    if (permission !== "write") {
      return;
    }

    socket.emit("save-code", { roomId: id });
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("send-message", { roomId: id, message: newMessage });
      setNewMessage("");
    }
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

        <div>
          <p>{activeUsers}</p>
        </div>

        <textarea
          name="code"
          value={code}
          onChange={handleChange}
          id="code"
          disabled={permission !== "write"}
          className="h-96"
        ></textarea>
        <button onClick={handleRun}>Run</button>
        <button onClick={saveCode}>Save</button>
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
