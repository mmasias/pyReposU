import { Request, Response, NextFunction } from "express";
import { getUserStats, generateUserStatsCSV, getRepoGeneralStats } from "../../services/users/userStatsService";
import {getRepoBranches} from "../../utils/gitRepoUtils";


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

    //  Obtener datos de PRs, Issues y Comments solo una vez
    const repoStats = await getRepoGeneralStats(repoUrl);

    //  Obtener stats de commits, líneas añadidas y eliminadas por usuario
    const userStats = await getUserStats(repoUrl, branch, startDate, endDate);

    //  Combinar los datos antes de enviarlos
    const finalStats = userStats.map(user => ({
      ...user,
      pullRequests: repoStats[user.user]?.pullRequests || 0,
      issues: repoStats[user.user]?.issues || 0,
      comments: repoStats[user.user]?.comments || 0,
    }));

    res.json(finalStats);
  } catch (error) {
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
