import { Request, Response, NextFunction } from "express";
import { generateUserStatsCSV } from "../../services/analisisMultidimensional/exportStatsToCSVService";
import { AppError } from "../../middleware/errorHandler";



export const exportStatsToCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    const branch = req.query.branch as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!repoUrl) {
      return next(new AppError("REPO_URL_REQUIRED_FOR_CSV", undefined, 400));
    }

    const csv = await generateUserStatsCSV(repoUrl, branch, startDate, endDate);

    res.header("Content-Type", "text/csv");
    res.attachment("user-stats.csv");
    res.send(csv);
  } catch (error) {
    console.error("[exportStatsToCSV] Error:", error);
    next(new AppError("INTERNAL_ERROR"));
  }
};
