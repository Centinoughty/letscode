"use client";

export default function OutputPanel() {
  return (
    <div className="border-t border-gray-200">
      <div className="flex items-center border-b border-gray-200 px-4">
        <button className="border-b-2 border-emerald-500 px-4 py-3 text-sm">
          Input
        </button>

        <button className="px-4 py-3 text-sm text-zinc-400">Output</button>

        <button className="px-4 py-3 text-sm text-zinc-400">Terminal</button>
      </div>

      <div className="p-4">
        <textarea
          className="h-32 w-full resize-none rounded-md p-3 border border-gray-200 text-sm outline-none"
          placeholder='{\n  "n": 10\n}'
        />
      </div>
    </div>
  );
}
