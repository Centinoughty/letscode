"use client";

export default function OutputPanel() {
  return (
    <div className="border-t border-zinc-800 bg-zinc-900">
      <div className="flex items-center border-b border-zinc-800 px-4">
        <button className="border-b-2 border-emerald-500 px-4 py-3 text-sm">
          Input
        </button>

        <button className="px-4 py-3 text-sm text-zinc-400">Output</button>

        <button className="px-4 py-3 text-sm text-zinc-400">Terminal</button>
      </div>

      <div className="p-4">
        <textarea
          className="h-32 w-full resize-none rounded-md bg-zinc-950 p-3 text-sm outline-none"
          placeholder='{\n  "n": 10\n}'
        />
      </div>
    </div>
  );
}
