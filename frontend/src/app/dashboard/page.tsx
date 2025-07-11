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
      <main>
        <CreateCode onCodeCreate={handleCodeCreated} />
        {data && (
          <div>
            {ownedCodes.map((code: Code, idx: number) => (
              <div key={idx}>
                <Link href={`/code/${code.id}`}>{code.id}</Link>
                <span>{code.file_name}</span>
                <button onClick={() => handleDelete(code.id)}>Delete</button>
              </div>
            ))}
            {collabCodes.map((code: Code, idx: number) => (
              <div key={idx}>
                <Link href={`/code/${code.id}`}>{code.id}</Link>
                <span>{code.file_name}</span>
                <button onClick={() => handleDelete(code.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
