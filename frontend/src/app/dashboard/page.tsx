"use client";

import CreateCode from "@/components/Code/CreateCode";
import useFetch from "@/hooks/useFetch";
import { deleteCode } from "@/lib/code";
import { poppins } from "@/styles/fonts";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { data, loading, error } = useFetch<{
    owned_codes: Code[];
    collaborated_codes: Code[];
  }>("api/code/all", true);

  const [ownedCodes, setOwnedCodes] = useState<Code[]>([]);
  const [collabCodes, setCollabCodes] = useState<Code[]>([]);

  useEffect(() => {
    if (data) {
      setOwnedCodes(data.owned_codes);
      setCollabCodes(data.collaborated_codes);
    }
  }, [data]);

  async function handleDelete(codeId: string) {
    try {
      await deleteCode(codeId);

      setOwnedCodes((prev) => prev.filter((code) => code.id !== codeId));
      setCollabCodes((prev) => prev.filter((code) => code.id !== codeId));
    } catch (error) {
      console.log(error);
    }
  }

  function handleCodeCreated(newCode: Code) {
    setOwnedCodes((prev) => [...prev, newCode]);
  }

  return (
    <>
      <main className="mx-4 sm:mx-6 px-4 sm:px-6 lg:px-8">
        <h2
          className={`${poppins.className} text-center font-medium tracking-wide text-xl sm:text-2xl md:text-3xl lg:text-4xl my-6`}
        >
          Start Coding Right Now!!
        </h2>

        <CreateCode onCodeCreate={handleCodeCreated} />

        <h3
          className={`${poppins.className} font-medium tracking-wide text-lg sm:text-xl md:text-2xl mt-8 mb-4`}
        >
          Recent Codes
        </h3>

        {data && (
          <div className="space-y-4">
            {ownedCodes.map((code: Code, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-800 p-4 rounded-md"
              >
                <Link
                  href={`/code/${code.id}`}
                  className="text-blue-400 hover:underline"
                >
                  {code.id}
                </Link>
                <span>{code.file_name}</span>
                <button
                  onClick={() => handleDelete(code.id)}
                  className="text-red-400 hover:text-red-600 transition"
                >
                  Delete
                </button>
              </div>
            ))}
            {collabCodes.map((code: Code, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-800 p-4 rounded-md"
              >
                <Link
                  href={`/code/${code.id}`}
                  className="text-blue-400 hover:underline"
                >
                  {code.id}
                </Link>
                <span>{code.file_name}</span>
                <button
                  onClick={() => handleDelete(code.id)}
                  className="text-red-400 hover:text-red-600 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
