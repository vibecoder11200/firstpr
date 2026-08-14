import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchIssues, fetchLanguages, authUrl, type ApiIssue } from "./lib/api";
import { setLanguage } from "./lib/i18n";
import { track } from "./lib/posthog";
import IssueCard from "./components/IssueCard";
import ScoreBreakdown from "./components/ScoreBreakdown";

export default function App() {
  const { t } = useTranslation();
  const [issues, setIssues] = useState<ApiIssue[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [language, setLanguageFilter] = useState<string>("all");
  const [sort, setSort] = useState<"score" | "fresh">("score");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<ApiIssue | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIssues({ language, sort, pageSize: 30 });
      setIssues(data.issues);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [language, sort]);

  useEffect(() => {
    void load();
    void fetchLanguages().then(setLanguages);
  }, [load]);

  const openBreakdown = (issue: ApiIssue) => {
    setActive(issue);
    track("issue_view", { language, score_band: band(issue.displayedScore) });
  };

  const selectLang = (l: string) => {
    setLanguageFilter(l);
    track("filter_language", { language: l });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">🌱 FirstPR</h1>
            <p className="text-xs text-gray-400">{t("common.tagline")}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={languageFromStorage()}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded text-xs px-2 py-1"
            >
              <option value="en">EN</option>
              <option value="vi">VI</option>
            </select>
            <a
              href={authUrl()}
              className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-3 py-1.5"
            >
              {t("nav.login")}
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-gray-400">{t("filters.language")}:</span>
          <button
            onClick={() => selectLang("all")}
            className={`text-xs px-2.5 py-1 rounded ${language === "all" ? "bg-emerald-700 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          >
            {t("filters.all")}
          </button>
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => selectLang(l)}
              className={`text-xs px-2.5 py-1 rounded ${language === l ? "bg-emerald-700 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              {l}
            </button>
          ))}

          <span className="ml-auto text-xs text-gray-400">{t("filters.sortBy")}:</span>
          <button
            onClick={() => setSort("score")}
            className={`text-xs px-2.5 py-1 rounded ${sort === "score" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            {t("filters.sortScore")}
          </button>
          <button
            onClick={() => setSort("fresh")}
            className={`text-xs px-2.5 py-1 rounded ${sort === "fresh" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            {t("filters.sortFresh")}
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 mb-4">
            {t("common.error")}: {error} —{" "}
            <button className="underline" onClick={() => void load()}>
              {t("common.retry")}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-20">{t("common.loading")}</div>
        ) : issues.length === 0 ? (
          <div className="text-center text-gray-500 py-20">{t("common.empty")}</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {issues.map((i) => (
              <IssueCard key={i.id} issue={i} onOpenBreakdown={openBreakdown} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        {t("footer.madeFor")}
      </footer>

      {active && <ScoreBreakdown issue={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function languageFromStorage(): string {
  try {
    return localStorage.getItem("firstpr-lang") ?? "en";
  } catch {
    return "en";
  }
}

function band(score: number): string {
  if (score >= 80) return "80-100";
  if (score >= 60) return "60-79";
  if (score >= 40) return "40-59";
  return "0-39";
}
