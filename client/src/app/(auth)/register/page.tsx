"use client";

import Google from "@/components/icons/Google";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/store/useAuthStore";
import { poppins } from "@/styles/font";
import { useGoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");

  const { register, isLoading, error } = useAuthStore();

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    // create account
    await register(name, email, password);

    // if authenticated, continue to dashboard
    const currentStoreState = useAuthStore.getState();
    if (currentStoreState.isAuthenticated) {
      router.push("/");
    }
  }

  const loginWithGoogleRedirect = useGoogleLogin({
    flow: "auth-code",
    ux_mode: "redirect",
    redirect_uri: "http://localhost:3000/auth/callback",
  });

  return (
    <>
      <main className="min-h-screen flex justify-center items-center">
        <div
          className={`p-6 w-lg flex flex-col items-center gap-6 ${poppins.className} border border-black/20`}
        >
          <h2 className="tracking-wide text-lg text-primary font-bold">
            letscode
          </h2>

          <div className="text-center">
            <h1 className="font-semibold text-xl">Create Account</h1>
            <p className="text-sm text-gray-400">
              Join letscode to Start COllaborating
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <Input
              type="text"
              label="Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              type="email"
              label="Email Address"
              placeholder="temp@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              type="Password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />

            <Button label="Create account" />
          </form>

          <Divider />

          <button
            type="button"
            onClick={() => loginWithGoogleRedirect()}
            className="p-2 w-full flex justify-center items-center gap-2 font-medium border border-black/20"
          >
            <Google className="w-8 aspect-square" />
            Sign in with Google
          </button>

          <div className="flex gap-2 text-sm">
            <p>Already have an account?</p>
            <Link href={"/login"} className="text-primary">
              login
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
