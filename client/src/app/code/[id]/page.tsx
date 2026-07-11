"use client";

import ChatSidebar from "@/components/code/ChatSidebar";
import EditorHeader from "@/components/code/EditorHeader";
import MonacoEditor, {
  MonacoEditorHandle,
} from "@/components/code/MonacoEditor";
import OutputPanel from "@/components/code/OutputPanel";
import { getSocket } from "@/lib/socket";
import { useCodeStore } from "@/store/useCodeStore";
import { poppins } from "@/styles/font";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export interface User {
  socketId: string;
  name: string;
  avatar?: string;
}

export default function CodeEditorPage() {
  const params = useParams<{ id: string }>();
  const codeId = params.id;

  const { codes, getCode, editCode, runCode } = useCodeStore();
  const code = codes.find((c) => c.id === codeId);
  const collaborators = code?.collaborators ?? [];

  const [users, setUsers] = useState<User[]>([]);

  const [name, setName] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isCodeLoaded, setIsCodeLoaded] = useState<boolean>(false);

  const [input, setInput] = useState<string>("");
  const [runOutput, setRunOutput] = useState<string[]>([]);

  const [socketInst, setSocketInst] = useState<Socket | null>(null);
  const editorRef = useRef<MonacoEditorHandle>(null);

  // socket instance init
  useEffect(() => {
    if (!codeId || !isCodeLoaded || !language) return;

    const socket = getSocket();
    setSocketInst(socket);

    const handleRoomUsers = ({ users }: { users: User[] }) => {
      setUsers(users);
    };

    const handleUserJoin = (user: User) => {
      setUsers((prev) => {
        const exists = prev.some((u) => u.socketId === user.socketId);

        if (exists) {
          return prev;
        }

        return [...prev, user];
      });
    };

    const handleUserLeave = ({ socketId }: { socketId: string }) => {
      setUsers((prev) => prev.filter((user) => user.socketId !== socketId));
    };

    const joinRoom = () => {
      if (codeId) {
        socket.emit("room:join", {
          roomId: codeId,
          language: language.toUpperCase(),
        });
      }
    };

    socket.on("room:users", handleRoomUsers);
    socket.on("room:user_join", handleUserJoin);
    socket.on("room:user_leave", handleUserLeave);

    // If socket already connected, join immediately; otherwise wait for connect
    if (socket.connected) {
      joinRoom();
    } else {
      socket.on("connect", joinRoom);
    }

    return () => {
      socket.off("connect", joinRoom);

      socket.off("room:users", handleRoomUsers);
      socket.off("room:user_join", handleUserJoin);
      socket.off("room:user_leave", handleUserLeave);

      // prefer leaving the room instead of disconnecting the shared socket
      try {
        if (codeId) socket.emit("room:leave", { roomId: codeId });
      } catch (e) {
        // ignore
      }

      setSocketInst(null);
    };
  }, [codeId, isCodeLoaded, language]);

  // mount code
  useEffect(() => {
    if (!codeId) {
      return;
    }

    setIsCodeLoaded(false);

    async function loadCode() {
      const code = await getCode(codeId);

      if (!code) {
        setIsCodeLoaded(true);
        return;
      }

      setName(code.name);
      setLanguage(code.language.toLowerCase());
      setContent(code.content || "");
      setIsCodeLoaded(true);
    }

    loadCode();
  }, [getCode, codeId]);

  return (
    <>
      <div
        className={`h-dvh ${poppins.className} grid grid-rows-[56px_1fr_300px]`}
      >
        <EditorHeader
          codeId={codeId}
          name={name}
          language={language}
          onChange={(e) => setName(e.target.value)}
          users={collaborators}
          onBlur={() => {
            const codeId = params.id;

            if (!codeId || !name.trim()) {
              return;
            }

            editCode(codeId, name.trim());
          }}
          onRun={async () => {
            if (!codeId) {
              return;
            }

            const code = editorRef.current?.getCode();
            if (code === undefined) return;

            setRunOutput([]);

            const result = await runCode(codeId, code, input);
            const output: string[] = [];

            if (result.stdout) output.push(result.stdout);
            if (result.stderr) output.push(result.stderr);

            setRunOutput(output);
          }}
        />

        <div className="grid overflow-hidden grid-cols-[1fr_360px]">
          <div className="p-2 overflow-hidden">
            <MonacoEditor
              ref={editorRef}
              socket={socketInst}
              roomId={codeId}
              initialValue={content}
              language={language}
            />
          </div>

          <ChatSidebar socket={socketInst} codeId={codeId} />
        </div>

        <OutputPanel input={input} setInput={setInput} output={runOutput} />
      </div>
    </>
  );
}
