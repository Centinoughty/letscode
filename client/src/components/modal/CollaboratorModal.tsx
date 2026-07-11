import { CollabRole, collabRoleOptions } from "@/types/CollabRole";
import Dropdown from "../ui/Dropdown";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { KeyboardEvent as ReactKeyboardEvent, useState } from "react";
import { useCollaboratorStore } from "@/store/useCollaboratorStore";
import { X } from "lucide-react";
import Image from "next/image";
import Button from "../ui/Button";
import { Collaborator } from "@/types/Collaborator";

interface CollaboratorModalProps {
  codeId: string;
  isOpen: boolean;
  collaborators: Collaborator[];
  setIsOpen: (state: boolean) => void;
}

export default function CollaboratorModal({
  codeId,
  isOpen,
  setIsOpen,
  collaborators,
}: CollaboratorModalProps) {
  const [emailInput, setEmailInput] = useState<string>("");
  const [emails, setEmails] = useState<string[]>([]);
  const [collabRole, setCollabRole] = useState<CollabRole>("VIEW");

  const { addCollaborators } = useCollaboratorStore();

  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();

      const trimmedEmail = emailInput.trim();

      if (
        trimmedEmail &&
        isEmailValid(trimmedEmail) &&
        !emails.includes(trimmedEmail)
      ) {
        setEmails((prev) => [...prev, trimmedEmail]);
        setEmailInput("");
      }
    }
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleAddCollaborator = async () => {
    await addCollaborators({ codeId, collabEmails: emails, collabRole });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add collaborator"
      >
        <form onSubmit={handleAddCollaborator} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Add people by email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              autoFocus
            />

            <Dropdown
              value={collabRole}
              onChange={(e) => setCollabRole(e)}
              options={collabRoleOptions}
            />
          </div>

          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emails.map((email) => (
                <div
                  key={email}
                  className="px-2 py-1 flex items-center gap-2 rounded-sm bg-gray-300 text-sm"
                >
                  <span>{email}</span>

                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="text-gray-800 hover:text-gray-500"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="font-medium">People with access</p>

          {collaborators.length === 0 ? (
            <p className="text-center text-gray-500">Share with someone</p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {collaborators.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between gap-2 items-center"
                  >
                    <div className="flex gap-2">
                      <div className="relative h-8 w-8">
                        <Image
                          src={item.user.avatar || "https://i.pravatar.cc/100"}
                          alt={item.user.name}
                          fill
                          className="object-cover rounded-full"
                          sizes="30px"
                          priority
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium">{item.user.name}</p>
                        <p className="text-xs">{item.user.email}</p>
                      </div>
                    </div>

                    <div>
                      <Dropdown
                        value={item.role}
                        options={collabRoleOptions}
                        mode="opt-2"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          <Button
            type="submit"
            label="Add"
            disabled={emails.length === 0 || collabRole === null}
          />
        </form>
      </Modal>
    </>
  );
}
