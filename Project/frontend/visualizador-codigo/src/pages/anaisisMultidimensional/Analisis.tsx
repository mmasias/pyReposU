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

  return (
    <div className="p-6">
      <Filtros {...{ repoUrl, setRepoUrl, since, setSince, until, setUntil, fetchData }} />
      <TablaAnalisis data={data} branches={branches} visibleColumns={visibleColumns} setData={setData} />
      <ExportarDatos />
    </div>
  );
};

export default Analisis;
