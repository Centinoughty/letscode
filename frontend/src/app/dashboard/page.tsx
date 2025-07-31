"use client";

import CreateCode from "@/components/Code/CreateCode";
import useFetch from "@/hooks/useFetch";
import { deleteCode } from "@/lib/code";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { data, loading, error } = useFetch<{
    owned_codes: Code[];
    collaborated_codes: Code[];
  }>("api/code/all", true);

  const [ownedCodes, setOwnedCodes] = useState<any[]>([]);
  const [collabCodes, setCollabCodes] = useState<any[]>([]);

  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (data) {
      setOwnedCodes(data.owned_codes);
      setCollabCodes(data.collaborated_codes);
    }
  }, [data]);

  function handleDeleteRequest(code: any) {
    setItemToDelete(code);
    setConfirmOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!itemToDelete) return;
    try {
      await deleteCode(itemToDelete.id);
      setOwnedCodes((prev) => prev.filter((c) => c.id !== itemToDelete.id));
      setCollabCodes((prev) => prev.filter((c) => c.id !== itemToDelete.id));
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmOpen(false);
      setItemToDelete(null);
    }
  }

  function handleCodeCreated(newCode: any) {
    setOwnedCodes((prev) => [newCode, ...prev]);
  }

  const CodeTable = ({ title, codes }: { title: string; codes: any[] }) => (
    <div className="mt-8">
      <h2 className="text-base font-medium text-[#444746]">{title}</h2>
      <div className="mt-2 rounded-lg border border-[#DADCE0]">
        <table className="min-w-full divide-y divide-[#DADCE0]">
          <thead className="bg-white">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#444746]"
              >
                Name
              </th>
              <th
                scope="col"
                className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#444746] md:table-cell"
              >
                Owner
              </th>
              <th
                scope="col"
                className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#444746] lg:table-cell"
              >
                Last modified
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {codes.length > 0 ? (
              codes.map((code) => (
                <tr
                  key={code.id}
                  className="transition-colors hover:bg-[#F8F9FA]"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/code/${code.id}`}
                      className="flex items-center gap-3 text-[#1F1F1F] hover:text-[#1A73E8]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                        className="text-gray-500"
                      >
                        <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h360l240 240v480q0 33-23.5 56.5T760-80H240Zm360-560v-160H240v640h520v-480H600Z" />
                      </svg>
                      {code.file_name || "Untitled"}
                    </Link>
                  </td>
                  <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-[#444746] md:table-cell">
                    me
                  </td>
                  <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-[#444746] lg:table-cell">
                    Jul 12, 2025
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteRequest(code)}
                      className="rounded-full p-2 text-[#444746] hover:bg-gray-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20px"
                        viewBox="0 -960 960 960"
                        width="20px"
                        fill="currentColor"
                      >
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360Z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No files to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <main className="pt-16 w-full bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-16 items-center">
            <CreateCode onCodeCreate={handleCodeCreated} />
          </div>

          {loading && (
            <div className="mt-12 text-center text-sm text-gray-500">
              Loading files...
            </div>
          )}
          {error && (
            <div className="mt-12 text-center text-sm text-red-600">
              Failed to load files. Please try again.
            </div>
          )}

          {!loading && data && (
            <>
              <CodeTable title="Owned by me" codes={ownedCodes} />
              <CodeTable title="Shared with me" codes={collabCodes} />
            </>
          )}
        </div>
      </main>

      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-[3px]"
          aria-modal="true"
        >
          <div className="w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-medium text-[#1F1F1F]">
              Delete file permanently?
            </h3>
            <div className="mt-2">
              <p className="text-sm text-[#444746]">
                You are about to permanently delete{" "}
                <span className="font-medium">{itemToDelete?.file_name}</span>.
                This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-[#1A73E8] transition-colors hover:bg-blue-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-full bg-[#DB4437] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
