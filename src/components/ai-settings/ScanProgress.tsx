import { useEffect, useState } from "react";
import { SCAN_MESSAGES } from "./constants";

type ScanProgressProps = {
  active: boolean;
};

export function ScanProgress({ active }: ScanProgressProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < SCAN_MESSAGES.length - 1 ? prev + 1 : prev,
      );
    }, 900);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-indigo-500/30 dark:border-t-indigo-400" />
      <p className="font-sans text-sm font-medium text-slate-700 dark:text-slate-300">
        {SCAN_MESSAGES[messageIndex]}
      </p>
      <div className="mt-4 flex justify-center gap-1.5">
        {SCAN_MESSAGES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i <= messageIndex
                ? "bg-indigo-500"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
