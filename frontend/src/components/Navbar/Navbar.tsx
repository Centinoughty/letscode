"use client";

import { RootState } from "@/store/store";
import { poppins } from "@/styles/fonts";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";

const LetsCodeIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 18l6-6-6-6" />
    <path d="M8 6l-6 6 6 6" />
    <line x1="14.5" y1="4" x2="9.5" y2="20" />
  </svg>
);

const MenuIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6h16M4 12h16M4 18h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Navbar() {
  const [pathname, setPathname] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/explore", label: "Explore" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/80 backdrop-blur-lg border-b border-gray-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <a href="/" className="flex-shrink-0 flex items-center gap-2">
              <LetsCodeIcon className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white tracking-wider">
                letscode
              </span>
            </a>

            <div className="hidden md:flex md:items-center md:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-gray-300 hover:text-white transition-colors duration-200 text-lg ${
                    pathname === link.href ? "text-blue-400 font-semibold" : ""
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                {user ? (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.email.toUpperCase().split("")[0]}
                  </div>
                ) : (
                  <a
                    href="/auth/login"
                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Login
                  </a>
                )}
              </div>
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-300 hover:text-white focus:outline-none"
                >
                  {isMenuOpen ? (
                    <XIcon className="h-7 w-7" />
                  ) : (
                    <MenuIcon className="h-7 w-7" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-xl absolute top-20 left-0 w-full">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-gray-300 hover:text-white hover:bg-gray-800 block px-3 py-3 rounded-md text-base font-medium w-full text-center ${
                    pathname === link.href ? "text-blue-400 bg-gray-900" : ""
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 pb-2 w-full px-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {user.email.toUpperCase().split("")[0]}
                    </div>
                    <span className="text-white font-medium">{user.email}</span>
                  </div>
                ) : (
                  <a
                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-5 py-3 w-full block text-center bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300"
                  >
                    Login
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
