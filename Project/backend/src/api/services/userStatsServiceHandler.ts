import { getUserStats } from "./userStatsService";
import { getRepoBranches } from "./githubService";
import { Parser } from "json2csv";

/**
 * Obtiene estadísticas de usuario desde un repositorio.
 */
export const fetchUserStats = async (repoUrl: string, branch: string, startDate: string, endDate: string) => {
  return await getUserStats(repoUrl, branch, startDate, endDate);
};

/**
 * Obtiene las ramas de un repositorio.
 */
export const fetchRepoBranches = async (repoUrl: string) => {
  const [repoOwner, repoName] = new URL(repoUrl).pathname.slice(1).split("/");
  if (!repoOwner || !repoName) {
    throw new Error("URL del repo inválida");
  }
  return await getRepoBranches(repoOwner, repoName);
};

/**
 * Convierte estadísticas de usuario en formato CSV.
 */
export const generateUserStatsCSV = async (repoUrl: string, branch?: string, startDate?: string, endDate?: string): Promise<string> => {
  const stats = await getUserStats(repoUrl, branch || "all", startDate || "", endDate || "");

  const fields = ["user", "totalContributions", "commits", "linesAdded", "linesDeleted", "pullRequests", "issues", "comments"];
  const json2csv = new Parser({ fields });

  return json2csv.parse(stats);
};
