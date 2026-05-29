"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";

export default function OfflineBanner() {
  const { language } = useLanguage();
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;
  return (
    <div className="border-b border-amber-300/30 bg-amber-400/15 px-4 py-2 text-center text-sm font-semibold text-amber-100">
      {language === "pl" ? "Jesteś offline — quiz i nauka działają lokalnie, ale live weather może być niedostępne." : "You are offline — quiz and learning work locally, but live weather may be unavailable."}
    </div>
  );
}
