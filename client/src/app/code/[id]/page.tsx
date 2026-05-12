"use client";

import ChatSidebar from "@/components/code/ChatSidebar";
import EditorHeader from "@/components/code/EditorHeader";
import MonacoEditor from "@/components/code/MonacoEditor";
import OutputPanel from "@/components/code/OutputPanel";
import { useCodeStore } from "@/store/useCodeStore";
import { poppins } from "@/styles/font";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CodeEditorPage() {
  const params = useParams<{ id: string }>();
  const { getCode, editCode } = useCodeStore();

  const [name, setName] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const codeId = params.id;

    if (!codeId) {
      return;
    }

    async function loadCode() {
      const code = await getCode(codeId);

      if (!code) {
        return;
      }

      setName(code.name);
      setLanguage(code.language.toLowerCase());
      setContent(code.content || "");
    }

    loadCode();
  }, [getCode, params.id]);

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
        />

        <div className="grid overflow-hidden grid-cols-[1fr_360px]">
          <div className="p-2 overflow-hidden">
            <MonacoEditor initialValue={content} language={language} />
          </div>

          <ChatSidebar />
        </div>

        <OutputPanel />
      </div>
    </>
  );
}
