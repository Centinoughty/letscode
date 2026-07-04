"use client";

interface OutputPanelProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  output?: unknown[];
}

export default function OutputPanel({
  input,
  setInput,
  output = [],
}: OutputPanelProps) {
  return (
    <div className="border-t border-gray-200 h-full">
      <div className="grid h-full grid-cols-2 divide-x divide-gray-200">
        {/* Input */}
        <div className="flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <h2 className="font-medium">Input</h2>
          </div>

          <div className="flex-1 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-full w-full resize-none rounded-md border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter stdin..."
            />
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <h2 className="font-medium">Output</h2>
          </div>

          <div className="flex-1 overflow-auto p-3">
            {output.length > 0 ? (
              <div className="h-full space-y-3">
                {output.map((item, idx) => (
                  <pre
                    key={idx}
                    className="h-full whitespace-pre-wrap rounded-md border border-gray-200 bg-zinc-50 p-3 text-sm text-zinc-700"
                  >
                    {typeof item === "string"
                      ? item
                      : JSON.stringify(item, null, 2)}
                  </pre>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-md border border-gray-200 bg-zinc-50 text-sm text-zinc-500">
                Output will appear here after code execution.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
