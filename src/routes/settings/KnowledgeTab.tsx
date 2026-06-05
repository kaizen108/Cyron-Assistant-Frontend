import { motion } from "framer-motion";
import { Loader } from "../../components/ui/Loader";
import { Button } from "../../components/ui/Button";

const entryChars = (entry: KnowledgeEntry) =>
  (entry.title?.length ?? 0) +
  (entry.main_content?.length ?? entry.content?.length ?? 0) +
  (entry.additional_context?.length ?? 0) +
  (entry.behavior_notes?.length ?? 0);

const templateBadge = (t?: string | null) => {
  const key = (t || "general_knowledge").toLowerCase();
  const map: Record<string, string> = {
    general_knowledge: "General",
    problem_solution: "Problem/Solution",
    product_info: "Product",
    behavior_rule: "Behavior",
  };
  return map[key] ?? key.replace(/_/g, " ");
};

export const KnowledgeTab = ({
  knowledge,
  knowledgeLoading,
  knowledgeError,
  openCreateModal,
  openProblemModal,
  openEditModal,
  handleDeleteKnowledge,
  deleteKnowledgePending,
  totalChars,
  maxChars,
  usageRatio,
  showUpgradeBanner,
  planLabel,
}: {
  knowledge: KnowledgeEntry[];
  knowledgeLoading: boolean;
  knowledgeError: boolean;
  openCreateModal: () => void;
  openProblemModal: () => void;
  openEditModal: (e: KnowledgeEntry) => void;
  handleDeleteKnowledge: (e: KnowledgeEntry) => void;
  deleteKnowledgePending: boolean;
  totalChars: number;
  maxChars: number;
  usageRatio: number;
  showUpgradeBanner: boolean;
  planLabel: string;
}) => (
  <motion.div
    key="knowledge"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
    className="space-y-4"
  >
    {/* Capacity bar */}
    <div className="rounded-xl bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">Knowledge capacity</span>
          {knowledgeLoading && <Loader />}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`font-mono ${usageRatio > 0.8 ? "text-amber-500" : "text-slate-500"}`}
          >
            {totalChars.toLocaleString()} / {maxChars.toLocaleString()} chars
          </span>
          <Button
            onClick={openCreateModal}
            disabled={knowledgeLoading}
            className="px-3 py-1.5 text-xs"
          >
            New Knowledge
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={openProblemModal}
            disabled={knowledgeLoading}
            className="border border-slate-200 px-3 py-1.5 text-xs"
          >
            New Problem
          </Button>
        </div>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${usageRatio * 100}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full rounded-full ${usageRatio > 0.8 ? "bg-gradient-to-r from-amber-400 to-red-500" : "bg-primary"}`}
        />
      </div>
    </div>

    {/* Upgrade banner */}
    {showUpgradeBanner && (
      <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">
            Reached knowledge capacity for {planLabel} plan.
          </p>
          <p className="mt-0.5 text-slate-500">Upgrade to add more entries.</p>
        </div>
        <Button className="w-full px-4 py-2 text-xs sm:w-auto">
          Upgrade plan
        </Button>
      </div>
    )}

    {/* Entries */}
    <div className="rounded-xl bg-white p-4 shadow-soft">
      {knowledgeLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      )}
      {knowledgeError && !knowledgeLoading && (
        <p className="text-sm text-red-500">Failed to load. Please refresh.</p>
      )}
      {!knowledgeLoading && !knowledgeError && knowledge.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <h3 className="text-sm font-semibold">No knowledge entries yet</h3>
          <p className="max-w-sm text-xs text-slate-500">
            Add your first entry to teach the AI about your support topics.
          </p>
          <Button onClick={openCreateModal} className="px-4 py-2 text-xs">
            Add your first entry
          </Button>
        </div>
      )}
      {!knowledgeLoading && !knowledgeError && knowledge.length > 0 && (
        <div className="space-y-2">
          {knowledge.map((entry) => {
            const chars = entryChars(entry);
            const preview = (entry.main_content ?? entry.content ?? "").slice(
              0,
              120,
            );
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-slate-100 bg-white p-3 text-xs"
              >
                {/* Mobile: stacked */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 truncate">
                      {entry.title || "Untitled"}
                    </p>
                    <p className="mt-0.5 text-slate-500 line-clamp-2">
                      {preview}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {templateBadge(entry.template_type)}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {chars.toLocaleString()} chars
                      </span>
                      <span className="hidden sm:inline text-[10px] text-slate-400">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      onClick={() => openEditModal(entry)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteKnowledge(entry)}
                      disabled={deleteKnowledgePending}
                      className="rounded-lg border border-red-100 px-2 py-1 text-[11px] text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  </motion.div>
);
