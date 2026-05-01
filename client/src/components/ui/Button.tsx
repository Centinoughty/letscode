import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  className?: string;
}

export default function Button({ label, className }: ButtonProps) {
  return (
    <>
      <button
        className={`p-2 bg-primary text-neutral ${className}`}
      >
        {label}
      </button>
    </>
  );
}
