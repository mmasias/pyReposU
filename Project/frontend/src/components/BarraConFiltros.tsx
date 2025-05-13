import React, { useState, useEffect } from "react";
import axios from "axios";

interface FiltrosContribucionesProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  branch: string;
  setBranch: (branch: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  fetchData: () => void;
  mode: "heatmap" | "bubbleChart";
  hideBranchSelect?: boolean; 
}

const FiltrosContribucionesYHeatMap: React.FC<FiltrosContribucionesProps> = ({
  repoUrl,
  setRepoUrl,
  branch,
  setBranch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  fetchData,
  mode,
  hideBranchSelect = false, 
}) => {
  const [branches, setBranches] = useState<string[]>(["main"]);
  const [repoCreatedAt, setRepoCreatedAt] = useState("");

  useEffect(() => {
    if (repoUrl.trim() && repoUrl.startsWith("http")) {
      fetchRepoData();
    }
  }, [repoUrl, mode]);

useEffect(() => {
  const fetchBranches = async () => {
    if (!repoUrl.trim() || !repoUrl.startsWith("http")) return;

    try {
      console.log(`  Enviando petición a: http://localhost:3000/api/analisisMultidimensionalRoutes/branches?repoUrl=${encodeURIComponent(repoUrl)}`);
      const { data } = await axios.get(
        `http://localhost:3000/api/analisisMultidimensional/branches?repoUrl=${encodeURIComponent(repoUrl)}`
      );

      console.log("  Ramas recibidas:", data);
      setBranches(Array.isArray(data) ? data : ["main"]);
    } catch (error) {
      console.error("  Error obteniendo ramas:", error);
      setBranches(["main"]);
    }
  };


  if (!hideBranchSelect) {
    fetchBranches();
  }
}, [repoUrl, hideBranchSelect]);


  const fetchRepoData = async () => {
    if (!repoUrl.trim()) return;
    if (!repoUrl.startsWith("http")) {
      console.error(" URL del repo inválida:", repoUrl);
      return;
    }

    try {
      console.log("  Cargando información del repo...");
      const url = new URL(repoUrl);
      const [repoOwner, repoNameRaw] = url.pathname.slice(1).split("/");
      if (!repoOwner || !repoNameRaw) throw new Error(" URL mal formada");

      const repoName = repoNameRaw.replace(/\.git$/, "");

      console.log("  Cargando fecha de creación...");
      const { data: repoInfo } = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repoName}`
      );
      const createdAt = repoInfo.created_at.split("T")[0];

      setRepoCreatedAt(createdAt);
      if (!startDate) {
        console.log("  Asignando startDate:", createdAt);
        setStartDate(createdAt);
      }
      if (!endDate) {
        const today = new Date();
        const todayLocal = today.toLocaleDateString("sv-SE"); 
        console.log("  Asignando endDate:", today);
        setEndDate(todayLocal);
      }

      fetchData();
    } catch (error) {
      console.error("  Error obteniendo datos del repo:", error);
    }
  };

  useEffect(() => {
    if (repoUrl && startDate) {
      fetchData();
    }
  }, [repoUrl, startDate]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Filtros</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Repositorio:
        </label>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/usuario/repo.git"
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        />
      </div>

      {!hideBranchSelect && Array.isArray(branches) && branches.length > 0 ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rama:
          </label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
          >
            {mode === "bubbleChart" && (
              <option key="all" value="all">
                Todos
              </option>
            )}
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      ) : hideBranchSelect ? null : (
        <p className="text-gray-500">Cargando ramas...</p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Desde:
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={repoCreatedAt}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Hasta:
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        />
      </div>

      <button
        onClick={fetchData}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition"
      >
        Aplicar Filtros
      </button>
    </div>
  );
};

export default FiltrosContribucionesYHeatMap;
