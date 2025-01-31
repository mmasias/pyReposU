import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-full border border-gray-300 dark:border-gray-600"
    >
      {theme === "light" ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
    </button>
  );
};

export default ThemeSwitcher;
