"use client";

import { createCode } from "@/lib/code";
import { ChangeEvent, FormEvent, useState } from "react";
import Input from "../Input/Input";

interface CreateCodeProps {
  onCodeCreate: (newCode: any) => void;
}

export default function CreateCode({ onCodeCreate }: CreateCodeProps) {
  // State to control the modal visibility
  const [isOpen, setIsOpen] = useState(false);

  const [file, setFile] = useState({ fileName: "", language: "cpp" });
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

    if (!file.fileName.trim()) {
      setError("File name is required.");
      setLoading(false);
      return;
    }

    try {
      const newCode = await createCode(file.fileName, file.language);
      if (newCode) {
        onCodeCreate(newCode);
        setIsOpen(false);
        setFile({ fileName: "", language: "cpp" });
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setIsOpen(false);
    setError(null);
    setFile({ fileName: "", language: "cpp" });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-medium text-gray-800 shadow-md transition-all hover:bg-gray-100 hover:shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1A73E8"
        >
          <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
        </svg>
        New
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-[3px]"
          aria-modal="true"
        >
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-xl font-medium text-[#1F1F1F]">
              Create New File
            </h3>

            <div className="mt-6 space-y-6">
              <div className="relative">
                <Input
                  label="File Name"
                  id="fileName"
                  name="fileName"
                  type="text"
                  value={file.fileName}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <select
                  id="language"
                  name="language"
                  value={file.language}
                  onChange={handleChange}
                  className="peer w-full appearance-none rounded-md border border-[#747775] bg-transparent px-3 pb-2.5 pt-4 text-base text-[#1F1F1F] focus:border-2 focus:border-[#1A73E8] focus:outline-none focus:ring-0"
                >
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
                <label
                  htmlFor="language"
                  className="absolute start-3 top-3 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-[#444746] duration-300"
                >
                  Language
                </label>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-[#1A73E8] transition-colors hover:bg-blue-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex min-w-[100px] items-center justify-center rounded-full bg-[#1A73E8] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1B66C9] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
