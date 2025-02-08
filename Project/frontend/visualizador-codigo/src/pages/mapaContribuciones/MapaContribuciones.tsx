import React, { useState, useEffect } from "react";
import { fetchContributions, fetchBubbleChartData } from "../../services/contributionsService";
import Heatmap from "./HeatMap";
import BubbleChart from "./BubbleChart";
import FiltrosContribuciones from "./FiltrosContribuciones";    
import Layout from "../../components/Layout";

const MapaContribuciones: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [contributions, setContributions] = useState<any>(null);
  const [bubbleData, setBubbleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const transformContributions = (rawData: any) => {
    const formattedData: Record<string, Record<string, { linesAdded: number; linesDeleted: number; percentage: number }>> = {};

    for (const user in rawData) {
      for (const folder in rawData[user]) {
        if (!formattedData[folder]) {
          formattedData[folder] = {};
        }
        formattedData[folder][user] = rawData[user][folder];
      }
    }
    return formattedData;
  };

  const fetchData = async () => {
    if (!repoUrl) return;
    setLoading(true);

    try {
      const [contribData, bubbleData] = await Promise.all([
        fetchContributions(repoUrl, branch, startDate, endDate),
        fetchBubbleChartData(repoUrl, branch),
      ]);

      setContributions(transformContributions(contribData));
      setBubbleData(bubbleData);
    } catch (error) {
      console.error("    Error al obtener datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [repoUrl, branch, startDate, endDate]);

  return (
    <Layout>
      <div className="space-y-6">
        <FiltrosContribuciones
          {...{ repoUrl, setRepoUrl, branch, setBranch, startDate, setStartDate, endDate, setEndDate, fetchData }}
        />

        {loading ? (
          <div className="text-center text-gray-500">Cargando datos...</div>
        ) : (
          <>
            {contributions && <Heatmap data={contributions} />}
            {bubbleData && <BubbleChart data={bubbleData} startDate={startDate} endDate={endDate} />}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MapaContribuciones;
