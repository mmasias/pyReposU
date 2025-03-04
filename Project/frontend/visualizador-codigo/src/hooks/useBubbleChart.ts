import { useState, useEffect } from "react";
import { fetchBubbleChartData } from "../services/bubbleChartService";

export const useBubbleChart = (repoUrl: string, branch: string) => {
  const [bubbleData, setBubbleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!repoUrl || !branch) {
      console.warn("  Esperando valores válidos antes de hacer la petición...");
      return;
    }
  
    setLoading(true);
  
    try {
      console.log(`  Fetching bubble chart data -> repoUrl: ${repoUrl}, branch: ${branch}`);
      const data = await fetchBubbleChartData(repoUrl, branch);
      setBubbleData(data);
    } catch (error) {
      console.error("  Error al obtener datos del diagrama de burbujas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!repoUrl || !branch) {
      console.warn("  Esperando valores válidos antes de hacer la petición...");
      return;
    }
  
    fetchData();
  }, [repoUrl, branch]);

  return { bubbleData, loading, fetchData };
};
