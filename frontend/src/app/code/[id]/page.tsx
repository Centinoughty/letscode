"use client";

import io from "socket.io-client";
import { useParams, usePathname } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { getAuthToken } from "@/util/security";
import axios from "axios";
import { runCode } from "@/lib/code";

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_SERVER;
const socket = io(SOCKET_SERVER, {
  auth: { token: getAuthToken() },
  transports: ["websocket"],
});

export default function Editor() {
  const pathname = usePathname();
  const { id } = useParams<{ id: string }>();

  const [code, setCode] = useState<string>("");
  const [permission, setPermission] = useState<"read" | "write" | null>(null);
  const [output, setOutput] = useState<string | null>(null);

  // temporary
  const [email, setEmail] = useState<string>("");
  const [perms, setPerms] = useState<"read" | "write" | null>(null);

  // -- -- FUNCTION CALL TO FETCH CODE FROM BACKEND -- --
  // const { data, loading, error } = useFetch<CodeResponse>(
  //   `api/code/${id}`,
  //   true
  // );

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
      socket.emit("leave-room", { roomId: id });
      socket.off("code-update");
      socket.off("permission-update");
      socket.off("error");
    };
  }, [id]);

  useEffect(() => {
    return () => {
      socket.emit("leave-room", { roomId: id });
    };
  }, [pathname]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (permission !== "write") {
      return;
    }

    const newCode = event.target.value;
    setCode(newCode);
    socket.emit("code-change", { roomId: id, code: newCode });
  };

  // -- effect change when data updates --
  // useEffect(() => {
  //   if (data?.code) {
  //     setCode(data.code);
  //   }
  // }, [data]);

  const addUserToCode = async (event: FormEvent) => {
    event.preventDefault();

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/code/${id}/collaborators/add`,
      { user_email: email, access_level: perms },
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );

    console.log(response.data);
  };

  const handleRun = async () => {
    const response = await runCode(id, "");
    setOutput(response.output);
  };

  const saveCode = () => {
    if (permission !== "write") {
      return;
    }

    socket.emit("save-code", { roomId: id });
  };

  return (
    <>
      <main>
        <form onSubmit={addUserToCode}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="text"
            value={perms ?? ""}
            placeholder="permission"
            onChange={(event) =>
              setPerms(event.target.value as "read" | "write")
            }
          />
          <button type="submit">Add</button>
        </form>

        <textarea
          name="code"
          value={code}
          onChange={handleChange}
          id="code"
          disabled={permission !== "write"}
          className="h-96"
        ></textarea>
        <button onClick={handleRun}>Run</button>
        <button onClick={saveCode}>Save</button>
        <p>{output}</p>
      </main>
    </>
  );
}
