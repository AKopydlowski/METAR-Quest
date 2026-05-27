import type {
  FlightCategory,
  MetarAltimeter,
  MetarCloudLayer,
  MetarTemperature,
  MetarVisibility,
  MetarWind,
  ParsedMetar,
} from "@/types/metar";

const CLOUD_RE = /^(SKC|CLR|FEW|SCT|BKN|OVC|VV)(\d{3}|\/\/\/)?(CB|TCU)?$/;

export function parseMetar(rawText: string): ParsedMetar {
  const tokens = rawText.trim().split(/\s+/);
  const station = tokens[0] ?? "XXXX";

  const wind = tokens.map(parseWind).find(Boolean) as MetarWind | undefined;
  const visibility = tokens.map(parseVisibility).find(Boolean) as MetarVisibility | undefined;
  const clouds = tokens.map(parseCloud).filter(Boolean) as MetarCloudLayer[];
  const temperature = tokens.map(parseTemperature).find(Boolean) as MetarTemperature | undefined;
  const altimeter = tokens.map(parseAltimeter).find(Boolean) as MetarAltimeter | undefined;

  const weatherCodes = tokens.filter((token) => /^[-+]?([A-Z]{2,})$/.test(token));

  return {
    station,
    rawText,
    wind,
    visibility,
    clouds,
    weatherCodes,
    temperature,
    altimeter,
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

function parseWind(token: string): MetarWind | undefined {
  const match = token.match(/^(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT$/);
  if (!match) return undefined;
  return {
    direction: match[1] === "VRB" ? null : Number(match[1]),
    speedKt: Number(match[2]),
    gustKt: match[4] ? Number(match[4]) : undefined,
  };
}

function parseVisibility(token: string): MetarVisibility | undefined {
  if (token === "9999") {
    return { statuteMiles: 6.2, raw: token };
  }

  if (/^\d{1,2}SM$/.test(token)) {
    return { statuteMiles: Number(token.replace("SM", "")), raw: token };
  }

  const fraction = token.match(/^(\d)\/(\d)SM$/);
  if (fraction) {
    return {
      statuteMiles: Number(fraction[1]) / Number(fraction[2]),
      raw: token,
    };
  }

  return undefined;
}

function parseCloud(token: string): MetarCloudLayer | undefined {
  const match = token.match(CLOUD_RE);
  if (!match) return undefined;

  return {
    coverage: match[1] as MetarCloudLayer["coverage"],
    baseFtAgl: match[2] && match[2] !== "///" ? Number(match[2]) * 100 : undefined,
    cloudType: match[3] as MetarCloudLayer["cloudType"],
  };
}

function parseTemperature(token: string): MetarTemperature | undefined {
  const match = token.match(/^(M?\d{2})\/(M?\d{2})$/);
  if (!match) return undefined;

  return {
    celsius: parseSignedTemp(match[1]),
    dewpointCelsius: parseSignedTemp(match[2]),
  };
}

function parseAltimeter(token: string): MetarAltimeter | undefined {
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

function parseSignedTemp(token: string): number {
  return token.startsWith("M") ? -Number(token.slice(1)) : Number(token);
}

function getCeiling(clouds: MetarCloudLayer[]): number {
  const ceilingLayer = clouds
    .filter((layer) => ["BKN", "OVC", "VV"].includes(layer.coverage) && layer.baseFtAgl)
    .sort((a, b) => (a.baseFtAgl ?? Infinity) - (b.baseFtAgl ?? Infinity))[0];

  return ceilingLayer?.baseFtAgl ?? 100000;
}
