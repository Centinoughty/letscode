import { SyntheticEvent, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useDashboardStore } from "@/store/useDashboardStore";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CodeModal({ isOpen, onClose }: ModalProps) {
  const [name, setName] = useState<string>("");

  const { createCode } = useDashboardStore();

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    await createCode(name);

    setName("");
    onClose();
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Create new Code">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            label="File Name"
            placeholder="e.g. index"
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
