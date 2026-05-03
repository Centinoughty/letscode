import { SyntheticEvent, useState } from "react";
import { useCodeStore } from "@/store/useCodeStore";
import Button from "../ui/Button";
import Dropdown from "../ui/Dropdown";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CodeModal({ isOpen, onClose }: ModalProps) {
  const [name, setName] = useState<string>("");
  const [language, setLanguage] = useState<string>("");

  const { createCode } = useCodeStore();

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    await createCode(name, language);

    setName("");
    setLanguage("");
    onClose();
  }

  const languageOptions = [
    { label: "C++", value: "CPP" },
    { label: "JavaScript", value: "JAVASCRIPT" },
    { label: "Python", value: "PYTHON" },
    { label: "TypeScript", value: "TYPESCRIPT" },
  ];

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
            required
            autoFocus
          />

          <Dropdown
            label="Language"
            value={language}
            onChange={(event) => setLanguage(event)}
            options={languageOptions}
          />

          <Button type="submit" label="Create" disabled={!name.trim()} />
        </form>
      </Modal>
    </>
  );
}
