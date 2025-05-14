import { useState, useEffect } from "react";
import axios from "axios";
import { CONSOLE_LOG_MESSAGES } from "../utils/constants/errorConstants";

const API_URL = `${import.meta.env.VITE_API_URL}/mapaContribuciones/`;

export const useContributions = (
  repoUrl: string,
  branch: string,
  startDate: string,
  endDate: string
) => {
  const [contributions, setContributions] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchContributions = async () => {
    if (!repoUrl || !startDate || !branch) {
      console.warn(CONSOLE_LOG_MESSAGES.WAITING_FOR_VALID_VALUES);
      return;
    }
  
    setLoading(true);
  
    try {
      console.log(CONSOLE_LOG_MESSAGES.FETCHING_CONTRIBUTIONS, repoUrl, branch, startDate, endDate);
      const response = await axios.get(API_URL, {
        params: { repoUrl, branch, startDate, endDate },
      });
  
      console.log(CONSOLE_LOG_MESSAGES.DATA_RECEIVED_FROM_BACKEND, response.data);
      setContributions(response.data);
    } catch (error) {
      console.error(CONSOLE_LOG_MESSAGES.ERROR_FETCHING_CONTRIBUTIONS, error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (!repoUrl || !startDate || !branch) {
      console.warn(CONSOLE_LOG_MESSAGES.WAITING_FOR_VALID_VALUES);
      return;
    }
  
    fetchContributions();
  }, [repoUrl, branch, startDate, endDate]);
  
  
  return { contributions, loading, fetchContributions };
};
