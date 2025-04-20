import { Request, Response, NextFunction } from "express";
import { getUserStats, generateUserStatsCSV, getRepoGeneralStats } from "../services/userStatsService";
import { getRepoBranches } from "../utils/gitRepoUtils";
import { syncRepoIfNeeded } from "../services/syncService";

export const getUserStatsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    const branch = (req.query.branch as string) || "all";
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!repoUrl || !startDate || !endDate) {
      res.status(400).json({ error: "Parámetros faltantes" });
      return;
    }

    //  Aquí se asegura que se sincronice el repo y la actividad de GitHub (PRs, Issues, Comments)
    await syncRepoIfNeeded(repoUrl, {
      syncCommits: true,
      syncDiffs: false,
      syncStats: true,              // Necesitamos líneas añadidas/borradas
      syncGithubActivityOption: true, // Para PRs, Issues y Comments
    });
    // Obtener datos de PRs, Issues y Comments desde BBDD ya actualizada
    const repoStats = await getRepoGeneralStats(repoUrl, startDate, endDate);

    // Obtener stats de commits, líneas añadidas y eliminadas por usuario
    const userStats = await getUserStats(repoUrl, branch, startDate, endDate);

    // Combinar los datos antes de enviarlos
    const finalStats = userStats.map(user => ({
      ...user,
      pullRequests: repoStats[user.user]?.pullRequests || 0,
      issues: repoStats[user.user]?.issues || 0,
      comments: repoStats[user.user]?.comments || 0,
    }));

    res.json(finalStats);
  } catch (error) {
    console.error("[getUserStatsHandler] Error:", error);
    next(error);
  }
};



export const exportStatsToCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    const branch = req.query.branch as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!repoUrl) {
      res.status(400).json({ message: "El parámetro repoUrl es obligatorio." });
      return;
    }

    const csv = await generateUserStatsCSV(repoUrl, branch, startDate, endDate);

    res.header("Content-Type", "text/csv");
    res.attachment("user-stats.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const getBranchesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    if (!repoUrl) {
      res.status(400).json({ error: "Se requiere repoUrl" });
      return;
    }

    const branches = await getRepoBranches(repoUrl);
    res.json(branches);
  } catch (error) {
    next(error);
  }
};
