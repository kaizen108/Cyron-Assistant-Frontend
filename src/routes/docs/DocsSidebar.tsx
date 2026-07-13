import clsx from 'clsx';
import type { DocSection } from './docsContent';

type Props = {
  sections: DocSection[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function DocsSidebar({ sections, activeId, onSelect }: Props) {
  return (
    <aside className="hidden lg:block w-56 shrink-0 self-start sticky top-[4.5rem] z-[9]">
      <div className="max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200/80 bg-white/95 px-2 py-4 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/95">
        <p className="mb-3 px-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">
          Sections
        </p>
        <nav className="space-y-0.5">
          {sections.map((section) => {
            const active = section.id === activeId;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                className={clsx(
                  'group flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition',
                  active
                    ? 'border-l-2 border-sky-500 bg-slate-100 text-sky-700 dark:bg-slate-800 dark:text-sky-400'
                    : 'border-l-2 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
                )}
              >
                <span className="truncate">{section.label}</span>
                <span
                  className={clsx(
                    'shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px]',
                    active
                      ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                      : 'bg-slate-200/80 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
                  )}
                >
                  {section.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function DocsMobileNav({
  sections,
  activeId,
  onSelect,
}: Props) {
  return (
    <div className="lg:hidden sticky top-[4.5rem] z-[9] mb-6 -mx-1 bg-bg-base/95 py-2 backdrop-blur-md dark:bg-[#0b1120]/95">
      <label className="block">
        <span className="sr-only">Jump to section</span>
        <select
          value={activeId}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
