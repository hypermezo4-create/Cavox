"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") || "light";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button onClick={toggle} className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text-primary)]">
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
