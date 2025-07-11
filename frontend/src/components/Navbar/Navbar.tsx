"use client";

import { RootState } from "@/store/store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import NavbarDark from "./NavbarDark";

export default function Navbar() {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

  let x: any;
  if (pathname.startsWith("/code/")) return <NavbarDark />;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/explore", label: "Explore" },
  ];

  return (
    <nav className="fixed top-0 left-0 h-16 w-full border-b border-[#C4C7C5] bg-[#FFFFFF]">
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Homepage">
            <span className="text-xl font-medium text-[#444746] tracking-tight">
              letscode
            </span>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          {user ? (
            <button
              aria-label="User account"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D3E3FD] text-lg font-medium text-[#1E457A] transition-colors hover:bg-blue-200"
            >
              {user.email.charAt(0).toUpperCase()}
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="flex h-10 items-center justify-center rounded-full bg-[#1A73E8] px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1B66C9] hover:shadow-md"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
