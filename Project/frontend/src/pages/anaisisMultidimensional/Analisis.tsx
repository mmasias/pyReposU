import React, { useState, useEffect } from "react";
import axios from "axios";
import TablaAnalisis from "./TablaAnalisis";
import ExportarDatos from "./ExportarDatos";
import Graficos from "../../components/Graficos";
import BarraConFiltros from "../../components/BarraConFiltros";
import { CONSOLE_LOG_MESSAGES, ERROR_MESSAGES } from "../../utils/constants/errorConstants";

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

type StatsMap = Record<string, Record<string, UserData>>;

const Analisis: React.FC = () => {
  const [data, setData] = useState<UserData[]>([]);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState(new Date().toLocaleDateString("sv-SE")); // ← fecha local
  const [branches, setBranches] = useState<string[]>(["Todas"]);
  const [statsMap, setStatsMap] = useState<StatsMap>({});

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

  useEffect(() => {
    if (!repoUrl) return;

    const loadMetadata = async () => {
      try {
        const { data: branchList } = await axios.get(`${import.meta.env.VITE_API_URL}/analisisMultidimensional/branches`, {
          params: { repoUrl: repoUrl }
        });

        const allBranches = ["Todas", ...branchList];
        setBranches(allBranches);

        const [owner, repoNameRaw] = new URL(repoUrl).pathname.slice(1).split("/");
        const repoName = repoNameRaw.replace(/\.git$/, "");

        const { data: repoMeta } = await axios.get(`https://api.github.com/repos/${owner}/${repoName}`);
        const created = repoMeta.created_at.split("T")[0];
        setSince(created);

        const localKey = `userStatsCache_${repoUrl}_${created}_${until}`;
        const cached = localStorage.getItem(localKey);

        if (cached) {
          const parsed = JSON.parse(cached) as StatsMap;
          setStatsMap(parsed);
          const defaultView = Object.entries(parsed).map(([user, branches]) => ({
            ...branches["Todas"] || Object.values(branches)[0],
            selectedBranch: "Todas"
          }));
          setData(defaultView);
        } else {
          await fetchInitialBranch(repoUrl, created, until, localKey);
        }
      } catch (err) {
        console.error(CONSOLE_LOG_MESSAGES.ERROR_INITIALIZING_DATA, err);
      }
    };

    loadMetadata();
  }, [repoUrl]);

  const fetchInitialBranch = async (url: string, from: string, to: string, localKey: string) => {
    try {
      const { data: branchList } = await axios.get(`${import.meta.env.VITE_API_URL}/analisisMultidimensional/branches`, {
        params: { repoUrl: url }
      });

      const allBranches = ["Todas", ...branchList];
      const map: StatsMap = {};
      let pending = allBranches.length - 1;

      for (const branch of allBranches) {
        const branchParam = branch === "Todas" ? "all" : branch;

        try {
          const response = await axios.get<UserData[]>(`${import.meta.env.VITE_API_URL}/analisisMultidimensional`, {
            params: { repoUrl: url, branch: branchParam, startDate: from, endDate: to }
          });

          for (const user of response.data) {
            map[user.user] ||= {};
            map[user.user][branch] = { ...user, selectedBranch: branch };
          }

          setStatsMap(prev => {
            const updated = { ...prev };
            for (const [user, branches] of Object.entries(map)) {
              updated[user] ||= {};
              updated[user][branch] = branches[branch];
            }
            return updated;
          });

          // 👇 Mostramos inmediatamente los datos de "Todas"
          if (branch === "Todas") {
            const initial = Object.entries(map).map(([_, branches]) => ({
              ...branches["Todas"],
              selectedBranch: "Todas"
            }));
            setData(initial);
          }

          if (branch !== "Todas") {
            pending--;
            setLoadingMessage(`⏳ Calculando rama ${branch}... Faltan ${pending} ramas`);
          }
        } catch (err) {
          console.error(`❌ Error cargando datos para la rama ${branch}:`, err);
        }
      }

      localStorage.setItem(localKey, JSON.stringify(map));
      setLoadingMessage(null); // ✅ Finaliza la carga
    } catch (err) {
      console.error(ERROR_MESSAGES.QUICK_ANALYSIS_FAILED, err);
    }
  };



  return (
    <div className="space-y-6">
      <BarraConFiltros
        repoUrl={repoUrl}
        setRepoUrl={setRepoUrl}
        branch=""
        setBranch={() => {}}
        startDate={since}
        setStartDate={setSince}
        endDate={until}
        setEndDate={setUntil}
        fetchData={() => {}} 
        mode="heatmap"
        hideBranchSelect={true}
      />

      <div className="p-6 mb-6 bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">📊 Resumen del Repositorio</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(resumen).map(([key, val]) => (
            <div key={key} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-300 text-sm">{key}</p>
              <p className="text-lg font-bold">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <Graficos userData={data} />
      {loadingMessage && (
        <div className="p-4 text-sm text-yellow-800 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 rounded">
          {loadingMessage}
        </div>
      )}

      <TablaAnalisis
        data={data}
        branches={branches}
        visibleColumns={[
          "totalContributions", "commits", "linesAdded", "linesDeleted", "pullRequests", "issues", "comments"
        ]}
        setData={setData}
        statsMap={statsMap}
        repoUrl={repoUrl}
        since={since}
        until={until}
      />


      <ExportarDatos repoUrl={repoUrl} branch="main" startDate={since} endDate={until} />
    </div>
  );
};

export default Analisis;
