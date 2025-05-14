//TODO: mover este archivo a usebubblechart
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/mapaContribuciones/`;

/**
 * Obtiene los datos del diagrama de burbujas.
 */
export const fetchBubbleChartData = async (repoUrl: string, branch?: string) => {
    const response = await axios.get(`${API_URL}/bubble-chart`, { params: { repoUrl, branch } });
    return response.data;
  };