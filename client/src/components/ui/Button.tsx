import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  className?: string;
  icon?: LucideIcon;
}

export default function Button({
  label,
  className,
  type = "button",
  icon: Icon,
  ...props
}: ButtonProps) {
  return (
    <>
      <button
        type={type}
        className={`p-2 flex items-center justify-center gap-2 bg-primary outline-none text-neutral disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {Icon && <Icon size={18} />}

        {label}
      </button>
    </>
  );
}
