import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { guildService } from "../../services/guildService";
import {
  PageLoader,
  SkeletonList,
  SkeletonLine,
} from "../../components/ui/Skeleton";

type Tab = "instructions" | "general_info" | "problems" | "knowledge";

const TABS: { id: Tab; label: string }[] = [
  { id: "instructions", label: "Instructions" },
  { id: "general_info", label: "General Info" },
  { id: "problems", label: "Problems" },
  { id: "knowledge", label: "Knowledge" },
];

export function Contexts() {
  const { guildId } = useParams<{ guildId: string }>();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("instructions");
  const [instructions, setInstructions] = useState("");
  const [generalInfo, setGeneralInfo] = useState("");
  const [newCtxName, setNewCtxName] = useState("");
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: contexts = [], isLoading } = useQuery({
    queryKey: ["contexts", guildId],
    queryFn: () => guildService.fetchContexts(guildId!),
    enabled: !!guildId,
  });

  const { data: knowledge = [], isLoading: knowledgeLoading } = useQuery({
    queryKey: ["knowledge", guildId],
    queryFn: () => guildService.fetchKnowledge(guildId!),
    enabled: !!guildId,
  });

  const selected =
    contexts.find((c) => c.id === selectedId) ?? contexts[0] ?? null;

  useEffect(() => {
    if (selected && selectedId !== selected.id) setSelectedId(selected.id);
  }, [contexts]);

  useEffect(() => {
    if (selected) {
      setInstructions(selected.instructions ?? "");
      setGeneralInfo(selected.general_info ?? "");
    }
  }, [selected?.id]);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["contexts", guildId] });

  const updateMut = useMutation({
    mutationFn: (payload: {
      name: string;
      instructions?: string;
      general_info?: string;
    }) => guildService.updateContext(guildId!, selected!.id, payload),
    onSuccess: () => {
      invalidate();
      showToast("Saved.");
    },
  });

  const createMut = useMutation({
    mutationFn: (name: string) =>
      guildService.createContext(guildId!, { name }),
    onSuccess: (ctx) => {
      invalidate();
      setSelectedId(ctx.id);
      setCreating(false);
      setNewCtxName("");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => guildService.deleteContext(guildId!, id),
    onSuccess: () => {
      invalidate();
      setSelectedId(null);
    },
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleSaveText() {
    if (!selected) return;
    updateMut.mutate({
      name: selected.name,
      instructions,
      general_info: generalInfo,
    });
  }

  const contextKnowledge = knowledge.filter(
    (k: KnowledgeEntry & { ai_context_id?: string; section?: string }) =>
      k.ai_context_id === selected?.id,
  );
  const problems = contextKnowledge.filter(
    (k: any) => k.section === "problems",
  );
  const knowledgeEntries = contextKnowledge.filter(
    (k: any) => k.section !== "problems",
  );

  if (isLoading) return <PageLoader label="Loading AI contexts…" />;

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 max-w-5xl">
      {/* Context list */}
      <aside className="w-full md:w-52 flex-shrink-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          AI Contexts
        </p>
        <div className="flex md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0 md:space-y-1">
          {contexts.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                c.id === selected?.id
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {c.name}
              <span className="ml-1 text-[10px] text-slate-400">
                v{c.context_version}
              </span>
            </button>
          ))}
        </div>
        {creating ? (
          <div className="mt-3 space-y-2">
            <input
              autoFocus
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Context name"
              value={newCtxName}
              onChange={(e) => setNewCtxName(e.target.value)}
            />
            <div className="flex gap-1">
              <button
                onClick={() =>
                  newCtxName.trim() && createMut.mutate(newCtxName.trim())
                }
                className="flex-1 rounded-lg bg-sky-600 py-1 text-xs text-white hover:bg-sky-700"
              >
                Create
              </button>
              <button
                onClick={() => setCreating(false)}
                className="flex-1 rounded-lg border border-slate-200 py-1 text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="mt-3 w-full rounded-xl border border-dashed border-slate-300 py-2 text-xs text-slate-500 hover:bg-slate-50"
          >
            + New Context
          </button>
        )}
      </aside>

      {/* Editor */}
      {selected ? (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {selected.name}
            </h2>
            <button
              onClick={() =>
                window.confirm("Delete this context?") &&
                deleteMut.mutate(selected.id)
              }
              className="text-xs text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-slate-200 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-sky-600 text-sky-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "instructions" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Always injected into every prompt for this context.
              </p>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 min-h-[200px]"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Always reply in a friendly tone. Never mention competitor products."
              />
              <button
                onClick={handleSaveText}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Save
              </button>
            </div>
          )}

          {tab === "general_info" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                General information always available to the AI (no retrieval
                needed).
              </p>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 min-h-[200px]"
                value={generalInfo}
                onChange={(e) => setGeneralInfo(e.target.value)}
                placeholder="e.g. Our store is open Mon–Fri 9am–6pm. Support email: help@example.com"
              />
              <button
                onClick={handleSaveText}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Save
              </button>
            </div>
          )}

          {tab === "problems" &&
            (knowledgeLoading ? (
              <SkeletonList count={2} />
            ) : (
              <KnowledgeList
                entries={problems}
                label="Problem → Solution entries"
                guildId={guildId!}
                contextId={selected.id}
                section="problems"
              />
            ))}

          {tab === "knowledge" &&
            (knowledgeLoading ? (
              <SkeletonList count={2} />
            ) : (
              <KnowledgeList
                entries={knowledgeEntries}
                label="General knowledge entries"
                guildId={guildId!}
                contextId={selected.id}
                section="knowledge"
              />
            ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Select or create a context.
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function KnowledgeList({
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
        ai_context_id: contextId as any,
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{label}</p>
        <button
          onClick={() => setAdding(true)}
          className="rounded-lg bg-sky-600 px-3 py-1 text-xs text-white hover:bg-sky-700"
        >
          + Add
        </button>
      </div>

      {adding && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          <input
            autoFocus
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 min-h-[100px]"
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
              onClick={() => createMut.mutate()}
              disabled={!title.trim() || !content.trim() || createMut.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {createMut.isPending ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setTitle("");
                setContent("");
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 && !adding && (
        <p className="text-sm text-slate-400">No entries yet.</p>
      )}
      {entries.map((k) => (
        <div
          key={k.id}
          className="flex items-start justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
        >
          <div className="min-w-0">
            <p className="font-medium text-sm text-slate-900 truncate">
              {k.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
              {k.main_content ?? k.content}
            </p>
          </div>
          <button
            onClick={() => deleteMut.mutate(k.id)}
            className="ml-4 flex-shrink-0 text-xs text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
