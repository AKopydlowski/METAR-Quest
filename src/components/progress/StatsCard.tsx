export type StatsCardProps = {
  label: string;
  value: string;
  subtext?: string;
};

export function StatsCard({ label, value, subtext }: StatsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">{value}</p>
      {subtext ? <p className="mt-1 text-sm text-slate-600">{subtext}</p> : null}
    </article>
  );
}
