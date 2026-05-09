"use client";

import MonacoEditor from "./MonacoEditor";
import EditorHeader from "./EditorHeader";
import OutputPanel from "./OutputPanel";
import ChatSidebar from "./ChatSidebar";

export default function CodeEnvirment() {
  return (
    <>
      <div className="grid h-full grid-rows-[56px_1fr_220px]">
        <EditorHeader name="main" language="Python" />

        <div className="grid overflow-hidden grid-cols-[1fr_360px]">
          <div className="p-2 overflow-hidden">
            <MonacoEditor />
          </div>

          <ChatSidebar />
        </div>

        <OutputPanel />
      </div>
    </>
  );
}
