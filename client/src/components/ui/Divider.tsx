import clsx from "clsx";

export default function Divider({ text = "or" }: { text?: string }) {
  return (
    <>
      <div className={clsx("w-full", "flex items-center")}>
        <div className={clsx("h-px grow", "bg-gray-200")}></div>
        <span
          className={clsx(
            "px-3",
            "",
            "block",
            "text-sm font-semibold text-gray-400 uppercase",
          )}
        >
          {text}
        </span>
        <div className={clsx("", "h-px grow", "bg-gray-200")}></div>
      </div>
    </>
  );
}
