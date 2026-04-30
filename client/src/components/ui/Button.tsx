interface ButtonProps {
  label: string;
}

export default function Button({ label }: ButtonProps) {
  return (
    <>
      <button className="p-2 bg-primary text-neutral">{label}</button>
    </>
  );
}
