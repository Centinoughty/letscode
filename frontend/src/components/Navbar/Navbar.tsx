import Link from "next/link";
import LinkButton from "../Button/LinkButton";

export default function Navbar() {
  return (
    <>
      <nav className="fixed top-0 left-0 w-full px-[15%] py-3 flex justify-between items-center text-white border-b border-gray-500/40 backdrop-blur-3xl">
        <div>
          <Link href="/" className="font-semibold text-xl">
            Let'sCode
          </Link>
        </div>
        <div className="flex gap-4">
          <Link href="">Features</Link>
          <Link href="">Testimonials</Link>
          <Link href="">Pricing</Link>
        </div>
        <div className="flex justify-center items-center gap-2">
          <LinkButton
            url="/login"
            text="Login"
            className="border border-gray-500/50"
          />
          <LinkButton
            url="/signup"
            text="Signup"
            className="bg-white text-black!"
          />
        </div>
      </nav>
    </>
  );
}
