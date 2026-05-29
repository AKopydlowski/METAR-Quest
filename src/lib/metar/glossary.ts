export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const metarGlossary: GlossaryEntry[] = [
  { term: "METAR", definition: "Rutynowy lotniczy raport obserwacji pogody dla lotniska lub stacji." },
  { term: "TAF", definition: "Prognoza pogody dla lotniska, zwykle obejmująca kolejne godziny operacji." },
  { term: "AUTO", definition: "Raport automatyczny, bez bezpośredniego uzupełnienia przez obserwatora." },
  { term: "RMK", definition: "Sekcja uwag z dodatkowymi informacjami o obserwacji." },
  { term: "KT", definition: "Węzły — jednostka prędkości wiatru w METAR i TAF." },
  { term: "SM", definition: "Mile statutowe stosowane m.in. w amerykańskich raportach widzialności." },
  { term: "CLR", definition: "Brak chmur poniżej 12 000 ft w raporcie ze stacji automatycznej." },
  { term: "SKC", definition: "Niebo bezchmurne w obserwacji manualnej." },
  { term: "FEW", definition: "Nieliczne chmury: 1/8–2/8 pokrycia nieba." },
  { term: "SCT", definition: "Chmury rozproszone: 3/8–4/8 pokrycia nieba." },
  { term: "BKN", definition: "Chmury popękane: 5/8–7/8 pokrycia; taka warstwa liczy się jako podstawa." },
  { term: "OVC", definition: "Zachmurzenie całkowite: 8/8 pokrycia; liczy się jako podstawa chmur." },
  { term: "VV", definition: "Widzialność pionowa, gdy niebo jest zasłonięte, np. przez mgłę." },
  { term: "CAVOK", definition: "Widzialność i chmury bez istotnych ograniczeń operacyjnych." },
  { term: "BR", definition: "Zamglenie." },
  { term: "FG", definition: "Mgła." },
  { term: "RA", definition: "Deszcz." },
  { term: "SN", definition: "Śnieg." },
  { term: "TS", definition: "Burza." },
  { term: "DZ", definition: "Mżawka." },
  { term: "HZ", definition: "Zmętnienie powietrza / haze." },
  { term: "A2992", definition: "Nastawa wysokościomierza w calach rtęci, np. 29.92 inHg." },
  { term: "Q1013", definition: "Nastawa QNH w hektopaskalach." },
  { term: "M05", definition: "Wartość ujemna temperatury lub punktu rosy, np. -5°C." },
  { term: "VRB", definition: "Zmienny kierunek wiatru." },
  { term: "G25KT", definition: "Porywy wiatru do 25 węzłów." },
  { term: "VFR", definition: "Kategoria pogody do lotu według przepisów VFR." },
  { term: "MVFR", definition: "Marginalna kategoria VFR — warunki wymagają większej ostrożności." },
  { term: "IFR", definition: "Kategoria pogody do lotu według wskazań przyrządów." },
  { term: "LIFR", definition: "Bardzo niska kategoria IFR, zwykle o dużym ryzyku operacyjnym." },
];
