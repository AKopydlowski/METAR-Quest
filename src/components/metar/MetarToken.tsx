export type MetarTokenProps = {
  token: string;
  meaning?: string;
  highlighted?: boolean;
};

export function MetarToken({
  token,
  meaning,
  highlighted = false,
}: MetarTokenProps) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        highlighted
          ? "border-sky-500 bg-sky-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <p className="font-mono text-sm font-semibold text-slate-900">{token}</p>
      {meaning ? <p className="mt-1 text-xs text-slate-600">{meaning}</p> : null}
    </div>
  );
}
