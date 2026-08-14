import { useTranslation } from "react-i18next";
import ScoreChip from "./ScoreChip";
import type { ApiIssue } from "../lib/api";

interface Props {
  issue: ApiIssue;
  onOpenBreakdown: (issue: ApiIssue) => void;
}

/** Issue card: repo header, title (text node), metadata, score chip top-right. */
export default function IssueCard({ issue, onOpenBreakdown }: Props) {
  const { t } = useTranslation();
  const [owner, repo] = issue.repoFullName.split("/");

  return (
    <a
      href={issue.htmlUrl}
      target="_blank"
      rel="noreferrer"
      className="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-gray-500 mb-1">
            {owner}/{repo}
            <span className="mx-1 text-gray-700">·</span>
            <span className="text-gray-500">{issue.stars}★</span>
            {issue.language && (
              <>
                <span className="mx-1 text-gray-700">·</span>
                <span className="text-gray-500">{issue.language}</span>
              </>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-100 line-clamp-2">{issue.title}</h3>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300">
              {t("issueCard.goodFirstIssue")}
            </span>
          </div>
        </div>
        <div className="shrink-0" onClick={(e) => e.preventDefault()}>
          <ScoreChip score={issue.displayedScore} onClick={() => onOpenBreakdown(issue)} />
        </div>
      </div>
    </a>
  );
}
