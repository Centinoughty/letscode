import { SyntheticEvent, useState } from "react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkspaceModal({ isOpen, onClose }: ModalProps) {
  const [name, setName] = useState<string>("");

  const { createWorkspace } = useWorkspaceStore();

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    await createWorkspace(name);

    setName("");
    onClose();
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Create new Workspace">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            label="Workspace Name"
            placeholder="e.g. server"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Button type="submit" label="Create" disabled={!name.trim()} />
        </form>
      </Modal>
    </>
  );
}
