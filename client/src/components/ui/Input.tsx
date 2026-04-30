import { inter, mont, poppins } from "@/styles/font";
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, ...props }: InputProps) {
  return (
    <>
      <div className={`flex flex-col ${poppins.className}`}>
        <label className="text-sm font-medium">{label}</label>

        <input
          className="px-3 py-2 outline-none border border-black/20 duration-100 focus:border-transparent focus:ring-2 focus:ring-primary"
          {...props}
        />
      </div>
    </>
  );
}
