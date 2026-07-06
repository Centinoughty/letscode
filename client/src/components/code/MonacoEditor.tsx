import { Editor, OnChange } from "@monaco-editor/react";
import { useEffect, useState } from "react";
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
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange: OnChange = (nextValue) => {
    const updatedValue = nextValue ?? "";

    setValue(updatedValue);
    onChange?.(updatedValue);

    if (!socket || !roomId || readOnly) return;

    socket.emit("code:update", {
      roomId,
      code: updatedValue,
    });
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleRemoteUpdate = ({
      roomId: incomingRoomId,
      code,
    }: {
      roomId: string;
      code: string;
    }) => {
      if (incomingRoomId !== roomId) return;

      setValue(code);
      onChange?.(code);
    };

    socket.on("code:update", handleRemoteUpdate);

    return () => {
      socket.off("code:update", handleRemoteUpdate);
    };
  }, [onChange, roomId, socket]);

  return (
    <>
      <Editor
        height={height}
        language={language}
        defaultValue={value}
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
      />
    </>
  );
}
