import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaPlus, FaTrash } from "react-icons/fa";
import { guildService } from "../../services/guildService";

export function KnowledgeTable({
  entries,
  label,
  guildId,
  contextId,
  section,
}: {
  entries: KnowledgeEntry[];
  label: string;
  guildId: string;
  contextId: string;
  section: string;
}) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const deleteMut = useMutation({
    mutationFn: (id: string) => guildService.deleteKnowledge(guildId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", guildId] }),
  });

  const createMut = useMutation({
    mutationFn: () =>
      guildService.createKnowledge(guildId, {
        title,
        content,
        main_content: content,
        template_type:
          section === "problems" ? "problem_solution" : "general_knowledge",
        persist_mode: "structured",
        ai_context_id: contextId,
        section,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", guildId] });
      setAdding(false);
      setTitle("");
      setContent("");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-sans text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 font-sans text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <FaPlus className="text-[10px]" />
          Add entry
        </button>
      </div>

      {adding && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-700 dark:bg-slate-800/40">
          <input
            autoFocus
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-sans text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-slate-600 dark:bg-slate-800"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-[13px] leading-relaxed focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-slate-600 dark:bg-slate-800"
            placeholder={
              section === "problems"
                ? "Problem description and solution…"
                : "Knowledge content…"
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => createMut.mutate()}
              disabled={
                !title.trim() || !content.trim() || createMut.isPending
              }
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-sans text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMut.isPending ? "Saving…" : "Save entry"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setTitle("");
                setContent("");
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 font-sans text-xs font-medium text-slate-600 hover:bg-white dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
          <p className="font-sans text-sm text-slate-400">No entries yet.</p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-2 font-sans text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Add your first entry
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 dark:border-slate-700 dark:bg-slate-800/80">
                  <th className="px-5 py-3.5 text-left font-display text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Title
                  </th>
                  <th className="px-5 py-3.5 text-left font-display text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Preview
                  </th>
                  <th className="w-24 px-5 py-3.5 text-right font-display text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {entries.map((k) => (
                  <tr
                    key={k.id}
                    className="bg-white transition-colors hover:bg-slate-50/80 dark:bg-slate-900 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4 align-top">
                      <p className="font-sans font-semibold text-slate-900 dark:text-slate-100">
                        {k.title}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 font-mono text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {k.main_content ?? k.content}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <button
                        type="button"
                        onClick={() => deleteMut.mutate(k.id)}
                        disabled={deleteMut.isPending}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-sans text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <FaTrash className="text-[10px]" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
