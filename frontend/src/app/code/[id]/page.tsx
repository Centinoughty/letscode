"use client";

import io from "socket.io-client";
import useFetch from "@/hooks/useFetch";
import { useParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { getAuthToken } from "@/util/security";

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_SERVER;
const socket = io(SOCKET_SERVER, {
  auth: { token: getAuthToken() },
});

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [code, setCode] = useState<string>("");

  const { data, loading, error } = useFetch<CodeResponse>(
    `api/code/${id}`,
    true
  );

  useEffect(() => {
    socket.emit("join-room", { roomId: id });

    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off("code-update");
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = event.target.value;
    setCode(newCode);
    socket.emit("code-change", { roomId: id, code: newCode });
  };

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
          onChange={handleChange}
          id="code"
        ></textarea>
      </main>
    </>
  );
}
