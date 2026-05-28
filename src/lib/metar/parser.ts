import type {
  FlightCategory,
  MetarAltimeter,
  MetarCloudLayer,
  MetarRunwayVisualRange,
  MetarTemperature,
  MetarVisibility,
  MetarWeatherPhenomenon,
  MetarWind,
  ParsedMetar,
} from "@/types/metar";

const CLOUD_RE = /^(SKC|CLR|FEW|SCT|BKN|OVC|VV|NCD)(\d{3}|\/\/\/)?(CB|TCU)?$/;
const OBS_TIME_RE = /^\d{6}Z$/;
const VARIABLE_WIND_RE = /^(\d{3})V(\d{3})$/;
const RVR_RE = /^R(\d{2}[LCR]?)[/](?:P|M)?(\d{4})(FT)?(?:[/]([UDN]))?$/;
const TREND_TOKENS = new Set(["NOSIG", "NSW", "BECMG", "TEMPO"]);
const DESCRIPTOR_CODES = new Set(["MI", "PR", "BC", "DR", "BL", "SH", "TS", "FZ"]);
const PHENOMENA_CODES = new Set(["DZ", "RA", "SN", "SG", "IC", "PL", "GR", "GS", "UP", "BR", "FG", "FU", "VA", "DU", "SA", "HZ", "PY", "PO", "SQ", "FC", "SS", "DS"]);

export function parseMetar(rawText: string): ParsedMetar {
  const tokens = rawText.trim().split(/\s+/).filter(Boolean);
  const station = tokens[0] ?? "XXXX";
  const observedAt = OBS_TIME_RE.test(tokens[1] ?? "") ? tokens[1] : undefined;
  const remarksIndex = tokens.indexOf("RMK");
  const operationalTokens = remarksIndex >= 0 ? tokens.slice(0, remarksIndex) : tokens;
  const remarks = remarksIndex >= 0 ? tokens.slice(remarksIndex + 1).join(" ") : undefined;

  const wind = parseWindGroup(operationalTokens);
  const visibility = parseVisibilityGroup(operationalTokens);
  const clouds = operationalTokens.map(parseCloud).filter(Boolean) as MetarCloudLayer[];
  const temperature = operationalTokens.map(parseTemperature).find(Boolean) as MetarTemperature | undefined;
  const altimeter = operationalTokens.map(parseAltimeter).find(Boolean) as MetarAltimeter | undefined;
  const runwayVisualRange = operationalTokens.map(parseRunwayVisualRange).filter(Boolean) as MetarRunwayVisualRange[];
  const weather = operationalTokens.map(parseWeatherPhenomenon).filter(Boolean) as MetarWeatherPhenomenon[];
  const trend = operationalTokens.filter((token) => TREND_TOKENS.has(token));

  return {
    station,
    observedAt,
    rawText,
    wind,
    visibility,
    clouds,
    weatherCodes: weather.map((item) => item.raw),
    weather,
    temperature,
    altimeter,
    runwayVisualRange,
    trend,
    remarks,
    flightCategory: deriveFlightCategory(visibility, clouds),
  };
}

export function deriveFlightCategory(
  visibility?: MetarVisibility,
  clouds: MetarCloudLayer[] = [],
): FlightCategory {
  const vis = visibility?.statuteMiles ?? 10;
  const ceiling = getCeiling(clouds);

  if (vis < 1 || ceiling < 500) return "LIFR";
  if (vis < 3 || ceiling < 1000) return "IFR";
  if (vis <= 5 || ceiling <= 3000) return "MVFR";
  return "VFR";
}

