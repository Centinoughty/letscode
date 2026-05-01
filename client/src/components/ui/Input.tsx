import { poppins } from "@/styles/font";
import { LucideIcon } from "lucide-react";
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  className?: string;
}

export default function Input({
  label,
  icon: Icon,
  className,
  ...props
}: InputProps) {
  return (
    <>
      <div className={`flex flex-col ${poppins.className}`}>
        <label className="text-sm font-medium">{label}</label>

        <div className="px-3 py-2 flex items-center gap-3 border border-black/20 duration-100 focus:border-transparent focus:ring-2 focus:ring-primary">
          {Icon && <Icon size={20} className="text-gray-600" />}

          <input
            className={`grow outline-none tracking-wide ${className}`}
            {...props}
          />
        </div>
      </div>
    </>
  );
}
