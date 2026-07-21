import { FaSave } from "react-icons/fa";
import type { GeneralRulesTab } from "./constants";
import { GENERAL_RULES_TABS } from "./constants";

export function GlobalBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 font-display font-semibold uppercase tracking-wide text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[10px]"
      }`}
    >
      Global — all panels
    </span>
  );
}

export function TabBar({
  active,
  onChange,
}: {
  active: GeneralRulesTab;
  onChange: (tab: GeneralRulesTab) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 dark:border-slate-700 dark:bg-slate-800/60">
      {GENERAL_RULES_TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`rounded-xl px-4 py-2 font-sans text-sm font-medium transition-all ${
            active === t.id
              ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function EditorArea({
  value,
  onChange,
  placeholder,
  minHeight = "min-h-[320px]",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  minHeight?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 shadow-inner dark:border-slate-700 dark:bg-slate-900/40">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white/80 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800/80">
        <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-slate-400">
          Markdown
        </span>
      </div>
      <textarea
        className={`w-full resize-y border-0 bg-transparent px-5 py-4 font-mono text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500 ${minHeight}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
}

export function PrimaryButton({
  onClick,
  disabled,
  loading,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <FaSave className="text-xs" />
      )}
      {children}
    </button>
  );
}

export function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
        enabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
