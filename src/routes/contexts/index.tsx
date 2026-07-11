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
    (k) => k.ai_context_id === selected?.id,
  );
  const problems = contextKnowledge.filter(
    (k) => k.section === "problems",
  );
  const knowledgeEntries = contextKnowledge.filter(
    (k) => k.section !== "problems",
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
          {/* General Rules — pinned at top */}
          <button
            onClick={() => setSelectedId("general")}
            className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
              selectedId === "general"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "text-slate-600 hover:bg-slate-50 border border-dashed border-slate-200"
            }`}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span>General Rules</span>
              <span className="inline-flex items-center rounded-full border border-amber-400 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 shadow-sm">
                Global — applies to all panels
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Applies to all panels</p>
          </button>

          {/* Per-panel contexts */}
          {contexts.filter(c => c.id !== generalRules?.id).map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                c.id === selected?.id && selectedId !== "general"
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
      {selectedId === "general" ? (
        <GeneralRulesEditor
          guildId={guildId!}
          generalRules={generalRules}
          generalLoading={generalLoading}
          knowledge={knowledge}
          knowledgeLoading={knowledgeLoading}
        />
      ) : selected ? (
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

function GeneralRulesEditor({
  guildId,
  generalRules,
  generalLoading,
  knowledge,
  knowledgeLoading,
}: {
  guildId: string;
  generalRules: GeneralRules | undefined;
  generalLoading: boolean;
  knowledge: KnowledgeEntry[];
  knowledgeLoading: boolean;
}) {
  const qc = useQueryClient();
  const [grInstructions, setGrInstructions] = useState(generalRules?.instructions ?? "");
  const [grGeneralInfo, setGrGeneralInfo] = useState(generalRules?.general_info ?? "");
  const [grEnabled, setGrEnabled] = useState(generalRules?.enabled ?? true);
  const [grTab, setGrTab] = useState<Tab>("instructions");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (generalRules) {
      setGrInstructions(generalRules.instructions ?? "");
      setGrGeneralInfo(generalRules.general_info ?? "");
      setGrEnabled(generalRules.enabled ?? true);
    }
  }, [generalRules?.id, generalRules?.context_version]);

  const updateMut = useMutation({
    mutationFn: (payload: { instructions?: string; general_info?: string; enabled?: boolean }) =>
      guildService.updateGeneralRules(guildId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["general-rules", guildId] });
      setToast("Saved.");
      setTimeout(() => setToast(null), 2500);
    },
  });

  function handleSave() {
    updateMut.mutate({ instructions: grInstructions, general_info: grGeneralInfo, enabled: grEnabled });
  }

  const generalKnowledge = knowledge.filter((k) => k.ai_context_id === generalRules?.id);
  const generalProblems = generalKnowledge.filter((k) => k.section === "problems");
  const generalKnowledgeEntries = generalKnowledge.filter((k) => k.section !== "problems");

  if (generalLoading && !generalRules) {
    return (
      <div className="flex-1 min-w-0">
        <SkeletonLine w="w-48" h="h-8" />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">General Rules</h2>
            <span className="inline-flex items-center rounded-full border border-amber-400 bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 shadow-sm">
              Global — applies to all panels
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Applies to ALL AI-enabled panels on this server.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className={grEnabled ? "text-emerald-700 font-medium" : "text-slate-400"}>
              {grEnabled ? "Active" : "Disabled"}
            </span>
            <button type="button" onClick={() => setGrEnabled(!grEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${grEnabled ? 'bg-emerald-600' : 'bg-slate-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${grEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </label>
          <button onClick={handleSave} disabled={updateMut.isPending}
            className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50">
            {updateMut.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {!grEnabled && (
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-4 mb-4 shadow-sm" role="alert">
          <p className="text-sm font-semibold text-amber-900">General Rules is currently OFF</p>
          <p className="text-xs text-amber-800 mt-1">
            Server-wide rules are not being applied to any panel. Turn on the toggle above to inject General Rules into every AI reply.
          </p>
        </div>
      )}

      <div className="flex gap-1 mb-4 border-b border-slate-200 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setGrTab(t.id)}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              grTab === t.id ? "border-amber-600 text-amber-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>{t.label}</button>
        ))}
      </div>

      {grTab === "instructions" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Rules that apply to every AI reply on this server — tone, safety, escalation rules.
          </p>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[240px] font-mono"
            value={grInstructions}
            onChange={(e) => setGrInstructions(e.target.value)}
            placeholder={"# General Rules\n\n## Tone & Style\n- Be friendly, professional, concise\n- Always reply in the user's language\n\n## Safety\n- Never promise refunds without approval\n- Never share internal info\n\n## Escalation\n- If user is angry, offer human help"}
          />
          <button onClick={handleSave} disabled={updateMut.isPending}
            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
            {updateMut.isPending ? "Saving…" : "Save General Rules"}
          </button>
        </div>
      )}

      {grTab === "general_info" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            General server/company info available to the AI across all panels.
          </p>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[240px]"
            value={grGeneralInfo}
            onChange={(e) => setGrGeneralInfo(e.target.value)}
            placeholder={"Company: Your Company Name\nSupport hours: Mon-Fri 9am-6pm UTC\nWebsite: https://example.com\nContact: support@example.com\n\n## Common Situations\n- Order status: ask for order number\n- Refunds: never promise — escalate to staff"}
          />
          <button onClick={handleSave} disabled={updateMut.isPending}
            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
            {updateMut.isPending ? "Saving…" : "Save General Rules"}
          </button>
        </div>
      )}

      {grTab === "problems" && generalRules && (
        knowledgeLoading ? (
          <SkeletonList count={2} />
        ) : (
          <KnowledgeList
            entries={generalProblems}
            label="Common problems & solutions (server-wide)"
            guildId={guildId}
            contextId={generalRules.id}
            section="problems"
          />
        )
      )}

      {grTab === "knowledge" && generalRules && (
        knowledgeLoading ? (
          <SkeletonList count={2} />
        ) : (
          <KnowledgeList
            entries={generalKnowledgeEntries}
            label="General knowledge entries (server-wide)"
            guildId={guildId}
            contextId={generalRules.id}
            section="knowledge"
          />
        )
      )}

      {toast && (
        <span className="ml-3 text-sm text-emerald-600">{toast}</span>
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
