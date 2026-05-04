"use client";

import { ElementType, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useCodeStore } from "@/store/useCodeStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { mont } from "@/styles/font";
import { getAccountAge } from "@/util/formatDate";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileCode2,
  FolderGit2,
  Globe,
  Info,
  Languages,
  Mail,
  MapPin,
  Pencil,
  Save,
  Shield,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";

type ProfileForm = {
  name: string;
  location: string;
  organization: string;
  language: string;
};

function Field({
  label,
  icon: Icon,
  value,
  editing,
  name,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  editing: boolean;
  name: keyof ProfileForm;
  onChange: (name: keyof ProfileForm, val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <Icon size={13} />
        {label}
      </label>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      ) : (
        <p className="text-sm text-gray-900 py-2">
          {value || <span className="text-gray-400 italic">Not set</span>}
        </p>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: ElementType;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition hover:border-gray-200 hover:bg-gray-50">
      <div className="inline-flex w-fit rounded-lg border border-gray-200 bg-white p-2 text-primary shadow-sm">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-gray-900">
          {value}
        </p>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, editProfile } = useAuthStore();
  const { codes } = useCodeStore();
  const { workspaces } = useWorkspaceStore();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<ProfileForm>({
    name: user?.name || "",
    location: "",
    organization: "",
    language: "English (US)",
  });

  const [draft, setDraft] = useState<ProfileForm>(form);

  useEffect(() => {
    if (user?.name) setForm((f) => ({ ...f, name: user.name! }));
  }, [user?.name]);

  const displayName = form.name || "Alex Developer";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleEdit() {
    setDraft(form);
    setEditing(true);
    setSaved(false);
  }

  function handleCancel() {
    setDraft(form);
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    await editProfile(draft.name);
    setForm(draft);
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function onChange(name: keyof ProfileForm, val: string) {
    setDraft((d) => ({ ...d, [name]: val }));
  }

  const fields: {
    label: string;
    icon: React.ElementType;
    name: keyof ProfileForm;
  }[] = [
    { label: "Email Address", icon: Mail, name: "name" },
    { label: "Location", icon: MapPin, name: "location" },
    { label: "Organization", icon: Building2, name: "organization" },
    { label: "Preferred Language", icon: Languages, name: "language" },
  ];

  const emailValue = user?.email || "";

  return (
    <main className={`p-2 ${mont.className} flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and account settings.
          </p>
        </div>

        {saved && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 animate-fade-in">
            <CheckCircle2 size={13} />
            Changes saved
          </span>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Profile card */}
          <article className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row sm:items-start gap-5">
              {/* Avatar */}
              <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="80px"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xl font-semibold text-primary">
                    {initials || "A"}
                  </div>
                )}
              </div>

              {/* Name / badges / actions */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {displayName}
                  </h2>

                  {user?.is_verified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <BadgeCheck size={11} /> Verified
                    </span>
                  )}

                  {user?.is_admin && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      <Shield size={11} /> Admin
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-sm text-gray-500">
                  Full-Stack Engineer
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {!editing ? (
                    <Button
                      label="Edit profile"
                      icon={Pencil}
                      onClick={handleEdit}
                      className="px-4 py-2 flex items-center gap-2 bg-primary text-sm font-medium text-white rounded-lg transition hover:opacity-90"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        label={saving ? "Saving…" : "Save changes"}
                        icon={Save}
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 flex items-center gap-2 bg-primary text-sm font-medium text-white rounded-lg transition hover:opacity-90 disabled:opacity-60"
                      />

                      <Button
                        label="Cancel"
                        icon={X}
                        onClick={handleCancel}
                        className="px-4 py-2 flex items-center gap-2 bg-white text-sm rounded-lg font-medium text-gray-700! transition hover:bg-gray-50"
                      />
                    </div>
                  )}

                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    <Globe size={13} />
                    {emailValue}
                  </span>
                </div>
              </div>
            </div>

            {/* Fields grid */}
            <div
              className={`border-t border-gray-100 grid sm:grid-cols-2 gap-px bg-gray-100`}
            >
              {fields.map((f) => (
                <div
                  key={f.name}
                  className={`bg-white px-6 py-5 transition-colors ${editing ? "bg-gray-50/40" : ""}`}
                >
                  <Field
                    label={f.label}
                    icon={f.icon}
                    value={
                      f.name === "name"
                        ? emailValue
                        : editing
                          ? draft[f.name]
                          : form[f.name]
                    }
                    editing={f.name !== "name" && editing}
                    name={f.name}
                    onChange={onChange}
                  />
                </div>
              ))}
            </div>
          </article>

          {/* Account details */}
          <article className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-black">Account Details</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {[
                {
                  label: "Member since",
                  value: user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—",
                  meta: user?.createdAt
                    ? getAccountAge(user.createdAt)
                    : undefined,
                },
                {
                  label: "Subscription plan",
                  value: "Developer Plan",
                  action: "Manage",
                },
                {
                  label: "Linked accounts",
                  value: user?.is_google ? "Google" : "None",
                  connected: user?.is_google,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {row.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{row.value}</p>
                  </div>

                  <div className="shrink-0">
                    {row.meta && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {row.meta}
                      </span>
                    )}

                    {row.action && (
                      <Link
                        href="/profile"
                        className="text-xs font-medium text-primary transition hover:opacity-70"
                      >
                        {row.action}
                      </Link>
                    )}

                    {row.connected && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <CheckCircle2 size={13} /> Connected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Stats */}
          <article className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-black">Overview</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">
              <StatCard icon={FileCode2} value={codes.length} label="Files" />

              <StatCard
                icon={FolderGit2}
                value={workspaces.length}
                label="Workspaces"
              />
            </div>
          </article>

          {/* Security */}
          <article className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-black">Security</h3>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {user?.is_google && (
                <div className="flex gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-3.5 text-xs leading-relaxed text-blue-700">
                  <Info size={14} className="mt-0.5 shrink-0" />

                  <p>
                    Your account uses Google SSO. Password changes must be done
                    through Google.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Two-factor authentication
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Enabled via SMS
                  </p>
                </div>

                <Link
                  href="/profile"
                  className="text-xs font-medium text-primary transition hover:opacity-70"
                >
                  Manage
                </Link>
              </div>

              <button className="w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.99]">
                View security logs
              </button>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
