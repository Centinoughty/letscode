import { Operation } from "@/lib/ot/operation";
import { transformPendingQueue } from "@/lib/ot/transformPendingQueue";
import { Editor, OnChange } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface CodeEnvirmentProps {
  socket: Socket | null;
  roomId?: string;

  initialValue?: string;
  language?: string;
  height?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export default function MonacoEditor({
  socket,
  roomId,
  initialValue = "",
  language,
  height = "100%",
  readOnly = false,
  onChange,
}: CodeEnvirmentProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const pendingOpRef = useRef<Operation[]>([]);
  const revisionRef = useRef(0);
  const applyingRemoteRef = useRef(false);

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange: OnChange = (nextValue) => {
    const updatedValue = nextValue ?? "";

    setValue(updatedValue);

    onChange?.(updatedValue);
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleOperation = (remoteOperation: Operation) => {
      if (remoteOperation.userId === socket.id) {
        return;
      }

      const transformedRemote = transformPendingQueue(
        remoteOperation,
        pendingOpRef.current,
      );

      applyRemoteOperation(transformedRemote);
    };

    const handleAck = ({ id, revision }: { id: string; revision: number }) => {
      const index = pendingOpRef.current.findIndex((op) => op.id === id);

      if (index !== -1) {
        pendingOpRef.current.splice(index, 1);
      }

      revisionRef.current = revision;
    };

    socket.on("operation", handleOperation);
    socket.on("operation:ack", handleAck);

    return () => {
      socket.off("operation", handleOperation);
      socket.off("operation:ack", handleAck);
    };
  }, [socket, roomId]);

  function applyRemoteOperation(operation: Operation) {
    const editor = editorRef.current;

    if (!editor) return;

    applyingRemoteRef.current = true;

    try {
      const model = editor.getModel();

      if (!model) return;

      if (operation.type === "insert") {
        const start = model.getPositionAt(operation.position);

        editor.executeEdits("remote", [
          {
            range: new monaco.Range(
              start.lineNumber,
              start.column,
              start.lineNumber,
              start.column,
            ),
            text: operation.text,
          },
        ]);
      }

      if (operation.type === "delete") {
        const start = model.getPositionAt(operation.position);

        const end = model.getPositionAt(operation.position + operation.length);

        editor.executeEdits("remote", [
          {
            range: new monaco.Range(
              start.lineNumber,
              start.column,
              end.lineNumber,
              end.column,
            ),
            text: "",
          },
        ]);
      }

      revisionRef.current = operation.revision;

      const currentValue = editor.getValue();

      setValue(currentValue);

      onChange?.(currentValue);
    } finally {
      applyingRemoteRef.current = false;
    }
  }

  return (
    <>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 22,
          stickyScroll: {
            enabled: false,
          },
          smoothScrolling: true,
          scrollBeyondLastLine: true,
          automaticLayout: true,
          readOnly,
          padding: { top: 16, bottom: 16 },
          renderWhitespace: "selection",
          wordWrap: "off",
        }}
        onMount={(editor: monaco.editor.IStandaloneCodeEditor) => {
          editorRef.current = editor;
          editor.onDidChangeModelContent((event) => {
            if (applyingRemoteRef.current || !socket || !roomId) {
              return;
            }

            for (const change of event.changes) {
              const operationId = crypto.randomUUID();

              // Insert

              if (change.rangeLength === 0 && change.text.length > 0) {
                const operation: Operation = {
                  id: operationId,
                  roomId,
                  userId: socket.id!,
                  revision: revisionRef.current,
                  timestamp: Date.now(),
                  type: "insert",
                  position: change.rangeOffset,
                  text: change.text,
                };

                pendingOpRef.current.push(operation);

                socket.emit("operation", operation);

                continue;
              }

              // Delete

              if (change.rangeLength > 0 && change.text === "") {
                const operation: Operation = {
                  id: operationId,
                  roomId,
                  userId: socket.id!,
                  revision: revisionRef.current,
                  timestamp: Date.now(),
                  type: "delete",
                  position: change.rangeOffset,
                  length: change.rangeLength,
                };

                pendingOpRef.current.push(operation);

                socket.emit("operation", operation);

                continue;
              }

              // Replace

              if (change.rangeLength > 0 && change.text.length > 0) {
                const deleteOp: Operation = {
                  id: crypto.randomUUID(),
                  roomId,
                  userId: socket.id!,
                  revision: revisionRef.current,
                  timestamp: Date.now(),
                  type: "delete",
                  position: change.rangeOffset,
                  length: change.rangeLength,
                };

                const insertOp: Operation = {
                  id: crypto.randomUUID(),
                  roomId,
                  userId: socket.id!,
                  revision: revisionRef.current,
                  timestamp: Date.now(),
                  type: "insert",
                  position: change.rangeOffset,
                  text: change.text,
                };

                pendingOpRef.current.push(deleteOp, insertOp);

                socket.emit("operation", deleteOp);

                socket.emit("operation", insertOp);
              }
            }
          });
        }}
      />
    </>
  );
}
