import { useState, useEffect } from "react";
import { fetchBubbleChartData } from "../services/bubbleChartService";
import { CONSOLE_LOG_MESSAGES, ERROR_MESSAGES } from "../utils/constants/errorConstants";

export const useBubbleChart = (repoUrl: string, branch: string) => {
  const [bubbleData, setBubbleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!repoUrl || !branch) {
      console.warn(CONSOLE_LOG_MESSAGES.WAITING_FOR_VALID_VALUES);
      return;
    }
  
    setLoading(true);
  
    try {
      console.log(CONSOLE_LOG_MESSAGES.FETCHING_BUBBLE_CHART_DATA, repoUrl, branch);
      const data = await fetchBubbleChartData(repoUrl, branch);
      setBubbleData(data);
    } catch (error) {
      console.error(CONSOLE_LOG_MESSAGES.ERROR_GETTING_BUBBLE_CHART_DATA, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!repoUrl || !branch) {
      console.warn(CONSOLE_LOG_MESSAGES.WAITING_FOR_VALID_VALUES);
      return;
    }
  
    fetchData();
  }, [repoUrl, branch]);

  return { bubbleData, loading, fetchData };
};
