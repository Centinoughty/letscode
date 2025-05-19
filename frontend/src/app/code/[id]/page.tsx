"use client";

import io from "socket.io-client";
import { useParams, usePathname } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { getAuthToken } from "@/util/security";

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
      socket.off("permission-update");
      socket.off("code-update");
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

  return (
    <>
      <main>
        <textarea
          name="code"
          value={code}
          onChange={handleChange}
          id="code"
          disabled={permission !== "write"}
          className="h-96"
        ></textarea>
      </main>
    </>
  );
}
