"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import Google from "@/components/icons/Google";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import Input from "@/components/ui/Input";
import { poppins } from "@/styles/font";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { login, isLoading, error } = useAuthStore();

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    // login user
    await login(email, password);

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
            <h1 className="font-semibold text-xl">Login to Dashboard</h1>
            <p className="text-sm text-gray-400">
              Welcome back to the workplace
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-3 tracking-wider"
          >
            <Input
              type="email"
              label="Email Address"
              placeholder="temp@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button label="Sign in" />
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
            <p>Don't have an account?</p>
            <Link href={"/register"} className="text-primary">
              create account
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
