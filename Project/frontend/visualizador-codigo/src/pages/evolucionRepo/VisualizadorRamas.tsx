import React, { useState } from "react";
import CommitGraph from "../../components/CommitGraph";
import FiltrosContribucionesYHeatMap from "../../components/BarraConFiltros";

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
      const res = await fetch(`http://localhost:3000/api/mapaEvolucionRepo?repoUrl=${encodedUrl}`);
      if (!res.ok) throw new Error(await res.text());

      const data: Commit[] = await res.json();

      const filtered = data
        .filter((commit) => {
          const commitDate = commit.date.split("T")[0];
          return (!startDate || commitDate >= startDate) &&
                (!endDate || commitDate <= endDate);
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 


      setCommits(filtered);
    } catch (err) {
      console.error("❌ Error al cargar commits:", err);
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
        <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
          <CommitGraph commits={commits} />
        </div>
      )}
    </div>
  );
};

export default VisualizadorRamas;
