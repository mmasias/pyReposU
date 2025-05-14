import { Request, Response, NextFunction } from "express";
import { getCommits as getCommitsFromDb } from "../services/commitsService";
import { AppError } from "../middleware/errorHandler";
import { ErrorMessages } from "../utils/constants/error.constants";

export const getCommitsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    if (!repoUrl) {
      throw new AppError(ErrorMessages.REPO_URL_REQUIRED, "400");
    }

    const commits = await getCommitsFromDb(repoUrl);
    res.status(200).json(commits);
  } catch (error) {
    console.error("[getCommitsHandler] Error:", error);
    next(error);
  }
};
