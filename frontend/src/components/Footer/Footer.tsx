import { roboto } from "@/styles/fonts";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className={`w-full bg-[#F8F9FA] border-t border-[#DADCE0] ${roboto.className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center text-sm text-[#444746]">
          <span className="font-medium">letscode © 2025</span>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-[#1A73E8]">
              About
            </Link>
            <Link href="/privacy" className="hover:text-[#1A73E8]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#1A73E8]">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
