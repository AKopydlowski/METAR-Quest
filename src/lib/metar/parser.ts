export type Wind = { direction: number; speedKt: number };
export type Visibility = { meters: number };
export type CloudLayer = { coverage: string; heightFt: number | null };
export type Temperature = { temperatureC: number; dewPointC: number };
export type Pressure = { qnhHpa: number };

export type ParsedMetar = {
  station: string | null;
  observationTime: string | null;
  wind: Wind | null;
  visibility: Visibility | null;
  clouds: CloudLayer[];
  temperature: Temperature | null;
  pressure: Pressure | null;
};

export const parseWind = (token: string): Wind | null => {
  const m = token.match(/^(\d{3})(\d{2})KT$/);
  if (!m) return null;
  return { direction: Number(m[1]), speedKt: Number(m[2]) };
};

export const parseVisibility = (token: string): Visibility | null => {
  if (!/^\d{4}$/.test(token)) return null;
  return { meters: Number(token) };
};

export const parseClouds = (token: string): CloudLayer | null => {
  const m = token.match(/^(FEW|SCT|BKN|OVC)(\d{3}|\/\/\/)$/);
  if (!m) return null;
  return {
    coverage: m[1],
    heightFt: m[2] === '///' ? null : Number(m[2]) * 100,
  };
};

const parseSignedTemp = (part: string): number | null => {
  const m = part.match(/^(M)?(\d{2})$/);
  if (!m) return null;
  const value = Number(m[2]);
  return m[1] ? -value : value;
};

export const parseTemperature = (token: string): Temperature | null => {
  const m = token.match(/^([M]?\d{2})\/([M]?\d{2})$/);
  if (!m) return null;
  const temperatureC = parseSignedTemp(m[1]);
  const dewPointC = parseSignedTemp(m[2]);
  if (temperatureC === null || dewPointC === null) return null;
  return { temperatureC, dewPointC };
};

export const parsePressure = (token: string): Pressure | null => {
  const m = token.match(/^Q(\d{4})$/);
  if (!m) return null;
  return { qnhHpa: Number(m[1]) };
};

export const parseMetar = (metar: string): ParsedMetar => {
  const tokens = metar.trim().split(/\s+/);
  const station = /^[A-Z]{4}$/.test(tokens[0] ?? '') ? tokens[0] : null;
  const observationTime = /^\d{6}Z$/.test(tokens[1] ?? '') ? tokens[1] : null;

  const wind = tokens.map(parseWind).find((x): x is Wind => x !== null) ?? null;
  const visibility =
    tokens.map(parseVisibility).find((x): x is Visibility => x !== null) ?? null;
  const clouds = tokens
    .map(parseClouds)
    .filter((x): x is CloudLayer => x !== null);
  const temperature =
    tokens.map(parseTemperature).find((x): x is Temperature => x !== null) ?? null;
  const pressure =
    tokens.map(parsePressure).find((x): x is Pressure => x !== null) ?? null;

  return { station, observationTime, wind, visibility, clouds, temperature, pressure };
};
