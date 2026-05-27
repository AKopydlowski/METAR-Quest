export type DecodeQuestionProps = {
  prompt: string;
  token: string;
  hint?: string;
};

export function DecodeQuestion({ prompt, token, hint }: DecodeQuestionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <p className="text-sm font-medium uppercase tracking-wide text-sky-700">Decode</p>
      <p className="mt-2 text-base text-slate-800 sm:text-lg">{prompt}</p>
      <p className="mt-3 rounded-lg bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 sm:inline-block">
        {token}
      </p>
      {hint ? <p className="mt-3 text-sm text-slate-500">Hint: {hint}</p> : null}
    </section>
  );
}
