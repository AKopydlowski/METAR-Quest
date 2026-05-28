export type FlightCategory = "VFR" | "MVFR" | "IFR" | "LIFR";

export interface MetarWind {
  direction: number | null;
  speedKt: number;
  gustKt?: number;
  variable?: [number, number];
}

export interface MetarVisibility {
  statuteMiles: number;
  raw: string;
  cavok?: boolean;
}

export interface MetarCloudLayer {
  coverage: "SKC" | "CLR" | "FEW" | "SCT" | "BKN" | "OVC" | "VV" | "NCD";
  baseFtAgl?: number;
  cloudType?: "CB" | "TCU";
}

export interface MetarTemperature {
  celsius: number;
  dewpointCelsius: number;
}

export interface MetarAltimeter {
  inchesHg: number;
  hectopascals?: number;
}

export interface MetarRunwayVisualRange {
  runway: string;
  rangeFt?: number;
  rangeMeters?: number;
  tendency?: "U" | "D" | "N";
  raw: string;
}

export interface MetarWeatherPhenomenon {
  raw: string;
  intensity?: "light" | "heavy" | "vicinity";
  descriptors: string[];
  phenomena: string[];
}

export interface ParsedMetar {
  station: string;
  observedAt?: string;
  rawText: string;
  wind?: MetarWind;
  visibility?: MetarVisibility;
  weatherCodes: string[];
  weather: MetarWeatherPhenomenon[];
  clouds: MetarCloudLayer[];
  temperature?: MetarTemperature;
  altimeter?: MetarAltimeter;
  runwayVisualRange: MetarRunwayVisualRange[];
  trend?: string[];
  remarks?: string;
  flightCategory?: FlightCategory;
}

export interface MetarExample {
  id: string;
  title: string;
  rawText: string;
  parsed: ParsedMetar;
  explanation: string;
}
