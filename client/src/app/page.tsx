"use client";

import Link from "next/link";
import {
  ArrowRight,
  Code2,
  GraduationCap,
  MessageSquareText,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { mont } from "@/styles/font";

const audiences = [
  {
    icon: GraduationCap,
    title: "Students",
    description:
      "Build confidence with guided practice, shared workspaces, and feedback that keeps momentum high.",
  },
  {
    icon: Users,
    title: "Mentors",
    description:
      "Review code, guide decisions, and stay close to the learner's progress without friction.",
  },
  {
    icon: MessageSquareText,
    title: "Interviewers",
    description:
      "Run focused coding sessions, observe thinking clearly, and keep the evaluation experience structured.",
  },
];

const highlights = [
  "Real-time collaboration",
  "Shared coding rooms",
  "Interview-ready sessions",
];

export default function Home() {
  const { isAuthenticated, isAuthChecked, isLoading } = useAuthStore();

  const ctaHref = isAuthenticated ? "/dashboard" : "/login";
  const ctaLabel =
    !isAuthChecked || isLoading
      ? "Checking session..."
      : isAuthenticated
        ? "Go to dashboard"
        : "Login to continue";
  const ctaDisabled = !isAuthChecked || isLoading;

  return (
    <>
      <main
        className={`min-h-screen overflow-hidden bg-neutral text-secondary ${mont.className}`}
      >
        <div className="relative isolate min-h-screen">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,104,95,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(195,109,75,0.16),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f9fafb_48%,#eef4f3_100%)]" />
          <div className="absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />

          <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-16 lg:px-10">
            <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur">
                  <Code2 size={16} />
                  LetsCode collaborative coding platform
                </div>

                <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Code together.
                  <span className="block text-primary">
                    Learn faster. Interview smarter.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  LetsCode brings students, mentors, and interviewers into one
                  focused workspace for live coding, feedback, and evaluation.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href={ctaHref}
                    aria-disabled={ctaDisabled}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                      ctaDisabled
                        ? "pointer-events-none bg-primary/60 text-white"
                        : "bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary/90"
                    }`}
                  >
                    {ctaLabel}
                    {!ctaDisabled && <ArrowRight size={24} />}
                  </Link>

                  <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                    {highlights.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-6 rounded-4xl bg-primary/10 blur-3xl" />
                <div className="relative rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                        Session ready
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                        Everything in one place
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <ShieldCheck size={24} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {audiences.map((audience) => {
                      const Icon = audience.icon;

                      return (
                        <article
                          key={audience.title}
                          className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4"
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                            <Icon size={20} />
                          </div>
                          <h3 className="mt-4 text-lg font-semibold text-slate-950">
                            {audience.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {audience.description}
                          </p>
                        </article>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-3xl bg-black px-5 py-4 text-white">
                    <p className="text-sm font-medium uppercase text-gray-200">
                      Focus
                    </p>
                    <p className="mt-2 text-lg font-medium">
                      Build, review, and assess code without leaving the
                      workspace.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
