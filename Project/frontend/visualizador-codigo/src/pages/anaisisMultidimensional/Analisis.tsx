import React, { useState, useEffect } from "react";
import axios from "axios";
import TablaAnalisis from "./TablaAnalisis";
import Filtros from "./Filtros";
import ExportarDatos from "./ExportarDatos";
import Layout from "../../components/Layout"; 
import Graficos from "../../components/Graficos";

interface UserData {
  user: string;
  totalContributions: number;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  pullRequests: number;
  issues: number;
  comments: number;
  selectedBranch: string;
}

const Analisis: React.FC = () => {
  const [data, setData] = useState<UserData[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [since, setSince] = useState("");  
  const [until, setUntil] = useState(new Date().toISOString().split("T")[0]); 
  const [branches, setBranches] = useState<string[]>(["Todas"]);
  const [visibleColumns] = useState<string[]>([
    "totalContributions", "commits", "linesAdded", "linesDeleted", "pullRequests", "issues", "comments"
  ]);

  useEffect(() => {
    if (!repoUrl) return;

    axios.get("http://localhost:3000/api/stats/user/branches", { params: { repoUrl } })
      .then(response => setBranches(["Todas", ...response.data]))
      .catch(error => console.error("Error al obtener ramas:", error));

    const [repoOwner, repoNameRaw] = new URL(repoUrl).pathname.slice(1).split("/");
    const repoName = repoNameRaw.replace(/\.git$/, "");

    axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}`)
      .then(response => setSince(response.data.created_at.split("T")[0]))
      .catch(error => console.error("Error al obtener la fecha de creación:", error));

  }, [repoUrl]);  

  const fetchData = async () => {
    try {
      const response = await axios.get<UserData[]>("http://localhost:3000/api/stats/user", {
        params: { repoUrl, startDate: since, endDate: until }
      });

      const userStatsWithBranches = response.data.map((user: UserData) => ({
        ...user,
        selectedBranch: "Todas"
      }));

      setData(userStatsWithBranches);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  const resumen = data.reduce(
    (acc, user) => {
      acc.commits += user.commits;
      acc.linesAdded += user.linesAdded;
      acc.linesDeleted += user.linesDeleted;
      acc.pullRequests += user.pullRequests;
      acc.issues += user.issues;
      acc.comments += user.comments;
      return acc;
    },
    { commits: 0, linesAdded: 0, linesDeleted: 0, pullRequests: 0, issues: 0, comments: 0 }
  );

  return (
    <Layout>
      <div className="space-y-6">
        <Filtros {...{ repoUrl, setRepoUrl, since, setSince, until, setUntil, fetchData }} />

        {/* MINI RESUMEN GENERAL */}
        <div className="p-6 mb-6 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">📊 Resumen del Repositorio</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-300 text-sm">Commits totales</p>
              <p className="text-lg font-bold">{resumen.commits}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-300 text-sm">Líneas añadidas</p>
              <p className="text-lg font-bold">{resumen.linesAdded}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-300 text-sm">Líneas eliminadas</p>
              <p className="text-lg font-bold">{resumen.linesDeleted}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-300 text-sm">Pull Requests</p>
              <p className="text-lg font-bold">{resumen.pullRequests}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-300 text-sm">Issues</p>
              <p className="text-lg font-bold">{resumen.issues}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-300 text-sm">Comentarios</p>
              <p className="text-lg font-bold">{resumen.comments}</p>
            </div>
          </div>
        </div>

        {/* INTEGRAR GRÁFICOS AQUÍ */}
        <Graficos userData={data} />

        <TablaAnalisis data={data} branches={branches} visibleColumns={visibleColumns} setData={setData} />
        <ExportarDatos />
      </div>
    </Layout>
  );
};

export default Analisis;
