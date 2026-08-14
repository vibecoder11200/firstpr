import { useState } from "react";
import { useTranslation } from "react-i18next";
import ScoreChip from "./ScoreChip";
import type { ApiIssue } from "../lib/api";

interface Props {
  issue: ApiIssue;
  onClose: () => void;
}

const WEIGHTS = { maintainer: 30, repoHealth: 20, freshness: 15, clarity: 35 };

function Bar({
  label,
  value,
  weight,
  color,
}: {
  label: string;
  value: number | null;
  weight: number;
  color: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">
          {value ?? "—"} · {t("scoreBreakdown.weight", { weight })}
        </span>
      </div>
      <div className="h-2.5 rounded bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded transition-all"
          style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/** Drawer/modal showing the per-criterion breakdown + confidence (differentiator). */
export default function ScoreBreakdown({ issue, onClose }: Props) {
  const { t } = useTranslation();
  const [showOriginal, setShowOriginal] = useState(false);
  const b = issue.scoreBreakdown;

  // Confidence adjustment mirrors the server (Q4): high=1, medium=0.9, low=0.7
  const confFactor = issue.confidence === "high" ? 1 : issue.confidence === "medium" ? 0.9 : 0.7;
  const adjusted = Math.round(issue.score * confFactor);
  const shown = showOriginal ? issue.score : adjusted;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{t("scoreBreakdown.title")}</h2>
            <p className="text-sm text-gray-400 line-clamp-2">{issue.repoFullName} · {issue.title}</p>
          </div>
          <button onClick={onClose} aria-label="close" className="text-gray-400 hover:text-white text-xl">×</button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <ScoreChip score={shown} size="lg" />
          <div>
            <div className="text-sm text-gray-300">{t("scoreBreakdown.total")}: <b>{shown}</b></div>
            <div className="text-xs text-gray-400 mt-1">
              {t("scoreBreakdown.confidence")}: {t(`confidence.${issue.confidence}`)}
            </div>
            <button
              type="button"
              className="mt-2 text-xs underline text-blue-400 hover:text-blue-300"
              onClick={() => setShowOriginal((v) => !v)}
            >
              {showOriginal ? t("scoreBreakdown.showAdjusted") : t("scoreBreakdown.showOriginal")}
            </button>
          </div>
        </div>

        <Bar label={t("scoreBreakdown.group.maintainer")} value={b.maintainer} weight={WEIGHTS.maintainer} color="#60a5fa" />
        <Bar label={t("scoreBreakdown.group.repoHealth")} value={b.repoHealth} weight={WEIGHTS.repoHealth} color="#34d399" />
        <Bar label={t("scoreBreakdown.group.freshness")} value={b.freshness} weight={WEIGHTS.freshness} color="#fbbf24" />
        <Bar label={t("scoreBreakdown.group.clarity")} value={b.clarity} weight={WEIGHTS.clarity} color="#c084fc" />
      </div>
    </div>
  );
}
