"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, MoonStar } from "lucide-react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 flex items-center p-2 transition-all duration-300 ease-in-out hover:scale-110">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex items-center justify-center w-12 h-12 shadow-lg dark:bg-white bg-background border-primary rounded-lg focus:outline-none"
      >
        <Sun
          className={`h-6 w-6 text-primary text-white     transition-transform duration-500 ease-in-out ${
            theme === "dark" ? "-rotate-90 scale-0" : "rotate-0 scale-100"
          }`}
        />
        <MoonStar
          className={`absolute h-6 w-6 text-black  transition-transform duration-500 ease-in-out ${
            theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
          }`}
        />
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  );
}