"use client";

import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Link from "next/link";

import {
  Code2,
  Folder,
  MoreVertical,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react";

import {
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Collaborator } from "@/types/Collaborator";
import CollaboratorModal from "../modal/CollaboratorModal";

interface NodeCardProps {
  id: string;
  type: "FILE" | "WORKSPACE";
  name: string;
  language?: string;
  lastEdited: string;
  collaborators: Collaborator[];
  isOwned: boolean;

  onEdit?: (name: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export default function NodeCard({
  id,
  type,
  name,
  language,
  lastEdited,
  collaborators,
  isOwned,
  onEdit,
  onDelete,
}: NodeCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const [isAddCollabOpen, setIsAddCollabOpen] = useState<boolean>(false);

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(name);
  const [nextName, setNextName] = useState<string>(name);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // handler to close pop-up
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // categorise the object by type
  const entityLabel = type === "FILE" ? "File" : "Workspace";

  // add collaborator handler
  const handleAddCollabOpen = () => {
    setIsMenuOpen(false);
    setIsAddCollabOpen(true);
  };

  // edit handler
  const handleEditOpen = () => {
    setIsMenuOpen(false);
    setDisplayName(name);
    setNextName(name);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    const trimmedName = nextName.trim();
    if (!trimmedName) return;

    setDisplayName(trimmedName);
    await onEdit?.(trimmedName);
    setIsEditOpen(false);
    setIsMenuOpen(false);
  };

  // delete handler
  const handleDeleteConfirm = async () => {
    await onDelete?.();
    setIsDeleted(true);
    setIsDeleteOpen(false);
    setIsMenuOpen(false);
  };

  if (isDeleted) return null;

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-gray-100">
            {type === "FILE" ? (
              <Code2 size={18} className="text-primary" />
            ) : (
              <Folder size={18} className="text-primary" />
            )}
          </div>

          <div className="relative flex items-center gap-2" ref={menuRef}>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${isOwned ? "bg-primary/20 text-primary" : "bg-gray-200 text-gray-600"}`}
            >
              {isOwned ? "OWNED BY YOU" : "SHARED"}
            </span>

            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="relative rounded-full p-1 hover:bg-gray-100 outline-none"
              aria-label={`${entityLabel} actions`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {isOwned && (
                  <button
                    type="button"
                    onClick={handleAddCollabOpen}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <User size={16} />
                    Add People
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleEditOpen}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <Pencil size={16} />
                  Edit Name
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDeleteOpen(true);
                  }}
                  className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Link href={`/code/${id}`} className="text-sm font-medium truncate">
            {displayName}
          </Link>

          {language && (
            <div className="mr-1 flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              {language.toUpperCase()}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-gray-500">
          <div>
            <p className="uppercase text-xs">Last edited</p>

            <p className="text-sm text-gray-600">{lastEdited || "-"}</p>
          </div>

          <div className="text-right">
            <p className="uppercase text-xs">
              {type === "FILE" ? "Team size" : "Members"}
            </p>

            <p className="text-sm text-gray-600">{collaborators.length + 1}</p>
          </div>
        </div>
      </div>

      {/* add collaborator form */}
      <CollaboratorModal
        codeId={id}
        isOpen={isAddCollabOpen}
        setIsOpen={setIsAddCollabOpen}
        collaborators={collaborators}
      />

      {/* edit name form */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${entityLabel}`}
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            label={`${entityLabel} name`}
            value={nextName}
            onChange={(event) => setNextName(event.target.value)}
            autoFocus
          />

          <div className="flex items-center gap-3">
            <Button
              type="button"
              label="Cancel"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 flex-1 border border-gray-200 text-sm font-medium bg-neutral! text-black!"
            />

            <Button
              type="submit"
              label="Save Changes"
              disabled={!nextName.trim() || nextName.trim() === displayName}
              className="px-4 py-2 flex-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </form>
      </Modal>

      {/* delete confirmation modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={`Delete ${entityLabel}`}
      >
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              This will permanently delete{" "}
              <span className="font-medium text-gray-900">{displayName}</span>.
            </p>

            <p className="text-sm text-gray-600">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              label="Cancel"
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 flex-1 border border-gray-200 text-sm font-medium bg-neutral! text-black!"
            />

            <Button
              type="button"
              label="Delete"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 flex-1 text-sm font-medium bg-red-600 text-white transition hover:bg-red-700"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
