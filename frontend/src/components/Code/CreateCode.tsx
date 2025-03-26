"use client";

import { createCode } from "@/lib/code";
import { ChangeEvent, FormEvent, useState } from "react";

interface CreateCodeProps {
  onCodeCreate: (newCode: Code) => void;
}

export default function CreateCode({ onCodeCreate }: CreateCodeProps) {
  const [file, setFile] = useState<CodeCreate>({ fileName: "", language: "" });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFile((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!file.fileName.trim() || !file.language.trim()) {
        setError("Both file name and language are required");
        return;
      }

      const newCode = await createCode(file.fileName, file.language);
      if (newCode) {
        onCodeCreate(newCode);
      }

      setFile({ fileName: "", language: "" });
    } catch (error) {
      setError("Failed to create code file");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleCreate}>
        <input
          name="fileName"
          type="text"
          placeholder="File Name"
          value={file.fileName}
          onChange={handleChange}
        />
        <input
          name="language"
          type="text"
          placeholder="Language"
          value={file.language}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          create
        </button>
      </form>
    </>
  );
}
