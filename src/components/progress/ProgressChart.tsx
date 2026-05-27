export type ProgressPoint = {
  label: string;
  value: number;
};

export type ProgressChartProps = {
  title: string;
  points: ProgressPoint[];
  maxValue?: number;
};

export function ProgressChart({ title, points, maxValue }: ProgressChartProps) {
  const resolvedMax = maxValue ?? Math.max(...points.map((point) => point.value), 1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 space-y-3">
        {points.map((point) => {
          const width = `${Math.min(100, Math.round((point.value / resolvedMax) * 100))}%`;

          return (
            <div key={point.label}>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                <span>{point.label}</span>
                <span className="font-medium text-slate-800">{point.value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-sky-600 transition-all"
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
