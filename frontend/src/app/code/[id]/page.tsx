"use client";

import axios from "axios";
import io from "socket.io-client";
import { getAuthToken } from "@/util/security";
import dynamic from "next/dynamic";
import { useParams, usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_SERVER;
const socket = io(SOCKET_SERVER, {
  auth: { token: getAuthToken() },
  transports: ["websocket"],
});

export default function Editor() {
  const pathname = usePathname();
  const { id } = useParams<{ id: string }>();
  const editorRef = useRef<any>(null);

  // -- -- Socket State
  const [code, setCode] = useState<string>("");
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [permission, setPermission] = useState<"read" | "write" | null>(null);
  const [output, setOutput] = useState<string>("");

  // -- -- Chat Messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  // -- -- Add Collaborator
  const [email, setEmail] = useState<string>("");
  const [perms, setPerms] = useState<"read" | "write" | null>(null);

  // -- -- -- SOCKET -- -- --
  useEffect(() => {
    socket.emit("join-room", { roomId: id });

    socket.on("permission-update", ({ permission }) => {
      // console.log(permission)
      setPermission(permission);
    });

    socket.on("code-update", (newCode) => {
      console.log("hi");
      setCode(newCode);
    });

    socket.on("active-users", ({ count }) => {
      setActiveUsers(count);
    });

    socket.on("send-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("error", (message) => {
      console.log(message);
    });

    return () => {
      socket.emit("leave-room", { roomId: id });
    };
  }, [id]);

  useEffect(() => {
    return () => {
      socket.emit("leave-room", { roomId: id });
      socket.off("permission-update");
      socket.off("code-update");
      socket.off("active-users");
      socket.off("send-message");
      socket.off("error");
    };
  }, [id]);

  useEffect(() => {
    return () => {
      socket.emit("leave-room", { roomId: id });
    };
  }, [pathname]);

  // -- -- -- FUNCTION TO ADD USER TO CODE -- -- --
  const addUserToCode = async (event: FormEvent) => {
    event.preventDefault();

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/code/${id}/collaborators/add`,
      { user_email: email, access_level: perms },
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );

    console.log(response.data);
  };

  // -- -- -- FUNCTION TO RUN A CODE -- -- --
  const handleRunCode = () => {};

  // -- -- -- FUNCTION TO SAVE A CODE -- -- --
  const handleSaveCode = () => {
    if (permission !== "write") return;

    socket.emit("save-code", { roomId: id });
  };

  // -- -- -- FUNCTION TO SEND A MESSAGE -- -- --
  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("send-message", { roomId: id, message: newMessage });
      setNewMessage("");
    }
  };

  // -- -- -- FUNCTION TO HANDLE CODE MOUNT -- -- --
  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      console.log(permission);
      if (permission !== "write") return;

      const currentCode = editor.getValue();
      setCode(currentCode);
      console.log("ed");

      socket.emit("code-change", { roomId: id, code: currentCode });
    });
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

        <div>{activeUsers}</div>

        <MonacoEditor
          height="500px"
          language="cpp"
          value={code}
          onMount={handleEditorMount}
          options={{
            readOnly: permission !== "write",
            fontSize: 14,
          }}
        />

        <button onClick={handleRunCode}>Run</button>
        <button onClick={handleSaveCode}>Save</button>
        <p>{output}</p>

        <div>
          <ul>
            {messages.map((message, idx) => (
              <li key={idx}>
                {message.username} - {message.message}
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </main>
    </>
  );
}

// "use client";

// import io from "socket.io-client";
// import { useParams, usePathname } from "next/navigation";
// import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
// import dynamic from "next/dynamic";
// import { getAuthToken } from "@/util/security";
// import axios from "axios";
// import { runCode } from "@/lib/code";

// const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
//   ssr: false,
// });

// const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_SERVER;
// const socket = io(SOCKET_SERVER, {
//   auth: { token: getAuthToken() },
//   transports: ["websocket"],
// });

// export default function Editor() {
//   const pathname = usePathname();
//   const { id } = useParams<{ id: string }>();

//   const editorRef = useRef<any>(null);

//   const [code, setCode] = useState<string>("");
//   const [permission, setPermission] = useState<"read" | "write" | null>(null);
//   const [output, setOutput] = useState<string | null>(null);

//   const [cursorMap, setCursorMap] = useState<Record<string, number>>({});
//   const [activeUsers, setActiveUsers] = useState<number>(0);

//   // temporary
//   const [email, setEmail] = useState<string>("");
//   const [perms, setPerms] = useState<"read" | "write" | null>(null);

//   // Chat function
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState<string>("");

//   // -- -- FUNCTION CALL TO FETCH \CODE FROM BACKEND -- --
//   // const { data, loading, error } = useFetch<CodeResponse>(
//   //   `api/code/${id}`,
//   //   true
//   // );

//   useEffect(() => {
//     socket.emit("join-room", { roomId: id });

//     socket.on("permission-update", ({ permission }) => {
//       setPermission(permission);
//     });

//     socket.on("code-update", (newCode) => {
//       setCode(newCode);
//     });

//     socket.on("apply-op", (operation: Operation) => {
//       const currentCode = editorRef.current?.getValue();
//       if (!currentCode) return;

//       let updated = currentCode;
//       if (operation.type === "insert") {
//         updated =
//           currentCode.slice(0, operation.position) +
//           operation.content +
//           currentCode.slice(operation.position);
//       } else if (operation.type === "delete") {
//         updated =
//           currentCode.slice(0, operation.position) +
//           currentCode.slice(operation.position + (operation.length || 0));
//       }

//       setCode(updated);
//       editorRef.current?.setValue(updated);
//     });

//     socket.on("update-cursor", ({ userId, position }) => {
//       setCursorMap((prev) => ({ ...prev, [userId]: position }));
//     });

//     socket.on("active-users", ({ count }) => {
//       setActiveUsers(count);
//     });

//     socket.on("send-message", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     socket.on("error", (message) => {
//       console.log(message);
//     });

//     return () => {
//       socket.emit("leave-room", { roomId: id });
//       socket.off("code-update");
//       socket.off("apply-op");
//       socket.off("update-cursor");
//       socket.off("permission-update");
//       socket.off("send-message");
//       socket.off("error");
//     };
//   }, [id]);

//   useEffect(() => {
//     return () => {
//       socket.emit("leave-room", { roomId: id });
//     };
//   }, [pathname]);

//   const handleEditorMount = (editor: any) => {
//     console.log("Editor mounted"); // ✅ Add this
//     editorRef.current = editor;

//     editor.onDidChangeModelContent((event: any) => {
//       console.log("Model content changed", event); // ✅ Add this

//       if (permission !== "write") return;

//       for (const change of event.changes) {
//         const { rangeOffset, rangeLength, text } = change;

//         let operation: Operation;
//         if (rangeLength === 0) {
//           operation = {
//             type: "insert",
//             position: rangeOffset,
//             content: text,
//           };
//         } else {
//           operation = {
//             type: "delete",
//             position: rangeOffset,
//             length: rangeLength,
//           };
//         }

//         socket.emit("code-change", { roomId: id, operation });
//       }

//       const pos = editor.getPosition();
//       const offset = editor.getModel().getOffsetAt(pos);
//       socket.emit("send-cursor-position", { roomId: id, position: offset });
//     });
//   };

//   // const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
//   //   if (permission !== "write") {
//   //     return;
//   //   }

//   //   const newCode = event.target.value;
//   //   setCode(newCode);
//   //   socket.emit("code-change", { roomId: id, code: newCode });
//   // };

//   // -- effect change when data updates --
//   // useEffect(() => {
//   //   if (data?.code) {
//   //     setCode(data.code);
//   //   }
//   // }, [data]);

//   const addUserToCode = async (event: FormEvent) => {
//     event.preventDefault();

//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/code/${id}/collaborators/add`,
//       { user_email: email, access_level: perms },
//       { headers: { Authorization: `Bearer ${getAuthToken()}` } }
//     );

//     console.log(response.data);
//   };

//   const handleRun = async () => {
//     const response = await runCode(id, "");
//     setOutput(response.output);
//   };

//   const saveCode = () => {
//     if (permission !== "write") {
//       return;
//     }

//     socket.emit("save-code", { roomId: id });
//   };

//   const sendMessage = () => {
//     if (newMessage.trim()) {
//       socket.emit("send-message", { roomId: id, message: newMessage });
//       setNewMessage("");
//     }
//   };

//   return (
//     <>
//       <main>
//         <form onSubmit={addUserToCode}>
//           <input
//             type="email"
//             placeholder="email"
//             value={email}
//             onChange={(event) => setEmail(event.target.value)}
//           />
//           <input
//             type="text"
//             value={perms ?? ""}
//             placeholder="permission"
//             onChange={(event) =>
//               setPerms(event.target.value as "read" | "write")
//             }
//           />
//           <button type="submit">Add</button>
//         </form>

//         <div>
//           <p>{activeUsers}</p>
//         </div>

//         <MonacoEditor
//           height="500px"
//           defaultLanguage="cpp"
//           value={code}
//           onMount={handleEditorMount}
//           options={{
//             readOnly: permission !== "write",
//             fontSize: 14,
//           }}
//         />
//         <button onClick={handleRun}>Run</button>
//         <button onClick={saveCode}>Save</button>
//         <p>{output}</p>

//         <div>
//           <ul>
//             {messages.map((message, idx) => (
//               <li key={idx}>
//                 {message.username} - {message.message}
//               </li>
//             ))}
//           </ul>
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(event) => setNewMessage(event.target.value)}
//           />
//           <button onClick={sendMessage}>Send</button>
//         </div>
//       </main>
//     </>
//   );
// }
