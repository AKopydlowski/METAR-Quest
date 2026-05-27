import { MetarToken } from "./MetarToken";
import { WeatherBadge, type WeatherTone } from "./WeatherBadge";

export type MetarCardBadge = {
  label: string;
  value: string;
  tone?: WeatherTone;
};

export type MetarCardToken = {
  token: string;
  meaning?: string;
  highlighted?: boolean;
};

export type MetarCardProps = {
  station: string;
  issuedAt: string;
  rawMetar: string;
  badges: MetarCardBadge[];
  tokens: MetarCardToken[];
};

export function MetarCard({
  station,
  issuedAt,
  rawMetar,
  badges,
  tokens,
}: MetarCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{station}</h3>
        <p className="text-xs text-slate-500">Issued {issuedAt}</p>
      </header>

      <p className="mt-4 rounded-lg bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-100 sm:text-sm">
        {rawMetar}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <WeatherBadge
            key={`${badge.label}-${badge.value}`}
            label={badge.label}
            value={badge.value}
            tone={badge.tone}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tokens.map((token) => (
          <MetarToken
            key={`${token.token}-${token.meaning ?? ""}`}
            token={token.token}
            meaning={token.meaning}
            highlighted={token.highlighted}
          />
        ))}
      </div>
    </article>
  );
}
