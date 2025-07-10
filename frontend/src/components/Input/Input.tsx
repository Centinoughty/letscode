import { ChangeEvent, memo } from "react";

const Input = memo(function InputField({
  id,
  name,
  type,
  value,
  onChange,
  label,
}: {
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  label: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        className="peer block w-full appearance-none rounded-md border border-[#747775] bg-transparent px-3 pb-2.5 pt-4 text-base text-[#1F1F1F] focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8] focus:outline-none"
        placeholder=" "
      />
      <label
        htmlFor={id}
        className="absolute start-3 top-3.5 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-[#444746] duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[#1A73E8]"
      >
        {label}
      </label>
    </div>
  );
});

export default Input;
