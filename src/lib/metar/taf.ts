export type TafSegmentKind = "base" | "from" | "temporary" | "becoming" | "probability";

export interface TafTimelineSegment {
  id: string;
  kind: TafSegmentKind;
  label: string;
  window: string;
  summary: string;
  raw: string;
  risk: "low" | "medium" | "high";
}

const CHANGE_RE = /^(FM\d{6}|TEMPO|BECMG|PROB30|PROB40)$/;

function riskFor(raw: string): TafTimelineSegment["risk"] {
  if (/\b(\+TS|TS|FZ|SN|FG|VV00|OVC00|BKN00|[MP]?\d\/\dSM|\b[01]SM\b)/.test(raw)) return "high";
  if (/\b(RA|BR|HZ|BKN0[1-3]|OVC0[1-3]|[2345]SM)\b/.test(raw)) return "medium";
  return "low";
}

function summarize(raw: string): string {
  const parts: string[] = [];
  const wind = raw.match(/(\d{3}|VRB)\d{2,3}(G\d{2,3})?KT/);
  const visibility = raw.match(/(P?\d{1,2}SM|\d\s\d\/\dSM|\d{4}|CAVOK)/);
  const clouds = raw.match(/\b(SKC|CLR|NSC|FEW\d{3}|SCT\d{3}|BKN\d{3}|OVC\d{3}|VV\d{3})\b/g);
  const weather = raw.match(/\b[-+]?(TS|SH|FZ)?(RA|SN|FG|BR|HZ|DZ|GS|GR)\b/g);
  if (wind) parts.push(`wind ${wind[0]}`);
  if (visibility) parts.push(`visibility ${visibility[0]}`);
  if (weather?.length) parts.push(`weather ${weather.join(", ")}`);
  if (clouds?.length) parts.push(`clouds ${clouds.join(", ")}`);
  return parts.length ? parts.join(" • ") : "no major change tokens detected";
}

function labelFor(token: string, index: number): Pick<TafTimelineSegment, "kind" | "label"> {
  if (token.startsWith("FM")) return { kind: "from", label: `From ${token.slice(2, 4)} ${token.slice(4, 6)}:${token.slice(6, 8)}Z` };
  if (token === "TEMPO") return { kind: "temporary", label: "Temporary change" };
  if (token === "BECMG") return { kind: "becoming", label: "Becoming" };
  if (token.startsWith("PROB")) return { kind: "probability", label: `${token.slice(4)}% probability` };
  return { kind: "base", label: index === 0 ? "Base forecast" : "Forecast period" };
}

export function parseTafTimeline(taf?: string | null): TafTimelineSegment[] {
  if (!taf) return [];
  const normalized = taf.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const tokens = normalized.split(" ");
  const segments: { marker: string; tokens: string[] }[] = [{ marker: "BASE", tokens: [] }];

  for (const token of tokens) {
    if (CHANGE_RE.test(token) && segments[segments.length - 1].tokens.length) {
      segments.push({ marker: token, tokens: [token] });
    } else {
      segments[segments.length - 1].tokens.push(token);
    }
  }

  return segments
    .filter((segment) => segment.tokens.length)
    .map((segment, index) => {
      const raw = segment.tokens.join(" ");
      const period = raw.match(/\b(\d{4}\/\d{4})\b/)?.[1] ?? (segment.marker.startsWith("FM") ? segment.marker.slice(2) : "active window");
      const label = labelFor(segment.marker === "BASE" ? "" : segment.marker, index);
      return {
        id: `${index}-${segment.marker}`,
        ...label,
        window: period,
        summary: summarize(raw),
        raw,
        risk: riskFor(raw),
      };
    });
}
