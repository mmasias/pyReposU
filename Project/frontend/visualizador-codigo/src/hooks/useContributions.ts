import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/mapaContribuciones/";

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
      console.warn("  Esperando valores válidos antes de hacer la petición...");
      return;
    }
  
    setLoading(true);
  
    try {
      console.log(`  Fetching contributions -> repoUrl: ${repoUrl}, branch: ${branch}, startDate: ${startDate}, endDate: ${endDate}`);
      const response = await axios.get(API_URL, {
        params: { repoUrl, branch, startDate, endDate },
      });
  
      console.log("  Datos recibidos del backend (useContributions):", response.data);
      setContributions(response.data);
    } catch (error) {
      console.error("  Error al obtener contribuciones:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (!repoUrl || !startDate || !branch) {
      console.warn("  Esperando valores válidos antes de hacer la petición...");
      return;
    }
  
    fetchContributions();
  }, [repoUrl, branch, startDate, endDate]);
  
  
  return { contributions, loading, fetchContributions };
};
