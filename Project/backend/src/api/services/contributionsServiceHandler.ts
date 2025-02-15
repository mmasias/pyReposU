import { getContributionsByUser } from "./contributionsService";
import { getBubbleChartData } from "./bubbleChartService";

/**
 * Obtiene contribuciones de usuarios en un repositorio.
 */
export const getUserContributions = async (repoUrl: string, branch: string) => {
  return await getContributionsByUser(repoUrl, branch);
};

/**
 * Obtiene datos para el diagrama de burbujas.
 */
export const getBubbleChart = async (repoUrl: string, branch: string) => {
  return await getBubbleChartData(repoUrl, branch);
};
