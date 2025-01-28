import React from "react";

interface FiltrosProps {
  repoUrl: string;
  setRepoUrl: (value: string) => void;
  branch: string;
  setBranch: (value: string) => void;
  since: string;
  setSince: (value: string) => void;
  until: string;
  setUntil: (value: string) => void;
  fetchData: () => void;
}

const Filtros: React.FC<FiltrosProps> = ({ repoUrl, setRepoUrl, branch, setBranch, since, setSince, until, setUntil, fetchData }) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center mb-6">
      <input
        type="text"
        placeholder="URL del repositorio"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        className="border p-2 w-96"
      />
      <input type="text" placeholder="Rama" value={branch} onChange={(e) => setBranch(e.target.value)} className="border p-2 w-40" />
      <input type="date" value={since} onChange={(e) => setSince(e.target.value)} className="border p-2 w-40" />
      <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className="border p-2 w-40" />
      <button onClick={fetchData} className="bg-blue-500 text-white p-2 rounded">Aplicar Filtros</button>
    </div>
  );
};

export default Filtros;
