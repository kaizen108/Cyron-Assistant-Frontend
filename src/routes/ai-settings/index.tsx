import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaRobot } from "react-icons/fa";
import { guildService } from "../../services/guildService";
import { GeneralRulesEditor } from "../../components/ai-settings/GeneralRulesEditor";
import { Phase0Welcome } from "../../components/ai-settings/Phase0Welcome";
import { ScanProgress } from "../../components/ai-settings/ScanProgress";
import { PageLoader } from "../../components/ui/Skeleton";

type ViewMode = "welcome" | "scanning" | "editor";

export function AiSettings() {
  const { guildId } = useParams<{ guildId: string }>();
  const [viewMode, setViewMode] = useState<ViewMode | null>(null);
  const [scanResult, setScanResult] = useState<AiDiscoveryScanResult | null>(
    null,
  );

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

  const effectiveView: ViewMode = (() => {
    if (viewMode) return viewMode;
    if (generalLoading) return "editor";
    return generalRules?.enabled ? "editor" : "welcome";
  })();

  async function handleAnalyze() {
    if (!guildId) return;
    setViewMode("scanning");
    setScanResult(null);
    try {
      const result = await guildService.runAiDiscoveryScan(guildId);
      setScanResult(result);
    } catch {
      setScanResult(null);
    } finally {
      setViewMode("editor");
    }
  }

  function handleSkip() {
    setViewMode("editor");
  }

  if (!guildId) return null;
  if (generalLoading && !generalRules) {
    return <PageLoader label="Loading AI settings…" />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-soft sm:p-8 dark:border-slate-700 dark:bg-none dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <FaRobot className="text-indigo-500" />
              AI Settings
            </h1>
            <p className="mt-1 font-sans text-sm text-slate-600 dark:text-slate-400">
              Configure General Rules and server-wide AI behavior.
            </p>
          </div>
          {generalRules?.enabled && (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-sans text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              AI active — AI Contexts unlocked
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-700 dark:bg-slate-900">
        {effectiveView === "welcome" && (
          <Phase0Welcome onAnalyze={handleAnalyze} onSkip={handleSkip} />
        )}

        {effectiveView === "scanning" && <ScanProgress active />}

        {effectiveView === "editor" && (
          <>
            {scanResult && (
              <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/60 px-4 py-3.5 dark:border-indigo-500/30 dark:bg-indigo-500/10">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-sans text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                    Server scan complete
                  </p>
                  <span className="rounded-full bg-indigo-200/80 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide text-indigo-800 dark:bg-indigo-500/30 dark:text-indigo-200">
                    {scanResult.confidence_tier} · {Math.round((scanResult.confidence ?? 0) * 100)}%
                  </span>
                </div>
                <p className="mt-1 font-sans text-xs text-indigo-800/80 dark:text-indigo-300/80">
                  {scanResult.summary}
                </p>
                {scanResult.proposed_category && (
                  <p className="mt-1 font-sans text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    Proposed: {scanResult.proposed_category.replace("_", " ")}
                  </p>
                )}
                {(scanResult.rationale?.length ?? 0) > 0 && (
                  <ul className="mt-2 space-y-0.5 font-sans text-xs text-indigo-700/90 dark:text-indigo-300/70">
                    {scanResult.rationale.slice(0, 5).map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                )}
                {scanResult.classified_channels?.ticket_history?.length > 0 && (
                  <p className="mt-2 font-sans text-xs text-indigo-600 dark:text-indigo-400">
                    Found {scanResult.classified_channels.ticket_history.length} closed ticket channel(s) for future extraction.
                  </p>
                )}
              </div>
            )}

            <GeneralRulesEditor
              guildId={guildId}
              generalRules={generalRules}
              generalLoading={generalLoading}
              knowledge={knowledge}
              knowledgeLoading={knowledgeLoading}
              onEnabledChange={(enabled) => {
                if (enabled) setViewMode("editor");
              }}
            />

            <p className="mt-6 border-t border-slate-100 pt-4 font-sans text-xs text-slate-400 dark:border-slate-800">
              Advanced:{" "}
              <Link
                to={`/guilds/${guildId}/settings`}
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Legacy system prompt &amp; knowledge settings
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
