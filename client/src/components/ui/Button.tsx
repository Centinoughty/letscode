import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  className?: string;
  icon?: LucideIcon;
  iconClass?: string;
}

export default function Button({
  label,
  className,
  type = "button",
  icon: Icon,
  iconClass,
  ...props
}: ButtonProps) {
  return (
    <>
      <button
        type={type}
        className={`p-2 flex items-center justify-center gap-2 bg-primary outline-none text-neutral disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {Icon && <Icon className={iconClass} size={18} />}

        {label}
      </button>
    </>
  );
}