export function parseWind(token: string): MetarWind | undefined {
  const match = token.match(/^(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT$/);
  if (!match) return undefined;
  return {
    direction: match[1] === "VRB" ? null : Number(match[1]),
    speedKt: Number(match[2]),
    gustKt: match[4] ? Number(match[4]) : undefined,
  };
}

export function parseVisibility(token: string): MetarVisibility | undefined {
  if (token === "CAVOK") {
    return { statuteMiles: 6.2, raw: token, cavok: true };
  }

  if (/^\d{4}$/.test(token)) {
    const meters = Number(token);
    return {
      statuteMiles: meters === 9999 ? 6.2 : Number((meters / 1609.34).toFixed(2)),
      raw: token,
    };
  }

  if (/^\d{1,2}SM$/.test(token)) {
    return { statuteMiles: Number(token.replace("SM", "")), raw: token };
  }

  const fraction = token.match(/^(\d{1,2})\/(\d{1,2})SM$/);
  if (fraction) {
    return {
      statuteMiles: Number(fraction[1]) / Number(fraction[2]),
      raw: token,
    };
  }

  return undefined;
}

export function parseCloud(token: string): MetarCloudLayer | undefined {
  const match = token.match(CLOUD_RE);
  if (!match) return undefined;

  return {
    coverage: match[1] as MetarCloudLayer["coverage"],
    baseFtAgl: match[2] && match[2] !== "///" ? Number(match[2]) * 100 : undefined,
    cloudType: match[3] as MetarCloudLayer["cloudType"],
  };
}

export function parseTemperature(token: string): MetarTemperature | undefined {
  const match = token.match(/^(M?\d{2})\/(M?\d{2})$/);
  if (!match) return undefined;

  return {
    celsius: parseSignedTemp(match[1]),
    dewpointCelsius: parseSignedTemp(match[2]),
  };
}

export function parseAltimeter(token: string): MetarAltimeter | undefined {
  const usMatch = token.match(/^A(\d{4})$/);
  if (usMatch) {
    return { inchesHg: Number(usMatch[1]) / 100 };
  }

  const intlMatch = token.match(/^Q(\d{4})$/);
  if (intlMatch) {
    const hectopascals = Number(intlMatch[1]);
    return {
      hectopascals,
      inchesHg: Number((hectopascals * 0.02953).toFixed(2)),
    };
  }

  return undefined;
}

export function parseRunwayVisualRange(token: string): MetarRunwayVisualRange | undefined {
  const match = token.match(RVR_RE);
  if (!match) return undefined;

  const range = Number(match[2]);
  return {
    runway: match[1],
    rangeFt: match[3] ? range : undefined,
    rangeMeters: match[3] ? undefined : range,
    tendency: match[4] as MetarRunwayVisualRange["tendency"],
    raw: token,
  };
}

export function parseWeatherPhenomenon(token: string): MetarWeatherPhenomenon | undefined {
  if (["CAVOK", "NSW", "NOSIG"].includes(token)) return undefined;

  const intensityToken = token.startsWith("-") || token.startsWith("+") ? token[0] : token.startsWith("VC") ? "VC" : undefined;
  const body = intensityToken ? token.slice(intensityToken.length) : token;
  if (!body || body.length % 2 !== 0 || !/^[A-Z]+$/.test(body)) return undefined;

  const descriptors: string[] = [];
  const phenomena: string[] = [];
  for (let i = 0; i < body.length; i += 2) {
    const code = body.slice(i, i + 2);
    if (DESCRIPTOR_CODES.has(code)) descriptors.push(code);
    else if (PHENOMENA_CODES.has(code)) phenomena.push(code);
    else return undefined;
  }

  if (!phenomena.length) return undefined;

  return {
    raw: token,
    intensity: intensityToken === "-" ? "light" : intensityToken === "+" ? "heavy" : intensityToken === "VC" ? "vicinity" : undefined,
    descriptors,
    phenomena,
  };
}

function parseWindGroup(tokens: string[]): MetarWind | undefined {
  const windIndex = tokens.findIndex((token) => Boolean(parseWind(token)));
  if (windIndex < 0) return undefined;

  const wind = parseWind(tokens[windIndex]);
  const variableMatch = tokens[windIndex + 1]?.match(VARIABLE_WIND_RE);
  if (wind && variableMatch) {
    wind.variable = [Number(variableMatch[1]), Number(variableMatch[2])];
  }

  return wind;
}

function parseVisibilityGroup(tokens: string[]): MetarVisibility | undefined {
  const cavok = tokens.find((token) => token === "CAVOK");
  if (cavok) return parseVisibility(cavok);

  for (let i = 0; i < tokens.length; i += 1) {
    const mixed = tokens[i + 1]?.match(/^(\d{1,2})\/(\d{1,2})SM$/);
    if (/^\d{1,2}$/.test(tokens[i]) && mixed) {
      return {
        statuteMiles: Number(tokens[i]) + Number(mixed[1]) / Number(mixed[2]),
        raw: `${tokens[i]} ${tokens[i + 1]}`,
      };
    }

    const parsed = parseVisibility(tokens[i]);
    if (parsed) return parsed;
  }

  return undefined;
}

function parseSignedTemp(token: string): number {
  return token.startsWith("M") ? -Number(token.slice(1)) : Number(token);
}

function getCeiling(clouds: MetarCloudLayer[]): number {
  const ceilingLayer = clouds
    .filter((layer) => ["BKN", "OVC", "VV"].includes(layer.coverage) && layer.baseFtAgl)
    .sort((a, b) => (a.baseFtAgl ?? Infinity) - (b.baseFtAgl ?? Infinity))[0];

  return ceilingLayer?.baseFtAgl ?? 100000;
}
