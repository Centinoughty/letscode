import { Operation } from "@/lib/ot/operation";
import { transformPendingQueue } from "@/lib/ot/transformPendingQueue";
import { generateId } from "@/util/id";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
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

export interface MonacoEditorHandle {
  getCode: () => string;
}

const MonacoEditor = forwardRef<MonacoEditorHandle, CodeEnvirmentProps>(
  (
    {
      socket,
      roomId,
      initialValue = "",
      language,
      height = "100%",
      readOnly = false,
    },
    ref,
  ) => {
    const socketRef = useRef<Socket | null>(null);
    const roomIdRef = useRef<string | undefined>(roomId);

    const pendingInitialCodeRef = useRef<{
      code: string;
      revision: number;
    } | null>(null);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const pendingOpRef = useRef<Operation[]>([]);
    const revisionRef = useRef(0);
    const applyingRemoteRef = useRef(false);

    useImperativeHandle(ref, () => ({
      getCode() {
        return editorRef.current?.getValue() ?? "";
      },
    }));

    useEffect(() => {
      socketRef.current = socket;
    }, [socket]);

    useEffect(() => {
      roomIdRef.current = roomId;
    }, [roomId]);

    useEffect(() => {
      if (!socket || !roomId) return;

      const handleInitialCode = ({
        roomId: incomingRoomId,
        code,
        revision,
      }: {
        roomId: string;
        code: string;
        revision: number;
      }) => {
        if (incomingRoomId !== roomId) return;

        const editor = editorRef.current;

        if (!editor) {
          pendingInitialCodeRef.current = {
            code,
            revision,
          };

          return;
        }

        const model = editor.getModel();

        if (!model) return;

        applyingRemoteRef.current = true;
        model.setValue(code);
        applyingRemoteRef.current = false;
        revisionRef.current = revision;
      };

      socket.on("code:update", handleInitialCode);

      const handleOperation = (remoteOperation: Operation) => {
        const transformedRemote = transformPendingQueue(
          remoteOperation,
          pendingOpRef.current,
        );

        applyRemoteOperation(transformedRemote);
      };

      const handleAck = ({
        id,
        revision,
      }: {
        id: string;
        revision: number;
      }) => {
        const index = pendingOpRef.current.findIndex((op) => op.id === id);

        if (index !== -1) {
          pendingOpRef.current.splice(index, 1);
        }

        revisionRef.current = revision;
      };

      socket.on("operation", handleOperation);
      socket.on("operation:ack", handleAck);

      return () => {
        socket.off("code:update", handleInitialCode);
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

          const end = model.getPositionAt(
            operation.position + operation.length,
          );

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
      } finally {
        applyingRemoteRef.current = false;
      }
    }

    return (
      <>
        <Editor
          height={height}
          language={language}
          defaultValue={initialValue}
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
            padding: { top: 10, bottom: 16 },
            renderWhitespace: "selection",
            wordWrap: "off",
          }}
          onMount={(editor: monaco.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;

            const pending = pendingInitialCodeRef.current;

            if (pending) {
              applyingRemoteRef.current = true;

              editor.getModel()?.setValue(pending.code);

              applyingRemoteRef.current = false;
              revisionRef.current = pending.revision;
              pendingInitialCodeRef.current = null;
            }

            editor.onDidChangeModelContent((event) => {
              const currentSocket = socketRef.current;
              const currentRoomId = roomIdRef.current;

              if (
                applyingRemoteRef.current ||
                !currentSocket ||
                !currentRoomId
              ) {
                return;
              }

              for (const change of event.changes) {
                const operationId = generateId();

                // Insert operation
                if (change.rangeLength === 0 && change.text.length > 0) {
                  const operation: Operation = {
                    id: operationId,
                    roomId: currentRoomId,
                    userId: currentSocket.id!,
                    revision: revisionRef.current,
                    timestamp: Date.now(),
                    type: "insert",
                    position: change.rangeOffset,
                    text: change.text,
                  };

                  pendingOpRef.current.push(operation);
                  currentSocket.emit("operation", operation);

                  continue;
                }

                // Delete operation
                if (change.rangeLength > 0 && change.text === "") {
                  const operation: Operation = {
                    id: operationId,
                    roomId: currentRoomId,
                    userId: currentSocket.id!,
                    revision: revisionRef.current,
                    timestamp: Date.now(),
                    type: "delete",
                    position: change.rangeOffset,
                    length: change.rangeLength,
                  };

                  pendingOpRef.current.push(operation);
                  currentSocket.emit("operation", operation);

                  continue;
                }

                // Replace operation
                if (change.rangeLength > 0 && change.text.length > 0) {
                  const deleteOp: Operation = {
                    id: generateId(),
                    roomId: currentRoomId,
                    userId: currentSocket.id!,
                    revision: revisionRef.current,
                    timestamp: Date.now(),
                    type: "delete",
                    position: change.rangeOffset,
                    length: change.rangeLength,
                  };

                  const insertOp: Operation = {
                    id: generateId(),
                    roomId: currentRoomId,
                    userId: currentSocket.id!,
                    revision: revisionRef.current,
                    timestamp: Date.now(),
                    type: "insert",
                    position: change.rangeOffset,
                    text: change.text,
                  };

                  pendingOpRef.current.push(deleteOp, insertOp);

                  currentSocket.emit("operation", deleteOp);
                  currentSocket.emit("operation", insertOp);
                }
              }
            });
          }}
        />
      </>
    );
  },
);
MonacoEditor.displayName = "MonacoEditor";

export default MonacoEditor;
