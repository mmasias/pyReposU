import { Request, Response, NextFunction } from "express";
import { Repository } from "../models/Repository";
import { getFolderStatsService } from "../services/getFolderStatsService";
import { AppError } from "../middleware/errorHandler";

export const getFolderStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { repoUrl } = req.query;

  if (!repoUrl) {
    return next(new AppError("REPO_URL_REQUIRED", undefined, 400));
  }

  try {
    const decodedRepoUrl = decodeURIComponent(repoUrl as string);
    const repo = await Repository.findOne({ where: { url: decodedRepoUrl } });

    if (!repo) {
      return next(new AppError("REPO_NOT_FOUND", undefined, 404));
    }

    const stats = await getFolderStatsService(repo.id, decodedRepoUrl);
    res.status(200).json(stats);
  } catch (error) {
    console.error("[getFolderStats] Error:", error);
    next(new AppError("FAILED_TO_GET_FOLDER_STATS"));
  }
};
