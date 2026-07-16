interface ProgressBarProps {
  caught: number;
  total: number;
  size?: "sm" | "lg";
}

export function ProgressBar({ caught, total, size = "sm" }: ProgressBarProps) {
  const pct = total > 0 ? (caught / total) * 100 : 0;

  return (
    <div
      className={`w-full bg-chip rounded-[6px] overflow-hidden ${
        size === "lg" ? "h-[9px]" : "h-[7px]"
      }`}
    >
      <div
        className="h-full bg-brand rounded-[5px] origin-left animate-[barIn_1.1s_0.2s_ease-out_both]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
