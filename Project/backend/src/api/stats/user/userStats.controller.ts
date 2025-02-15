import { Request, Response, NextFunction } from "express";
import { getUserStats, generateUserStatsCSV } from "../../services/users/userStatsService";
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

    const stats = await getUserStats(repoUrl, branch, startDate, endDate);
    res.json(stats);
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
