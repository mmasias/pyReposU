import { Request, Response, NextFunction } from "express";
import { getUserStats, getRepoGeneralStats } from "../../services/analisisMultidimensional/userStatsService";
import { AppError } from "../../middleware/errorHandler";

export const getUserStatsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    const branch = (req.query.branch as string) || "all";
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!repoUrl || !startDate || !endDate) {
      return next(new AppError("USER_STATS_PARAMS_MISSING", undefined, 400));
    }

    const repoStats = await getRepoGeneralStats(repoUrl, startDate, endDate);
    const userStats = await getUserStats(repoUrl, branch, startDate, endDate);

    const finalStats = userStats.map(user => ({
      ...user,
      pullRequests: repoStats[user.user]?.pullRequests || 0,
      issues: repoStats[user.user]?.issues || 0,
      comments: repoStats[user.user]?.comments || 0,
    }));

    res.json(finalStats);
  } catch (error) {
    console.error("[getUserStatsHandler] Error:", error);
    next(new AppError("INTERNAL_ERROR"));
  }
};


