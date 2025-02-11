import { useState, useEffect } from "react";
import { fetchContributions, fetchBubbleChartData } from "../services/contributionsService";   

export const useContributions = (repoUrl: string, branch: string, startDate: string, endDate: string) => {
  const [contributions, setContributions] = useState<any>(null);
  const [bubbleData, setBubbleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!repoUrl) return;
    setLoading(true);

    try {
      const contribData = await fetchContributions(repoUrl, branch, startDate, endDate);
      setContributions(contribData);

      const bubbleData = await fetchBubbleChartData(repoUrl, branch);
      setBubbleData(bubbleData);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [repoUrl, branch, startDate, endDate]);

  return { contributions, bubbleData, loading, fetchData };
};
