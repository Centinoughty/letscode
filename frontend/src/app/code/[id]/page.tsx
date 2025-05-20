"use client";

import * as monaco from "monaco-editor";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { getAuthToken } from "@/util/security";

const clientId = uuidv4();

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_SERVER;
const socket = io(SOCKET_SERVER, {
  auth: { token: getAuthToken() },
  transports: ["websocket"],
});

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

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const operationQueue = useRef<Operation[]>([]);

  const versionRef = useRef<number>(0);
  const isApplyingChange = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = document.getElementById("editor");
    if (!container) return;

    socket.emit("join-room", id);

    socket.on("initial-doc", ({ initialCode, version: serverVersion }) => {
      if (!editorRef.current) {
        initializeMonaco(initialCode);
      }

      versionRef.current = serverVersion;
    });

    socket.on("remote-change", ({ operation }) => {
      console.log(operation);
      applyRemoteChange(operation);
      versionRef.current = operation.version;
    });

    return () => {
      editorRef.current?.dispose();
      socket.disconnect();
    };
  }, [id]);

  const initializeMonaco = async (content: string) => {
    const monaco = await import("monaco-editor/esm/vs/editor/editor.api");

    monacoRef.current = monaco;

    const editor = monaco.editor.create(document.getElementById("editor")!, {
      value: content,
    });

    editorRef.current = editor;

    editor.onDidChangeModelContent((event) => {
      if (isApplyingChange.current) return;

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
        operationQueue.current.push(operation);
        socket.emit("code-change", { id, operation });
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

  return (
    <>
      <div id="editor" className="h-[90vh]"></div>
    </>
  );
}
