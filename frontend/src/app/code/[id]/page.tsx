"use client";

import * as monaco from "monaco-editor";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useRef, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { getAuthToken } from "@/util/security";

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
  const socketRef = useRef<Socket | null>(null);
  const operationQueue = useRef<Operation[]>([]);

  const versionRef = useRef<number>(0);
  const isEditorInit = useRef<boolean>(false);
  const isApplyingChange = useRef<boolean>(false);

  const initializeMonaco = async () => {
    const monaco = await import("monaco-editor/esm/vs/editor/editor.api");

    monacoRef.current = monaco;

    const editor = monaco.editor.create(document.getElementById("editor")!, {
      value: "",
      fontSize: 14,
      minimap: { enabled: false },
    });

    editorRef.current = editor;

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

    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  };

  useEffect(() => {
    const setup = async () => {
      await initializeMonaco();
      connectSocket();
    };

    setup();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("init");
        socketRef.current.off("remote-change");
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

  return (
    <>
      <div id="editor" className="h-screen"></div>
    </>
  );
}
