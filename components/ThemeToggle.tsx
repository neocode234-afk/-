"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const enabled = localStorage.theme === "dark" || (!("theme" in localStorage) && matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  function toggle() {
    const enabled = !dark;
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
    localStorage.theme = enabled ? "dark" : "light";
  }

  return <button type="button" aria-label="تغییر پوسته" onClick={toggle} className="icon-button size-9 hover:rotate-12 sm:size-10">{dark ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}</button>;
}
