import axios from "axios";

const API_URL = "http://localhost:3000/api/stats/contributions";

/**
 * Obtiene los datos del mapa de calor de contribuciones.
 */
export const fetchContributions = async (repoUrl: string, branch?: string, startDate?: string, endDate?: string) => {
  const response = await axios.get(API_URL, { params: { repoUrl, branch, startDate, endDate } });
  return response.data;
};

/**
 * Obtiene los datos del diagrama de burbujas.
 */
export const fetchBubbleChartData = async (repoUrl: string, branch?: string) => {
  const response = await axios.get(`${API_URL}/bubble-chart`, { params: { repoUrl, branch } });
  return response.data;
};
