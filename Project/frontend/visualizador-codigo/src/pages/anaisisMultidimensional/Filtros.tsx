import React from "react";

interface FiltrosProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  since: string;
  setSince: (date: string) => void;
  until: string;
  setUntil: (date: string) => void;
  fetchData: () => Promise<void>;
}

const Filtros: React.FC<FiltrosProps> = ({ repoUrl, setRepoUrl, since, setSince, until, setUntil, fetchData }) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <input 
        type="text"
        placeholder="Introduce la URL del repositorio"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        className="border p-2 rounded w-80 bg-white dark:bg-gray-700"
      />
      <input 
        type="date"
        value={since}
        onChange={(e) => setSince(e.target.value)}
        className="border p-2 rounded bg-white dark:bg-gray-700"
      />
      <input 
        type="date"
        value={until}
        onChange={(e) => setUntil(e.target.value)}
        className="border p-2 rounded bg-white dark:bg-gray-700"
      />
      <button 
        onClick={fetchData}
        className={`px-4 py-2 rounded transition duration-300 
          ${repoUrl ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"}`} 
        disabled={!repoUrl}
      >
        Aplicar Filtros
      </button>
    </div>
  );
};

export default Filtros;
