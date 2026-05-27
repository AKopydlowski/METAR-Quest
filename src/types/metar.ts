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
}

export interface MetarCloudLayer {
  coverage: "SKC" | "CLR" | "FEW" | "SCT" | "BKN" | "OVC" | "VV";
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

export interface ParsedMetar {
  station: string;
  observedAt?: string;
  rawText: string;
  wind?: MetarWind;
  visibility?: MetarVisibility;
  weatherCodes: string[];
  clouds: MetarCloudLayer[];
  temperature?: MetarTemperature;
  altimeter?: MetarAltimeter;
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
