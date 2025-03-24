"use client";

import { RootState } from "@/store/store";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function Navbar() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <>
      <nav className="flex justify-between">
        {user && <span>Welcome, {user.email}</span>}
        <div className="flex gap-2">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/auth/login">Login</Link>
          <Link href="/auth/signup">Signup</Link>
        </div>
      </nav>
    </>
  );
}
