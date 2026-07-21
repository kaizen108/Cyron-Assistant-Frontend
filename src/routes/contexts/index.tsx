import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBrain,
  FaPlus,
  FaTrash,
  FaSave,
  FaLayerGroup,
  FaLock,
} from "react-icons/fa";
import { guildService } from "../../services/guildService";
import {
  PageLoader,
  SkeletonList,
  SkeletonLine,
} from "../../components/ui/Skeleton";

type Tab = "instructions" | "general_info" | "problems" | "knowledge";

const TABS: { id: Tab; label: string; hint: string }[] = [
  {
    id: "instructions",
    label: "Instructions",
    hint: "Always injected into every prompt for this context.",
  },
  {
    id: "general_info",
    label: "General Info",
    hint: "General information always available to the AI (no retrieval needed).",
  },
  {
    id: "problems",
    label: "Problems",
    hint: "Problem → solution pairs the AI can reference.",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    hint: "General knowledge entries scoped to this context.",
  },
];

function TabBar({
  active,
  onChange,
  accent = "sky",
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
  accent?: "sky" | "indigo";
}) {
  const activeClass =
    accent === "indigo"
      ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
      : "bg-white text-sky-700 shadow-sm dark:bg-slate-800 dark:text-sky-300";

  return (
    <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 dark:border-slate-700 dark:bg-slate-800/60">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`rounded-xl px-4 py-2 font-sans text-sm font-medium transition-all ${
            active === t.id
              ? activeClass
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function EditorArea({
  value,
  onChange,
  placeholder,
  minHeight = "min-h-[280px]",
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

function PrimaryButton({
  onClick,
  disabled,
  loading,
  children,
  variant = "sky",
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: "sky" | "indigo";
}) {
  const colors =
    variant === "indigo"
      ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/30"
      : "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500/30";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${colors}`}
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

function ToggleSwitch({
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

  const { data: generalRules, isLoading: generalLoading } = useQuery({
    queryKey: ["general-rules", guildId],
    queryFn: () => guildService.fetchGeneralRules(guildId!),
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
    if (selectedId) return;
    const panelContexts = contexts.filter((c) => c.id !== generalRules?.id);
    if (panelContexts.length > 0) setSelectedId(panelContexts[0].id);
  }, [contexts, generalRules?.id, selectedId]);

  useEffect(() => {
    if (selected && selected.id !== generalRules?.id) {
      setInstructions(selected.instructions ?? "");
      setGeneralInfo(selected.general_info ?? "");
    }
  }, [selected?.id, generalRules?.id]);

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
      showToast("Changes saved.");
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
      const remaining = contexts.filter(
        (c) => c.id !== selected?.id && c.id !== generalRules?.id,
      );
      setSelectedId(remaining[0]?.id ?? null);
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
    (k) => k.ai_context_id === selected?.id,
  );
  const problems = contextKnowledge.filter((k) => k.section === "problems");
  const knowledgeEntries = contextKnowledge.filter(
    (k) => k.section !== "problems",
  );

  const activeTabMeta = TABS.find((t) => t.id === tab);

  if (isLoading || generalLoading) return <PageLoader label="Loading AI contexts…" />;

  if (generalRules && !generalRules.enabled) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-indigo-50 p-6 shadow-soft sm:p-8 dark:border-slate-700 dark:bg-none dark:bg-slate-900">
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <FaBrain className="text-sky-500" />
            AI Contexts
          </h1>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <FaLock className="text-xl" />
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Complete AI Settings first
          </h2>
          <p className="mx-auto mt-2 max-w-md font-sans text-sm text-slate-500 dark:text-slate-400">
            General Rules is the foundation every panel context builds on.
            Configure and activate General Rules in AI Settings to unlock panel
            contexts.
          </p>
          <Link
            to={`/guilds/${guildId}/ai-settings`}
            className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Go to AI Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-indigo-50 p-6 shadow-soft sm:p-8 dark:border-slate-700 dark:bg-none dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <FaBrain className="text-sky-500" />
              AI Contexts
            </h1>
            <p className="mt-1 font-sans text-sm text-slate-600 dark:text-slate-400">
              Shape how your bot thinks — per panel or server-wide.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800/80">
            <FaLayerGroup className="text-slate-400" />
            <span className="font-sans text-slate-600 dark:text-slate-300">
              {contexts.filter((c) => c.id !== generalRules?.id).length} panel
              {contexts.filter((c) => c.id !== generalRules?.id).length === 1
                ? ""
                : "s"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Contexts
            </p>

            <div className="space-y-1.5">
              {contexts
                .filter((c) => c.id !== generalRules?.id)
                .map((c) => {
                  const isActive = c.id === selected?.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition-all ${
                        isActive
                          ? "border border-sky-200 bg-sky-50/80 ring-1 ring-sky-200/60 dark:border-sky-500/30 dark:bg-sky-500/10 dark:ring-sky-500/20"
                          : "border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <p
                        className={`truncate font-sans text-sm font-medium ${
                          isActive
                            ? "text-sky-800 dark:text-sky-200"
                            : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {c.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                        v{c.context_version}
                      </p>
                    </button>
                  );
                })}
            </div>

            {creating ? (
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <input
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-sans text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 dark:border-slate-600 dark:bg-slate-800"
                  placeholder="Context name"
                  value={newCtxName}
                  onChange={(e) => setNewCtxName(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      newCtxName.trim() && createMut.mutate(newCtxName.trim())
                    }
                    disabled={!newCtxName.trim() || createMut.isPending}
                    className="flex-1 rounded-xl bg-sky-600 py-2 font-sans text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2 font-sans text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 font-sans text-xs font-medium text-slate-500 transition hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-600 dark:border-slate-600 dark:hover:border-sky-500/40 dark:hover:bg-sky-500/5 dark:hover:text-sky-400"
              >
                <FaPlus className="text-[10px]" />
                New Context
              </button>
            )}
          </div>
        </aside>

        {/* Main panel */}
        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-700 dark:bg-slate-900">
            {selected ? (
              <>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {selected.name}
                    </h2>
                    <p className="mt-1 font-sans text-sm text-slate-500 dark:text-slate-400">
                      Panel-specific AI context
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      window.confirm("Delete this context?") &&
                      deleteMut.mutate(selected.id)
                    }
                    className="inline-flex items-center gap-1.5 self-start rounded-xl border border-red-200 px-3 py-1.5 font-sans text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <FaTrash className="text-[10px]" />
                    Delete
                  </button>
                </div>

                <div className="mb-5">
                  <TabBar active={tab} onChange={setTab} />
                </div>

                <p className="mb-4 font-sans text-sm text-slate-500 dark:text-slate-400">
                  {activeTabMeta?.hint}
                </p>

                {(tab === "instructions" || tab === "general_info") && (
                  <div className="space-y-4">
                    <EditorArea
                      value={tab === "instructions" ? instructions : generalInfo}
                      onChange={
                        tab === "instructions"
                          ? setInstructions
                          : setGeneralInfo
                      }
                      placeholder={
                        tab === "instructions"
                          ? "e.g. Always reply in a friendly tone. Never mention competitor products."
                          : "e.g. Our store is open Mon–Fri 9am–6pm. Support email: help@example.com"
                      }
                    />
                    <PrimaryButton
                      onClick={handleSaveText}
                      loading={updateMut.isPending}
                    >
                      {updateMut.isPending ? "Saving…" : "Save changes"}
                    </PrimaryButton>
                  </div>
                )}

                {tab === "problems" &&
                  (knowledgeLoading ? (
                    <SkeletonList count={2} />
                  ) : (
                    <KnowledgeTable
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
                    <KnowledgeTable
                      entries={knowledgeEntries}
                      label="General knowledge entries"
                      guildId={guildId!}
                      contextId={selected.id}
                      section="knowledge"
                    />
                  ))}
              </>
            ) : (
              <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                <FaBrain className="mb-3 text-3xl text-slate-300 dark:text-slate-600" />
                <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                  Select or create a context to get started.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 z-50 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 font-sans text-sm font-medium text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function KnowledgeTable({
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
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 font-sans text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          <FaPlus className="text-[10px]" />
          Add entry
        </button>
      </div>

      {adding && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-3 dark:border-slate-700 dark:bg-slate-800/40">
          <input
            autoFocus
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-sans text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 dark:border-slate-600 dark:bg-slate-800"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-[13px] leading-relaxed focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 dark:border-slate-600 dark:bg-slate-800 min-h-[120px]"
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
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 font-sans text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
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
            className="mt-2 font-sans text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
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
