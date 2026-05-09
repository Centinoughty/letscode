"use client";

import CodeEnvirment from "@/components/code/CodeEnvirment";
import { poppins } from "@/styles/font";

export default function CodeEditorPage() {
  return (
    <>
      <main className={`h-dvh ${poppins.className}`}>
        <CodeEnvirment />
      </main>
    </>
  );
}
