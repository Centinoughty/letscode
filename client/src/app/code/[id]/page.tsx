"use client";

import ChatSidebar from "@/components/code/ChatSidebar";
import EditorHeader from "@/components/code/EditorHeader";
import MonacoEditor from "@/components/code/MonacoEditor";
import OutputPanel from "@/components/code/OutputPanel";
import { getSocket } from "@/lib/socket";
import { useCodeStore } from "@/store/useCodeStore";
import { poppins } from "@/styles/font";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export default function CodeEditorPage() {
  const params = useParams<{ id: string }>();
  const codeId = params.id;

  const { getCode, editCode, runCode } = useCodeStore();

  const [name, setName] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isCodeLoaded, setIsCodeLoaded] = useState<boolean>(false);

  const [input, setInput] = useState<string>("");
  const [runOutput, setRunOutput] = useState<string[]>([]);

  const [socketInst, setSocketInst] = useState<Socket | null>(null);

  // socket instance init
  useEffect(() => {
    if (!codeId || !isCodeLoaded || !language) return;

    const socket = getSocket();

    const joinRoom = () => {
      if (codeId) {
        socket.emit("room:join", {
          roomId: codeId,
          language: language.toUpperCase(),
        });
      }
    };

    // If socket already connected, join immediately; otherwise wait for connect
    if (socket.connected) {
      joinRoom();
    } else {
      socket.on("connect", joinRoom);
    }

    setSocketInst(socket);

    return () => {
      socket.off("connect", joinRoom);

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
          name={name}
          language={language}
          onChange={(e) => setName(e.target.value)}
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

            const result = await runCode(codeId, input);
            const output: string[] = [];

            if (result.stdout) output.push(result.stdout);
            if (result.stderr) output.push(result.stderr);

            setRunOutput(output);
          }}
        />

        <div className="grid overflow-hidden grid-cols-[1fr_360px]">
          <div className="p-2 overflow-hidden">
            <MonacoEditor
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
