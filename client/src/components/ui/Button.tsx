import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  className?: string;
}

export default function Button({
  label,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`p-2 bg-primary outline-none text-neutral ${className}`}
      {...props}
    >
      {label}
    </button>
  );
}
