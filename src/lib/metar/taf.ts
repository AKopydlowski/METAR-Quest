export type TafSegmentKind = "base" | "from" | "temporary" | "becoming" | "probability";

export interface TafTimelineSegment {
  id: string;
  kind: TafSegmentKind;
  label: string;
  window: string;
  summary: string;
  raw: string;
  risk: "low" | "medium" | "high";
  startsAt?: string;
  endsAt?: string;
  probability?: number;
  tokens: {
    wind?: string;
    visibility?: string;
    weather: string[];
    clouds: string[];
  };
}

export interface TafMissionWindowAssessment {
  departureHour: number;
  arrivalHour: number;
  segments: TafTimelineSegment[];
  highestRisk: TafTimelineSegment["risk"];
  recommendation: "GO" | "CAUTION" | "NO-GO";
  rationale: string;
}

const CHANGE_RE = /^(FM\d{6}|TEMPO|BECMG|PROB30|PROB40)$/;
const RISK_WEIGHT: Record<TafTimelineSegment["risk"], number> = { low: 1, medium: 2, high: 3 };

function riskFor(raw: string): TafTimelineSegment["risk"] {
  if (/\b(\+TS|TS|FZ|SN|FG|VV00|OVC00|BKN00|M?\d\/\dSM|\b[01]SM\b|R\d{2}[LCR]?\/[MP]?0?\d{3})/.test(raw)) return "high";
  if (/\b(RA|BR|HZ|BKN0[1-3]|OVC0[1-3]|[2345]SM|TEMPO|PROB40)\b/.test(raw)) return "medium";
  return "low";
}

function extractTokens(raw: string): TafTimelineSegment["tokens"] {
  return {
    wind: raw.match(/(\d{3}|VRB)\d{2,3}(G\d{2,3})?KT/)?.[0],
    visibility: raw.match(/(P?\d{1,2}SM|M?\d\/\dSM|\d\s\d\/\dSM|\d{4}|CAVOK)/)?.[0],
    clouds: raw.match(/\b(SKC|CLR|NSC|NCD|FEW\d{3}(CB|TCU)?|SCT\d{3}(CB|TCU)?|BKN\d{3}(CB|TCU)?|OVC\d{3}|VV\d{3})\b/g) ?? [],
    weather: raw.match(/\b[-+]?(VC|MI|PR|BC|DR|BL|SH|TS|FZ)?(DZ|RA|SN|SG|IC|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PY|PO|SQ|FC|SS|DS)\b/g) ?? [],
  };
}

function summarize(raw: string): string {
  const tokens = extractTokens(raw);
  const parts: string[] = [];
  if (tokens.wind) parts.push(`wind ${tokens.wind}`);
  if (tokens.visibility) parts.push(`visibility ${tokens.visibility}`);
  if (tokens.weather.length) parts.push(`weather ${tokens.weather.join(", ")}`);
  if (tokens.clouds.length) parts.push(`clouds ${tokens.clouds.join(", ")}`);
  return parts.length ? parts.join(" • ") : "no major change tokens detected";
}

function labelFor(token: string, index: number): Pick<TafTimelineSegment, "kind" | "label"> {
  if (token.startsWith("FM")) return { kind: "from", label: `From day ${token.slice(2, 4)} ${token.slice(4, 6)}:${token.slice(6, 8)}Z` };
  if (token === "TEMPO") return { kind: "temporary", label: "Temporary change" };
  if (token === "BECMG") return { kind: "becoming", label: "Becoming" };
  if (token.startsWith("PROB")) return { kind: "probability", label: `${token.slice(4)}% probability` };
  return { kind: "base", label: index === 0 ? "Base forecast" : "Forecast period" };
}

function parseWindow(marker: string, raw: string) {
  const range = raw.match(/\b(\d{4})\/(\d{4})\b/);
  if (range) return { window: `${range[1]}/${range[2]}`, startsAt: range[1], endsAt: range[2] };
  if (marker.startsWith("FM")) return { window: `from ${marker.slice(2)}`, startsAt: marker.slice(2), endsAt: undefined };
  return { window: "active window", startsAt: undefined, endsAt: undefined };
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
      const marker = segment.marker === "BASE" ? "" : segment.marker;
      const label = labelFor(marker, index);
      const window = parseWindow(marker, raw);
      return {
        id: `${index}-${segment.marker}`,
        ...label,
        ...window,
        summary: summarize(raw),
        raw,
        risk: riskFor(raw),
        probability: marker.startsWith("PROB") ? Number(marker.slice(4)) : undefined,
        tokens: extractTokens(raw),
      };
    });
}

function hourInWindow(segment: TafTimelineSegment, hour: number) {
  const start = segment.startsAt ? Number(segment.startsAt.slice(2, 4)) : 0;
  const end = segment.endsAt ? Number(segment.endsAt.slice(2, 4)) : 24;
  if (Number.isNaN(start) || Number.isNaN(end)) return true;
  if (start <= end) return hour >= start && hour <= end;
  return hour >= start || hour <= end;
}

export function assessTafMissionWindow(taf: string | null | undefined, departureHour: number, arrivalHour: number): TafMissionWindowAssessment {
  const timeline = parseTafTimeline(taf);
  const matching = timeline.filter((segment) => hourInWindow(segment, departureHour) || hourInWindow(segment, arrivalHour));
  const segments = matching.length ? matching : timeline;
  const highestRisk = segments.reduce<TafTimelineSegment["risk"]>((max, segment) => (RISK_WEIGHT[segment.risk] > RISK_WEIGHT[max] ? segment.risk : max), "low");
  const recommendation = highestRisk === "high" ? "NO-GO" : highestRisk === "medium" ? "CAUTION" : "GO";
  const rationale = segments.length
    ? `Mission window crosses ${segments.length} TAF segment(s); highest forecast risk is ${highestRisk}.`
    : "No usable TAF segment found for this mission window.";
  return { departureHour, arrivalHour, segments, highestRisk, recommendation, rationale };
}
