"use client";

import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ProfileButton() {
  const router = useRouter();

  const { user, logout } = useAuthStore();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSignout = async () => {
    await logout();
    setIsMenuOpen(false);
    router.push("/login");
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        <Image
          src={user?.avatar || "https://i.pravatar.cc/100"}
          alt={user?.name || "pravatar"}
          width={33}
          height={33}
          onClick={() => setIsMenuOpen((current) => !current)}
          className="rounded-full cursor-pointer hover:ring-8 hover:ring-gray-200 duration-150"
        />

        {isMenuOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <Link
              href={"/profile"}
              onClick={() => setIsMenuOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
            >
              Profile
            </Link>

            <button
              type="button"
              onClick={handleSignout}
              className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
            >
              Signout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
