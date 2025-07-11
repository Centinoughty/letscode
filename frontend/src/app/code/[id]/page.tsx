"use client";

import * as monaco from "monaco-editor";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useRef, useEffect, useState, ChangeEvent } from "react";
import { useParams, usePathname } from "next/navigation";
import { getAuthToken } from "@/util/security";
import { poppins, roboto } from "@/styles/fonts";
import Chat from "@/components/Chat/Chat";

const clientId = uuidv4();
const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_SERVER;

interface Operation {
  version: number;
  clientId: string;
  change: monaco.editor.IModelContentChange;
  text: string;
  offset: number;
  timestamp: number;
}

export default function Editor() {
  const { id } = useParams();
  const pathname = usePathname();

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const isMonacoInitialized = useRef<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const operationQueue = useRef<Operation[]>([]);

  const versionRef = useRef<number>(0);
  const isEditorInit = useRef<boolean>(false);
  const isApplyingChange = useRef<boolean>(false);

  // Non Editor State
  const [commsTab, setCommsTab] = useState<"chat" | "desc">("chat");
  const [streamTab, setStreamTab] = useState<"stdin" | "stdout" | "stderr">(
    "stdin"
  );

  // Chat
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");

  // -- -- -- Function to Handle a Message Change -- -- --
  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  // -- -- -- Function to Send a Message -- -- --
  const sendMessage = () => {
    const socket = socketRef.current;
    if (socket?.connected) {
      if (message.trim()) {
        socket.emit("send-message", { roomId: id, message });
      }
    }

    setMessage("");
  };

  const initializeMonaco = async () => {
    if (isMonacoInitialized.current || !document.getElementById("editor"))
      return;

    const monaco = await import("monaco-editor/esm/vs/editor/editor.api");
    await import("monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution");
    await import(
      "monaco-editor/esm/vs/basic-languages/python/python.contribution"
    );

    monacoRef.current = monaco;

    const editor = monaco.editor.create(document.getElementById("editor")!, {
      value: "",
      fontSize: 14,
      language: "cpp",
      theme: "vs-dark",
      cursorBlinking: "smooth",
      // cursorSmoothCaretAnimation: "on",
      scrollBeyondLastLine: true,
      minimap: { enabled: false },
      padding: {
        top: 5,
        bottom: 5,
      },
    });

    editorRef.current = editor;
    isMonacoInitialized.current = true;

    editor.onDidChangeModelContent((event) => {
      if (!isEditorInit.current || isApplyingChange.current) return;

      event.changes.forEach((change) => {
        const operation: Operation = {
          version: versionRef.current + 1,
          clientId,
          change,
          text: change.text,
          offset: change.rangeOffset,
          timestamp: Date.now(),
        };

        versionRef.current += 1;

        if (socketRef.current?.connected) {
          console.log(socketRef.current?.connected);
          socketRef.current.emit("code-change", { id, operation });
        } else {
          operationQueue.current.push(operation);
        }
      });
    });
  };

  const applyRemoteChange = (operation: Operation) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (clientId === operation.clientId) return;

    isApplyingChange.current = true;
    editor.executeEdits("remote", [
      {
        range: operation.change.range,
        text: operation.text,
        forceMoveMarkers: true,
      },
    ]);

    isApplyingChange.current = false;
  };

  const flushQueuedChanges = () => {
    const socket = socketRef.current;
    while (operationQueue.current.length && socket?.connected) {
      const operation = operationQueue.current.shift();
      if (operation) {
        socket.emit("code-change", { id, operation });
      }
    }
  };

  const connectSocket = () => {
    if (typeof window === "undefined") return;

    const container = document.getElementById("editor");
    if (!container) return;

    const socket = io(SOCKET_SERVER, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      auth: { token: getAuthToken() },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to the socket server");
      socket.emit("join-room", id);
      flushQueuedChanges();
    });

    socket.on("init", ({ initialCode, version: serverVersion }) => {
      const model = editorRef.current?.getModel();
      if (!model) return;
      isApplyingChange.current = true;
      model.setValue(initialCode);
      isApplyingChange.current = false;
      versionRef.current = serverVersion;
      isEditorInit.current = true;
    });

    socket.on("remote-change", ({ operation }) => {
      console.log(operation);
      applyRemoteChange(operation);
      versionRef.current = operation.version;
    });

    socket.on("message", (data) => {
      setAllMessages((prev) => [...prev, data]);
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  };

  useEffect(() => {
    const setup = async () => {
      if (typeof window !== undefined) {
        await initializeMonaco();
      }

      connectSocket();
    };

    setup();

    const handleResize = () => {
      editorRef.current?.layout();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("init");
        socketRef.current.off("remote-change");
        socketRef.current.off("message");
        socketRef.current.off("disconnect");
        if (socketRef.current.connected) {
          socketRef.current.emit("leave-room", id);
        }

        socketRef.current.disconnect();
      }

      editorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.emit("leave-room", id);
    };
  }, [pathname]);

  const activeTab = "bg-[#2a2d2e]";

  return (
    <>
      <div className="flex pt-16 h-screen">
        <div id="editor" className="w-[75%] h-full"></div>

        <div className="w-[25%] h-full flex flex-col border-l border-gray-700 bg-[#1e1e1e] text-white text-sm tracking-wide">
          <div className="flex-1 border-b border-gray-700 flex flex-col">
            <div className="p-2 flex gap-3 border-b border-gray-700">
              <button
                onClick={() => setCommsTab("chat")}
                className={`px-4 py-1.5 rounded-md text-center hover:bg-[#2a2d2e] cursor-pointer ${
                  commsTab === "chat" ? activeTab : ""
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setCommsTab("desc")}
                className={`px-4 py-1.5 rounded-md text-center hover:bg-[#2a2d2e] cursor-pointer ${
                  commsTab === "desc" ? activeTab : ""
                }`}
              >
                Description
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {commsTab === "chat" ? (
                <Chat
                  message={message}
                  allMessages={allMessages}
                  setMessage={handleMessageChange}
                  sendMessage={sendMessage}
                />
              ) : (
                <p>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Eligendi, optio! Dolorum maxime alias expedita autem veritatis
                  praesentium sapiente ad eum. Officiis animi earum explicabo
                  labore. Asperiores hic aut enim odit?
                </p>
              )}
            </div>
          </div>

          <div className="flex-1  flex flex-col">
            <div className="p-2 flex gap-3 border-b border-gray-700">
              <button
                onClick={() => setStreamTab("stdin")}
                className={`px-4 py-1.5 rounded-md text-center hover:bg-[#2a2d2e] cursor-pointer ${
                  streamTab === "stdin" ? activeTab : ""
                }`}
              >
                Test Cases
              </button>
              <button
                onClick={() => setStreamTab("stdout")}
                className={`px-4 py-1.5 rounded-md text-center hover:bg-[#2a2d2e] cursor-pointer ${
                  streamTab === "stdout" ? activeTab : ""
                }`}
              >
                Stdout
              </button>
              <button
                onClick={() => setStreamTab("stderr")}
                className={`px-4 py-1.5 rounded-md text-center hover:bg-[#2a2d2e] cursor-pointer ${
                  streamTab === "stderr" ? activeTab : ""
                }`}
              >
                Error
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <p className="text-sm text-gray-300">
                Test Cases or Stdout output goes here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
