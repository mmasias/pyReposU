import React, { useState } from "react";
import CommitGraph from "../../components/evolucionRepo/CommitGraph";
import FiltrosContribucionesYHeatMap from "../../components/BarraConFiltros";
import { ERROR_MESSAGES } from "../../utils/constants/errorConstants";

type Commit = {
  sha: string;
  message: string;
  parents: string[];
  branches: string[];
  primaryBranch: string;
  date: string;
  author: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
};

const VisualizadorRamas = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [commits, setCommits] = useState<Commit[]>([]);

  const fetchData = async () => {
    if (!repoUrl.trim()) return;

    try {
      const encodedUrl = encodeURIComponent(repoUrl);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/mapaEvolucionRepo?repoUrl=${encodedUrl}`);
      if (!res.ok) throw new Error(await res.text());

      const data: Commit[] = await res.json();
      console.log("🔄 Backend devuelve commits:", data.length, data.map(c => c.sha));


      const filtered = data
        .filter((commit) => {
          const commitDate = commit.date.split("T")[0];
          return (!startDate || commitDate >= startDate) &&
                (!endDate || commitDate <= endDate);
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
console.log("🧹 Commits tras filtro de fechas:", filtered.length, filtered.map(c => c.sha));

console.log("Filtered commits: ", filtered);
console.log("🧠 Enviando a setCommits:", filtered.length);

      setCommits([...filtered]);
    } catch (err) {
      console.error(ERROR_MESSAGES.ERROR_LOADING_COMMITS, err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Visualizador de Ramas</h2>

      <FiltrosContribucionesYHeatMap
        repoUrl={repoUrl}
        setRepoUrl={setRepoUrl}
        branch="" // ignorado
        setBranch={() => {}} // noop
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        fetchData={fetchData}
        mode="heatmap"
        hideBranchSelect={true} 
      />

      {commits.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded shadow p-4 overflow-x-auto">
          <CommitGraph commits={commits} />
        </div>
      )}
    </div>
  );
};

export default VisualizadorRamas;
