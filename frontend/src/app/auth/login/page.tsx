"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { loginAction } from "@/store/actions/authActions";
import Input from "@/components/Input/Input";
import { MdErrorOutline } from "react-icons/md";
import Link from "next/link";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<Login>({
    email: "",
    password: "",
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    dispatch(loginAction(formData));

    setFormData({ email: "", password: "" });
  }

  return (
    <main className="flex min-h-[100dvh] w-full items-center justify-center bg-[#FFFFFF] p-4">
      <div className="w-full max-w-md rounded-lg border border-[#dadce0] px-8 py-10">
        <div className="text-center">
          <h1 className="text-2xl text-[#1F1F1F]">Sign in</h1>
          <p className="mt-2 text-base text-black">to continue to letscode</p>
        </div>

        {error && (
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-[#DB4437]">
            <MdErrorOutline className="text-base" />
            <span className="font-medium">Error:</span> {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            label="Email Address"
          />

          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            label="Password"
          />

          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/auth/signup"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#1A73E8] transition-colors hover:bg-blue-50"
            >
              Create account
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 min-w-[90px] items-center justify-center rounded-md bg-[#1A73E8] px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1B66C9] hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              {loading ? "..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
