// src/api/stats/user/userStats.controller.ts
import { Request, Response } from "express";
import { Parser } from "json2csv";
import { getUserStats } from "../../services/userStatsService";

/**
 * Controlador para obtener estadísticas de usuario.
 */
export const getUserStatsHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, branch, startDate, endDate, userId } = req.query;

  if (!repoUrl) {
    res.status(400).json({ message: "El parámetro repoUrl es obligatorio." });
    return;
  }

  try {
    const stats = await getUserStats(
      repoUrl as string,
      branch as string,
      startDate as string,
      endDate as string,
      userId as string
    );

    res.status(200).json(stats);
  } catch (error) {
    console.error("[getUserStatsHandler] Error:", error);
    res.status(500).json({ message: "Error al obtener estadísticas." });
  }
};

/**
 * Controlador para exportar estadísticas a CSV.
 */
export const exportStatsToCSV = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, branch, startDate, endDate, userId } = req.query;

  if (!repoUrl) {
    res.status(400).json({ message: "El parámetro repoUrl es obligatorio." });
    return;
  }

  try {
    const stats = await getUserStats(
      repoUrl as string,
      branch as string,
      startDate as string,
      endDate as string,
      userId as string
    );
    console.log("[DEBUG] Datos para CSV:", stats);
    const fields = [
      "user",
      "totalContributions",
      "commits",
      "linesAdded",
      "linesDeleted",
      "pullRequests",
      "issues",
      "comments",
    ];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(stats);

    res.header("Content-Type", "text/csv");
    res.attachment("user-stats.csv");
    res.send(csv);
  } catch (error) {
    console.error("[exportStatsToCSV] Error:", error);
    res.status(500).json({ message: "Error al exportar estadísticas a CSV." });
  }
};

export default { getUserStatsHandler, exportStatsToCSV };
