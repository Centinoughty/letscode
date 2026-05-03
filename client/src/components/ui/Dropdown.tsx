"use client";

import { poppins } from "@/styles/font";
import { ChevronUp } from "lucide-react";
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
  className?: string;
  onChange?: (value: string) => void;
}

export default function Dropdown({
  label,
  options,
  className = "",
  onChange,
  value,
  ...props
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
          className="px-3 py-2 flex items-center justify-between border border-black/20 duration-100 cursor-pointer hover:border-black/30 bg-white"
        >
          <span className="tracking-wide">
            {selectedOption?.label || "Select..."}
          </span>

          <span className={`duration-150 ${isOpen ? "-rotate-180" : ""}`}>
            <ChevronUp size={20} />
          </span>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 border border-black/20 bg-white z-50 shadow-lg max-h-60 overflow-y-auto">
            {options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2 cursor-pointer ${
                  option.value === selectedValue
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
