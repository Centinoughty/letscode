"use client";

import useFetch from "@/hooks/useFetch";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [code, setCode] = useState<string>("");

  const { data, loading, error } = useFetch<CodeResponse>(
    `api/code/${id}`,
    true
  );

  useEffect(() => {
    if (data?.code) {
      setCode(data.code);
    }
  }, [data]);

  return (
    <>
      <main>
        <textarea
          name="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          id=""
        ></textarea>
      </main>
    </>
  );
}
