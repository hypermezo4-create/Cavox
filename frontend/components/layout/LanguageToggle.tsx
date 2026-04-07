"use client";

import { useEffect, useState } from "react";

export default function LanguageToggle() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang") || "en";
    setLang(stored);
    document.documentElement.lang = stored;
    document.documentElement.dir = stored === "ar" ? "rtl" : "ltr";
  }, []);

  return (
    <button
      onClick={() => {
        const next = lang === "en" ? "ar" : "en";
        setLang(next);
        localStorage.setItem("lang", next);
        document.documentElement.lang = next;
        document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      }}
      className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text-primary)]"
    >
      {lang.toUpperCase()}
    </button>
  );
}
