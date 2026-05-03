"use client";

import { Code2, Folder, MoreVertical } from "lucide-react";
import clsx from "clsx";

interface NodeCardProps {
  type: "FILE" | "WORKSPACE";
  name: string;
  language?: string;
  lastEdited?: string;
  collaborators?: number;
  isOwned?: boolean;
}

export default function NodeCard({
  type,
  name,
  language,
  lastEdited,
  collaborators = 1,
  isOwned = true,
}: NodeCardProps) {
  return (
    <>
      <div className="flex flex-col gap-3 border border-gray-200 rounded-xl bg-white p-3 cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-gray-100">
            {type === "FILE" ? (
              <Code2 size={18} className="text-primary" />
            ) : (
              <Folder size={18} className="text-primary" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "text-xs px-2 py-1 rounded-full font-medium",
                isOwned
                  ? "bg-primary/20 text-primary"
                  : "bg-gray-200 text-gray-600",
              )}
            >
              {isOwned ? "OWNED BY YOU" : "SHARED"}
            </span>

            <button className="p-1 rounded-full hover:bg-gray-100">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {language && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            {language.toUpperCase()}
          </div>
        )}

        <p className="text-sm font-medium truncate">{name}</p>

        <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-gray-500">
          <div>
            <p className="uppercase text-xs">Last edited</p>
            <p className="text-sm text-gray-600">{lastEdited || "-"}</p>
          </div>

          <div className="text-right">
            <p className="uppercase text-xs">
              {type === "FILE" ? "Team size" : "Members"}
            </p>
            <p className="text-sm text-gray-600">{collaborators}</p>
          </div>
        </div>
      </div>
    </>
  );
}
