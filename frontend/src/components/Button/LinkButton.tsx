import Link from "next/link";

interface LinkButton {
  url: string;
  text: string;
  className?: string;
}

export default function LinkButton({ url, text, className }: LinkButton) {
  return (
    <>
      <Link
        href={url}
        className={`px-4 py-2 text-white rounded-sm ${className}`}
      >
        {text}
      </Link>
    </>
  );
}
