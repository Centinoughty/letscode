import { RootState } from "@/store/store";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function NavbarDark() {
  const user = useSelector((state: RootState) => state.auth.user);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/explore", label: "Explore" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 h-16 w-full z-50 border-b border-gray-700 bg-[#1e1e1e]">
        <div className="flex h-full w-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" aria-label="Homepage">
              <span className="text-xl font-medium text-gray-100 tracking-tight">
                letscode
              </span>
            </Link>
            <div className="hidden items-center gap-2 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#2a2d2e]"
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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3c3c3c] text-lg font-medium text-white transition-colors hover:bg-[#555]"
              >
                {user.email.charAt(0).toUpperCase()}
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="flex h-10 items-center justify-center rounded-full bg-[#0e639c] px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1177bb] hover:shadow-md"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
