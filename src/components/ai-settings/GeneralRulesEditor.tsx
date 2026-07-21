import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { guildService } from "../../services/guildService";
import { SkeletonLine, SkeletonList } from "../ui/Skeleton";
import {
  GENERAL_INFO_PLACEHOLDER,
  GENERAL_RULES_TABS,
  INSTRUCTIONS_PLACEHOLDER,
  type GeneralRulesTab,
} from "./constants";
import { KnowledgeTable } from "./KnowledgeTable";
import {
  EditorArea,
  GlobalBadge,
  PrimaryButton,
  TabBar,
  ToggleSwitch,
} from "./ui";

type GeneralRulesEditorProps = {
  guildId: string;
  generalRules: GeneralRules | undefined;
  generalLoading: boolean;
  knowledge: KnowledgeEntry[];
  knowledgeLoading: boolean;
  showHeader?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
};

export function GeneralRulesEditor({
  guildId,
  generalRules,
  generalLoading,
  knowledge,
  knowledgeLoading,
  showHeader = true,
  onEnabledChange,
}: GeneralRulesEditorProps) {
  const qc = useQueryClient();
  const [grInstructions, setGrInstructions] = useState("");
  const [grGeneralInfo, setGrGeneralInfo] = useState("");
  const [grEnabled, setGrEnabled] = useState(false);
  const [grTab, setGrTab] = useState<GeneralRulesTab>("instructions");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (generalRules) {
      setGrInstructions(generalRules.instructions ?? "");
      setGrGeneralInfo(generalRules.general_info ?? "");
      setGrEnabled(generalRules.enabled ?? false);
    }
  }, [generalRules?.id, generalRules?.context_version, generalRules?.enabled]);

  const updateMut = useMutation({
    mutationFn: (payload: {
      instructions?: string;
      general_info?: string;
      enabled?: boolean;
    }) => guildService.updateGeneralRules(guildId, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["general-rules", guildId] });
      onEnabledChange?.(data.enabled);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    },
  });

  function handleSave() {
    updateMut.mutate({
      instructions: grInstructions,
      general_info: grGeneralInfo,
      enabled: grEnabled,
    });
  }

  function handleToggle(enabled: boolean) {
    setGrEnabled(enabled);
  }

  const generalKnowledge = knowledge.filter(
    (k) => k.ai_context_id === generalRules?.id,
  );
  const generalProblems = generalKnowledge.filter(
    (k) => k.section === "problems",
  );
  const generalKnowledgeEntries = generalKnowledge.filter(
    (k) => k.section !== "problems",
  );

  const activeTabMeta = GENERAL_RULES_TABS.find((t) => t.id === grTab);

  if (generalLoading && !generalRules) {
    return (
      <div className="space-y-4">
        <SkeletonLine w="w-48" h="h-8" />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div>
      {showHeader && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                General Rules
              </h2>
              <GlobalBadge />
            </div>
            <p className="mt-1.5 font-sans text-sm text-slate-500 dark:text-slate-400">
              Applies to all AI-enabled panels on this server. Completing and
              activating unlocks AI Contexts.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2.5">
              <span
                className={`font-sans text-sm font-medium ${
                  grEnabled
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {grEnabled ? "Active" : "Disabled"}
              </span>
              <ToggleSwitch enabled={grEnabled} onChange={handleToggle} />
            </label>
            <PrimaryButton onClick={handleSave} loading={updateMut.isPending}>
              {updateMut.isPending ? "Saving…" : "Save"}
            </PrimaryButton>
          </div>
        </div>
      )}

      {!showHeader && (
        <div className="mb-5 flex items-center justify-end gap-4">
          <label className="flex items-center gap-2.5">
            <span
              className={`font-sans text-sm font-medium ${
                grEnabled
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400"
              }`}
            >
              {grEnabled ? "Active" : "Disabled"}
            </span>
            <ToggleSwitch enabled={grEnabled} onChange={handleToggle} />
          </label>
          <PrimaryButton onClick={handleSave} loading={updateMut.isPending}>
            {updateMut.isPending ? "Saving…" : "Save General Rules"}
          </PrimaryButton>
        </div>
      )}

      {!grEnabled && (
        <div
          className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3.5 dark:border-amber-500/30 dark:bg-amber-500/10"
          role="alert"
        >
          <p className="font-sans text-sm font-semibold text-amber-900 dark:text-amber-300">
            General Rules is currently off
          </p>
          <p className="mt-1 font-sans text-xs text-amber-800/80 dark:text-amber-400/80">
            Turn on the toggle and save to activate AI and unlock AI Contexts.
          </p>
        </div>
      )}

      <div className="mb-5">
        <TabBar active={grTab} onChange={setGrTab} />
      </div>

      <p className="mb-4 font-sans text-sm text-slate-500 dark:text-slate-400">
        {activeTabMeta?.hint}
      </p>

      {(grTab === "instructions" || grTab === "general_info") && (
        <div className="space-y-4">
          <EditorArea
            value={grTab === "instructions" ? grInstructions : grGeneralInfo}
            onChange={
              grTab === "instructions" ? setGrInstructions : setGrGeneralInfo
            }
            placeholder={
              grTab === "instructions"
                ? INSTRUCTIONS_PLACEHOLDER
                : GENERAL_INFO_PLACEHOLDER
            }
          />
          {savedFlash && (
            <span className="font-sans text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Saved successfully
            </span>
          )}
        </div>
      )}

      {grTab === "problems" && generalRules && (
        knowledgeLoading ? (
          <SkeletonList count={2} />
        ) : (
          <KnowledgeTable
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
          <KnowledgeTable
            entries={generalKnowledgeEntries}
            label="General knowledge entries (server-wide)"
            guildId={guildId}
            contextId={generalRules.id}
            section="knowledge"
          />
        )
      )}
    </div>
  );
}
