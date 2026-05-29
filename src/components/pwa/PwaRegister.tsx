"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/layout/LanguageProvider";

export default function PwaRegister() {
  const { language } = useLanguage();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").then(() => setReady(true)).catch(() => setReady(false));
  }, []);

  if (!ready) return null;
  return <span className="sr-only">{language === "pl" ? "Tryb offline gotowy" : "Offline mode ready"}</span>;
}
