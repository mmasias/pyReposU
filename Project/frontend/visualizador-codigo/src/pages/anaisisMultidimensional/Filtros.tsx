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
    <div className="flex gap-4 mb-4">
      <input type="text" placeholder="URL del repositorio" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="border p-2 rounded w-80" />
      <input type="date" value={since} onChange={(e) => setSince(e.target.value)} className="border p-2 rounded" />
      <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className="border p-2 rounded" />
      <button
      onClick={fetchData} className={`px-4 py-2 rounded ${repoUrl ? "bg-blue-500 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"}`} disabled={!repoUrl} >Aplicar Filtros</button>    </div>
  );
};

export default Filtros;
