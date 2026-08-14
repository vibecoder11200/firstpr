interface Props {
  score: number;
  /** small = compact chip on card; large = breakdown drawer */
  size?: "sm" | "lg";
  onClick?: () => void;
}

function tierColor(score: number): string {
  if (score >= 80) return "#34d399"; // emerald
  if (score >= 60) return "#a3e635"; // lime
  if (score >= 40) return "#fbbf24"; // amber
  return "#f87171"; // red
}

/** Small circular score donut. Pure SVG, text-node label (HIGH-11). */
export default function ScoreChip({ score, size = "sm", onClick }: Props) {
  const r = size === "lg" ? 54 : 22;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = tierColor(score);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`score ${score}`}
      className={`relative inline-flex items-center justify-center rounded-full ${size === "lg" ? "w-32 h-32" : "w-12 h-12"} ${onClick ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
      style={{ background: "transparent" }}
    >
      <svg viewBox="0 0 64 64" className={size === "lg" ? "w-32 h-32" : "w-12 h-12"}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="#1f2937" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <span
        className="absolute font-semibold"
        style={{ fontSize: size === "lg" ? "1.6rem" : "0.7rem", color }}
      >
        {score}
      </span>
    </button>
  );
}
