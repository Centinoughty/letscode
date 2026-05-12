"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";

interface OutputPanelProps {
  output?: unknown[];
}

const MAX_INPUTS = 7;

export default function OutputPanel({ output = [] }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<"input" | "output">("input");
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [inputs, setInputs] = useState<string[]>([""]);

  const addInput = () => {
    setInputs((currentInputs) => {
      if (currentInputs.length >= MAX_INPUTS) {
        return currentInputs;
      }

      return [...currentInputs, ""];
    });

    setActiveInputIndex((currentIndex) =>
      Math.min(currentIndex + 1, MAX_INPUTS - 1),
    );
  };

  const updateInput = (index: number, value: string) => {
    setInputs((currentInputs) =>
      currentInputs.map((currentValue, currentIndex) =>
        currentIndex === index ? value : currentValue,
      ),
    );
  };

  const removeInput = (index: number) => {
    setInputs((currentInputs) => {
      if (currentInputs.length === 1) {
        setActiveInputIndex(0);
        return [""];
      }

      const nextInputs = currentInputs.filter(
        (_, currentIndex) => currentIndex !== index,
      );

      setActiveInputIndex((currentActiveIndex) => {
        if (currentActiveIndex === index) {
          return Math.max(0, index - 1);
        }

        if (currentActiveIndex > index) {
          return currentActiveIndex - 1;
        }

        return currentActiveIndex;
      });

      return nextInputs;
    });
  };

  const activeInputValue = inputs[activeInputIndex] ?? "";

  return (
    <>
      <div className="border-t border-gray-200">
        <div className="px-4 flex items-center border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("input")}
            className={`px-4 py-3 text-sm ${
              activeTab === "input"
                ? "border-b-2 border-primary text-zinc-900"
                : "text-zinc-400"
            }`}
          >
            Input
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("output")}
            className={`px-4 py-3 text-sm ${
              activeTab === "output"
                ? "border-b-2 border-primary text-zinc-900"
                : "text-zinc-400"
            }`}
          >
            Output
          </button>
        </div>

        <div className="p-2">
          {activeTab === "input" ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {inputs.map((_, idx) => {
                    const isActive = idx === activeInputIndex;

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveInputIndex(idx)}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                          isActive
                            ? "border-primary/40 bg-green-50 text-zinc-900"
                            : "border-gray-200 text-zinc-500 hover:bg-gray-50"
                        }`}
                      >
                        <button
                          type="button"
                          className="flex items-center gap-1 whitespace-nowrap outline-none"
                        >
                          Input {idx + 1}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeInput(idx)}
                          className="text-xs font-medium cursor-pointer text-zinc-400 hover:text-zinc-700 transition"
                          aria-label={`Delete input ${idx + 1}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}

                  <Button
                    label="Add Input"
                    icon={Plus}
                    onClick={addInput}
                    disabled={inputs.length >= MAX_INPUTS}
                    className="rounded-md cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Input {activeInputIndex + 1}
                  </label>

                  <textarea
                    value={activeInputValue}
                    placeholder=""
                    onChange={(event) =>
                      updateInput(activeInputIndex, event.target.value)
                    }
                    className="h-32 w-full resize-none rounded-md border border-gray-200 p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                {output.length > 0 ? (
                  output.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-md border border-gray-200 bg-zinc-50 p-3 text-sm text-zinc-700"
                    >
                      {typeof item === "string" ? item : JSON.stringify(item)}
                    </div>
                  ))
                ) : (
                  <div className="min-h-32 rounded-md border border-gray-200 bg-zinc-50 p-3 text-sm text-zinc-700">
                    Output will appear here after code execution
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
