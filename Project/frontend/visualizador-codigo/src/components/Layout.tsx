import React, { useState, useEffect } from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("theme");
    setDarkMode(savedMode === "dark");
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
      <header className="p-4 flex justify-between items-center bg-gray-200 dark:bg-gray-800">
        <h1 className="text-xl font-bold">Framework de Análisis</h1>
        <button onClick={toggleDarkMode} className="p-2 rounded bg-gray-300 dark:bg-gray-600">
          {darkMode ? "☀️" : "🌙"}
        </button>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
};

export default Layout;
