export type LearnModule = {
  id: string;
  title: string;
  skill: string;
  goal: string;
  level: "podstawy" | "praktyka" | "misja";
};

export const learnModules: LearnModule[] = [
  { id: "station-time", title: "Stacja i czas", skill: "scan", level: "podstawy", goal: "Najpierw znajdź kod ICAO i czas obserwacji UTC, dopiero potem oceniaj ryzyko." },
  { id: "wind", title: "Wiatr", skill: "wind", level: "podstawy", goal: "Odczytuj kierunek, prędkość, sektor zmienny oraz różnicę między wiatrem stałym i porywami." },
  { id: "visibility", title: "Widzialność", skill: "visibility", level: "praktyka", goal: "Zamieniaj metry, mile statutowe, CAVOK i RVR na praktyczną widzialność operacyjną." },
  { id: "clouds", title: "Chmury i podstawa", skill: "clouds", level: "praktyka", goal: "Rozpoznawaj warstwy BKN/OVC/VV, podstawę chmur i oznaczenia chmur konwekcyjnych." },
  { id: "weather", title: "Pogoda bieżąca", skill: "weather", level: "praktyka", goal: "Szybko wychwytuj TS, FG, FZ, SN, RA i inne grupy, które zmieniają decyzję o locie." },
  { id: "altimeter", title: "Altimeter / QNH", skill: "altimeter", level: "podstawy", goal: "Poprawnie czytaj grupy Q i A, żeby bez pomyłki ustawić wysokościomierz." },
  { id: "taf", title: "Trendy TAF", skill: "weather", level: "misja", goal: "Wykorzystuj TEMPO, BECMG, FM i PROB do briefingu zmian pogody w oknie misji." },
  { id: "decision", title: "GO / Uwaga / NO-GO", skill: "clouds", level: "misja", goal: "Łącz tokeny METAR/TAF, lotnisko zapasowe i minima profilu w konserwatywną decyzję." },
];
