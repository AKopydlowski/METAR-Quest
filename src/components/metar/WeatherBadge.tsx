const toneStyles = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-700",
} as const;

export type WeatherTone = keyof typeof toneStyles;

export type WeatherBadgeProps = {
  label: string;
  value: string;
  tone?: WeatherTone;
};

export function WeatherBadge({
  label,
  value,
  tone = "neutral",
}: WeatherBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${toneStyles[tone]}`}
    >
      <span className="uppercase tracking-wide">{label}</span>
      <span>{value}</span>
    </span>
  );
}
