import React, { useState, useEffect } from "react";
import axios from "axios";
import TablaAnalisis from "./TablaAnalisis";
import ExportarDatos from "./ExportarDatos";
import Graficos from "../../components/Graficos";
import BarraConFiltros from "../../components/BarraConFiltros";

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
        const { data: branchData } = await axios.get("http://localhost:3000/api/analisisMultidimensional/branches", {
          params: { repoUrl }
        });
        const allBranches = ["Todas", ...branchData];
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
        console.error("❌ Error al inicializar datos:", err);
      }
    };

    loadMetadata();
  }, [repoUrl]);

  const fetchInitialBranch = async (url: string, from: string, to: string, localKey: string) => {
    try {
      const response = await axios.get<UserData[]>("http://localhost:3000/api/analisisMultidimensional", {
        params: { repoUrl: url, startDate: from, endDate: to }
      });

      const map: StatsMap = {};
      for (const user of response.data) {
        map[user.user] ||= {};
        map[user.user]["Todas"] = { ...user, selectedBranch: "Todas" };
      }

      localStorage.setItem(localKey, JSON.stringify(map));
      setStatsMap(map);

      const initial = Object.entries(map).map(([_, branches]) => ({
        ...branches["Todas"],
        selectedBranch: "Todas"
      }));

      setData(initial);
    } catch (err) {
      console.error("❌ Error inicial al obtener datos:", err);
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

      <TablaAnalisis
        data={data}
        branches={branches}
        visibleColumns={[
          "totalContributions", "commits", "linesAdded", "linesDeleted", "pullRequests", "issues", "comments"
        ]}
        setData={setData}
        statsMap={statsMap}
      />

      <ExportarDatos repoUrl={repoUrl} branch="main" startDate={since} endDate={until} />
    </div>
  );
};

export default Analisis;
