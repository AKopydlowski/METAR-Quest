"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type Language = "pl" | "en";

type Dict = Record<string, string>;

const translations: Record<Language, Dict> = {
  en: {
    appName: "METAR Quest",
    home: "Home",
    learn: "Learn",
    decode: "Decode",
    quiz: "Quiz",
    timeAttack: "Time Attack",
    realWeather: "Real Weather",
    progress: "Progress",
    chooseLanguage: "Language",
    heroTitle: "Decode aviation weather reports with speed and confidence.",
    heroDesc:
      "METAR Quest helps pilots, students, and aviation enthusiasts master METAR interpretation through interactive decoding, fast-paced quizzes, and scenario-based repetition.",
    startDecoding: "Start Decoding",
    takeQuiz: "Take a Quiz",
    learnTitle: "Learn METAR basics",
    learnDesc: "Key abbreviations and examples to build your foundation.",
    quizEmpty: "No quiz attempts yet. Start your first round.",
  },
  pl: {
    appName: "METAR Quest",
    home: "Strona główna",
    learn: "Nauka",
    decode: "Dekodowanie",
    quiz: "Quiz",
    timeAttack: "Atak czasu",
    realWeather: "Pogoda na żywo",
    progress: "Postęp",
    chooseLanguage: "Język",
    heroTitle: "Odczytuj raporty pogodowe lotnicze szybko i pewnie.",
    heroDesc:
      "METAR Quest pomaga pilotom, uczniom i pasjonatom lotnictwa opanować interpretację METAR dzięki interaktywnemu dekodowaniu, quizom i powtórkom scenariuszowym.",
    startDecoding: "Zacznij dekodować",
    takeQuiz: "Rozwiąż quiz",
    learnTitle: "Poznaj podstawy METAR",
    learnDesc: "Najważniejsze skróty i przykłady do szybkiej nauki.",
    quizEmpty: "Brak prób quizu. Rozpocznij pierwszą rundę.",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("pl");

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string) => translations[language][key] ?? key,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
