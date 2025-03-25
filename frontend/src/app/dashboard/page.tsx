"use client";

import useFetch from "@/hooks/useFetch";
import Link from "next/link";

export default function Home() {
  const { data, loading, error } = useFetch<{
    owned_codes: Code[];
    collaborated_codes: Code[];
  }>("api/code/all", true);

  return (
    <>
      <main>
        {data && (
          <div>
            {data.owned_codes.map((code: Code, idx: number) => (
              <Link key={idx} href={`/code/${code.id}`}>
                {code.id}
              </Link>
            ))}
            {data.collaborated_codes.map((code: Code, idx: number) => (
              <Link key={idx} href={`/code/${code.id}`}>
                {code.id}
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
