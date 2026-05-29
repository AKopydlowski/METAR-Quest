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
  modifier?: "P" | "M";
}

export interface MetarCloudLayer {
  coverage: "SKC" | "CLR" | "FEW" | "SCT" | "BKN" | "OVC" | "VV" | "NCD" | "NSC";
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
  reportType?: "METAR" | "SPECI";
  station: string;
  observedAt?: string;
  rawText: string;
  wind?: MetarWind;
  visibility?: MetarVisibility;
  weatherCodes: string[];
  weather: MetarWeatherPhenomenon[];
  recentWeather: string[];
  vicinityWeather: string[];
  windShear: string[];
  clouds: MetarCloudLayer[];
  temperature?: MetarTemperature;
  altimeter?: MetarAltimeter;
  runwayVisualRange: MetarRunwayVisualRange[];
  trend?: string[];
  remarks?: string;
  flightCategory?: FlightCategory;
  maintenanceIndicator?: boolean;
}

export interface MetarExample {
  id: string;
  title: string;
  rawText: string;
  parsed: ParsedMetar;
  explanation: string;
}
