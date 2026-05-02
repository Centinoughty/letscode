"use client";

import { mont } from "@/styles/font";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
        role="presentation"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="w-full max-w-lg flex flex-col rounded-xl border border-gray-200 bg-neutral p-5 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-3">
            <h3
              className={`text-lg font-medium text-gray-900 ${mont.className}`}
            >
              {title}
            </h3>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="pt-4">{children}</div>
        </div>
      </div>
    </>
  );
}
