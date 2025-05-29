"use client";

import { RootState } from "@/store/store";
import { poppins } from "@/styles/fonts";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function Navbar() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <>
      <nav className="px-4 py-2 flex justify-between">
        <div>
          <span>letscode</span>
        </div>
        <div
          className={`flex gap-4 ${poppins.className} text-lg text-gray-400 tracking-wide`}
        >
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/explore">Explore</Link>
        </div>
        <div className="text-gray-400">
          {user ? (
            <span>{user.email.toUpperCase().split("")[0]}</span>
          ) : (
            <Link href="/auth/login"></Link>
          )}
        </div>
      </nav>
    </>
  );
}
