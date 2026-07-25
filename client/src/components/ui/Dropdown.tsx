"use client";

import { poppins } from "@/styles/font";
import { Check, ChevronUp, X } from "lucide-react";
import { SelectHTMLAttributes, useState, useRef, useEffect } from "react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> {
  label?: string;
  options: DropdownOption[];
  mode?: "opt-1" | "opt-2";
  className?: string;
  onChange?: (value: string) => void;
}

export default function Dropdown({
  label,
  options,
  mode = "opt-1",
  className = "",
  onChange,
  value,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(
    (value as string) || "",
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        event.stopPropagation();
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    onChange?.(optionValue);
  };

  return (
    <>
      <div
        ref={dropdownRef}
        className={`relative flex flex-col ${poppins.className} ${className}`}
      >
        {label && (
          <label
            onClick={() => isOpen && setIsOpen(false)}
            className="text-sm font-medium"
          >
            {label}
          </label>
        )}

        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-2 flex items-center justify-between ${mode === "opt-1" ? "border border-black/20 hover:border-black/30 duration-100" : "hover:bg-black/10 rounded-md duration-200"} cursor-pointer`}
        >
          <span className="tracking-wide">
            {selectedOption?.label || "Select..."}
          </span>

          <span className={`duration-150 ${isOpen ? "-rotate-180" : ""}`}>
            <ChevronUp size={20} />
          </span>
        </div>

        {isOpen && (
          <div
            className="absolute top-full right-0 mt-1
              min-w-full w-max
              rounded-sm bg-white z-50
              border border-gray-300 shadow-2xl
              max-h-60 overflow-y-auto
            "
          >
            {options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(option.value)}
                className={`pl-3 pr-6 py-2 grid grid-cols-[20px_1fr] gap-4 text-nowrap text-sm cursor-pointer ${
                  option.value === selectedValue
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="w-5">
                  {option.value === selectedValue ? <Check /> : null}
                </div>

                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
