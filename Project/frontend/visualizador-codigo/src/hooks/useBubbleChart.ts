import { useState, useEffect } from "react";
import { fetchBubbleChartData } from "../services/bubbleChartService";

export const useBubbleChart = (repoUrl: string, branch: string) => {
  const [bubbleData, setBubbleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!repoUrl) return;
    setLoading(true);

    try {
      const data = await fetchBubbleChartData(repoUrl, branch);
      setBubbleData(data);
    } catch (error) {
      console.error("Error al obtener datos del diagrama de burbujas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [repoUrl, branch]);
  

  return { bubbleData, loading, fetchData };
};
