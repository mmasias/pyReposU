import React, { useState, useEffect } from "react";
import axios from "axios";
import TablaAnalisis from "./TablaAnalisis";
import Filtros from "./Filtros";
import ExportarDatos from "./ExportarDatos";

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
      .then(response => {
        console.log("[DEBUG] Ramas obtenidas:", response.data);
        setBranches(["Todas", ...response.data]);
      })
      .catch(error => console.error("Error al obtener ramas:", error));

    const [repoOwner, repoNameRaw] = new URL(repoUrl).pathname.slice(1).split("/");
    const repoName = repoNameRaw.replace(/\.git$/, "");

    axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}`)
      .then(response => {
        const createdAt = response.data.created_at.split("T")[0]; 
        console.log("[DEBUG] Fecha de creación del repo:", createdAt);
        setSince(createdAt);  
      })
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

  // 🔥 **Cálculo del resumen general sin modificar el resto del código**
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
    <div className="p-6">
      <Filtros {...{ repoUrl, setRepoUrl, since, setSince, until, setUntil, fetchData }} />

      {/*  MINI RESUMEN GENERAL */}
      <div className="p-4 mb-4 bg-gray-100 border rounded">
        <h3 className="text-lg font-semibold">📊 Resumen del Repositorio</h3>
        <p>📝 <strong>Commits totales:</strong> {resumen.commits}</p>
        <p>📥 <strong>Líneas añadidas:</strong> {resumen.linesAdded}</p>
        <p>❌ <strong>Líneas eliminadas:</strong> {resumen.linesDeleted}</p>
        <p>🔀 <strong>Pull Requests:</strong> {resumen.pullRequests}</p>
        <p>📌 <strong>Issues:</strong> {resumen.issues}</p>
        <p>💬 <strong>Comentarios:</strong> {resumen.comments}</p>
      </div>

      <TablaAnalisis data={data} branches={branches} visibleColumns={visibleColumns} setData={setData} />
      <ExportarDatos />
    </div>
  );
};

export default Analisis;
