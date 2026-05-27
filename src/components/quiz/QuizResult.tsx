export type QuizResultProps = {
  score: number;
  total: number;
  message: string;
  onRetry: () => void;
};

export function QuizResult({ score, total, message, onRetry }: QuizResultProps) {
  const percentage = Math.round((score / total) * 100);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:p-8">
      <p className="text-sm uppercase tracking-wide text-slate-500">Quiz Complete</p>
      <p className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
        {score}/{total}
      </p>
      <p className="mt-1 text-sm font-medium text-sky-700">{percentage}%</p>
      <p className="mt-3 text-sm text-slate-600 sm:text-base">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
      >
        Try Again
      </button>
    </section>
  );
}
