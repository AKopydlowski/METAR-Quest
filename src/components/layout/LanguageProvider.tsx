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
    missions: "Missions",
    progress: "Progress",
    onboarding: "Training Plan",
    chooseLanguage: "Language",
    heroTitle: "Decode aviation weather reports with speed and confidence.",
    heroDesc:
      "METAR Quest helps pilots, students, and aviation enthusiasts master METAR interpretation through interactive decoding, fast-paced quizzes, and scenario-based repetition.",
    startDecoding: "Start Decoding",
    takeQuiz: "Take a Quiz",
    learnTitle: "Learn METAR basics",
    learnDesc: "Key abbreviations and examples to build your foundation.",
    quizEmpty: "No quiz attempts yet. Start your first round.",
    menu: "Menu",
    close: "Close",
    score: "Score",
    streak: "Streak",
    hints: "Hints",
    hint: "Hint",
    next: "Next",
    result: "Result",
    playAgain: "Play Again",
    loading: "Loading...",
    load: "Load",
    noWeather: "No weather loaded yet.",
    weatherSource: "Live METAR (AviationWeather.gov API)",
    questionSource: "Question source",
    liveApi: "Live API (larger database)",
    localDb: "Local database",
    time: "Time",
    endOfRound: "End of round",
    accuracy: "Accuracy",
    bestCombo: "Best combo",
    answers: "Answers",
    difficulty: "Difficulty",
    all: "All",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    explanation: "Explanation",
    correctAnswer: "Correct answer",
    pause: "Pause",
    resume: "Resume",
    duration: "Duration",
    weakAreas: "Weak areas",
    recommendedPractice: "Recommended practice",
    exam: "Exam",
    leaderboard: "Leaderboard",
  },
  pl: {
    appName: "METAR Quest",
    home: "Strona główna",
    learn: "Nauka",
    decode: "Dekodowanie",
    quiz: "Quiz",
    timeAttack: "Atak czasu",
    realWeather: "Pogoda na żywo",
    missions: "Misje",
    progress: "Postęp",
    onboarding: "Plan treningu",
    chooseLanguage: "Język",
    heroTitle: "Odczytuj raporty pogodowe lotnicze szybko i pewnie.",
    heroDesc:
      "METAR Quest pomaga pilotom, uczniom i pasjonatom lotnictwa opanować interpretację METAR dzięki interaktywnemu dekodowaniu, quizom i powtórkom scenariuszowym.",
    startDecoding: "Zacznij dekodować",
    takeQuiz: "Rozwiąż quiz",
    learnTitle: "Poznaj podstawy METAR",
    learnDesc: "Najważniejsze skróty i przykłady do szybkiej nauki.",
    quizEmpty: "Brak prób quizu. Rozpocznij pierwszą rundę.",
    menu: "Menu",
    close: "Zamknij",
    score: "Wynik",
    streak: "Seria",
    hints: "Podpowiedzi",
    hint: "Podpowiedź",
    next: "Następne",
    result: "Wynik",
    playAgain: "Zagraj ponownie",
    loading: "Ładowanie...",
    load: "Wczytaj",
    noWeather: "Brak wczytanej pogody.",
    weatherSource: "METAR na żywo (API AviationWeather.gov)",
    questionSource: "Źródło pytań",
    liveApi: "Live API (większa baza)",
    localDb: "Lokalna baza",
    time: "Czas",
    endOfRound: "Koniec rundy",
    accuracy: "Skuteczność",
    bestCombo: "Najlepsze combo",
    answers: "Odpowiedzi",
    difficulty: "Trudność",
    all: "Wszystkie",
    easy: "Łatwe",
    medium: "Średnie",
    hard: "Trudne",
    explanation: "Wyjaśnienie",
    correctAnswer: "Poprawna odpowiedź",
    pause: "Pauza",
    resume: "Wznów",
    duration: "Czas rundy",
    weakAreas: "Słabsze obszary",
    recommendedPractice: "Rekomendowany trening",
    exam: "Egzamin",
    leaderboard: "Ranking",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "pl";
    const saved = window.localStorage.getItem("metar-quest:language");
    return saved === "pl" || saved === "en" ? saved : "pl";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") window.localStorage.setItem("metar-quest:language", lang);
  };

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
