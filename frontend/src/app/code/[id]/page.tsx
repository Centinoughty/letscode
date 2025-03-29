"use client";

import io from "socket.io-client";
import useFetch from "@/hooks/useFetch";
import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { getAuthToken } from "@/util/security";
import axios from "axios";

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_SERVER;
const socket = io(SOCKET_SERVER, {
  auth: { token: getAuthToken() },
});

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [code, setCode] = useState<string>("");
  const [permission, setPermission] = useState<"read" | "write" | null>(null);

  const [email, setEmail] = useState<string>("");
  const [perms, setPerms] = useState<"read" | "write" | null>(null);

  const { data, loading, error } = useFetch<CodeResponse>(
    `api/code/${id}`,
    true
  );

  useEffect(() => {
    socket.emit("join-room", { roomId: id });

    socket.on("permission-update", ({ permission }) => {
      setPermission(permission);
    });

    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    socket.on("error", (message) => {
      console.log(message);
    });

    return () => {
      socket.off("code-update");
      socket.off("permission-update");
      socket.off("error");
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (permission !== "write") {
      return;
    }

    const newCode = event.target.value;
    setCode(newCode);
    socket.emit("code-change", { roomId: id, code: newCode });
  };

  useEffect(() => {
    if (data?.code) {
      setCode(data.code);
    }
  }, [data]);

  async function addUserToCode(event: FormEvent) {
    event.preventDefault()

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/code/${id}/collaborators/add`,
      { user_email: email, access_level: perms },
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );

    console.log(response.data);
  }

  return (
    <>
      <main>
        <form onSubmit={addUserToCode}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="text"
            value={perms ?? ""}
            onChange={(event) => setPerms(event.target.value as "read" | "write")}
          />
          <button type="submit">Add</button>
        </form>

        <textarea
          name="code"
          value={code}
          onChange={handleChange}
          id="code"
          disabled={permission !== "write"}
        ></textarea>
      </main>
    </>
  );
}
