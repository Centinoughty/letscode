"use client";

import { createCode } from "@/lib/code";
import { poppins } from "@/styles/fonts";
import { ChangeEvent, FormEvent, useState } from "react";

interface CreateCodeProps {
  onCodeCreate: (newCode: Code) => void;
}

export default function CreateCode({ onCodeCreate }: CreateCodeProps) {
  const [file, setFile] = useState<CodeCreate>({
    fileName: "",
    language: "cpp",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
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

      setFile({ fileName: "", language: "cpp" });
    } catch (error) {
      setError("Failed to create code file");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleCreate}
        className={`my-8 ${poppins.className} flex justify-center`}
      >
        <div className="w-full max-w-2xl p-3 rounded-lg border-2 border-gray-500 flex flex-col sm:flex-row gap-3 sm:gap-2">
          <select
            name="language"
            value={file.language}
            onChange={handleChange}
            className="block outline-none rounded-md py-2 px-3 bg-white/10 w-full sm:w-auto"
          >
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="python">Python</option>
          </select>

          <input
            name="fileName"
            type="text"
            placeholder="Type the name of your file"
            value={file.fileName}
            onChange={handleChange}
            className="outline-none grow py-2 px-3 bg-white/5 rounded-md"
          />

          <button
            type="submit"
            disabled={loading}
            className={`rounded-md px-4 py-2 bg-white/10 hover:bg-white/20 duration-300 w-full sm:w-auto ${
              loading ? "cursor-wait" : "cursor-pointer"
            }`}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </>
  );
}
