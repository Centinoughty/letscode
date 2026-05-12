import { Editor, OnChange } from "@monaco-editor/react";
import { useEffect, useState } from "react";

interface CodeEnvirmentProps {
  initialValue?: string;
  language?: string;
  height?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export default function MonacoEditor({
  initialValue = "",
  language = "javascript",
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
  };

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
