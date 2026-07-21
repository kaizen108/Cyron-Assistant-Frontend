import { FaRobot, FaSearch } from "react-icons/fa";

type Phase0WelcomeProps = {
  onAnalyze: () => void;
  onSkip: () => void;
};

export function Phase0Welcome({ onAnalyze, onSkip }: Phase0WelcomeProps) {
  return (
    <div className="mx-auto max-w-xl py-8 text-center sm:py-12">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
        <FaRobot className="text-2xl" />
      </div>

      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        Configure AI for your server
      </h2>

      <p className="mt-4 font-sans text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Let&apos;s configure the AI for your server. First I&apos;ll take a
        look at how it&apos;s built — channels, roles and panels — so I only ask
        you the necessary questions.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onAnalyze}
          className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-sans text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:w-auto"
        >
          <FaSearch className="text-xs" />
          Analyze my server
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="font-sans text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          Skip, I&apos;ll fill everything in myself
        </button>
      </div>
    </div>
  );
}
